import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ClothingItem, Outfit, Profile } from '../types';
import { STARTER_CLOTHES } from './sampleData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local storage keys for Demo / Offline mode
const STORAGE_PROFILE_KEY = 'dolap_user_profile_v2';
const STORAGE_CLOTHES_KEY = 'dolap_user_clothes_v2';
const STORAGE_OUTFITS_KEY = 'dolap_user_outfits_v2';

export const defaultProfile: Profile = {
  id: 'demo-user-id',
  name: 'Selin',
  gender: 'Female',
  birthday: '2000-05-15',
  height: 172,
  body_type: 'Athletic',
  styles: ['Clean Girl', 'Old Money', 'Minimalist'],
  language: 'tr',
  avatar_url: undefined,
  phone: '+90 555 123 4567',
  onboarding_step: 14,
  notification_time: '08:30',
};

// Storage helpers
export const storageService = {
  // Profiles
  async getProfile(): Promise<Profile> {
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (data && !error) return data;
        }
      } catch (e) {
        console.warn('Supabase profile fetch fallback to local:', e);
      }
    }
    const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
    return saved ? JSON.parse(saved) : defaultProfile;
  },

  async saveProfile(profile: Partial<Profile>): Promise<Profile> {
    const current = await this.getProfile();
    const updated = { ...current, ...profile, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updated));

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').upsert({
            ...updated,
            id: user.id,
          });
        }
      } catch (e) {
        console.warn('Supabase profile sync warning:', e);
      }
    }
    return updated;
  },

  // Clothes
  async getClothes(): Promise<ClothingItem[]> {
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('clothing_items')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (data && !error && data.length > 0) return data;
        }
      } catch (e) {
        console.warn('Supabase clothes fetch fallback:', e);
      }
    }
    const saved = localStorage.getItem(STORAGE_CLOTHES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    // Return starter clothes if none exist
    localStorage.setItem(STORAGE_CLOTHES_KEY, JSON.stringify(STARTER_CLOTHES));
    return STARTER_CLOTHES;
  },

  async addClothingItem(item: Omit<ClothingItem, 'id'>): Promise<ClothingItem> {
    const newItem: ClothingItem = {
      ...item,
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
    };
    const current = await this.getClothes();
    const updated = [newItem, ...current];
    localStorage.setItem(STORAGE_CLOTHES_KEY, JSON.stringify(updated));

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('clothing_items').insert({
            ...newItem,
            user_id: user.id,
          });
        }
      } catch (e) {
        console.warn('Supabase add item warning:', e);
      }
    }
    return newItem;
  },

  async deleteClothingItem(itemId: string): Promise<void> {
    const current = await this.getClothes();
    const updated = current.filter((i) => i.id !== itemId);
    localStorage.setItem(STORAGE_CLOTHES_KEY, JSON.stringify(updated));

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('clothing_items').delete().eq('id', itemId).eq('user_id', user.id);
        }
      } catch (e) {
        console.warn('Supabase delete item warning:', e);
      }
    }
  },

  // Outfits
  async getOutfits(): Promise<Outfit[]> {
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('outfits')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (data && !error) return data;
        }
      } catch (e) {
        console.warn('Supabase outfits fetch fallback:', e);
      }
    }
    const saved = localStorage.getItem(STORAGE_OUTFITS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  async saveOutfit(outfit: Omit<Outfit, 'id'>): Promise<Outfit> {
    const newOutfit: Outfit = {
      ...outfit,
      id: 'outfit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
    };
    const current = await this.getOutfits();
    const updated = [newOutfit, ...current];
    localStorage.setItem(STORAGE_OUTFITS_KEY, JSON.stringify(updated));

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('outfits').insert({
            ...newOutfit,
            user_id: user.id,
          });
        }
      } catch (e) {
        console.warn('Supabase save outfit warning:', e);
      }
    }
    return newOutfit;
  },

  async toggleFavouriteOutfit(outfitId: string): Promise<Outfit[]> {
    const current = await this.getOutfits();
    const updated = current.map((o) => (o.id === outfitId ? { ...o, is_favourite: !o.is_favourite } : o));
    localStorage.setItem(STORAGE_OUTFITS_KEY, JSON.stringify(updated));

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const target = updated.find((o) => o.id === outfitId);
          if (target) {
            await supabase
              .from('outfits')
              .update({ is_favourite: target.is_favourite })
              .eq('id', outfitId)
              .eq('user_id', user.id);
          }
        }
      } catch (e) {
        console.warn('Supabase toggle fav warning:', e);
      }
    }
    return updated;
  },

  async deleteOutfit(outfitId: string): Promise<void> {
    const current = await this.getOutfits();
    const updated = current.filter((o) => o.id !== outfitId);
    localStorage.setItem(STORAGE_OUTFITS_KEY, JSON.stringify(updated));

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('outfits').delete().eq('id', outfitId).eq('user_id', user.id);
        }
      } catch (e) {
        console.warn('Supabase delete outfit warning:', e);
      }
    }
  },

  // Delete all user data & reset
  async deleteAccount(): Promise<void> {
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').delete().eq('id', user.id);
          await supabase.from('clothing_items').delete().eq('user_id', user.id);
          await supabase.from('outfits').delete().eq('user_id', user.id);
          await supabase.auth.signOut();
        }
      } catch (e) {
        console.warn('Supabase delete account warning:', e);
      }
    }
    localStorage.removeItem(STORAGE_PROFILE_KEY);
    localStorage.removeItem(STORAGE_CLOTHES_KEY);
    localStorage.removeItem(STORAGE_OUTFITS_KEY);
  },
};
