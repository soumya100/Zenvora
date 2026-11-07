import React, { useState } from 'react';
import { SearchDirectAnswer } from '../types';
import {
  Calculator,
  Coins,
  Clock,
  Scale,
  Thermometer,
  BookOpen,
  MapPin,
  Calendar,
  Sparkles,
  Copy,
  Check,
  Atom,
} from 'lucide-react';

interface DirectAnswerCardProps {
  directAnswer: SearchDirectAnswer;
}

export const DirectAnswerCard: React.FC<DirectAnswerCardProps> = ({ directAnswer }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(directAnswer.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = () => {
    switch (directAnswer.type) {
      case 'calculator':
        return <Calculator className="w-5 h-5 text-emerald-500" />;
      case 'currency':
        return <Coins className="w-5 h-5 text-amber-500" />;
      case 'converter':
        return directAnswer.icon === 'Thermometer' ? (
          <Thermometer className="w-5 h-5 text-rose-500" />
        ) : (
          <Scale className="w-5 h-5 text-cyan-500" />
        );
      case 'clock':
        return <Clock className="w-5 h-5 text-indigo-500" />;
      case 'dictionary':
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      case 'age':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'fact':
        return directAnswer.icon === 'Atom' ? (
          <Atom className="w-5 h-5 text-cyan-500" />
        ) : (
          <MapPin className="w-5 h-5 text-rose-500" />
        );
      default:
        return <Sparkles className="w-5 h-5 text-cyan-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (directAnswer.type) {
      case 'calculator':
        return 'Calculator Result';
      case 'currency':
        return 'Currency Conversion';
      case 'converter':
        return 'Unit Conversion';
      case 'clock':
        return 'Local Time & World Clock';
      case 'dictionary':
        return 'Dictionary Definition';
      case 'age':
        return 'Age & Lifespan';
      case 'fact':
        return 'Direct Fact';
      default:
        return 'Instant Answer';
    }
  };

  return (
    <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-cyan-500/5 to-indigo-500/5 dark:from-slate-900/80 dark:via-cyan-950/20 dark:to-indigo-950/20 border border-slate-200/80 dark:border-cyan-500/20 shadow-md backdrop-blur-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-cyan-700 dark:text-cyan-400">
          {getIcon()}
          <span>{getTypeLabel()}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors"
          title="Copy result"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-1">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {directAnswer.title}
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {directAnswer.answer}
        </div>
        {directAnswer.subtext && (
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-1">
            {directAnswer.subtext}
          </div>
        )}
      </div>

      {directAnswer.details && directAnswer.details.example && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs italic text-slate-600 dark:text-slate-300">
          Example: {directAnswer.details.example}
        </div>
      )}
    </div>
  );
};

