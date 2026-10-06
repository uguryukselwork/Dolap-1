import React, { useState } from 'react';
import { Heart, Trash2, Share2, Sparkles, Shirt } from 'lucide-react';
import { ClothingItem, Language, Outfit } from '../../types';
import { getTranslation } from '../../i18n/translations';

interface FavouritesTabProps {
  outfits: Outfit[];
  clothes: ClothingItem[];
  language: Language;
  onRemoveFavourite: (id: string) => void;
  onSelectOutfitForToday?: (outfit: Outfit) => void;
}

export const FavouritesTab: React.FC<FavouritesTabProps> = ({
  outfits,
  clothes,
  language,
  onRemoveFavourite,
  onSelectOutfitForToday,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const favouriteOutfits = outfits.filter((o) => o.is_favourite);

  const handleShare = async (outfit: Outfit) => {
    const text = `Dolap Saved Look (${outfit.occasion}): ${outfit.reason || 'Check out my favorite look!'}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Dolap Outfit', text, url: window.location.href });
        return;
      } catch {}
    }
    navigator.clipboard?.writeText?.(text);
    setCopiedId(outfit.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 pt-3 pb-24">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-xl font-bold font-editorial text-slate-900">
          {getTranslation(language, 'favourites_title')}
        </h2>
        <span className="text-xs text-slate-400">
          {favouriteOutfits.length} {language === 'tr' ? 'kombin kaydedildi' : 'outfits saved'}
        </span>
      </div>

      {favouriteOutfits.length === 0 ? (
        <div className="my-auto py-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 stroke-[1.5]" />
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {getTranslation(language, 'favourites_empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {favouriteOutfits.map((outfit) => {
            const items = clothes.filter((c) => outfit.item_ids.includes(c.id));

            return (
              <div
                key={outfit.id}
                className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#7B8CC8]/15 text-[#5263A8] uppercase tracking-wider">
                      {outfit.occasion}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {outfit.created_at
                        ? new Date(outfit.created_at).toLocaleDateString()
                        : 'Today'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleShare(outfit)}
                      className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 active:scale-95"
                      title="Share"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveFavourite(outfit.id)}
                      className="p-2 rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Look & Items Preview */}
                <div className="flex gap-3 items-center">
                  {/* Tryon photo if available */}
                  <div className="w-24 h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={outfit.tryon_image_url || items[0]?.image_url || ''}
                      alt="Outfit"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Garment chips */}
                  <div className="flex-1 space-y-1.5 overflow-hidden">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      {items.map((i) => i.subcategory).join(' + ')}
                    </span>
                    {outfit.reason && (
                      <p className="text-[11px] text-slate-500 font-serif italic line-clamp-3">
                        "{outfit.reason}"
                      </p>
                    )}
                  </div>
                </div>

                {copiedId === outfit.id && (
                  <p className="text-[10px] text-emerald-600 text-center font-semibold">
                    Link copied to clipboard!
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
