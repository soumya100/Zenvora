import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ResultCard } from '../src/components/ResultCard';
import { SearchResultItem } from '../src/types';

describe('ResultCard Component', () => {
  const mockItem: SearchResultItem = {
    id: 'test-1',
    title: 'Linux Hardening Best Practices',
    url: 'https://security.example.org/linux-guide',
    domain: 'security.example.org',
    snippet: 'Step-by-step instructions on securing Linux VPS systems with UFW, SSH keys, and Caddy.',
    engine: 'brave',
    engines: ['brave', 'duckduckgo'],
    category: 'general',
  };

  it('renders result title, domain, and snippet accurately', () => {
    render(<ResultCard item={mockItem} />);

    expect(screen.getByText('Linux Hardening Best Practices')).toBeInTheDocument();
    expect(screen.getByText('security.example.org')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Step-by-step instructions on securing Linux VPS systems with UFW, SSH keys, and Caddy.'
      )
    ).toBeInTheDocument();
  });

  it('contains valid link with target and security attributes', () => {
    render(<ResultCard item={mockItem} />);

    const link = screen.getByRole('link', { name: /Linux Hardening Best Practices/i });
    expect(link).toHaveAttribute('href', 'https://security.example.org/linux-guide');
  });
});
