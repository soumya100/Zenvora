import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext';
import { useTranslation, resolveLanguage } from '../src/utils/i18n';

const LanguageConsumer = () => {
  const { settings, updateSettings } = useSettings();
  const { t, currentLang } = useTranslation();

  return (
    <div>
      <span data-testid="current-lang">{currentLang}</span>
      <span data-testid="current-region">{settings.region}</span>
      <span data-testid="translated-search">{t('searchButton')}</span>
      <span data-testid="translated-settings">{t('settings')}</span>
      <span data-testid="translated-cat-all">{t('catAll')}</span>
      <button
        data-testid="btn-set-spanish"
        onClick={() => updateSettings({ language: 'es', region: 'es' })}
      >
        Set Spanish
      </button>
      <button
        data-testid="btn-set-german"
        onClick={() => updateSettings({ language: 'de', region: 'de' })}
      >
        Set German
      </button>
      <button
        data-testid="btn-set-japanese"
        onClick={() => updateSettings({ language: 'ja', region: 'jp' })}
      >
        Set Japanese
      </button>
      <button
        data-testid="btn-set-english"
        onClick={() => updateSettings({ language: 'en', region: 'us' })}
      >
        Set English
      </button>
    </div>
  );
};

describe('i18n and Language/Region Switching', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  it('correctly resolves language preferences and fallbacks', () => {
    expect(resolveLanguage('es')).toBe('es');
    expect(resolveLanguage('fr')).toBe('fr');
    expect(resolveLanguage('de')).toBe('de');
    expect(resolveLanguage('ja')).toBe('ja');
    expect(resolveLanguage('zh')).toBe('zh');
    expect(resolveLanguage('en')).toBe('en');
    expect(resolveLanguage('unknown')).toBe('en');
  });

  it('translates interface elements in real time when language and region are changed', async () => {
    render(
      <SettingsProvider>
        <LanguageConsumer />
      </SettingsProvider>
    );

    // Initial English default
    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(screen.getByTestId('translated-search').textContent).toBe('Search');
    expect(screen.getByTestId('translated-settings').textContent).toBe('Settings');
    expect(screen.getByTestId('translated-cat-all').textContent).toBe('All');

    // Switch to Spanish
    await act(async () => {
      await userEvent.click(screen.getByTestId('btn-set-spanish'));
    });

    expect(screen.getByTestId('current-lang').textContent).toBe('es');
    expect(screen.getByTestId('current-region').textContent).toBe('es');
    expect(screen.getByTestId('translated-search').textContent).toBe('Buscar');
    expect(screen.getByTestId('translated-settings').textContent).toBe('Configuración');
    expect(screen.getByTestId('translated-cat-all').textContent).toBe('Todos');
    expect(document.documentElement.lang).toBe('es');

    // Switch to German
    await act(async () => {
      await userEvent.click(screen.getByTestId('btn-set-german'));
    });

    expect(screen.getByTestId('current-lang').textContent).toBe('de');
    expect(screen.getByTestId('current-region').textContent).toBe('de');
    expect(screen.getByTestId('translated-search').textContent).toBe('Suchen');
    expect(screen.getByTestId('translated-settings').textContent).toBe('Einstellungen');
    expect(screen.getByTestId('translated-cat-all').textContent).toBe('Alle');
    expect(document.documentElement.lang).toBe('de');

    // Switch to Japanese
    await act(async () => {
      await userEvent.click(screen.getByTestId('btn-set-japanese'));
    });

    expect(screen.getByTestId('current-lang').textContent).toBe('ja');
    expect(screen.getByTestId('current-region').textContent).toBe('jp');
    expect(screen.getByTestId('translated-search').textContent).toBe('検索');
    expect(screen.getByTestId('translated-settings').textContent).toBe('設定');
    expect(screen.getByTestId('translated-cat-all').textContent).toBe('すべて');
    expect(document.documentElement.lang).toBe('ja');
  });
});
