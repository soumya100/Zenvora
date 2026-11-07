import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RelatedQuestions } from '../src/components/RelatedQuestions';

describe('RelatedQuestions Component Tests (People Also Ask)', () => {
  it('renders interactive question pills', () => {
    const questions = [
      'What companies does Elon Musk own?',
      'Who is the CEO of SpaceX?',
      'What is Elon Musk net worth?',
    ];
    const onSelect = vi.fn();

    render(<RelatedQuestions questions={questions} onSelectQuestion={onSelect} />);

    expect(screen.getByText('People Also Ask')).toBeInTheDocument();
    expect(screen.getByText('What companies does Elon Musk own?')).toBeInTheDocument();
    expect(screen.getByText('Who is the CEO of SpaceX?')).toBeInTheDocument();
    expect(screen.getByText('What is Elon Musk net worth?')).toBeInTheDocument();
  });

  it('triggers onSelectQuestion callback when a question pill is clicked', () => {
    const questions = ['What is quantum computing?'];
    const onSelect = vi.fn();

    render(<RelatedQuestions questions={questions} onSelectQuestion={onSelect} />);

    const pill = screen.getByText('What is quantum computing?');
    fireEvent.click(pill);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('What is quantum computing?');
  });

  it('renders null when questions array is empty', () => {
    const onSelect = vi.fn();
    const { container } = render(<RelatedQuestions questions={[]} onSelectQuestion={onSelect} />);
    expect(container.firstChild).toBeNull();
  });
});

