import { ClothingItem, RecognitionResult, SuggestionResult } from '../types';

export interface BodyLandmarks {
  centerX: number;
  neckY: number;
  shoulderWidth: number;
  waistY: number;
  waistWidth: number;
  hipY: number;
  hipWidth: number;
  kneeY: number;
  ankleY: number;
}

export interface TryOnParams {
  avatarImage: string;
  clothingImages: string[];
  waistLevel?: number; // 0 to 100
  description?: string;
}

export interface TryOnResponse {
  imageUrl: string;
  landmarks?: BodyLandmarks;
  fallback?: boolean;
}

export const apiService = {
  /**
   * Recognizes clothing items from a photo using Gemini 2.5 Flash via /api/recognize
   */
  async recognizeClothing(imageBase64: string, language: string = 'en'): Promise<RecognitionResult> {
    const res = await fetch('/api/recognize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageBase64,
        language,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Recognition failed with status ${res.status}`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Invalid recognition response');
    }
    return json.data as RecognitionResult;
  },

  /**
   * Suggests an outfit combination using Gemini 2.5 Flash via /api/suggest
   */
  async suggestOutfit(
    items: ClothingItem[],
    styles: string[],
    occasion: string = 'Casual',
    language: string = 'en'
  ): Promise<SuggestionResult> {
    const res = await fetch('/api/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        styles,
        occasion,
        language,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Suggestion failed with status ${res.status}`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Invalid suggestion response');
    }
    return json.data as SuggestionResult;
  },

  /**
   * Generates a virtual try-on image or body landmarks via /api/tryon
   */
  async virtualTryOnFull(params: TryOnParams): Promise<TryOnResponse> {
    const res = await fetch('/api/tryon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Virtual try-on failed with status ${res.status}`);
    }

    const json = await res.json();
    if (!json.success || !json.imageUrl) {
      throw new Error(json.error || 'Invalid virtual try-on response');
    }
    return {
      imageUrl: json.imageUrl as string,
      landmarks: json.landmarks as BodyLandmarks | undefined,
      fallback: Boolean(json.fallback),
    };
  },

  async virtualTryOn(params: TryOnParams): Promise<string> {
    const full = await this.virtualTryOnFull(params);
    return full.imageUrl;
  },
};
