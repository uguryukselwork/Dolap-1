import React from 'react';
import { Sparkles, Shirt, Camera, Heart, User } from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../i18n/translations';

export type MainTabType = 'look' | 'closet' | 'scan' | 'favourites' | 'profile';

interface BottomNavProps {
  currentTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  language,
}) => {
  const tabs = [
    {
      id: 'look' as MainTabType,
      labelKey: 'tab_look',
      icon: Sparkles,
    },
    {
      id: 'closet' as MainTabType,
      labelKey: 'tab_closet',
      icon: Shirt,
    },
    {
      id: 'scan' as MainTabType,
      labelKey: 'tab_scan',
      icon: Camera,
      isCenter: true,
    },
    {
      id: 'favourites' as MainTabType,
      labelKey: 'tab_favourites',
      icon: Heart,
    },
    {
      id: 'profile' as MainTabType,
      labelKey: 'tab_profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-2xl border-t border-slate-200/60 pb-[env(safe-area-inset-bottom,8px)] pt-2 px-3 shadow-lg shadow-slate-900/5">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className="group relative -top-4 flex flex-col items-center cursor-pointer active:scale-90 transition-transform"
                title={getTranslation(language, tab.labelKey as any)}
              >
                <div
                  className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-tr from-[#687AB8] to-[#8E9BD4] text-white ring-4 ring-[#7B8CC8]/20 scale-105 shadow-[#7B8CC8]/40'
                      : 'bg-gradient-to-tr from-[#7B8CC8] to-[#8E9BD4] text-white shadow-[#7B8CC8]/30 group-hover:scale-105'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 transition-colors ${
                    isActive ? 'text-[#5263A8]' : 'text-slate-500'
                  }`}
                >
                  {getTranslation(language, tab.labelKey as any)}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className="flex flex-col items-center py-1 px-2.5 rounded-2xl cursor-pointer active:scale-95 transition-all text-center"
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-[#5263A8] bg-[#7B8CC8]/15'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-semibold mt-0.5 transition-colors truncate max-w-[64px] ${
                  isActive ? 'text-[#5263A8] font-bold' : 'text-slate-400'
                }`}
              >
                {getTranslation(language, tab.labelKey as any)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
