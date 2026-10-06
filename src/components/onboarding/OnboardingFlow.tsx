import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Camera,
  Upload,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Check,
  Calendar,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  ArrowRight,
  Shirt,
} from 'lucide-react';
import { ClothingItem, Gender, Language, Profile } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { STYLE_OPTIONS, SAMPLE_AVATARS, STARTER_CLOTHES } from '../../lib/sampleData';
import { apiService } from '../../lib/api';
import { OopsCard } from '../common/OopsCard';
import { PillButton } from '../common/PillButton';
import { OnboardingTopBar } from './OnboardingTopBar';

interface OnboardingFlowProps {
  initialProfile: Profile;
  clothes: ClothingItem[];
  onComplete: (profile: Profile, selectedClothes: ClothingItem[]) => void;
  onUpdateProfile: (profile: Partial<Profile>) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialProfile,
  clothes,
  onComplete,
  onUpdateProfile,
}) => {
  const [step, setStep] = useState<number>(initialProfile.onboarding_step || 1);
  const [profile, setProfile] = useState<Profile>(initialProfile);

  // Clothing selection for Step 8 & 9
  const [selectedTop, setSelectedTop] = useState<ClothingItem>(
    STARTER_CLOTHES.find((c) => c.category === 'Tops') || STARTER_CLOTHES[0]
  );
  const [selectedBottom, setSelectedBottom] = useState<ClothingItem>(
    STARTER_CLOTHES.find((c) => c.category === 'Bottoms') || STARTER_CLOTHES[3]
  );

  // Step 9: Try-on state
  const [waistLevel, setWaistLevel] = useState<number>(50);
  const [tryonImage, setTryonImage] = useState<string | null>(null);
  const [isTryonLoading, setIsTryonLoading] = useState<boolean>(false);
  const [tryonFailures, setTryonFailures] = useState<number>(0);
  const [tryonError, setTryonError] = useState<string | null>(null);

  // Step 12 & 13: Auth OTP state
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState<string>(profile.phone || '+90 555 123 4567');
  const [emailAddress, setEmailAddress] = useState<string>('alex@example.com');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState<number>(60);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update profile in parent
  const handleProfileChange = (changes: Partial<Profile>) => {
    const updated = { ...profile, ...changes };
    setProfile(updated);
    onUpdateProfile(changes);
  };

  const nextStep = () => {
    const next = Math.min(step + 1, 13);
    setStep(next);
    handleProfileChange({ onboarding_step: next });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    const prev = Math.max(step - 1, 1);
    setStep(prev);
    handleProfileChange({ onboarding_step: prev });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sparkles trigger on Step 11
  useEffect(() => {
    if (step === 11) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7B8CC8', '#8E9BD4', '#6CC86E', '#F7E3C8'],
        });
      } catch {}
    }
  }, [step]);

  // Resend cooldown timer for OTP
  useEffect(() => {
    if (step === 13 && resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, resendCooldown]);

  // Handle avatar file upload
  const handleAvatarFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleProfileChange({ avatar_url: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  // Virtual Try-on API call
  const handleGenerateTryon = async () => {
    if (!profile.avatar_url) return;
    setIsTryonLoading(true);
    setTryonError(null);

    try {
      const resultImageUrl = await apiService.virtualTryOn({
        avatarImage: profile.avatar_url,
        clothingImages: [selectedTop.image_url, selectedBottom.image_url],
        waistLevel,
        description: `${selectedTop.subcategory} paired with ${selectedBottom.subcategory}`,
      });
      setTryonImage(resultImageUrl);
      setTryonFailures(0);
    } catch (err: any) {
      console.error('Tryon error:', err);
      setTryonFailures((f) => f + 1);
      setTryonError(err?.message || 'Virtual try-on generation failed.');
    } finally {
      setIsTryonLoading(false);
    }
  };

  // Step 6: Age calculation
  const calculateAge = (birthdayStr?: string): number => {
    if (!birthdayStr) return 24;
    const birth = new Date(birthdayStr);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  const currentAge = calculateAge(profile.birthday);
  const isAgeValid = currentAge >= 13;

  // Step 13: OTP handlers
  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = clean;
    setOtpDigits(updated);

    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || '';
    }
    setOtpDigits(updated);
    const nextEmptyIndex = updated.findIndex((d) => !d);
    if (nextEmptyIndex !== -1) {
      otpInputRefs.current[nextEmptyIndex]?.focus();
    } else {
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleFinishOnboarding = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onComplete(
        {
          ...profile,
          onboarding_step: 14, // completed
        },
        [selectedTop, selectedBottom]
      );
    }, 600);
  };

  const lang = profile.language || 'en';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FC] text-slate-800 pb-12">
      {/* Top Bar */}
      <OnboardingTopBar
        currentStep={step}
        totalSteps={13}
        language={lang}
        canGoBack={step > 1}
        onBack={prevStep}
        onLanguageChange={(newLang) => handleProfileChange({ language: newLang })}
      />

      {/* Step Content Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-4 flex flex-col justify-between">
        <div className="flex-1">
          {/* STEP 1: Language */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center pt-4">
                <span className="text-4xl">🌍</span>
                <h2 className="text-2xl font-bold font-editorial text-slate-900 mt-3">
                  {getTranslation(lang, 'step1_title')}
                </h2>
                <p className="text-sm text-slate-500 mt-1.5">
                  {getTranslation(lang, 'step1_subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => handleProfileChange({ language: 'en' })}
                  className={`p-5 rounded-3xl border-2 flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    lang === 'en'
                      ? 'border-[#7B8CC8] bg-white shadow-md shadow-[#7B8CC8]/15 ring-2 ring-[#7B8CC8]/20'
                      : 'border-slate-200/80 bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl">🇬🇧</span>
                    <div className="text-left">
                      <div className="font-semibold text-slate-800">English</div>
                      <div className="text-xs text-slate-400">United States / Global</div>
                    </div>
                  </div>
                  {lang === 'en' && (
                    <div className="w-6 h-6 rounded-full bg-[#7B8CC8] text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleProfileChange({ language: 'tr' })}
                  className={`p-5 rounded-3xl border-2 flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    lang === 'tr'
                      ? 'border-[#7B8CC8] bg-white shadow-md shadow-[#7B8CC8]/15 ring-2 ring-[#7B8CC8]/20'
                      : 'border-slate-200/80 bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl">🇹🇷</span>
                    <div className="text-left">
                      <div className="font-semibold text-slate-800">Türkçe</div>
                      <div className="text-xs text-slate-400">Türkiye & Kıbrıs</div>
                    </div>
                  </div>
                  {lang === 'tr' && (
                    <div className="w-6 h-6 rounded-full bg-[#7B8CC8] text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Name */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center pt-4">
                <span className="text-4xl">👋</span>
                <h2 className="text-2xl font-bold font-editorial text-slate-900 mt-3">
                  {getTranslation(lang, 'step2_title')}
                </h2>
                <p className="text-sm text-slate-500 mt-1.5">
                  {getTranslation(lang, 'step2_subtitle')}
                </p>
              </div>

              <div className="pt-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-[#7B8CC8]/30 transition-all">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {getTranslation(lang, 'step2_placeholder')}
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleProfileChange({ name: e.target.value })}
                    placeholder={lang === 'tr' ? 'Örn: Deniz, Ece, Can' : 'e.g. Alex, Jordan, Taylor'}
                    autoFocus
                    className="w-full text-xl font-medium text-slate-800 placeholder-slate-300 outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Gender */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center pt-4">
                <span className="text-4xl">✨</span>
                <h2 className="text-2xl font-bold font-editorial text-slate-900 mt-3">
                  {getTranslation(lang, 'step3_title')}
                </h2>
                <p className="text-sm text-slate-500 mt-1.5">
                  {getTranslation(lang, 'step3_subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-3">
                {(['Female', 'Male', 'Other', 'Prefer not to say'] as Gender[]).map((gen) => {
                  const isSelected = profile.gender === gen;
                  const labelKey =
                    gen === 'Female'
                      ? 'gender_female'
                      : gen === 'Male'
                      ? 'gender_male'
                      : gen === 'Other'
                      ? 'gender_other'
                      : 'gender_prefer_not';

                  return (
                    <button
                      key={gen}
                      type="button"
                      onClick={() => handleProfileChange({ gender: gen })}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#7B8CC8] bg-white shadow-sm ring-1 ring-[#7B8CC8]/30'
                          : 'border-slate-200/80 bg-white/60 hover:bg-white'
                      }`}
                    >
                      <span className="font-semibold text-slate-800 text-sm">
                        {getTranslation(lang, labelKey as any)}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#7B8CC8] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Height & Body Type (Skippable) */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8" />
                  <span className="text-4xl">📏</span>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="text-xs font-semibold text-[#7B8CC8] hover:underline"
                  >
                    {getTranslation(lang, 'skip')}
                  </button>
                </div>
                <h2 className="text-2xl font-bold font-editorial text-slate-900">
                  {getTranslation(lang, 'step4_title')}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {getTranslation(lang, 'step4_subtitle')}
                </p>
              </div>

              {/* Height slider */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {getTranslation(lang, 'step4_height_label')}
                  </span>
                  <span className="text-lg font-bold text-[#5263A8]">
                    {profile.height || 172} cm
                  </span>
                </div>
                <input
                  type="range"
                  min={140}
                  max={215}
                  value={profile.height || 172}
                  onChange={(e) => handleProfileChange({ height: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#7B8CC8]"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>140 cm</span>
                  <span>175 cm</span>
                  <span>215 cm</span>
                </div>
              </div>

              {/* Body Type options */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block px-1">
                  {getTranslation(lang, 'step4_body_label')}
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'Petite', label: 'body_petite' },
                    { id: 'Slim', label: 'body_slim' },
                    { id: 'Athletic', label: 'body_athletic' },
                    { id: 'Regular', label: 'body_regular' },
                    { id: 'Curvy', label: 'body_curvy' },
                    { id: 'Plus Size', label: 'body_plus' },
                  ].map((item) => {
                    const isSelected = profile.body_type === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleProfileChange({ body_type: item.id })}
                        className={`p-3 rounded-2xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#7B8CC8] bg-white text-[#5263A8] shadow-sm ring-1 ring-[#7B8CC8]/30 font-bold'
                            : 'border-slate-200/80 bg-white/70 text-slate-600 hover:bg-white'
                        }`}
                      >
                        {getTranslation(lang, item.label as any)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Full-Body Avatar Upload */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center pt-2">
                <span className="text-4xl">📸</span>
                <h2 className="text-2xl font-bold font-editorial text-slate-900 mt-2">
                  {getTranslation(lang, 'step5_title')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {getTranslation(lang, 'step5_subtitle')}
                </p>
              </div>

              {/* Privacy badge */}
              <div className="p-3 bg-[#F7E3C8]/40 border border-[#F7E3C8] rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 leading-snug">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{getTranslation(lang, 'step5_privacy')}</span>
              </div>

              {/* Avatar Preview & Upload Action */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="relative w-36 h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner group">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs">
                      <Camera className="w-8 h-8 mb-1 text-slate-300" />
                      <span>No photo</span>
                    </div>
                  )}
                </div>

                {/* Upload Buttons */}
                <div className="flex gap-2 mt-3.5 w-full">
                  <label className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#F3F2F9] hover:bg-[#EAE8F5] text-[#5263A8] text-xs font-semibold cursor-pointer active:scale-95 transition-all text-center">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{getTranslation(lang, 'step5_camera')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarFile(file);
                      }}
                    />
                  </label>

                  <label className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#7B8CC8] hover:bg-[#6E7FB8] text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all text-center">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{getTranslation(lang, 'step5_gallery')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarFile(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Or Select Demo Preset Avatar */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 block text-center">
                  {getTranslation(lang, 'step5_presets_label')}
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleProfileChange({ avatar_url: av.url })}
                      className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        profile.avatar_url === av.url
                          ? 'border-[#7B8CC8] ring-2 ring-[#7B8CC8]/30 scale-105 shadow-md'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={av.url}
                        alt={av.name}
                        className="w-full h-full object-cover object-top"
                      />
                      {profile.avatar_url === av.url && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7B8CC8] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Birthday Wheel Picker (13+ only) */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center pt-4">
                <span className="text-4xl">🎂</span>
                <h2 className="text-2xl font-bold font-editorial text-slate-900 mt-3">
                  {getTranslation(lang, 'step6_title')}
                </h2>
                <p className="text-sm text-slate-500 mt-1.5">
                  {getTranslation(lang, 'step6_subtitle')}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200/80 text-slate-700 text-sm font-semibold">
                  <Calendar className="w-4 h-4 text-[#7B8CC8]" />
                  <span>
                    {getTranslation(lang, 'step6_selected_age', { age: currentAge })}
                  </span>
                </div>

                <div className="pt-2">
                  <input
                    type="date"
                    value={profile.birthday || '2000-05-15'}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleProfileChange({ birthday: e.target.value })}
                    className="w-full py-4 px-5 text-xl font-bold text-center text-[#5263A8] bg-[#F8F7FC] rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7B8CC8]/30"
                  />
                </div>

                {!isAgeValid && (
                  <p className="text-xs text-red-500 font-medium">
                    {getTranslation(lang, 'step6_age_error')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 7: Style Chips (min 3, max 6) */}
          {step === 7 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center pt-2">
                <span className="text-4xl">🎨</span>
                <h2 className="text-2xl font-bold font-editorial text-slate-900 mt-2">
                  {getTranslation(lang, 'step7_title')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {getTranslation(lang, 'step7_subtitle')}
                </p>
                <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#7B8CC8]/15 text-[#5263A8]">
                  {getTranslation(lang, 'step7_counter', { count: profile.styles.length })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center max-h-[360px] overflow-y-auto no-scrollbar p-1">
                {STYLE_OPTIONS.map((style) => {
                  const isSelected = profile.styles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          handleProfileChange({
                            styles: profile.styles.filter((s) => s !== style),
                          });
                        } else if (profile.styles.length < 6) {
                          handleProfileChange({
                            styles: [...profile.styles, style],
                          });
                        }
                      }}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 ${
                        isSelected
                          ? 'bg-[#7B8CC8] text-white shadow-md shadow-[#7B8CC8]/30 ring-2 ring-[#7B8CC8]/20'
                          : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? `✓ ${style}` : style}
                    </button>
                  );
                })}
              </div>

              {profile.styles.length < 3 && (
                <p className="text-xs text-amber-600 text-center font-medium">
                  {getTranslation(lang, 'step7_min_error')}
                </p>
              )}
            </div>
          )}

          {/* STEP 8: Add first Top + Bottom */}
          {step === 8 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center pt-2">
                <span className="text-4xl">👚👖</span>
                <h2 className="text-2xl font-bold font-editorial text-slate-900 mt-2">
                  {getTranslation(lang, 'step8_title')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {getTranslation(lang, 'step8_subtitle')}
                </p>
              </div>

              {/* Selected Combo preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm flex flex-col items-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {getTranslation(lang, 'step8_top_label')}
                  </span>
                  <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-2">
                    <img
                      src={selectedTop.image_url}
                      alt={selectedTop.subcategory}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 text-center truncate w-full">
                    {selectedTop.subcategory}
                  </span>
                  <span className="text-[10px] text-slate-400">{selectedTop.color}</span>
                </div>

                <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm flex flex-col items-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {getTranslation(lang, 'step8_bottom_label')}
                  </span>
                  <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-2">
                    <img
                      src={selectedBottom.image_url}
                      alt={selectedBottom.subcategory}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 text-center truncate w-full">
                    {selectedBottom.subcategory}
                  </span>
                  <span className="text-[10px] text-slate-400">{selectedBottom.color}</span>
                </div>
              </div>

              {/* Choose from starters */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 block px-1">
                  {lang === 'tr' ? 'Seçeneklerden dokunup değiştirin:' : 'Tap to swap choices:'}
                </span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {STARTER_CLOTHES.filter((c) => c.category === 'Tops').map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTop(t)}
                      className={`relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        selectedTop.id === t.id
                          ? 'border-[#7B8CC8] ring-2 ring-[#7B8CC8]/30 scale-105'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={t.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {STARTER_CLOTHES.filter((c) => c.category === 'Bottoms').map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBottom(b)}
                      className={`relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        selectedBottom.id === b.id
                          ? 'border-[#7B8CC8] ring-2 ring-[#7B8CC8]/30 scale-105'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: First Try-on with vertical Waist Level slider */}
          {step === 9 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center pt-1">
                <span className="text-3xl">👗</span>
                <h2 className="text-xl font-bold font-editorial text-slate-900 mt-1">
                  {getTranslation(lang, 'step9_title')}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {getTranslation(lang, 'step9_subtitle')}
                </p>
              </div>

              {/* Try-on Stage */}
              <div className="relative bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex items-center justify-center gap-4">
                {/* Central Avatar Stage */}
                <div className="relative w-44 h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <img
                    src={tryonImage || profile.avatar_url || SAMPLE_AVATARS[0].url}
                    alt="Fitting"
                    className="w-full h-full object-cover object-top"
                  />

                  {/* Garment Floating chips preview if not yet generated */}
                  {!tryonImage && (
                    <div className="absolute inset-0 bg-black/20 flex flex-col justify-between p-2">
                      <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-semibold text-slate-700 shadow-sm self-start">
                        {selectedTop.subcategory}
                      </div>
                      <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-semibold text-slate-700 shadow-sm self-end">
                        {selectedBottom.subcategory}
                      </div>
                    </div>
                  )}

                  {isTryonLoading && (
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-3 animate-in fade-in">
                      <div className="w-8 h-8 rounded-full border-3 border-[#7B8CC8] border-t-transparent animate-spin mb-2" />
                      <span className="text-xs font-semibold text-[#5263A8]">
                        {getTranslation(lang, 'step9_generating')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Vertical Waist Level Slider & Steppers */}
                <div className="flex flex-col items-center justify-center bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setWaistLevel((prev) => Math.min(100, prev + 5))}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95"
                    title="Raise Waist"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  <div className="py-3 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">100</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={waistLevel}
                      onChange={(e) => setWaistLevel(Number(e.target.value))}
                      style={{
                        writingMode: 'vertical-lr',
                        direction: 'rtl',
                        height: '110px',
                        width: '24px',
                      }}
                      className="cursor-pointer accent-[#7B8CC8]"
                    />
                    <span className="text-[10px] font-bold text-slate-400">0</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWaistLevel((prev) => Math.max(0, prev - 5))}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95"
                    title="Lower Waist"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <div className="mt-2 text-[10px] font-bold text-[#5263A8] text-center">
                    {waistLevel}%
                  </div>
                </div>
              </div>

              {/* Waist hint */}
              <p className="text-[11px] text-slate-400 text-center px-4">
                {getTranslation(lang, 'step9_waist_hint')}
              </p>

              {/* Error handling card with retry and skip */}
              {tryonError && (
                <OopsCard
                  language={lang}
                  message={tryonError}
                  failureCount={tryonFailures}
                  onRetry={handleGenerateTryon}
                  onSkip={nextStep}
                  isRetrying={isTryonLoading}
                />
              )}

              {/* Trigger Try-On Button */}
              {!tryonImage && !isTryonLoading && (
                <button
                  type="button"
                  onClick={handleGenerateTryon}
                  className="w-full py-3 rounded-full bg-[#F3F2F9] hover:bg-[#EAE8F5] text-[#5263A8] text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#7B8CC8]" />
                  <span>{getTranslation(lang, 'step9_tryon_btn')}</span>
                </button>
              )}
            </div>
          )}

          {/* STEP 10: Notification Time */}
          {step === 10 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center pt-4">
                <span className="text-4xl">⏰</span>
                <h2 className="text-2xl font-bold font-editorial text-slate-900 mt-3">
                  {getTranslation(lang, 'step10_title')}
                </h2>
                <p className="text-sm text-slate-500 mt-1.5">
                  {getTranslation(lang, 'step10_subtitle')}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#7B8CC8]" />
                  <span>{getTranslation(lang, 'step10_time_label')}</span>
                </div>

                <input
                  type="time"
                  value={profile.notification_time || '08:30'}
                  onChange={(e) => handleProfileChange({ notification_time: e.target.value })}
                  className="py-4 px-6 text-3xl font-extrabold text-[#5263A8] bg-[#F8F7FC] rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7B8CC8]/30 mx-auto"
                />

                <p className="text-xs text-slate-400 leading-relaxed">
                  {getTranslation(lang, 'step10_enable_note')}
                </p>
              </div>
            </div>
          )}

          {/* STEP 11: "You're all set!" Sparkles Screen */}
          {step === 11 && (
            <div className="space-y-6 text-center pt-6 animate-in fade-in zoom-in-95 duration-400">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#7B8CC8] to-[#6CC86E] text-white flex items-center justify-center mx-auto shadow-xl shadow-[#7B8CC8]/30 animate-bounce">
                <Sparkles className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold font-editorial text-slate-900">
                  {getTranslation(lang, 'step11_title')}
                </h2>
                <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                  {getTranslation(lang, 'step11_subtitle')}
                </p>
              </div>

              {/* Ready summary card */}
              <div className="bg-gradient-to-br from-[#F7E3C8]/40 via-white to-[#F8F7FC] p-5 rounded-3xl border border-[#F7E3C8] shadow-sm text-left max-w-sm mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 border border-white shadow-sm shrink-0">
                    <img
                      src={profile.avatar_url || SAMPLE_AVATARS[0].url}
                      alt="User"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{profile.name}</h4>
                    <p className="text-xs text-slate-500">
                      {profile.styles.slice(0, 3).join(' • ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 12: Phone Number Input */}
          {step === 12 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center pt-4">
                <span className="text-4xl">📱</span>
                <h2 className="text-2xl font-bold font-editorial text-slate-900 mt-2">
                  {getTranslation(lang, 'step12_title')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {getTranslation(lang, 'step12_subtitle')}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                {authMethod === 'phone' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      {getTranslation(lang, 'step12_phone_label')}
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-xl">🇹🇷</span>
                      <span className="text-sm font-bold text-slate-700">+90</span>
                      <input
                        type="tel"
                        value={phoneNumber.replace('+90', '').trim()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhoneNumber(`+90 ${val}`);
                          handleProfileChange({ phone: `+90 ${val}` });
                        }}
                        placeholder="555 123 4567"
                        className="w-full text-base font-semibold text-slate-800 bg-transparent outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      {getTranslation(lang, 'step12_email_label')}
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full text-sm font-semibold text-slate-800 bg-transparent outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Email / Phone toggle */}
                <button
                  type="button"
                  onClick={() => setAuthMethod(authMethod === 'phone' ? 'email' : 'phone')}
                  className="text-xs text-[#5263A8] font-medium hover:underline block text-center w-full"
                >
                  {authMethod === 'phone'
                    ? getTranslation(lang, 'step12_email_fallback')
                    : 'Prefer phone SMS OTP instead?'}
                </button>
              </div>

              {/* Instant Free Demo Bypass Button */}
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="w-full p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-amber-100/60 active:scale-98 transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{getTranslation(lang, 'step12_demo_bypass')}</span>
              </button>
            </div>
          )}

          {/* STEP 13: 6-Box OTP Verification */}
          {step === 13 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center pt-4">
                <span className="text-4xl">🔐</span>
                <h2 className="text-2xl font-bold font-editorial text-slate-900 mt-2">
                  {getTranslation(lang, 'step13_title')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {getTranslation(lang, 'step13_subtitle', {
                    target: authMethod === 'phone' ? phoneNumber : emailAddress,
                  })}
                </p>
              </div>

              {/* 6 Box Inputs */}
              <div className="flex justify-center gap-2 pt-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-2xl font-bold text-slate-800 bg-white rounded-2xl border-2 border-slate-200 focus:border-[#7B8CC8] focus:ring-2 focus:ring-[#7B8CC8]/20 outline-none transition-all shadow-sm"
                  />
                ))}
              </div>

              {/* Demo Mode auto-fill hint */}
              <button
                type="button"
                onClick={() => setOtpDigits(['1', '2', '3', '4', '5', '6'])}
                className="text-xs text-slate-400 hover:text-[#5263A8] text-center w-full block transition-colors underline"
              >
                {getTranslation(lang, 'step13_demo_code_hint')}
              </button>

              {/* Resend Cooldown */}
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <span className="text-xs text-slate-400">
                    {getTranslation(lang, 'step13_resend', { seconds: resendCooldown })}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResendCooldown(60)}
                    className="text-xs font-semibold text-[#5263A8] hover:underline"
                  >
                    {getTranslation(lang, 'step13_resend_now')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BUTTON */}
        <div className="mt-8 pt-2">
          {step === 11 ? (
            <PillButton onClick={nextStep} variant="primary" size="lg">
              {getTranslation(lang, 'step11_cta')}
            </PillButton>
          ) : step === 12 ? (
            <PillButton onClick={nextStep} variant="primary" size="lg">
              {getTranslation(lang, 'step12_send_otp')}
            </PillButton>
          ) : step === 13 ? (
            <PillButton
              onClick={handleFinishOnboarding}
              variant="primary"
              size="lg"
              isLoading={isVerifying}
              disabled={otpDigits.some((d) => !d)}
            >
              {getTranslation(lang, 'step13_verify_btn')}
            </PillButton>
          ) : (
            <PillButton
              onClick={nextStep}
              variant="primary"
              size="lg"
              disabled={
                (step === 2 && !profile.name.trim()) ||
                (step === 6 && !isAgeValid) ||
                (step === 7 && profile.styles.length < 3)
              }
            >
              {getTranslation(lang, 'next')}
            </PillButton>
          )}
        </div>
      </main>
    </div>
  );
};
