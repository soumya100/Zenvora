import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

interface RelatedQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
}

export const RelatedQuestions: React.FC<RelatedQuestionsProps> = ({
  questions,
  onSelectQuestion,
}) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="my-6 p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        <HelpCircle className="w-4 h-4 text-cyan-500" />
        <span>People Also Ask</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(q)}
            className="flex items-center justify-between p-3 text-left rounded-xl bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 transition-all group shadow-2xs"
          >
            <span className="line-clamp-2 pr-2">{q}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

