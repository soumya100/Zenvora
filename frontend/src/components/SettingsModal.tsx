import React from 'react';
import { X, Shield, Sliders, Moon, Sun, Monitor, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { SearchCategory, ThemePreference, LogoScheme } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-zen-bg-darkSurface rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zen-bg-darkBorder flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-zen-bg-darkBorder shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Search Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Saved locally in your browser. Zero cloud tracking.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zen-bg-darkCard transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Appearance & Theme
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { id: 'dark' as ThemePreference, label: 'Dark', icon: Moon },
                { id: 'light' as ThemePreference, label: 'Light', icon: Sun },
                { id: 'system' as ThemePreference, label: 'System', icon: Monitor },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => updateSettings({ theme: id })}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                    settings.theme === id
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 shadow-sm'
                      : 'border-slate-200 dark:border-zen-bg-darkBorder hover:bg-slate-50 dark:hover:bg-zen-bg-darkCard text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Logo Accent */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Logo Color Accent
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { id: 'sunset' as LogoScheme, label: 'Sunset Neon', colors: 'from-[#FF7A00] via-[#FF006E] to-[#8338EC]' },
                { id: 'aurora' as LogoScheme, label: 'Aurora Mint', colors: 'from-[#00F5A0] via-[#00D9F5] to-[#4361EE]' },
                { id: 'cyber' as LogoScheme, label: 'Cyber Prism', colors: 'from-[#00E5FF] via-[#7C4DFF] to-[#FF4081]' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateSettings({ logoScheme: item.id })}
                  className={`flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-medium transition-all ${
                    (settings.logoScheme || 'sunset') === item.id
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 font-bold shadow-sm'
                      : 'border-slate-200 dark:border-zen-bg-darkBorder hover:bg-slate-50 dark:hover:bg-zen-bg-darkCard text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className={`w-full h-2.5 sm:h-3 rounded-full bg-gradient-to-r ${item.colors}`} />
                  <span className="truncate max-w-full">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyan-500" />
                SafeSearch Filtering
              </label>
              <span className="text-xs text-slate-400">
                {settings.safeSearch === 0 ? 'Off' : settings.safeSearch === 1 ? 'Moderate' : 'Strict'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { val: 0, label: 'Off', desc: 'No content filtering' },
                { val: 1, label: 'Moderate', desc: 'Filters explicit images' },
                { val: 2, label: 'Strict', desc: 'Filters all explicit content' },
              ].map((lvl) => (
                <button
                  key={lvl.val}
                  type="button"
                  onClick={() => updateSettings({ safeSearch: lvl.val })}
                  className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all ${
                    settings.safeSearch === lvl.val
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400'
                      : 'border-slate-200 dark:border-zen-bg-darkBorder hover:bg-slate-50 dark:hover:bg-zen-bg-darkCard text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{lvl.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Default Category
            </label>
            <select
              value={settings.defaultCategory}
              onChange={(e) => updateSettings({ defaultCategory: e.target.value as SearchCategory })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zen-bg-darkCard border border-slate-200 dark:border-zen-bg-darkBorder text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="general">General (All Web)</option>
              <option value="news">News</option>
              <option value="images">Images</option>
              <option value="videos">Videos</option>
              <option value="science">Science & Academic</option>
              <option value="it">IT & Code</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Interface Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zen-bg-darkCard border border-slate-200 dark:border-zen-bg-darkBorder text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="auto">Automatic (Browser Default)</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Search Region
              </label>
              <select
                value={settings.region}
                onChange={(e) => updateSettings({ region: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zen-bg-darkCard border border-slate-200 dark:border-zen-bg-darkBorder text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="auto">Global / Auto</option>
                <option value="us">United States</option>
                <option value="gb">United Kingdom</option>
                <option value="de">Germany</option>
                <option value="fr">France</option>
                <option value="in">India</option>
                <option value="jp">Japan</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zen-bg-darkCard border border-slate-200 dark:border-zen-bg-darkBorder cursor-pointer">
              <div className="pr-4">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                  Open links in new tab
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Opens clicked search results in a fresh browser tab
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.openInNewTab}
                onChange={(e) => updateSettings({ openInNewTab: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zen-bg-darkCard border border-slate-200 dark:border-zen-bg-darkBorder cursor-pointer">
              <div className="pr-4">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                  Instant search suggestions
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Query suggestions without storing your typing history
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showSuggestions}
                onChange={(e) => updateSettings({ showSuggestions: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-600 dark:text-cyan-400 block mb-0.5">
                Client-Side Only
              </span>
              All configuration parameters are stored exclusively in your browser's localStorage. Zenvora maintains zero server-side user accounts or profile identifiers.
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-zen-bg-darkCard/50 border-t border-slate-200 dark:border-zen-bg-darkBorder flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold shadow-md transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
