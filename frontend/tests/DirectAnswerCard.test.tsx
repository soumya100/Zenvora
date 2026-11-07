import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DirectAnswerCard } from '../src/components/DirectAnswerCard';
import { SearchDirectAnswer } from '../src/types';

describe('DirectAnswerCard Component Tests', () => {
  it('renders Math Calculator card with answer, title, and formula subtext', () => {
    const directAnswer: SearchDirectAnswer = {
      type: 'calculator',
      title: '25 * 40 / 3',
      answer: '333.333333',
      subtext: 'Calculation result',
      icon: 'Calculator',
    };

    render(<DirectAnswerCard directAnswer={directAnswer} />);

    expect(screen.getByText('Calculator Result')).toBeInTheDocument();
    expect(screen.getByText('25 * 40 / 3')).toBeInTheDocument();
    expect(screen.getByText('333.333333')).toBeInTheDocument();
    expect(screen.getByText('Calculation result')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('handles copy button click and writes answer to clipboard', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const directAnswer: SearchDirectAnswer = {
      type: 'calculator',
      title: '12 * 12',
      answer: '144',
      subtext: 'Calculation result',
      icon: 'Calculator',
    };

    render(<DirectAnswerCard directAnswer={directAnswer} />);

    const copyBtn = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('144');
    expect(await screen.findByText(/copied/i)).toBeInTheDocument();
  });

  it('renders Currency Conversion card with badge and rate details', () => {
    const directAnswer: SearchDirectAnswer = {
      type: 'currency',
      title: '100 USD =',
      answer: '89.61 EUR',
      subtext: '1 USD = 0.8961 EUR',
      icon: 'Coins',
    };

    render(<DirectAnswerCard directAnswer={directAnswer} />);

    expect(screen.getByText('Currency Conversion')).toBeInTheDocument();
    expect(screen.getByText('100 USD =')).toBeInTheDocument();
    expect(screen.getByText('89.61 EUR')).toBeInTheDocument();
    expect(screen.getByText('1 USD = 0.8961 EUR')).toBeInTheDocument();
  });

  it('renders Unit Conversion card', () => {
    const directAnswer: SearchDirectAnswer = {
      type: 'converter',
      title: '10 km =',
      answer: '6.21371 miles',
      subtext: '1 km = 0.6214 miles',
      icon: 'Scale',
    };

    render(<DirectAnswerCard directAnswer={directAnswer} />);

    expect(screen.getByText('Unit Conversion')).toBeInTheDocument();
    expect(screen.getByText('10 km =')).toBeInTheDocument();
    expect(screen.getByText('6.21371 miles')).toBeInTheDocument();
  });

  it('renders World Clock card with time and city title', () => {
    const directAnswer: SearchDirectAnswer = {
      type: 'clock',
      title: 'Time in Tokyo, Japan',
      answer: '8:38 PM',
      subtext: 'Saturday, Nov 7, 2026 (Asia/Tokyo)',
      icon: 'Clock',
    };

    render(<DirectAnswerCard directAnswer={directAnswer} />);

    expect(screen.getByText('Local Time & World Clock')).toBeInTheDocument();
    expect(screen.getByText('Time in Tokyo, Japan')).toBeInTheDocument();
    expect(screen.getByText('8:38 PM')).toBeInTheDocument();
    expect(screen.getByText('Saturday, Nov 7, 2026 (Asia/Tokyo)')).toBeInTheDocument();
  });

  it('renders Direct Fact card', () => {
    const directAnswer: SearchDirectAnswer = {
      type: 'fact',
      title: 'Capital of France',
      answer: 'Paris',
      subtext: 'Capital city of France',
      icon: 'MapPin',
    };

    render(<DirectAnswerCard directAnswer={directAnswer} />);

    expect(screen.getByText('Direct Fact')).toBeInTheDocument();
    expect(screen.getByText('Capital of France')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });
});
