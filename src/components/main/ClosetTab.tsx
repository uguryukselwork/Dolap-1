import React, { useState, useMemo } from 'react';
import { Plus, Trash2, X, Filter, Sparkles, Check } from 'lucide-react';
import { ClothingCategory, ClothingItem, Language } from '../../types';
import { getTranslation } from '../../i18n/translations';

interface ClosetTabProps {
  clothes: ClothingItem[];
  language: Language;
  onDeleteItem: (id: string) => void;
  onNavigateToScan: () => void;
}

export const ClosetTab: React.FC<ClosetTabProps> = ({
  clothes,
  language,
  onDeleteItem,
  onNavigateToScan,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [activeItemModal, setActiveItemModal] = useState<ClothingItem | null>(null);

  const categories = [
    { id: 'All', label: 'all_categories' },
    { id: 'Tops', label: 'cat_tops' },
    { id: 'Bottoms', label: 'cat_bottoms' },
    { id: 'Dresses', label: 'cat_dresses' },
    { id: 'Outerwear', label: 'cat_outerwear' },
    { id: 'Shoes', label: 'cat_shoes' },
    { id: 'Accessories', label: 'cat_accessories' },
  ];

  // Extract unique colors from user items
  const availableColors = useMemo(() => {
    const set = new Set<string>();
    clothes.forEach((c) => {
      if (c.color) set.add(c.color.trim());
    });
    return ['All', ...Array.from(set)];
  }, [clothes]);

  // Filtered items
  const filteredClothes = useMemo(() => {
    return clothes.filter((item) => {
      const matchCat =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchColor =
        selectedColor === 'All' ||
        item.color?.toLowerCase().includes(selectedColor.toLowerCase());
      return matchCat && matchColor;
    });
  }, [clothes, selectedCategory, selectedColor]);

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 pt-3 pb-24">
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-bold font-editorial text-slate-900">
            {getTranslation(language, 'tab_closet')}
          </h2>
          <span className="text-xs text-slate-400">
            {getTranslation(language, 'items_count', { count: filteredClothes.length })}
          </span>
        </div>

        <button
          onClick={onNavigateToScan}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#7B8CC8] to-[#8E9BD4] text-white text-xs font-semibold shadow-sm hover:opacity-95 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{getTranslation(language, 'add_item')}</span>
        </button>
      </div>

      {/* Category Pills Slider */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-[#7B8CC8] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/70'
              }`}
            >
              {getTranslation(language, cat.label as any)}
            </button>
          );
        })}
      </div>

      {/* Color Filter Pills */}
      {availableColors.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 pl-1 shrink-0">
            {getTranslation(language, 'filter_color')}:
          </span>
          {availableColors.map((color) => {
            const isColorActive = selectedColor === color;
            return (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  isColorActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-white/80 text-slate-600 border border-slate-200/80 hover:bg-white'
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      )}

      {/* Items Grid */}
      {filteredClothes.length === 0 ? (
        <div className="my-auto py-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {getTranslation(language, 'empty_closet')}
          </p>
          <button
            onClick={onNavigateToScan}
            className="px-4 py-2 rounded-full bg-[#7B8CC8] text-white text-xs font-semibold shadow-sm active:scale-95"
          >
            {getTranslation(language, 'add_item')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 mt-2">
          {filteredClothes.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItemModal(item)}
              className="group bg-white rounded-3xl p-2.5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-2">
                <img
                  src={item.image_url}
                  alt={item.subcategory}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-700 shadow-sm">
                  {item.category}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 truncate">
                  {item.subcategory}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span className="truncate">{item.color}</span>
                  <span className="font-medium text-[#5263A8]">{item.style}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Detail & Delete Modal */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5263A8]">
                {activeItemModal.category}
              </span>
              <button
                onClick={() => setActiveItemModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
              <img
                src={activeItemModal.image_url}
                alt={activeItemModal.subcategory}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 font-editorial">
                {activeItemModal.subcategory}
              </h3>
              <p className="text-xs text-slate-500">{activeItemModal.color}</p>
            </div>

            {/* Metadata Tags */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {getTranslation(language, 'field_style')}
                </span>
                <span className="font-semibold text-slate-700">{activeItemModal.style}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {getTranslation(language, 'field_pattern')}
                </span>
                <span className="font-semibold text-slate-700">{activeItemModal.pattern}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {getTranslation(language, 'field_season')}
                </span>
                <span className="font-semibold text-slate-700">{activeItemModal.season}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {getTranslation(language, 'field_occasion')}
                </span>
                <span className="font-semibold text-slate-700">{activeItemModal.occasion}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onDeleteItem(activeItemModal.id);
                  setActiveItemModal(null);
                }}
                className="flex-1 py-3 rounded-full bg-red-50 text-red-600 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-red-100 active:scale-95 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>{getTranslation(language, 'delete')}</span>
              </button>
              <button
                onClick={() => setActiveItemModal(null)}
                className="flex-1 py-3 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 active:scale-95 transition-all"
              >
                {getTranslation(language, 'cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
