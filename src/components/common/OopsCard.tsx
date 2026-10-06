import React from 'react';
import { AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../i18n/translations';

interface OopsCardProps {
  language: Language;
  onRetry: () => void;
  onSkip?: () => void;
  failureCount: number;
  message?: string;
  isRetrying?: boolean;
}

export const OopsCard: React.FC<OopsCardProps> = ({
  language,
  onRetry,
  onSkip,
  failureCount,
  message,
  isRetrying = false,
}) => {
  const canSkip = failureCount >= 2 && Boolean(onSkip);

  return (
    <div className="w-full my-4 p-5 rounded-3xl bg-white/90 border border-red-100 shadow-xl shadow-red-500/5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-red-500">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-semibold text-slate-800">
            {getTranslation(language, 'oops_title')}
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {message || getTranslation(language, 'oops_desc')}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#7B8CC8] to-[#8E9BD4] shadow-sm hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? getTranslation(language, 'loading') : getTranslation(language, 'retry')}
            </button>

            {canSkip && (
              <button
                onClick={onSkip}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"
              >
                <span>{getTranslation(language, 'skip_after_failures')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
