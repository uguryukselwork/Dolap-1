import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Globe,
  Trash2,
  Check,
  ChevronRight,
  Shield,
  Palette,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { Gender, Language, Profile } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { STYLE_OPTIONS, SAMPLE_AVATARS } from '../../lib/sampleData';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { PillButton } from '../common/PillButton';

interface ProfileTabProps {
  profile: Profile;
  language: Language;
  onUpdateProfile: (updated: Partial<Profile>) => void;
  onDeleteAccount: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  language,
  onUpdateProfile,
  onDeleteAccount,
}) => {
  const [isEditingInfo, setIsEditingInfo] = useState<boolean>(false);
  const [isEditingStyles, setIsEditingStyles] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [height, setHeight] = useState<number>(profile.height || 172);
  const [bodyType, setBodyType] = useState<string>(profile.body_type || 'Athletic');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(profile.styles || []);
  const [saveToast, setSaveToast] = useState(false);

  const handleSaveInfo = () => {
    onUpdateProfile({
      name,
      gender,
      height,
      body_type: bodyType,
    });
    setIsEditingInfo(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleSaveStyles = () => {
    if (selectedStyles.length < 3) return;
    onUpdateProfile({ styles: selectedStyles });
    setIsEditingStyles(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 pt-3 pb-24 space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold font-editorial text-slate-900">
          {getTranslation(language, 'profile_title')}
        </h2>
      </div>

      {/* Free Demo Mode Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-sm flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-emerald-950">
              {getTranslation(language, 'demo_mode_badge')}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-200 text-emerald-800">
              100% Free
            </span>
          </div>
          <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
            {getTranslation(language, 'demo_mode_info')}
          </p>
        </div>
      </div>

      {/* Profile Header Avatar Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
        <div className="relative w-16 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
          <img
            src={profile.avatar_url || SAMPLE_AVATARS[0].url}
            alt="Profile Avatar"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-900 font-editorial">
            {profile.name}
          </h3>
          <p className="text-xs text-slate-400">
            {profile.gender} • {profile.height || 172} cm • {profile.body_type || 'Athletic'}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {profile.styles.slice(0, 3).map((st) => (
              <span
                key={st}
                className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#7B8CC8]/15 text-[#5263A8]"
              >
                {st}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Account Info Section */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {getTranslation(language, 'account_info')}
          </span>
          <button
            onClick={() => setIsEditingInfo(!isEditingInfo)}
            className="text-xs font-semibold text-[#5263A8] hover:underline"
          >
            {isEditingInfo ? getTranslation(language, 'cancel') : getTranslation(language, 'edit')}
          </button>
        </div>

        {isEditingInfo ? (
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                {language === 'tr' ? 'İsim' : 'Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#7B8CC8]"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                {language === 'tr' ? 'Cinsiyet' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#7B8CC8]"
              >
                {['Female', 'Male', 'Other', 'Prefer not to say'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                {language === 'tr' ? 'Boy (cm)' : 'Height (cm)'}: {height} cm
              </label>
              <input
                type="range"
                min={140}
                max={215}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-[#7B8CC8]"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                {language === 'tr' ? 'Vücut Tipi' : 'Body Type'}
              </label>
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#7B8CC8]"
              >
                {['Petite', 'Slim', 'Athletic', 'Regular', 'Curvy', 'Plus Size'].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <PillButton onClick={handleSaveInfo} variant="primary" size="sm" className="w-full">
              {getTranslation(language, 'save')}
            </PillButton>
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">{language === 'tr' ? 'İsim' : 'Name'}</span>
              <span className="font-semibold text-slate-800">{profile.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">{language === 'tr' ? 'Telefon' : 'Phone'}</span>
              <span className="font-semibold text-slate-800">{profile.phone || '+90 555 123 4567'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">{language === 'tr' ? 'Günlük Bildirim' : 'Daily Notification'}</span>
              <span className="font-semibold text-slate-800">{profile.notification_time || '08:30'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Preferred Styles Section */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {getTranslation(language, 'preferred_styles')}
          </span>
          <button
            onClick={() => setIsEditingStyles(!isEditingStyles)}
            className="text-xs font-semibold text-[#5263A8] hover:underline"
          >
            {isEditingStyles ? getTranslation(language, 'cancel') : getTranslation(language, 'edit')}
          </button>
        </div>

        {isEditingStyles ? (
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
              {STYLE_OPTIONS.map((style) => {
                const isSelected = selectedStyles.includes(style);
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedStyles(selectedStyles.filter((s) => s !== style));
                      } else if (selectedStyles.length < 6) {
                        setSelectedStyles([...selectedStyles, style]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#7B8CC8] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? `✓ ${style}` : style}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{selectedStyles.length}/6 selected (min 3)</span>
              <PillButton
                onClick={handleSaveStyles}
                variant="primary"
                size="sm"
                disabled={selectedStyles.length < 3}
              >
                {getTranslation(language, 'save')}
              </PillButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {profile.styles.map((style) => (
              <span
                key={style}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[#F3F2F9] text-[#5263A8]"
              >
                {style}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Language Switcher Setting */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-[#7B8CC8]" />
          <span className="text-xs font-bold text-slate-700">
            {getTranslation(language, 'app_language')}
          </span>
        </div>
        <LanguageSwitcher
          currentLanguage={language}
          onLanguageChange={(newLang) => onUpdateProfile({ language: newLang })}
          variant="pill"
        />
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="bg-rose-50/50 rounded-3xl p-4 border border-rose-200/80 shadow-sm space-y-2">
        <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
          {getTranslation(language, 'danger_zone')}
        </span>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {getTranslation(language, 'delete_confirm')}
        </p>

        {showDeleteConfirm ? (
          <div className="pt-2 flex gap-2">
            <button
              onClick={onDeleteAccount}
              className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-sm hover:bg-rose-700 active:scale-95 transition-all"
            >
              {language === 'tr' ? 'Evet, Her Şeyi Sil' : 'Yes, Delete Everything'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-2.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 active:scale-95 transition-all"
            >
              {getTranslation(language, 'cancel')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-2.5 rounded-full bg-white text-rose-600 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-rose-50 active:scale-95 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{getTranslation(language, 'delete_account')}</span>
          </button>
        )}
      </div>

      {/* Toast */}
      {saveToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-[#6CC86E]" />
          <span>{language === 'tr' ? 'Değişiklikler kaydedildi' : 'Profile updated successfully'}</span>
        </div>
      )}
    </div>
  );
};
