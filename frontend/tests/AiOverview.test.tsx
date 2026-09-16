import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { AiOverview, cleanUserFacingText, getSuggestedFollowUps } from '../src/components/AiOverview';
import { searchApi } from '../src/services/api';
import { SearchResultItem } from '../src/types';

describe('AiOverview Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockSearchResults: SearchResultItem[] = [
    {
      id: '1',
      title: 'React Server Components Documentation',
      url: 'https://react.dev/reference/rsc/server-components',
      domain: 'react.dev',
      snippet: 'React Server Components let you write UI that renders on the server and streams to the client.',
      engine: 'bing',
      engines: ['bing'],
      category: 'general',
    },
    {
      id: '2',
      title: 'Next.js App Router and Server Components',
      url: 'https://nextjs.org/docs/app',
      domain: 'nextjs.org',
      snippet: 'Next.js uses React Server Components by default in the app router directory.',
      engine: 'bing',
      engines: ['bing'],
      category: 'general',
    },
  ];

  it('renders loading skeleton while fetching AI overview', async () => {
    // Hang the stream call during test, resolving when aborted
    vi.spyOn(searchApi, 'streamAiOverview').mockImplementation(
      (_q, _r, _cb, signal) =>
        new Promise((resolve) => {
          if (signal) {
            signal.addEventListener('abort', () => resolve());
          }
        })
    );

    render(
      <AiOverview
        query="What is React Server Components?"
        category="general"
        searchResults={mockSearchResults}
      />
    );

    expect(screen.getByRole('region', { name: /AI Overview Loading/i })).toBeInTheDocument();
  });

  it('renders generated answer, markdown elements, citations, and source cards', async () => {
    vi.spyOn(searchApi, 'streamAiOverview').mockImplementation((_q, _r, callbacks) => {
      callbacks.onDone?.({
        query: 'What is React Server Components?',
        answer:
          '**React Server Components** (RSC) are a modern paradigm [1]. They execute exclusively on the server.\n\n- **Zero Bundle Size**: Server components do not add JavaScript to the client bundle [2].\n- **Direct Database Access**: Query data without client-side API waterfalls [1].',
        sources: [
          {
            id: 'src-1',
            title: 'React Server Components Documentation',
            url: 'https://react.dev/reference/rsc/server-components',
            domain: 'react.dev',
            snippet: 'React Server Components let you write UI on the server.',
            favicon: 'https://www.google.com/s2/favicons?domain=react.dev',
          },
          {
            id: 'src-2',
            title: 'Next.js App Router and Server Components',
            url: 'https://nextjs.org/docs/app',
            domain: 'nextjs.org',
            snippet: 'Next.js uses React Server Components by default.',
            favicon: 'https://www.google.com/s2/favicons?domain=nextjs.org',
          },
        ],
        status: 'success',
      });
      return Promise.resolve();
    });

    render(
      <AiOverview
        query="What is React Server Components?"
        category="general"
        searchResults={mockSearchResults}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('AI Overview')).toBeInTheDocument();
      expect(screen.getByText(/powered by NVIDIA Nemotron/i)).toBeInTheDocument();
      expect(screen.getByText('Generative AI')).toBeInTheDocument();
    });

    // Verify answer content and bold markdown
    expect(screen.getByText('React Server Components')).toBeInTheDocument();

    // Verify citation pills
    const citationButtons = screen.getAllByRole('button', { name: /Source citation/i });
    expect(citationButtons.length).toBeGreaterThan(0);
    expect(citationButtons[0]).toHaveTextContent('1');

    // Verify source cards
    expect(screen.getByText('react.dev')).toBeInTheDocument();
    expect(screen.getByText('nextjs.org')).toBeInTheDocument();
  });

  it('supports show more / show less toggle on long answers', async () => {
    const longAnswer =
      'React Server Components represent a generational shift in web application architecture [1]. ' +
      'By allowing components to render exclusively on the server, developers can eliminate large JavaScript dependencies from the client bundle.\n\n' +
      'Additionally, developers can query databases, read the local file system, and stream component HTML progressively.\n\n' +
      'Key architectural benefits include:\n- Seamless code sharing between server and client [2].\n- Automatic code splitting by boundary.\n- Preservation of client component state across refetches.';

    vi.spyOn(searchApi, 'streamAiOverview').mockImplementation((_q, _r, callbacks) => {
      callbacks.onDone?.({
        query: 'React Server Components architecture',
        answer: longAnswer,
        sources: [
          {
            id: 'src-1',
            title: 'React Server Components',
            url: 'https://react.dev/',
            domain: 'react.dev',
          },
        ],
        status: 'success',
      });
      return Promise.resolve();
    });

    render(
      <AiOverview
        query="React Server Components architecture"
        category="general"
        searchResults={mockSearchResults}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Show more/i })).toBeInTheDocument();
    });

    // Click Show more
    fireEvent.click(screen.getByRole('button', { name: /Show more/i }));
    expect(screen.getByRole('button', { name: /Show less/i })).toBeInTheDocument();

    // Click Show less
    fireEvent.click(screen.getByRole('button', { name: /Show less/i }));
    expect(screen.getByRole('button', { name: /Show more/i })).toBeInTheDocument();
  });

  it('handles error state with retry action gracefully', async () => {
    vi.spyOn(searchApi, 'streamAiOverview').mockImplementation((_q, _r, callbacks) => {
      callbacks.onError?.(new Error('AI service rate limit exceeded'));
      return Promise.resolve();
    });

    render(
      <AiOverview
        query="test error query"
        category="general"
        searchResults={mockSearchResults}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/AI Overview is temporarily unavailable/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });
  });

  it('displays empty state message when insufficient sources are found', async () => {
    vi.spyOn(searchApi, 'streamAiOverview').mockImplementation((_q, _r, callbacks) => {
      callbacks.onDone?.({
        query: 'xyzfakeunknownterm9876',
        answer: 'Not enough reliable sources were found to generate an overview.',
        sources: [],
        status: 'insufficient_sources',
      });
      return Promise.resolve();
    });

    render(
      <AiOverview
        query="xyzfakeunknownterm9876"
        category="general"
        searchResults={[]}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Not enough reliable sources were found to generate an overview/i)
      ).toBeInTheDocument();
    });
  });

  it('bypasses AI Overview for wallpaper and photo queries to prioritize visual results', () => {
    render(
      <AiOverview
        query="Daredevil wallpapers 4K"
        category="general"
        searchResults={mockSearchResults}
      />
    );

    expect(screen.queryByText('AI Overview')).not.toBeInTheDocument();
  });

  describe('Conversational Follow-Up Chat Experience', () => {
    const renderOverviewWithInitialAnswer = async () => {
      vi.spyOn(searchApi, 'streamAiOverview').mockImplementation((_q, _r, callbacks) => {
        callbacks.onDone?.({
          query: 'Who is Batman?',
          answer: 'Batman is Bruce Wayne, protector of Gotham City [1].',
          sources: [
            {
              id: 'src-1',
              title: 'Batman Biography',
              url: 'https://dc.com/batman',
              domain: 'dc.com',
            },
          ],
          status: 'success',
        });
        return Promise.resolve();
      });

      render(
        <AiOverview
          query="Who is Batman?"
          category="general"
          searchResults={mockSearchResults}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('AI Overview')).toBeInTheDocument();
      });
    };

    it('renders follow-up input box with send button and placeholder', async () => {
      await renderOverviewWithInitialAnswer();

      const input = screen.getByPlaceholderText(/Ask a follow-up question\.\.\./i);
      expect(input).toBeInTheDocument();

      const sendButton = screen.getByRole('button', { name: /Send question/i });
      expect(sendButton).toBeInTheDocument();
      expect(sendButton).toBeDisabled(); // empty input should be disabled
    });

    it('enables send button when text is entered and sends message', async () => {
      await renderOverviewWithInitialAnswer();

      const streamChatSpy = vi
        .spyOn(searchApi, 'streamAiOverviewChat')
        .mockImplementation((payload, callbacks) => {
          callbacks.onSources?.([
            {
              id: 'src-1',
              title: 'Batman Weaknesses',
              url: 'https://dc.fandom.com/batman',
              domain: 'dc.fandom.com',
              snippet: 'His primary weaknesses are physical exhaustion and trauma.',
            },
          ]);
          callbacks.onDelta?.('His primary weaknesses are exhaustion [1].', 'His primary weaknesses are exhaustion [1].');
          callbacks.onDone?.({
            reply: 'His primary weaknesses are exhaustion [1].',
            sources: [
              {
                id: 'src-1',
                title: 'Batman Weaknesses',
                url: 'https://dc.fandom.com/batman',
                domain: 'dc.fandom.com',
              },
            ],
          });
          return Promise.resolve();
        });

      const input = screen.getByPlaceholderText(/Ask a follow-up question\.\.\./i);
      fireEvent.change(input, { target: { value: 'What are his weaknesses?' } });

      const sendButton = screen.getByRole('button', { name: /Send question/i });
      expect(sendButton).not.toBeDisabled();

      fireEvent.click(sendButton);

      // Verify streamAiOverviewChat was called with contextual query and message
      expect(streamChatSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          originalQuery: 'Who is Batman?',
          message: 'What are his weaknesses?',
        }),
        expect.any(Object),
        expect.any(AbortSignal)
      );

      // Verify user message appears in thread
      await waitFor(() => {
        expect(screen.getByText('What are his weaknesses?')).toBeInTheDocument();
      });

      // Verify assistant reply appears in thread
      await waitFor(() => {
        expect(screen.getByText(/His primary weaknesses are exhaustion/i)).toBeInTheDocument();
      });

      // Verify input resets
      expect(input).toHaveValue('');
    });

    it('displays error banner and allows retry on follow-up failure', async () => {
      await renderOverviewWithInitialAnswer();

      vi.spyOn(searchApi, 'streamAiOverviewChat').mockImplementation((_p, callbacks) => {
        callbacks.onError?.(new Error('Follow-up generation failed.'));
        return Promise.resolve();
      });

      const input = screen.getByPlaceholderText(/Ask a follow-up question\.\.\./i);
      fireEvent.change(input, { target: { value: 'Tell me about Gotham' } });

      const sendButton = screen.getByRole('button', { name: /Send question/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Follow-up generation failed.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
      });
    });

    it('renders suggested follow-up chips and sends question on click', async () => {
      await renderOverviewWithInitialAnswer();

      const streamChatSpy = vi
        .spyOn(searchApi, 'streamAiOverviewChat')
        .mockImplementation((_params, callbacks) => {
          callbacks.onDone?.({
            reply: 'Spider-Man was created by Stan Lee and Steve Ditko.',
            sources: [],
            status: 'success',
          });
          return Promise.resolve();
        });

      // Verify suggested chips are displayed
      expect(screen.getByText('Suggested follow-ups')).toBeInTheDocument();
      const originChip = screen.getByRole('button', { name: /What is his comic book origin\?/i });
      expect(originChip).toBeInTheDocument();

      // Click the chip
      await act(async () => {
        fireEvent.click(originChip);
      });

      expect(streamChatSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          originalQuery: 'Who is Batman?',
          message: 'What is his comic book origin?',
        }),
        expect.any(Object),
        expect.any(AbortSignal)
      );
    });

    it('cleanUserFacingText strips <think> tags, thinking processes, and meta reasoning', () => {
      const dirty = `Here's a thinking process:
1. Analyze User Input: "comics origin"
2. Review Search Evidence: Wikipedia snippet
The guidelines say to cite sources.

Spider-Man first appeared in **Amazing Fantasy #15** in 1962 [1].`;

      const cleaned = cleanUserFacingText(dirty);
      expect(cleaned).not.toContain("Here's a thinking process");
      expect(cleaned).not.toContain('Analyze User Input');
      expect(cleaned).not.toContain('Review Search Evidence');
      expect(cleaned).not.toContain('The guidelines say');
      expect(cleaned).toContain('Spider-Man first appeared in **Amazing Fantasy #15** in 1962 [1].');
    });

    it('getSuggestedFollowUps returns tailored questions for queries', () => {
      const spidermanSuggestions = getSuggestedFollowUps('spiderman');
      expect(spidermanSuggestions).toContain('What is his comic book origin?');
      expect(spidermanSuggestions).toContain('What are his powers and abilities?');

      const reactSuggestions = getSuggestedFollowUps('What is React?');
      expect(reactSuggestions).toContain('What are the core features and benefits?');

      const comparisonSuggestions = getSuggestedFollowUps('React vs Vue');
      expect(comparisonSuggestions).toContain('Which one has better performance?');
    });
  });
});


