import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
}) => {
  const { t } = useTranslation();

  return (
    <div className="py-12 px-4 text-center max-w-md mx-auto animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center text-amber-500">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {t('errorTitle')}
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        {message || t('errorDesc')}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium text-sm shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
        >
          <RefreshCw className="w-4 h-4" />
          {t('retryButton')}
        </button>
      )}
    </div>
  );
};
