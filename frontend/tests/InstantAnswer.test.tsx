import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { InstantAnswer } from '../src/components/InstantAnswer';
import { SearchInfobox } from '../src/types';

describe('InstantAnswer Component', () => {
  it('renders infobox title, content, and dynamic source attribute', () => {
    const mockInfobox: SearchInfobox = {
      title: 'React',
      content: 'A JavaScript library for building user interfaces.',
      url: 'https://react.dev/',
      source: 'React Official Docs',
      attributes: [
        { label: 'Initial Release', value: 'May 2013' },
        { label: 'Platform', value: 'Web, Mobile' },
      ],
    };

    render(<InstantAnswer infobox={mockInfobox} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('A JavaScript library for building user interfaces.')).toBeInTheDocument();
    expect(screen.getByText('React Official Docs')).toBeInTheDocument();
    expect(screen.getByText('Initial Release:')).toBeInTheDocument();
    expect(screen.getByText('May 2013')).toBeInTheDocument();
  });

  it('falls back to domain when source is not explicitly specified', () => {
    const mockInfobox: SearchInfobox = {
      title: 'Domain Name System',
      content: 'The hierarchical and decentralized naming system used to identify computers.',
      url: 'https://en.wikipedia.org/wiki/Domain_Name_System',
    };

    render(<InstantAnswer infobox={mockInfobox} />);

    expect(screen.getByText('Domain Name System')).toBeInTheDocument();
    expect(screen.getByText('en.wikipedia.org')).toBeInTheDocument();
  });
});
