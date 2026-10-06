import React from 'react';
import { Language } from '../../types';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  variant?: 'compact' | 'pill';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
  variant = 'compact',
}) => {
  if (variant === 'pill') {
    return (
      <div className="inline-flex items-center p-1 bg-white/70 backdrop-blur-md rounded-full border border-slate-200/60 shadow-sm">
        <button
          type="button"
          onClick={() => onLanguageChange('en')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
            currentLanguage === 'en'
              ? 'bg-[#7B8CC8] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => onLanguageChange('tr')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
            currentLanguage === 'tr'
              ? 'bg-[#7B8CC8] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Türkçe
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onLanguageChange(currentLanguage === 'en' ? 'tr' : 'en')}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold border border-slate-200/80 shadow-sm transition-all active:scale-95"
      title="Switch Language / Dil Değiştir"
    >
      <Globe className="w-3.5 h-3.5 text-[#7B8CC8]" />
      <span>{currentLanguage === 'en' ? 'EN' : 'TR'}</span>
    </button>
  );
};
