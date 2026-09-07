import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', desc: 'Focus the search input bar' },
    { key: 'Ctrl + K / ⌘ + K', desc: 'Alternative focus shortcut' },
    { key: 'Esc', desc: 'Close modals or clear active suggestions' },
    { key: '↑ / ↓', desc: 'Navigate through autocomplete suggestions' },
    { key: 'Enter', desc: 'Execute query / select suggestion' },
    { key: 't', desc: 'Quickly toggle Dark / Light mode' },
    { key: '?', desc: 'Open this keyboard shortcuts reference' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-zen-bg-darkSurface rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zen-bg-darkBorder flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-zen-bg-darkBorder shrink-0">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zen-bg-darkCard transition-colors"
            aria-label="Close shortcuts"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 divide-y divide-slate-100 dark:divide-zen-bg-darkBorder/60 overflow-y-auto">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0">
              <span className="text-slate-600 dark:text-slate-300">{s.desc}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-slate-100 dark:bg-zen-bg-darkCard text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zen-bg-darkBorder shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
