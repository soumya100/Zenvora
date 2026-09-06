import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SearchBar } from '../src/components/SearchBar';

describe('SearchBar Component', () => {
  it('renders search input with placeholder', () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText('Search the web privately...');
    expect(input).toBeInTheDocument();
  });

  it('updates text input value on change', () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText('Search the web privately...');
    fireEvent.change(input, { target: { value: 'linux security' } });
    expect(input).toHaveValue('linux security');
  });

  it('triggers onSearch when Enter key is pressed', () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} initialValue="docker compose" />);

    const input = screen.getByPlaceholderText('Search the web privately...');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(handleSearch).toHaveBeenCalledWith('docker compose');
  });

  it('renders search submit button in large mode', () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} size="large" />);

    const button = screen.getByRole('button', { name: /search/i });
    expect(button).toBeInTheDocument();
  });
});
