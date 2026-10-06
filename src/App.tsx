import React, { useState, useEffect } from 'react';
import { ClothingItem, Language, Outfit, Profile } from './types';
import { defaultProfile, storageService } from './lib/supabase';
import { STARTER_CLOTHES } from './lib/sampleData';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { TodaysLookTab } from './components/main/TodaysLookTab';
import { ClosetTab } from './components/main/ClosetTab';
import { ScanItemTab } from './components/main/ScanItemTab';
import { FavouritesTab } from './components/main/FavouritesTab';
import { ProfileTab } from './components/main/ProfileTab';
import { BottomNav, MainTabType } from './components/main/BottomNav';
import { LanguageSwitcher } from './components/common/LanguageSwitcher';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [clothes, setClothes] = useState<ClothingItem[]>(STARTER_CLOTHES);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [currentTab, setCurrentTab] = useState<MainTabType>('look');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [savedProfile, savedClothes, savedOutfits] = await Promise.all([
          storageService.getProfile(),
          storageService.getClothes(),
          storageService.getOutfits(),
        ]);
        setProfile(savedProfile);
        setClothes(savedClothes);
        setOutfits(savedOutfits);
      } catch (err) {
        console.warn('Initialization notice:', err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  const language = profile.language || 'en';

  const handleUpdateProfile = async (changes: Partial<Profile>) => {
    const updated = await storageService.saveProfile(changes);
    setProfile(updated);
  };

  const handleCompleteOnboarding = async (
    completedProfile: Profile,
    chosenClothes: ClothingItem[]
  ) => {
    const saved = await storageService.saveProfile(completedProfile);
    setProfile(saved);

    // Save initial starter clothes if not yet present
    for (const item of chosenClothes) {
      if (!clothes.some((c) => c.subcategory === item.subcategory)) {
        await storageService.addClothingItem(item);
      }
    }
    const freshClothes = await storageService.getClothes();
    setClothes(freshClothes);
  };

  const handleAddItem = async (itemData: Omit<ClothingItem, 'id'>) => {
    const created = await storageService.addClothingItem(itemData);
    setClothes((prev) => [created, ...prev]);
    return created;
  };

  const handleDeleteItem = async (itemId: string) => {
    await storageService.deleteClothingItem(itemId);
    setClothes((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleSaveOutfit = async (outfitData: Omit<Outfit, 'id'>) => {
    const created = await storageService.saveOutfit(outfitData);
    setOutfits((prev) => [created, ...prev]);
    return created;
  };

  const handleToggleFavourite = async (outfitId: string) => {
    const updated = await storageService.toggleFavouriteOutfit(outfitId);
    setOutfits(updated);
  };

  const handleRemoveFavourite = async (outfitId: string) => {
    await storageService.deleteOutfit(outfitId);
    setOutfits((prev) => prev.filter((o) => o.id !== outfitId));
  };

  const handleDeleteAccount = async () => {
    await storageService.deleteAccount();
    setProfile({ ...defaultProfile, onboarding_step: 1 });
    setClothes(STARTER_CLOTHES);
    setOutfits([]);
    setCurrentTab('look');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F8F7FC] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-3 border-[#7B8CC8] border-t-transparent animate-spin mb-3" />
        <h1 className="text-xl font-bold font-editorial text-slate-800 tracking-wide">
          Dolap
        </h1>
        <p className="text-xs text-slate-400 mt-1">Loading your wardrobe...</p>
      </div>
    );
  }

  // Check if onboarding is completed
  const isOnboarded = profile.onboarding_step >= 14;

  if (!isOnboarded) {
    return (
      <OnboardingFlow
        initialProfile={profile}
        clothes={clothes}
        onComplete={handleCompleteOnboarding}
        onUpdateProfile={handleUpdateProfile}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#141418] selection:bg-[#7B8CC8]/20">
      {/* Top Header (only shown on secondary tabs; Today's Look has its own editorial header) */}
      {currentTab !== 'look' && (
        <header className="sticky top-0 z-30 w-full bg-[#eef0f8]/80 backdrop-blur-xl border-b border-slate-200/50 pt-3 pb-2.5 px-4">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentTab('look')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="text-2xl font-bold serif tracking-tight text-[#141418]">
                Dolap
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7B8CC8]/15 text-[#5263A8]">
                <Sparkles className="w-2.5 h-2.5 text-[#7B8CC8]" />
                AI
              </span>
            </button>

            <div className="flex items-center gap-2">
              <LanguageSwitcher
                currentLanguage={language}
                onLanguageChange={(newLang) => handleUpdateProfile({ language: newLang })}
              />
            </div>
          </div>
        </header>
      )}

      {/* Main Tab Screen Content */}
      <main className="flex-1 flex flex-col w-full">
        {currentTab === 'look' && (
          <TodaysLookTab
            profile={profile}
            clothes={clothes}
            outfits={outfits}
            language={language}
            onSaveOutfit={handleSaveOutfit}
            onToggleFavourite={handleToggleFavourite}
            onNavigateToTab={(tab) => setCurrentTab(tab as MainTabType)}
            onUpdateProfile={handleUpdateProfile}
            onAddClothingItem={handleAddItem}
            onStartOnboarding={() => handleUpdateProfile({ onboarding_step: 1 })}
          />
        )}

        {currentTab === 'closet' && (
          <ClosetTab
            clothes={clothes}
            language={language}
            onDeleteItem={handleDeleteItem}
            onNavigateToScan={() => setCurrentTab('scan')}
          />
        )}

        {currentTab === 'scan' && (
          <ScanItemTab
            language={language}
            onAddItem={handleAddItem}
            onSuccess={() => setCurrentTab('look')}
          />
        )}

        {currentTab === 'favourites' && (
          <FavouritesTab
            outfits={outfits}
            clothes={clothes}
            language={language}
            onRemoveFavourite={handleRemoveFavourite}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileTab
            profile={profile}
            language={language}
            onUpdateProfile={handleUpdateProfile}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        language={language}
      />
    </div>
  );
}
