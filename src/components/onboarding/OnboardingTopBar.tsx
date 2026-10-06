import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

interface OnboardingTopBarProps {
  currentStep: number;
  totalSteps?: number;
  language: Language;
  onBack: () => void;
  onLanguageChange: (lang: Language) => void;
  canGoBack: boolean;
}

export const OnboardingTopBar: React.FC<OnboardingTopBarProps> = ({
  currentStep,
  totalSteps = 13,
  language,
  onBack,
  onLanguageChange,
  canGoBack,
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F8F7FC]/80 backdrop-blur-xl border-b border-slate-200/50 pt-3 pb-3 px-4">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Back button pill */}
        <div className="w-20">
          {canGoBack && currentStep > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold shadow-sm border border-slate-200/70 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{getTranslation(language, 'back')}</span>
            </button>
          )}
        </div>

        {/* Step indicator */}
        <div className="text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {getTranslation(language, 'step_of', { current: currentStep, total: totalSteps })}
          </span>
        </div>

        {/* Language switch & percentage pill */}
        <div className="w-24 flex items-center justify-end gap-1.5">
          <span className="text-xs font-semibold text-[#5263A8] bg-[#7B8CC8]/15 px-2 py-0.5 rounded-full">
            {percentage}%
          </span>
          <LanguageSwitcher currentLanguage={language} onLanguageChange={onLanguageChange} />
        </div>
      </div>

      {/* Gradient Progress Bar */}
      <div className="max-w-md mx-auto mt-2.5 h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#7B8CC8] via-[#8E9BD4] to-[#6CC86E] transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </header>
  );
};
