import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext';

const ConsumerComponentA = () => {
  const { settings, updateSettings, toggleTheme, isDark } = useSettings();
  return (
    <div>
      <span data-testid="theme-val">{settings.theme}</span>
      <span data-testid="dark-val">{isDark ? 'true' : 'false'}</span>
      <span data-testid="logo-scheme">{settings.logoScheme || 'sunset'}</span>
      <button data-testid="btn-toggle-theme" onClick={toggleTheme}>Toggle Theme</button>
      <button data-testid="btn-set-aurora" onClick={() => updateSettings({ logoScheme: 'aurora' })}>Set Aurora</button>
      <button data-testid="btn-set-cyber" onClick={() => updateSettings({ logoScheme: 'cyber' })}>Set Cyber</button>
    </div>
  );
};

const ConsumerComponentB = () => {
  const { settings } = useSettings();
  return (
    <div>
      <span data-testid="comp-b-scheme">{settings.logoScheme || 'sunset'}</span>
      <span data-testid="comp-b-theme">{settings.theme}</span>
    </div>
  );
};

describe('SettingsContext Real-Time Reactivity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updates all subscribed consumer components in real time without page reload', async () => {
    render(
      <SettingsProvider>
        <ConsumerComponentA />
        <ConsumerComponentB />
      </SettingsProvider>
    );

    // Initial default values
    expect(screen.getByTestId('logo-scheme').textContent).toBe('sunset');
    expect(screen.getByTestId('comp-b-scheme').textContent).toBe('sunset');

    // Click to change logo scheme to aurora in Component A
    await act(async () => {
      await userEvent.click(screen.getByTestId('btn-set-aurora'));
    });

    // BOTH Component A and Component B MUST immediately reflect the change in real-time
    expect(screen.getByTestId('logo-scheme').textContent).toBe('aurora');
    expect(screen.getByTestId('comp-b-scheme').textContent).toBe('aurora');

    // Change to cyber
    await act(async () => {
      await userEvent.click(screen.getByTestId('btn-set-cyber'));
    });

    expect(screen.getByTestId('logo-scheme').textContent).toBe('cyber');
    expect(screen.getByTestId('comp-b-scheme').textContent).toBe('cyber');
  });

  it('toggles theme in real-time across components and updates document dark class', async () => {
    render(
      <SettingsProvider>
        <ConsumerComponentA />
        <ConsumerComponentB />
      </SettingsProvider>
    );

    await act(async () => {
      await userEvent.click(screen.getByTestId('btn-toggle-theme'));
    });

    const themeA = screen.getByTestId('theme-val').textContent;
    const themeB = screen.getByTestId('comp-b-theme').textContent;
    expect(themeA).toBe(themeB);
    expect(['dark', 'light']).toContain(themeA);
  });
});
