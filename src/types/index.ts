export type Language = 'en' | 'tr';

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export type ClothingCategory =
  | 'Tops'
  | 'Bottoms'
  | 'Dresses'
  | 'Outerwear'
  | 'Shoes'
  | 'Accessories';

export interface Profile {
  id: string;
  name: string;
  gender: Gender;
  birthday?: string;
  height?: number; // cm
  body_type?: string;
  styles: string[];
  language: Language;
  avatar_url?: string;
  phone?: string;
  onboarding_step: number;
  notification_time?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClothingItem {
  id: string;
  user_id?: string;
  image_url: string;
  cutout_url?: string;
  category: ClothingCategory;
  subcategory: string;
  color: string;
  pattern: string;
  style: string;
  season: string;
  occasion: string;
  created_at?: string;
}

export interface Outfit {
  id: string;
  user_id?: string;
  item_ids: string[];
  occasion: string;
  tryon_image_url?: string;
  waist_level: number; // 0 to 100
  is_favourite: boolean;
  reason?: string;
  created_at?: string;
}

export interface RecognitionResult {
  category: ClothingCategory;
  subcategory: string;
  color: string;
  pattern: string;
  style: string;
  season: string;
  occasion: string;
}

export interface SuggestionResult {
  itemIds: string[];
  reason: string;
}
