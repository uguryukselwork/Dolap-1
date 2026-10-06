import React, { useState } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Tag,
  Palette,
  Layers,
} from 'lucide-react';
import { ClothingCategory, ClothingItem, Language, RecognitionResult } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { apiService } from '../../lib/api';
import { removeGarmentBackground } from '../../lib/cutout';
import { OopsCard } from '../common/OopsCard';
import { PillButton } from '../common/PillButton';

interface ScanItemTabProps {
  language: Language;
  onAddItem: (item: Omit<ClothingItem, 'id'>) => Promise<ClothingItem>;
  onSuccess: () => void;
}

export const ScanItemTab: React.FC<ScanItemTabProps> = ({
  language,
  onAddItem,
  onSuccess,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanFailures, setScanFailures] = useState<number>(0);
  const [scanError, setScanError] = useState<string | null>(null);

  // Recognition result fields (editable)
  const [identifiedItem, setIdentifiedItem] = useState<RecognitionResult | null>(null);

  // Sample clothing items to test scanning instantly
  const sampleScanImages = [
    {
      label: 'Silk Blouse',
      url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Wide Denim',
      url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Tailored Blazer',
      url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
        triggerRecognition(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerRecognition = async (imageBase64: string) => {
    setIsScanning(true);
    setScanError(null);
    setIdentifiedItem(null);

    try {
      const result = await apiService.recognizeClothing(imageBase64, language);
      setIdentifiedItem(result);
      setScanFailures(0);
    } catch (err: any) {
      console.error('Scan recognition error:', err);
      setScanFailures((f) => f + 1);
      setScanError(err?.message || 'Failed to identify clothing details.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToWardrobe = async () => {
    if (!selectedImage || !identifiedItem) return;

    let cutoutUrl = selectedImage;
    try {
      cutoutUrl = await removeGarmentBackground(selectedImage, 42);
    } catch {
      cutoutUrl = selectedImage;
    }

    await onAddItem({
      image_url: cutoutUrl,
      cutout_url: cutoutUrl,
      category: identifiedItem.category,
      subcategory: identifiedItem.subcategory,
      color: identifiedItem.color,
      pattern: identifiedItem.pattern,
      style: identifiedItem.style,
      season: identifiedItem.season,
      occasion: identifiedItem.occasion,
    });

    onSuccess();
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 pt-3 pb-24">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold font-editorial text-slate-900">
          {getTranslation(language, 'scan_title')}
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          {getTranslation(language, 'scan_subtitle')}
        </p>
      </div>

      {/* Main Upload / Camera Viewport */}
      {!selectedImage ? (
        <div className="space-y-4">
          <div className="w-full aspect-[4/3] rounded-[32px] bg-white border-2 border-dashed border-slate-300/80 p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F3F2F9] text-[#7B8CC8] flex items-center justify-center mb-3">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {language === 'tr' ? 'Fotoğraf Çekin veya Yükleyin' : 'Snap or Upload Garment'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              {language === 'tr'
                ? 'Düz bir zemin üzerine koyun veya askıda çekin'
                : 'Lay flat or hang against a neutral background for best AI recognition'}
            </p>

            <div className="flex gap-2.5 mt-5 w-full max-w-xs">
              <label className="flex-1 py-3 px-3 rounded-full bg-[#F3F2F9] hover:bg-[#EAE8F5] text-[#5263A8] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all text-center">
                <Camera className="w-4 h-4" />
                <span>{getTranslation(language, 'take_photo')}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageFile(f);
                  }}
                />
              </label>

              <label className="flex-1 py-3 px-3 rounded-full bg-[#7B8CC8] hover:bg-[#6E7FB8] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all text-center shadow-sm">
                <Upload className="w-4 h-4" />
                <span>{getTranslation(language, 'choose_photo')}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageFile(f);
                  }}
                />
              </label>
            </div>
          </div>

          {/* Quick Sample Presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block text-center">
              {getTranslation(language, 'use_sample')}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {sampleScanImages.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(s.url);
                    triggerRecognition(s.url);
                  }}
                  className="group bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-sm hover:border-[#7B8CC8] transition-all text-left"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 mb-1">
                    <img
                      src={s.url}
                      alt={s.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 block truncate text-center">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview & AI Identified Card */
        <div className="space-y-4">
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
            <img
              src={selectedImage}
              alt="Scan"
              className="w-full h-full object-cover object-center"
            />

            {/* Scanning beam effect during AI analysis */}
            {isScanning && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                <div className="relative w-16 h-16 mb-3">
                  <div className="absolute inset-0 rounded-full border-4 border-[#7B8CC8] border-t-transparent animate-spin" />
                  <Sparkles className="w-8 h-8 text-[#7B8CC8] absolute inset-0 m-auto animate-pulse" />
                </div>
                <span className="text-xs font-bold text-white max-w-xs leading-relaxed">
                  {getTranslation(language, 'analyzing_image')}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedImage(null);
                setIdentifiedItem(null);
                setScanError(null);
              }}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/80 transition-all"
            >
              {language === 'tr' ? 'Yeniden Çek' : 'Retake'}
            </button>
          </div>

          {/* Error handling */}
          {scanError && (
            <OopsCard
              language={language}
              message={scanError}
              failureCount={scanFailures}
              onRetry={() => selectedImage && triggerRecognition(selectedImage)}
              onSkip={() => {
                // Allow manually entering default item
                setIdentifiedItem({
                  category: 'Tops',
                  subcategory: 'T-Shirt',
                  color: 'Black',
                  pattern: 'Solid',
                  style: 'Casual',
                  season: 'All Season',
                  occasion: 'Casual',
                });
                setScanError(null);
              }}
              isRetrying={isScanning}
            />
          )}

          {/* Editable "We've identified your item!" Card */}
          {identifiedItem && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-2 text-emerald-600">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  {getTranslation(language, 'card_identified')}
                </h3>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Category */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    {getTranslation(language, 'field_category')}
                  </label>
                  <select
                    value={identifiedItem.category}
                    onChange={(e) =>
                      setIdentifiedItem({
                        ...identifiedItem,
                        category: e.target.value as ClothingCategory,
                      })
                    }
                    className="w-full bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    {['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    {getTranslation(language, 'field_subcategory')}
                  </label>
                  <input
                    type="text"
                    value={identifiedItem.subcategory}
                    onChange={(e) =>
                      setIdentifiedItem({ ...identifiedItem, subcategory: e.target.value })
                    }
                    className="w-full bg-transparent font-bold text-slate-800 outline-none"
                  />
                </div>

                {/* Color */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    {getTranslation(language, 'field_color')}
                  </label>
                  <input
                    type="text"
                    value={identifiedItem.color}
                    onChange={(e) =>
                      setIdentifiedItem({ ...identifiedItem, color: e.target.value })
                    }
                    className="w-full bg-transparent font-bold text-slate-800 outline-none"
                  />
                </div>

                {/* Pattern */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    {getTranslation(language, 'field_pattern')}
                  </label>
                  <input
                    type="text"
                    value={identifiedItem.pattern}
                    onChange={(e) =>
                      setIdentifiedItem({ ...identifiedItem, pattern: e.target.value })
                    }
                    className="w-full bg-transparent font-bold text-slate-800 outline-none"
                  />
                </div>

                {/* Style */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    {getTranslation(language, 'field_style')}
                  </label>
                  <input
                    type="text"
                    value={identifiedItem.style}
                    onChange={(e) =>
                      setIdentifiedItem({ ...identifiedItem, style: e.target.value })
                    }
                    className="w-full bg-transparent font-bold text-slate-800 outline-none"
                  />
                </div>

                {/* Occasion */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    {getTranslation(language, 'field_occasion')}
                  </label>
                  <input
                    type="text"
                    value={identifiedItem.occasion}
                    onChange={(e) =>
                      setIdentifiedItem({ ...identifiedItem, occasion: e.target.value })
                    }
                    className="w-full bg-transparent font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Save Button */}
              <PillButton onClick={handleSaveToWardrobe} variant="primary" size="lg">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{getTranslation(language, 'save_to_wardrobe')}</span>
              </PillButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
