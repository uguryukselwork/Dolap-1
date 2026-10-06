import React, { useState, useRef, useEffect } from 'react';
import {
  Bookmark,
  Menu,
  RefreshCw,
  Share,
  Plus,
  Sparkles,
  Camera,
  User,
  Shirt,
  Heart,
  Globe,
  Check,
  SlidersHorizontal,
  Eye,
  RotateCcw,
  Upload,
  Link2,
  X,
  Wand2,
  ScanLine,
} from 'lucide-react';
import { ClothingCategory, ClothingItem, Language, Outfit, Profile } from '../../types';
import { apiService, BodyLandmarks } from '../../lib/api';
import { SAMPLE_AVATARS } from '../../lib/sampleData';
import { fetchImageAsDataUrl, removeGarmentBackground } from '../../lib/cutout';

export type GarmentShapeType =
  | 'tank'
  | 'tube'
  | 'skirt'
  | 'pencil'
  | 'pants'
  | 'cardigan'
  | 'heels'
  | 'boots';

export type SlotKey = 'top' | 'bottom' | 'shoes';

export interface WardrobePiece {
  id: string;
  type: GarmentShapeType;
  color: string;
  name: string;
  imageUrl?: string;
}

const DEFAULT_LANDMARKS: BodyLandmarks = {
  centerX: 50,
  neckY: 24,
  shoulderWidth: 30,
  waistY: 42,
  waistWidth: 24,
  hipY: 52,
  hipWidth: 30,
  kneeY: 70,
  ankleY: 87,
};

/* ---------- Gerçekçi gölgeli kıyafet çizimleri & kesilmiş fotoğraf (cutout) desteği ---------- */
export const Garment: React.FC<{
  type: GarmentShapeType;
  color: string;
  imageUrl?: string;
  className?: string;
  isDraped?: boolean;
}> = ({ type, color, imageUrl, className = '', isDraped = false }) => {
  const uid = React.useId().replace(/:/g, '');

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        draggable={false}
        className={`${className} ${
          isDraped
            ? 'w-full h-full object-fill select-none pointer-events-none'
            : 'object-contain rounded-xl'
        }`}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`fabric-${uid}`} x1="0%" y1="0%" x2="100%" y2="15%">
          <stop offset="0%" stopColor={color} />
          <stop offset="30%" stopColor={color} />
          <stop offset="52%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="75%" stopColor={color} />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>

        <linearGradient id={`depth-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.12" />
          <stop offset="20%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="85%" stopColor="#000000" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      {type === 'tube' && (
        <g>
          <path
            d="M18 16 Q50 9 82 16 L84 74 Q64 88 56 76 Q36 86 16 84 Z"
            fill={color}
          />
          <path
            d="M18 16 Q50 9 82 16 L84 74 Q64 88 56 76 Q36 86 16 84 Z"
            fill={`url(#fabric-${uid})`}
          />
          <path
            d="M22 28 Q52 38 80 24 M20 44 Q50 56 81 40 M20 60 Q48 70 78 58"
            fill="none"
            stroke="#000000"
            strokeOpacity="0.16"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      )}

      {type === 'tank' && (
        <g>
          <path
            d="M26 6 L36 6 Q50 24 64 6 L74 6 L75 30 Q82 60 80 92 L20 92 Q18 60 25 30 Z"
            fill={color}
          />
          <path
            d="M26 6 L36 6 Q50 24 64 6 L74 6 L75 30 Q82 60 80 92 L20 92 Q18 60 25 30 Z"
            fill={`url(#fabric-${uid})`}
          />
          <path
            d="M36 6 Q50 24 64 6"
            fill="none"
            stroke="#000000"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
        </g>
      )}

      {type === 'cardigan' && (
        <g>
          <path
            d="M32 6 L50 30 L68 6 L86 16 L95 74 L81 76 L77 38 L78 94 L22 94 L23 38 L19 76 L5 74 L14 16 Z"
            fill={color}
          />
          <path
            d="M32 6 L50 30 L68 6 L86 16 L95 74 L81 76 L77 38 L78 94 L22 94 L23 38 L19 76 L5 74 L14 16 Z"
            fill={`url(#fabric-${uid})`}
          />
          <line
            x1="50"
            y1="30"
            x2="50"
            y2="94"
            stroke="#000000"
            strokeOpacity="0.22"
            strokeWidth="1.8"
          />
        </g>
      )}

      {type === 'skirt' && (
        <g>
          <path d="M24 8 Q50 11 76 8 L88 88 Q50 94 12 88 Z" fill={color} />
          <path
            d="M24 8 Q50 11 76 8 L88 88 Q50 94 12 88 Z"
            fill={`url(#fabric-${uid})`}
          />
          <path
            d="M24 8 Q50 11 76 8 L88 88 Q50 94 12 88 Z"
            fill={`url(#depth-${uid})`}
          />
          <path
            d="M24 8 Q50 11 76 8 L77 16 Q50 19 23 16 Z"
            fill="#000000"
            fillOpacity="0.25"
          />
          <path
            d="M36 18 L28 88 M50 19 L50 91 M64 18 L72 88"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.14"
            strokeWidth="1.4"
          />
        </g>
      )}

      {type === 'pencil' && (
        <g>
          <path
            d="M25 8 Q50 11 75 8 L79 48 L75 92 Q58 94 56 92 L54 62 L49 92 Q32 94 25 92 L21 48 Z"
            fill={color}
          />
          <path
            d="M25 8 Q50 11 75 8 L79 48 L75 92 Q58 94 56 92 L54 62 L49 92 Q32 94 25 92 L21 48 Z"
            fill={`url(#fabric-${uid})`}
          />
          <path
            d="M25 8 Q50 11 75 8 L76 15 Q50 18 24 15 Z"
            fill="#000000"
            fillOpacity="0.18"
          />
        </g>
      )}

      {type === 'pants' && (
        <g>
          <path
            d="M24 6 Q50 9 76 6 L84 94 L55 94 L50 38 L45 94 L16 94 Z"
            fill={color}
          />
          <path
            d="M24 6 Q50 9 76 6 L84 94 L55 94 L50 38 L45 94 L16 94 Z"
            fill={`url(#fabric-${uid})`}
          />
          <path
            d="M24 6 Q50 9 76 6 L77 14 Q50 17 23 14 Z"
            fill="#000000"
            fillOpacity="0.16"
          />
        </g>
      )}

      {type === 'heels' && (
        <g>
          <path
            d="M14 52 Q20 30 36 34 L70 62 L86 60 Q90 70 84 74 L40 74 Q30 70 26 60 L22 86 L18 86 L18 60 Z"
            fill={color}
          />
          <path
            d="M14 52 Q20 30 36 34 L70 62 L86 60 Q90 70 84 74 L40 74 Q30 70 26 60 L22 86 L18 86 L18 60 Z"
            fill={`url(#fabric-${uid})`}
          />
        </g>
      )}

      {type === 'boots' && (
        <g>
          <path
            d="M34 6 L58 6 L58 58 L86 70 Q90 82 82 84 L46 84 L44 92 L38 92 L36 84 Z"
            fill={color}
          />
          <path
            d="M34 6 L58 6 L58 58 L86 70 Q90 82 82 84 L46 84 L44 92 L38 92 L36 84 Z"
            fill={`url(#fabric-${uid})`}
          />
        </g>
      )}
    </svg>
  );
};

/* Slot ikonları (sol taraftaki çizgi ikonlar) */
export const SlotIcon: React.FC<{ slot: SlotKey }> = ({ slot }) => {
  const d = {
    top: 'M8 4 L10 4 Q12 8 14 4 L16 4 L16 9 L17 20 L7 20 L8 9 Z',
    bottom: 'M6 3 L18 3 L19 21 L14 21 L12 9 L10 21 L5 21 Z',
    shoes: 'M3 15 Q5 9 9 10 L16 16 L21 16 L21 18 L9 18 L6 16 L5 21 L4 21 Z',
  }[slot];

  return (
    <svg
      viewBox="0 0 24 24"
      className="w-7 h-7"
      fill="white"
      stroke="#1c1c22"
      strokeWidth="1.4"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
};

/* ---------- Örnek dolap verisi ---------- */
export const WARDROBE: Record<SlotKey, WardrobePiece[]> = {
  top: [
    { id: 't1', type: 'tube', color: '#6b7f3a', name: 'Drapeli yeşil top' },
    { id: 't2', type: 'tank', color: '#c9ccd6', name: 'Gri atlet' },
    { id: 't3', type: 'cardigan', color: '#f2c98f', name: 'Bal rengi hırka' },
  ],
  bottom: [
    { id: 'b1', type: 'skirt', color: '#222226', name: 'Siyah mini etek' },
    { id: 'b2', type: 'pencil', color: '#b9c6dc', name: 'Buz mavisi kalem etek' },
    { id: 'b3', type: 'pants', color: '#cfe0ea', name: 'Açık mavi pantolon' },
  ],
  shoes: [
    { id: 's1', type: 'heels', color: '#e9dccb', name: 'Bej topuklu' },
    { id: 's2', type: 'boots', color: '#e7d3c4', name: 'Pudra bot' },
  ],
};

const TABS_TR = ['Dolap', 'Favoriler', 'Bugünün Kombini', 'Akşam', 'İş'];
const TABS_EN = ['Closet', 'Favourites', "Today's Look", 'Night Out', 'Work'];
const SLOTS: SlotKey[] = ['top', 'bottom', 'shoes'];

const pick = <T extends { id: string }>(arr: T[], notId: string): T => {
  const pool = arr.filter((i) => i.id !== notId);
  return pool[Math.floor(Math.random() * pool.length)] || arr[0];
};

interface GarmentAdjustment {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

interface TodaysLookTabProps {
  profile: Profile;
  clothes: ClothingItem[];
  outfits: Outfit[];
  language: Language;
  onSaveOutfit: (outfit: Omit<Outfit, 'id'>) => Promise<Outfit>;
  onToggleFavourite: (outfitId: string) => void;
  onNavigateToTab: (tab: 'look' | 'closet' | 'favourites' | 'scan' | 'profile') => void;
  onUpdateProfile: (changes: Partial<Profile>) => void;
  onAddClothingItem?: (item: Omit<ClothingItem, 'id'>) => Promise<ClothingItem>;
  onStartOnboarding?: () => void;
}

export const TodaysLookTab: React.FC<TodaysLookTabProps> = ({
  profile,
  clothes,
  language,
  onSaveOutfit,
  onNavigateToTab,
  onUpdateProfile,
  onAddClothingItem,
  onStartOnboarding,
}) => {
  const [tab, setTab] = useState<number>(2);
  const [outfit, setOutfit] = useState<Record<SlotKey, WardrobePiece>>({
    top: WARDROBE.top[0],
    bottom: WARDROBE.bottom[0],
    shoes: WARDROBE.shoes[0],
  });
  const [saved, setSaved] = useState<boolean>(false);
  const [spin, setSpin] = useState<boolean>(false);

  // User avatar photo
  const [rawAvatar, setRawAvatar] = useState<string | null>(profile.avatar_url || null);
  const [aiGeneratedAvatar, setAiGeneratedAvatar] = useState<string | null>(null);

  // Body landmarks detected by Gemini AI
  const [landmarks, setLandmarks] = useState<BodyLandmarks>(DEFAULT_LANDMARKS);

  // AI Analysis & Dressing State ("Yapay zeka görüntüyü analiz ediyor -> sonra üzerine giydiriyor")
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [aiStepMessage, setAiStepMessage] = useState<string>('');
  const [isDressed, setIsDressed] = useState<boolean>(false);
  const [hasUnappliedSelection, setHasUnappliedSelection] = useState<boolean>(true);

  // Preview Modal State ("Önizleme" button next to "Üzerine Giydir")
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showAdjustControls, setShowAdjustControls] = useState<boolean>(false);

  // Per-slot drag & independent width/height adjustments
  const [adjustments, setAdjustments] = useState<Record<SlotKey, GarmentAdjustment>>({
    top: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
    bottom: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
    shoes: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
  });

  // Google / Custom Garment Upload Modal State
  const [uploadSlotModal, setUploadSlotModal] = useState<SlotKey | null>(null);
  const [rawGarmentUpload, setRawGarmentUpload] = useState<string | null>(null);
  const [cutoutGarmentPreview, setCutoutGarmentPreview] = useState<string | null>(null);
  const [useAutoCutout, setUseAutoCutout] = useState<boolean>(true);
  const [cutoutTolerance, setCutoutTolerance] = useState<number>(42);
  const [isProcessingCutout, setIsProcessingCutout] = useState<boolean>(false);
  const [garmentUrlInput, setGarmentUrlInput] = useState<string>('');
  const [garmentUploadError, setGarmentUploadError] = useState<string | null>(null);
  const [customGarmentName, setCustomGarmentName] = useState<string>('');
  const [modalPreviewMode, setModalPreviewMode] = useState<boolean>(false);

  // Drag tracking on avatar
  const [draggingSlot, setDraggingSlot] = useState<SlotKey | null>(null);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  const [aiNote, setAiNote] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const garmentFileRef = useRef<HTMLInputElement | null>(null);

  const TABS = language === 'tr' ? TABS_TR : TABS_EN;

  // Merge user's scanned/custom clothes into wardrobe slots
  const wardrobePool: Record<SlotKey, WardrobePiece[]> = {
    top: [
      ...clothes
        .filter((c) => c.category === 'Tops' || c.category === 'Outerwear' || c.category === 'Dresses')
        .filter((c) => !c.id.startsWith('item-'))
        .map((c) => ({
          id: c.id,
          type: 'tank' as GarmentShapeType,
          color: '#7B8CC8',
          name: c.subcategory,
          imageUrl: c.cutout_url || c.image_url,
        })),
      ...WARDROBE.top,
    ],
    bottom: [
      ...clothes
        .filter((c) => c.category === 'Bottoms')
        .filter((c) => !c.id.startsWith('item-'))
        .map((c) => ({
          id: c.id,
          type: 'skirt' as GarmentShapeType,
          color: '#222226',
          name: c.subcategory,
          imageUrl: c.cutout_url || c.image_url,
        })),
      ...WARDROBE.bottom,
    ],
    shoes: [
      ...clothes
        .filter((c) => c.category === 'Shoes')
        .filter((c) => !c.id.startsWith('item-'))
        .map((c) => ({
          id: c.id,
          type: 'heels' as GarmentShapeType,
          color: '#e9dccb',
          name: c.subcategory,
          imageUrl: c.cutout_url || c.image_url,
        })),
      ...WARDROBE.shoes,
    ],
  };

  const alternatives = SLOTS.map((s) =>
    wardrobePool[s].find((i) => i.id !== outfit[s].id)
  );

  // Core AI Analysis & Dressing Function ("Yapay zeka görüntüyü analiz ediyor ve sonra üzerine giydiriyor")
  const handleRunAIDressOn = async (
    targetOutfit = outfit,
    targetPhotoUrl?: string
  ) => {
    let activePhoto = targetPhotoUrl || rawAvatar;

    // If user hasn't uploaded a photo yet, load the default model photo so they can test immediately
    if (!activePhoto) {
      activePhoto = SAMPLE_AVATARS[0].url;
      setRawAvatar(activePhoto);
      onUpdateProfile({ avatar_url: activePhoto });
    }

    setShowPreviewModal(false);
    setIsAnalyzingAI(true);
    setIsDressed(false);

    // Step 1 message
    setAiStepMessage(
      language === 'tr'
        ? 'Yapay zeka görüntüyü analiz ediyor...'
        : 'AI is analyzing the image...'
    );

    const step2Timer = setTimeout(() => {
      setAiStepMessage(
        language === 'tr'
          ? `${targetOutfit.bottom.name} kalıbı ve bel hizası tespit ediliyor...`
          : `Detecting waist & hip alignment for ${targetOutfit.bottom.name}...`
      );
    }, 850);

    const step3Timer = setTimeout(() => {
      setAiStepMessage(
        language === 'tr'
          ? 'Seçilen kıyafet fotoğrafın üzerine giydiriliyor...'
          : 'Dressing selected garment onto your photo...'
      );
    }, 1700);

    try {
      const clothingImgs = [
        targetOutfit.top.imageUrl,
        targetOutfit.bottom.imageUrl,
      ].filter(Boolean) as string[];

      const [res] = await Promise.all([
        apiService.virtualTryOnFull({
          avatarImage: activePhoto,
          clothingImages: clothingImgs,
          waistLevel: 50,
          description: `Wearing ${targetOutfit.top.name} and ${targetOutfit.bottom.name}`,
        }),
        // Ensure the user sees the AI scanning & analysis animation for at least 2.2s
        new Promise((r) => setTimeout(r, 2200)),
      ]);

      if (res.landmarks) {
        setLandmarks(res.landmarks);
      }

      if (!res.fallback && res.imageUrl && res.imageUrl !== activePhoto) {
        setAiGeneratedAvatar(res.imageUrl);
      } else {
        setAiGeneratedAvatar(null);
      }

      setIsDressed(true);
      setHasUnappliedSelection(false);
    } catch {
      setAiGeneratedAvatar(null);
      setIsDressed(true);
      setHasUnappliedSelection(false);
    } finally {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setIsAnalyzingAI(false);
      setAiStepMessage('');
    }
  };

  // Re-run background removal when tolerance or rawGarmentUpload changes
  useEffect(() => {
    if (!rawGarmentUpload) return;
    let cancelled = false;
    setIsProcessingCutout(true);
    removeGarmentBackground(rawGarmentUpload, cutoutTolerance)
      .then((cutoutUrl) => {
        if (!cancelled) {
          setCutoutGarmentPreview(cutoutUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCutoutGarmentPreview(rawGarmentUpload);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsProcessingCutout(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [rawGarmentUpload, cutoutTolerance]);

  // Listen for global paste (Ctrl+V) of images copied from Google Images
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const targetSlot = uploadSlotModal || 'bottom';
            if (!uploadSlotModal) {
              setUploadSlotModal(targetSlot);
            }
            handleLoadGarmentFile(file, targetSlot);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [uploadSlotModal]);

  const handleLoadGarmentFile = (file: File, slot: SlotKey) => {
    setGarmentUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawGarmentUpload(reader.result);
        if (!customGarmentName) {
          setCustomGarmentName(
            slot === 'bottom'
              ? language === 'tr'
                ? 'Seçtiğim Etek'
                : 'Selected Skirt'
              : slot === 'top'
              ? language === 'tr'
                ? 'Seçtiğim Üst'
                : 'Selected Top'
              : language === 'tr'
              ? 'Seçtiğim Ayakkabı'
              : 'Selected Shoes'
          );
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadGarmentFromUrl = async () => {
    if (!garmentUrlInput.trim()) return;
    setGarmentUploadError(null);
    setIsProcessingCutout(true);
    try {
      const dataUrl = await fetchImageAsDataUrl(garmentUrlInput.trim());
      setRawGarmentUpload(dataUrl);
      if (!customGarmentName) {
        setCustomGarmentName(
          uploadSlotModal === 'bottom'
            ? language === 'tr'
              ? 'Google Etek'
              : 'Web Skirt'
            : uploadSlotModal === 'top'
            ? language === 'tr'
              ? 'Google Üst Giyim'
              : 'Web Top'
            : language === 'tr'
            ? 'Google Ayakkabı'
            : 'Web Shoes'
        );
      }
    } catch (err: any) {
      setGarmentUploadError(
        err?.message ||
          (language === 'tr'
            ? 'Bu bağlantıdan resim alınamadı. Resmi kaydedip dosya olarak yükleyebilirsiniz.'
            : 'Could not load image from URL. Try saving the image and uploading as a file.')
      );
    } finally {
      setIsProcessingCutout(false);
    }
  };

  const buildUploadedPiece = (): { slot: SlotKey; piece: WardrobePiece } | null => {
    if (!uploadSlotModal || !rawGarmentUpload) return null;
    const finalImageUrl =
      useAutoCutout && cutoutGarmentPreview ? cutoutGarmentPreview : rawGarmentUpload;

    const slot = uploadSlotModal;
    const defaultShape: GarmentShapeType =
      slot === 'bottom' ? 'skirt' : slot === 'top' ? 'tank' : 'heels';
    const pieceName =
      customGarmentName.trim() ||
      (slot === 'bottom'
        ? 'Yeni Etek'
        : slot === 'top'
        ? 'Yeni Üst'
        : 'Yeni Ayakkabı');

    const newPiece: WardrobePiece = {
      id: 'custom_' + Date.now(),
      type: defaultShape,
      color: '#222226',
      name: pieceName,
      imageUrl: finalImageUrl,
    };

    return { slot, piece: newPiece };
  };

  // Select uploaded garment (or dress immediately if dressNow = true)
  const handleSelectOrDressUploadedGarment = async (dressNow: boolean) => {
    const built = buildUploadedPiece();
    if (!built) return;
    const { slot, piece } = built;

    const nextOutfit = { ...outfit, [slot]: piece };
    setOutfit(nextOutfit);
    setAiGeneratedAvatar(null);
    setSaved(false);

    if (onAddClothingItem && piece.imageUrl) {
      const categoryMap: Record<SlotKey, ClothingCategory> = {
        top: 'Tops',
        bottom: 'Bottoms',
        shoes: 'Shoes',
      };
      try {
        await onAddClothingItem({
          image_url: piece.imageUrl,
          cutout_url: piece.imageUrl,
          category: categoryMap[slot],
          subcategory: piece.name,
          color: 'Özel',
          pattern: 'Solid',
          style: 'Chic',
          season: 'All Season',
          occasion: 'Casual',
        });
      } catch {
        // Ignore storage warning
      }
    }

    // Close modal & reset modal state
    setUploadSlotModal(null);
    setRawGarmentUpload(null);
    setCutoutGarmentPreview(null);
    setGarmentUrlInput('');
    setCustomGarmentName('');
    setModalPreviewMode(false);

    if (dressNow) {
      // Trigger AI Analysis -> Dress onto photo!
      await handleRunAIDressOn(nextOutfit);
    } else {
      // Just selected; user can click Önizleme or Üzerine Giydir on the main stage
      setIsDressed(false);
      setHasUnappliedSelection(true);
    }
  };

  const openSlotUploader = (slot: SlotKey) => {
    setUploadSlotModal(slot);
    setRawGarmentUpload(null);
    setCutoutGarmentPreview(null);
    setGarmentUrlInput('');
    setGarmentUploadError(null);
    setCustomGarmentName('');
    setModalPreviewMode(false);
  };

  const shuffle = async () => {
    setSpin(true);
    const nextTop = pick(wardrobePool.top, outfit.top.id);
    const nextBottom = pick(wardrobePool.bottom, outfit.bottom.id);
    const nextShoes = pick(wardrobePool.shoes, outfit.shoes.id);

    const nextOutfit = {
      top: nextTop,
      bottom: nextBottom,
      shoes: nextShoes,
    };
    setOutfit(nextOutfit);
    setAiGeneratedAvatar(null);
    setIsDressed(false);
    setHasUnappliedSelection(true);
    setSaved(false);
    setTimeout(() => setSpin(false), 500);

    try {
      const occasionName = TABS[tab] || 'Casual';
      const suggestion = await apiService.suggestOutfit(
        clothes,
        profile.styles,
        occasionName,
        language
      );
      if (suggestion?.reason) {
        setAiNote(suggestion.reason);
      }
    } catch {
      // Continue silently
    }
  };

  // When user selects an alternative skirt/top/shoes on the right, mark it selected so they can click Önizleme or Üzerine Giydir
  const swap = (slot: SlotKey, item: WardrobePiece) => {
    const nextOutfit = { ...outfit, [slot]: item };
    setOutfit(nextOutfit);
    setAiGeneratedAvatar(null);
    setIsDressed(false);
    setHasUnappliedSelection(true);
    setSaved(false);
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        setRawAvatar(dataUrl);
        setAiGeneratedAvatar(null);
        setIsDressed(false);
        setHasUnappliedSelection(true);
        setAdjustments({
          top: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
          bottom: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
          shoes: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
        });
        onUpdateProfile({ avatar_url: dataUrl });
      }
    };
    reader.readAsDataURL(f);
  };

  // Drag handlers on photo
  const handlePointerDown = (
    slot: SlotKey,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingSlot(slot);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: adjustments[slot].x,
      startY: adjustments[slot].y,
    };
  };

  const handlePointerMove = (
    slot: SlotKey,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (draggingSlot !== slot || !dragStartRef.current || !stageContainerRef.current) {
      return;
    }
    const rect = stageContainerRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100;
    const dyPct = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100;

    setAdjustments((prev) => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        x: Math.max(-40, Math.min(40, dragStartRef.current!.startX + dxPct)),
        y: Math.max(-40, Math.min(40, dragStartRef.current!.startY + dyPct)),
      },
    }));
  };

  const handlePointerUp = (
    slot: SlotKey,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (draggingSlot === slot) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingSlot(null);
      dragStartRef.current = null;
    }
  };

  // Anatomical bounding box for each slot based on Gemini landmarks + user adjustments
  const getSlotStyle = (slot: SlotKey): React.CSSProperties => {
    const adj = adjustments[slot];
    const cx = landmarks.centerX + adj.x;

    if (slot === 'top') {
      const topY = landmarks.neckY + adj.y;
      const heightPct = Math.max(16, landmarks.waistY - landmarks.neckY + 5) * adj.scaleY;
      const widthPct = Math.max(26, landmarks.shoulderWidth * 1.45) * adj.scaleX;
      return {
        left: `${cx}%`,
        top: `${topY}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
        transform: 'translateX(-50%)',
      };
    }

    if (slot === 'bottom') {
      const bottomType = outfit.bottom.type;
      const waistStart = landmarks.waistY - 2 + adj.y;
      let rawHeight = landmarks.kneeY - landmarks.waistY + 4;
      if (bottomType === 'pencil') {
        rawHeight = landmarks.kneeY - landmarks.waistY + 11;
      } else if (bottomType === 'pants') {
        rawHeight = landmarks.ankleY - landmarks.waistY + 3;
      }
      const heightPct = Math.max(18, rawHeight) * adj.scaleY;
      const widthPct =
        Math.max(30, Math.max(landmarks.hipWidth, landmarks.waistWidth) * 1.6) *
        adj.scaleX;

      return {
        left: `${cx}%`,
        top: `${waistStart}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
        transform: 'translateX(-50%)',
      };
    }

    const shoeTop = landmarks.ankleY - 2 + adj.y;
    const widthPct = Math.max(18, landmarks.hipWidth * 0.78) * adj.scaleX;
    const heightPct = 11 * adj.scaleY;
    return {
      left: `${cx}%`,
      top: `${shoeTop}%`,
      width: `${widthPct}%`,
      height: `${heightPct}%`,
      transform: 'translateX(-50%)',
    };
  };

  const handleBookmarkToggle = async () => {
    const nextSaved = !saved;
    setSaved(nextSaved);
    if (nextSaved) {
      await onSaveOutfit({
        item_ids: [outfit.top.id, outfit.bottom.id, outfit.shoes.id],
        occasion: TABS[tab] || 'Bugünün Kombini',
        waist_level: 50,
        is_favourite: true,
        tryon_image_url: aiGeneratedAvatar || rawAvatar || undefined,
        reason:
          aiNote ||
          `${outfit.top.name}, ${outfit.bottom.name} & ${outfit.shoes.name}`,
      });
    }
  };

  const handleShare = async () => {
    const text = `Dolap - ${TABS[tab]}: ${outfit.top.name} + ${outfit.bottom.name} + ${outfit.shoes.name}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dolap',
          text,
          url: window.location.href,
        });
        return;
      } catch {}
    }
    navigator.clipboard?.writeText?.(text);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const handleTabSelect = (index: number) => {
    if (index === 0) {
      onNavigateToTab('closet');
      return;
    }
    if (index === 1) {
      onNavigateToTab('favourites');
      return;
    }
    setTab(index);
    shuffle();
  };

  const displayAvatar = aiGeneratedAvatar || rawAvatar;

  return (
    <div
      className="min-h-screen w-full flex justify-center bg-white"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="relative w-full max-w-md min-h-screen flex flex-col bg-gradient-to-b from-[#eef0f8] via-white to-white pb-20">
        {/* Logo */}
        <header className="pt-7 pb-1.5 text-center relative">
          <h1 className="serif text-[40px] leading-none tracking-tight text-[#141418]">
            Dolap
          </h1>
        </header>

        {/* Sekmeler */}
        <nav className="no-bar flex gap-6 overflow-x-auto px-6 pb-2 snap-x justify-center">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => handleTabSelect(i)}
              className={`serif shrink-0 snap-center whitespace-nowrap py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#141418] rounded cursor-pointer ${
                tab === i
                  ? 'text-[17px] text-[#141418]'
                  : 'text-[13px] text-[#a3a5b0] hover:text-[#141418]/70'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* Üst Hızlı Seçim Barı: Etek Seç / Yükle */}
        <div className="flex items-center justify-center gap-2 px-4 pb-1.5">
          <button
            type="button"
            onClick={() => openSlotUploader('bottom')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#141418] border border-[#c9cbd6] text-[11px] font-semibold shadow-sm hover:border-[#141418] active:scale-95 transition-all cursor-pointer"
          >
            <Upload size={12} className="text-[#5263A8]" />
            <span>
              {language === 'tr'
                ? 'Etek Seç / Resim Yükle'
                : 'Select / Upload Skirt'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => openSlotUploader('top')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#141418] border border-[#c9cbd6] text-[11px] font-semibold shadow-sm hover:border-[#141418] active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={12} className="text-[#5263A8]" />
            <span>
              {language === 'tr' ? 'Üst Seç / Yükle' : 'Select / Upload Top'}
            </span>
          </button>
        </div>

        {/* Sahne */}
        <main className="relative flex-1 grid grid-cols-[72px_1fr_72px] items-center px-2">
          {/* Sol: Seçili kombinin parçaları */}
          <div className="flex flex-col gap-8 z-10">
            {SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => openSlotUploader(s)}
                className="group relative h-26 -ml-3 text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#141418] rounded-xl"
                title={
                  language === 'tr'
                    ? `${outfit[s].name} — Değiştirmek veya resim yüklemek için dokun`
                    : `${outfit[s].name} — Tap to change or upload image`
                }
              >
                <Garment
                  type={outfit[s].type}
                  color={outfit[s].color}
                  imageUrl={outfit[s].imageUrl}
                  className="h-full w-full opacity-95 drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <SlotIcon slot={s} />
                  <span className="mt-0.5 px-1.5 py-0.2 rounded-full bg-[#141418]/80 text-white text-[8px] font-semibold">
                    {language === 'tr' ? 'Seç' : 'Edit'}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Orta: Kullanıcı Fotoğrafı + Yapay Zeka Analiz & Giydirme Sahnesi */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) {
                if (!rawAvatar) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === 'string') {
                      setRawAvatar(reader.result);
                      setIsDressed(false);
                      setHasUnappliedSelection(true);
                      onUpdateProfile({ avatar_url: reader.result });
                    }
                  };
                  reader.readAsDataURL(file);
                } else {
                  openSlotUploader('bottom');
                  handleLoadGarmentFile(file, 'bottom');
                }
              }
            }}
            className="relative h-[54vh] max-h-[490px] flex flex-col items-center justify-center px-1"
          >
            {displayAvatar ? (
              <div
                ref={stageContainerRef}
                className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-2xl select-none border border-slate-200/70 shadow-sm bg-slate-50"
              >
                <div className="relative h-full w-full flex items-center justify-center">
                  <img
                    src={displayAvatar}
                    alt={language === 'tr' ? 'Senin fotoğrafın' : 'Your photo'}
                    className="h-full w-full object-cover object-top rounded-2xl"
                    draggable={false}
                  />

                  {/* YAPAY ZEKA GÖRÜNTÜ ANALİZ EKRANI ("Yapay zeka görüntüyü analiz ediyor...") */}
                  {isAnalyzingAI && (
                    <div className="absolute inset-0 z-40 bg-[#141418]/65 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                      {/* Hareketli Yapay Zeka Tarama Çizgisi */}
                      <div className="absolute inset-x-0 top-1/4 h-1 bg-gradient-to-r from-transparent via-[#7B8CC8] to-transparent shadow-[0_0_20px_#7B8CC8] animate-pulse" />

                      <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mb-3 text-white shadow-lg">
                        <ScanLine className="w-6 h-6 animate-pulse text-[#a5b4fc]" />
                      </div>

                      <p className="text-xs font-bold text-white tracking-wide px-2">
                        {aiStepMessage}
                      </p>

                      {/* Analiz edilen seçili etek & üst küçük önizlemesi */}
                      <div className="mt-3 flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        <div className="w-5 h-5">
                          <Garment
                            type={outfit.bottom.type}
                            color={outfit.bottom.color}
                            imageUrl={outfit.bottom.imageUrl}
                            className="w-full h-full"
                          />
                        </div>
                        <span className="text-[10px] font-medium text-white/90">
                          {outfit.bottom.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Kıyafet Giydirme Katmanı (Sadece yapay zeka analiz edip giydirdikten sonra gösterilir) */}
                  {isDressed && !isAnalyzingAI && !aiGeneratedAvatar && (
                    <div className="absolute inset-0 overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-300">
                      {/* Alt Giyim (Etek / Pantolon) */}
                      <div
                        onPointerDown={(e) => handlePointerDown('bottom', e)}
                        onPointerMove={(e) => handlePointerMove('bottom', e)}
                        onPointerUp={(e) => handlePointerUp('bottom', e)}
                        style={getSlotStyle('bottom')}
                        title={
                          language === 'tr'
                            ? `${outfit.bottom.name} (Sürükleyerek belinize tam oturtabilirsiniz)`
                            : `${outfit.bottom.name} (Drag to position on waist)`
                        }
                        className={`absolute z-20 cursor-grab active:cursor-grabbing transition-transform duration-75 ${
                          showAdjustControls
                            ? 'ring-2 ring-dashed ring-white/90 rounded-lg'
                            : ''
                        }`}
                      >
                        <Garment
                          type={outfit.bottom.type}
                          color={outfit.bottom.color}
                          imageUrl={outfit.bottom.imageUrl}
                          isDraped
                          className="w-full h-full drop-shadow-[0_10px_16px_rgba(0,0,0,0.38)]"
                        />
                      </div>

                      {/* Üst Giyim */}
                      <div
                        onPointerDown={(e) => handlePointerDown('top', e)}
                        onPointerMove={(e) => handlePointerMove('top', e)}
                        onPointerUp={(e) => handlePointerUp('top', e)}
                        style={getSlotStyle('top')}
                        title={
                          language === 'tr'
                            ? `${outfit.top.name} (Sürükleyerek hizalayabilirsiniz)`
                            : `${outfit.top.name} (Drag to position)`
                        }
                        className={`absolute z-30 cursor-grab active:cursor-grabbing transition-transform duration-75 ${
                          showAdjustControls
                            ? 'ring-2 ring-dashed ring-white/90 rounded-lg'
                            : ''
                        }`}
                      >
                        <Garment
                          type={outfit.top.type}
                          color={outfit.top.color}
                          imageUrl={outfit.top.imageUrl}
                          isDraped
                          className="w-full h-full drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]"
                        />
                      </div>

                      {/* Ayakkabı */}
                      <div
                        onPointerDown={(e) => handlePointerDown('shoes', e)}
                        onPointerMove={(e) => handlePointerMove('shoes', e)}
                        onPointerUp={(e) => handlePointerUp('shoes', e)}
                        style={getSlotStyle('shoes')}
                        className={`absolute z-20 cursor-grab active:cursor-grabbing transition-transform duration-75 ${
                          showAdjustControls
                            ? 'ring-2 ring-dashed ring-white/90 rounded-lg'
                            : ''
                        }`}
                      >
                        <Garment
                          type={outfit.shoes.type}
                          color={outfit.shoes.color}
                          imageUrl={outfit.shoes.imageUrl}
                          isDraped
                          className="w-full h-full drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Durum Rozeti (Üst Kısım) */}
                  {!isAnalyzingAI && !showAdjustControls && (
                    <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between pointer-events-none">
                      {isDressed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-semibold shadow-sm">
                          <Check size={11} />
                          {language === 'tr'
                            ? 'Üzerine Giydirildi'
                            : 'Dressed on Photo'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#141418]/75 backdrop-blur-md text-white text-[10px] font-medium shadow-sm">
                          {language === 'tr'
                            ? `Seçilen: ${outfit.bottom.name}`
                            : `Selected: ${outfit.bottom.name}`}
                        </span>
                      )}

                      <div className="flex items-center gap-1 pointer-events-auto">
                        {isDressed && (
                          <button
                            type="button"
                            onClick={() => setShowAdjustControls((v) => !v)}
                            className="p-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#141418] border border-[#c9cbd6] shadow-sm hover:bg-white cursor-pointer"
                            title={language === 'tr' ? 'Kalıp ve Boyut Ayarla' : 'Adjust Fit'}
                          >
                            <SlidersHorizontal size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="p-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#141418] border border-[#c9cbd6] shadow-sm hover:bg-white cursor-pointer"
                          title={language === 'tr' ? 'Fotoğrafı Değiştir' : 'Change Photo'}
                        >
                          <Camera size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Kıyafet En / Boy Ayar Paneli */}
                  {showAdjustControls && isDressed && (
                    <div className="absolute top-2.5 left-2.5 right-2.5 z-40 bg-[#141418]/85 backdrop-blur-md text-white p-3 rounded-2xl text-[11px] space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {language === 'tr'
                            ? 'Eteği / Üstü Sürükle veya Boyutlandır'
                            : 'Drag or Resize Skirt & Top'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setAdjustments({
                                top: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
                                bottom: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
                                shoes: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
                              })
                            }
                            className="p-1 hover:text-[#9ea3c4] cursor-pointer"
                            title={language === 'tr' ? 'Sıfırla' : 'Reset'}
                          >
                            <RotateCcw size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAdjustControls(false)}
                            className="p-1 hover:text-[#9ea3c4] cursor-pointer"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-18 text-white/80">
                          {language === 'tr' ? 'Etek Eni:' : 'Skirt Width:'}
                        </span>
                        <input
                          type="range"
                          min={0.5}
                          max={1.8}
                          step={0.05}
                          value={adjustments.bottom.scaleX}
                          onChange={(e) =>
                            setAdjustments((prev) => ({
                              ...prev,
                              bottom: {
                                ...prev.bottom,
                                scaleX: Number(e.target.value),
                              },
                            }))
                          }
                          className="flex-1 h-1 accent-white cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-18 text-white/80">
                          {language === 'tr' ? 'Etek Boyu:' : 'Skirt Length:'}
                        </span>
                        <input
                          type="range"
                          min={0.5}
                          max={1.8}
                          step={0.05}
                          value={adjustments.bottom.scaleY}
                          onChange={(e) =>
                            setAdjustments((prev) => ({
                              ...prev,
                              bottom: {
                                ...prev.bottom,
                                scaleY: Number(e.target.value),
                              },
                            }))
                          }
                          className="flex-1 h-1 accent-white cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-1 w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#c9cbd6] text-[#6b6d78] hover:border-[#141418]/40 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#141418] cursor-pointer"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#141418] text-white shadow-md">
                    <Plus size={22} />
                  </span>
                  <span className="px-5 text-center text-xs leading-snug">
                    {language === 'tr'
                      ? 'Boydan bir fotoğrafını ekle, seçtiğin eteği yapay zeka ile üzerine giydir'
                      : 'Add a full-body photo to dress selected skirts on you with AI'}
                  </span>
                </button>

                {/* Hızlı örnek model seçimi */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[11px] text-[#a3a5b0]">
                    {language === 'tr' ? 'Örnek model:' : 'Demo model:'}
                  </span>
                  {SAMPLE_AVATARS.slice(0, 2).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setRawAvatar(preset.url);
                        setAiGeneratedAvatar(null);
                        setIsDressed(false);
                        setHasUnappliedSelection(true);
                        onUpdateProfile({ avatar_url: preset.url });
                      }}
                      className="w-7 h-7 rounded-full overflow-hidden border border-[#c9cbd6] hover:scale-110 transition-transform cursor-pointer"
                      title={preset.name}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onUpload}
            />
          </div>

          {/* Sağ: Alternatif Etek / Üst / Ayakkabı Seçenekleri */}
          <div className="relative flex h-full flex-col justify-center gap-8 z-10">
            <div className="absolute right-1 top-1 flex flex-col items-center gap-4 text-[#9ea3c4]">
              <button
                aria-label="Menü"
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1 hover:text-[#141418] transition-colors cursor-pointer"
              >
                <Menu size={22} strokeWidth={1.5} />
              </button>
              <button
                aria-label={saved ? 'Kaydedildi' : 'Kombini kaydet'}
                onClick={handleBookmarkToggle}
                className="p-1 hover:text-[#141418] transition-colors cursor-pointer"
              >
                <Bookmark
                  size={22}
                  strokeWidth={1.5}
                  fill={saved ? '#141418' : 'none'}
                  className={saved ? 'text-[#141418]' : ''}
                />
              </button>
            </div>
            <div className="mt-20 flex flex-col gap-8">
              {alternatives.map((item, i) =>
                item ? (
                  <button
                    key={item.id}
                    onClick={() => swap(SLOTS[i], item)}
                    aria-label={`${item.name} seç`}
                    title={`${item.name} seç`}
                    className="h-26 -mr-3 transition-transform active:scale-95 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#141418] rounded cursor-pointer"
                  >
                    <Garment
                      type={item.type}
                      color={item.color}
                      imageUrl={item.imageUrl}
                      className="h-full w-full drop-shadow-sm"
                    />
                  </button>
                ) : (
                  <div key={i} className="h-26" />
                )
              )}
            </div>
          </div>
        </main>

        {/* YAN YANA "ÖNİZLEME" VE "ÜZERİNE GİYDİR" BUTONLARI */}
        <div className="px-5 pt-2 pb-1">
          <div className="flex items-center gap-2.5 max-w-sm mx-auto">
            {/* Önizleme Butonu */}
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="flex-1 py-3 px-4 rounded-full bg-white text-[#141418] border border-[#c9cbd6] hover:border-[#141418] text-xs font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Eye size={15} className="text-[#5263A8]" />
              <span>{language === 'tr' ? 'Önizleme' : 'Preview'}</span>
            </button>

            {/* Üzerine Giydir Butonu (Önizleme butonunun hemen yanında!) */}
            <button
              type="button"
              onClick={() => handleRunAIDressOn(outfit)}
              disabled={isAnalyzingAI}
              className={`flex-[1.35] py-3 px-4 rounded-full text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-60 ${
                hasUnappliedSelection || !isDressed
                  ? 'bg-gradient-to-r from-[#5263A8] to-[#7B8CC8] ring-2 ring-[#7B8CC8]/30'
                  : 'bg-[#141418]'
              }`}
            >
              <Sparkles size={15} />
              <span>
                {isAnalyzingAI
                  ? language === 'tr'
                    ? 'Analiz Ediliyor...'
                    : 'Analyzing...'
                  : language === 'tr'
                  ? 'Üzerine Giydir'
                  : 'Dress On Photo'}
              </span>
            </button>
          </div>
        </div>

        {/* AI Stylist Note */}
        {aiNote && (
          <div className="px-6 py-0.5 text-center">
            <p className="text-[11px] text-[#6b6d78] italic serif truncate">
              “{aiNote}”
            </p>
          </div>
        )}

        {/* Alt bar */}
        <footer className="relative flex items-center justify-center pb-5 pt-1">
          <button
            onClick={shuffle}
            aria-label="Yeni kombin öner"
            className="p-2 text-[#9ea3c4] hover:text-[#141418] cursor-pointer transition-colors"
          >
            <RefreshCw
              size={26}
              strokeWidth={1.5}
              className={`transition-transform duration-500 ${
                spin ? 'rotate-180' : ''
              }`}
            />
          </button>
          <button
            onClick={handleShare}
            aria-label="Paylaş"
            className="absolute right-6 p-2 text-[#c4c7d8] hover:text-[#141418] cursor-pointer transition-colors"
          >
            <Share size={20} strokeWidth={1.5} />
          </button>
        </footer>

        {/* ÖNİZLEME (PREVIEW) MODALI — Yanında "Üzerine Giydir" Butonu ile */}
        {showPreviewModal && (
          <div
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setShowPreviewModal(false)}
          >
            <div
              className="bg-white w-full max-w-sm rounded-[28px] p-5 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#141418]">
                    {language === 'tr' ? 'Seçilen Kombin Önizlemesi' : 'Selected Outfit Preview'}
                  </h3>
                  <p className="text-[11px] text-[#6b6d78]">
                    {language === 'tr'
                      ? 'Seçtiğiniz parçaları kontrol edin ve yapay zeka ile üzerinize giydirin.'
                      : 'Review your selected pieces and dress them onto your photo with AI.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5 bg-[#eef0f8]/60 p-3.5 rounded-2xl border border-slate-200/80">
                {SLOTS.map((s) => (
                  <div
                    key={s}
                    className="bg-white rounded-xl p-2.5 flex flex-col items-center justify-between border border-slate-100 shadow-sm"
                  >
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {s === 'top'
                        ? language === 'tr'
                          ? 'Üst'
                          : 'Top'
                        : s === 'bottom'
                        ? language === 'tr'
                          ? 'Etek / Alt'
                          : 'Skirt / Bottom'
                        : language === 'tr'
                        ? 'Ayakkabı'
                        : 'Shoes'}
                    </span>
                    <div className="w-16 h-20 my-1 flex items-center justify-center">
                      <Garment
                        type={outfit[s].type}
                        color={outfit[s].color}
                        imageUrl={outfit[s].imageUrl}
                        className="w-full h-full"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#141418] truncate w-full text-center">
                      {outfit[s].name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 py-3 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  {language === 'tr' ? 'Kapat' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => handleRunAIDressOn(outfit)}
                  className="flex-[1.5] py-3 rounded-full bg-gradient-to-r from-[#5263A8] to-[#7B8CC8] text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 hover:opacity-95 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>
                    {language === 'tr' ? 'Üzerine Giydir' : 'Dress On Photo'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ETEK / KIYAFET SEÇME VE GOOGLE RESMİ YÜKLEME MODALI */}
        {uploadSlotModal && (
          <div
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setUploadSlotModal(null)}
          >
            <div
              className="bg-white w-full max-w-sm rounded-[28px] p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#141418]">
                    {uploadSlotModal === 'bottom'
                      ? language === 'tr'
                        ? 'Etek / Alt Giyim Seç veya Yükle'
                        : 'Select or Upload Skirt / Bottom'
                      : uploadSlotModal === 'top'
                      ? language === 'tr'
                        ? 'Üst Giyim Seç veya Yükle'
                        : 'Select or Upload Top'
                      : language === 'tr'
                      ? 'Ayakkabı Seç veya Yükle'
                      : 'Select or Upload Shoes'}
                  </h3>
                  <p className="text-[11px] text-[#6b6d78]">
                    {language === 'tr'
                      ? 'Hazır eteklerden seç veya Google’dan bulduğun resmi yükle, ardından Üzerine Giydir butonuna bas.'
                      : 'Pick a preset skirt or upload an image from Google, then tap Dress On.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadSlotModal(null)}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Slot Seçici */}
              <div className="flex gap-1.5 bg-[#eef0f8] p-1 rounded-full text-xs">
                {(['bottom', 'top', 'shoes'] as SlotKey[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setUploadSlotModal(s)}
                    className={`flex-1 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                      uploadSlotModal === s
                        ? 'bg-[#141418] text-white shadow-sm'
                        : 'text-[#6b6d78] hover:text-[#141418]'
                    }`}
                  >
                    {s === 'bottom'
                      ? language === 'tr'
                        ? 'Etek / Alt'
                        : 'Skirt / Bottom'
                      : s === 'top'
                      ? language === 'tr'
                        ? 'Üst Giyim'
                        : 'Top'
                      : language === 'tr'
                      ? 'Ayakkabı'
                      : 'Shoes'}
                  </button>
                ))}
              </div>

              {/* Mevcut Hazır Etek / Parçalardan Seçim */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  {language === 'tr'
                    ? '1. Hazır Parçalardan Seç:'
                    : '1. Choose from Ready Pieces:'}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {wardrobePool[uploadSlotModal].map((piece) => {
                    const isSelected = outfit[uploadSlotModal].id === piece.id && !rawGarmentUpload;
                    return (
                      <button
                        key={piece.id}
                        type="button"
                        onClick={() => {
                          setRawGarmentUpload(null);
                          swap(uploadSlotModal, piece);
                        }}
                        className={`rounded-2xl border p-2 flex flex-col items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#5263A8] bg-[#eef0f8]/70 ring-2 ring-[#7B8CC8]/30'
                            : 'border-slate-200 bg-slate-50/50 hover:border-[#141418]'
                        }`}
                      >
                        <Garment
                          type={piece.type}
                          color={piece.color}
                          imageUrl={piece.imageUrl}
                          className="w-12 h-14"
                        />
                        <span className="text-[10px] font-semibold text-slate-800 truncate w-full text-center mt-1">
                          {piece.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Veya Google'dan / Cihazdan Resim Yükle */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  {language === 'tr'
                    ? '2. Veya Google’dan Bulduğun Resmi Yükle:'
                    : '2. Or Upload Image Found on Google:'}
                </span>
                <button
                  type="button"
                  onClick={() => garmentFileRef.current?.click()}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#7B8CC8] bg-[#eef0f8]/50 hover:bg-[#eef0f8] text-[#141418] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload size={15} className="text-[#5263A8]" />
                  <span>
                    {language === 'tr'
                      ? 'Cihazdan Etek / Kıyafet Resmi Seç'
                      : 'Choose Skirt / Garment Image from Device'}
                  </span>
                </button>
                <input
                  ref={garmentFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && uploadSlotModal) {
                      handleLoadGarmentFile(f, uploadSlotModal);
                    }
                  }}
                />

                <div className="flex items-center gap-1.5">
                  <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                    <Link2 size={14} className="text-slate-400 shrink-0" />
                    <input
                      type="url"
                      value={garmentUrlInput}
                      onChange={(e) => setGarmentUrlInput(e.target.value)}
                      placeholder={
                        language === 'tr'
                          ? 'Google resim linkini yapıştır...'
                          : 'Paste direct image URL...'
                      }
                      className="w-full text-xs bg-transparent outline-none text-[#141418]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadGarmentFromUrl}
                    disabled={!garmentUrlInput.trim() || isProcessingCutout}
                    className="px-3 py-2 rounded-xl bg-[#141418] text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    {language === 'tr' ? 'Getir' : 'Load'}
                  </button>
                </div>
              </div>

              {garmentUploadError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl">
                  {garmentUploadError}
                </p>
              )}

              {/* Yüklenen Resim veya Seçilen Parça Önizlemesi */}
              {(rawGarmentUpload || modalPreviewMode) && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="relative aspect-square max-h-44 mx-auto rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center p-2 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px]">
                    {isProcessingCutout ? (
                      <div className="flex flex-col items-center gap-2 text-xs text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#141418]" />
                        <span>
                          {language === 'tr'
                            ? 'Arka plan temizleniyor...'
                            : 'Removing background...'}
                        </span>
                      </div>
                    ) : rawGarmentUpload ? (
                      <img
                        src={
                          useAutoCutout && cutoutGarmentPreview
                            ? cutoutGarmentPreview
                            : rawGarmentUpload
                        }
                        alt="Preview"
                        className="max-h-40 w-auto object-contain drop-shadow-md"
                      />
                    ) : (
                      <div className="w-28 h-32">
                        <Garment
                          type={outfit[uploadSlotModal].type}
                          color={outfit[uploadSlotModal].color}
                          imageUrl={outfit[uploadSlotModal].imageUrl}
                          className="w-full h-full"
                        />
                      </div>
                    )}
                  </div>

                  {rawGarmentUpload && (
                    <div className="bg-slate-50 p-2.5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#141418] flex items-center gap-1.5">
                          <Wand2 size={13} className="text-[#5263A8]" />
                          {language === 'tr'
                            ? 'Otomatik Arka Plan Sil'
                            : 'Auto Remove Background'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setUseAutoCutout((v) => !v)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer ${
                            useAutoCutout
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {useAutoCutout
                            ? language === 'tr'
                              ? 'Açık'
                              : 'On'
                            : language === 'tr'
                            ? 'Orijinal'
                            : 'Off'}
                        </button>
                      </div>

                      {useAutoCutout && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 whitespace-nowrap">
                            {language === 'tr' ? 'Hassasiyet:' : 'Tolerance:'}
                          </span>
                          <input
                            type="range"
                            min={15}
                            max={90}
                            value={cutoutTolerance}
                            onChange={(e) => setCutoutTolerance(Number(e.target.value))}
                            className="flex-1 h-1 accent-[#141418] cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* MODAL ALTINDA YAN YANA "ÖNİZLEME" VE "ÜZERİNE GİYDİR" BUTONLARI */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalPreviewMode((v) => !v)}
                  className="flex-1 py-3 px-3 rounded-full bg-white text-[#141418] border border-[#c9cbd6] hover:border-[#141418] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye size={14} className="text-[#5263A8]" />
                  <span>{language === 'tr' ? 'Önizleme' : 'Preview'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (rawGarmentUpload) {
                      handleSelectOrDressUploadedGarment(true);
                    } else {
                      setUploadSlotModal(null);
                      handleRunAIDressOn(outfit);
                    }
                  }}
                  disabled={isProcessingCutout}
                  className="flex-[1.4] py-3 px-4 rounded-full bg-gradient-to-r from-[#5263A8] to-[#7B8CC8] text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 hover:opacity-95 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  <span>
                    {language === 'tr' ? 'Üzerine Giydir' : 'Dress On Photo'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Menu Popover */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] flex justify-end"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="w-64 bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="serif text-2xl text-[#141418]">Dolap</span>
                  <button
                    onClick={() =>
                      onUpdateProfile({
                        language: language === 'tr' ? 'en' : 'tr',
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef0f8] text-[#141418] text-xs font-medium cursor-pointer"
                  >
                    <Globe size={13} />
                    <span>{language === 'tr' ? 'TR' : 'EN'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onNavigateToTab('closet');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef0f8]/60 text-sm font-medium text-[#141418] cursor-pointer"
                  >
                    <Shirt size={18} strokeWidth={1.5} />
                    <span>{language === 'tr' ? 'Dolabım' : 'My Closet'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onNavigateToTab('scan');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef0f8]/60 text-sm font-medium text-[#141418] cursor-pointer"
                  >
                    <Camera size={18} strokeWidth={1.5} />
                    <span>{language === 'tr' ? 'Yeni Kıyafet Tara' : 'Scan Garment'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onNavigateToTab('favourites');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef0f8]/60 text-sm font-medium text-[#141418] cursor-pointer"
                  >
                    <Heart size={18} strokeWidth={1.5} />
                    <span>{language === 'tr' ? 'Favori Kombinler' : 'Saved Outfits'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onNavigateToTab('profile');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef0f8]/60 text-sm font-medium text-[#141418] cursor-pointer"
                  >
                    <User size={18} strokeWidth={1.5} />
                    <span>{language === 'tr' ? 'Profil & Ayarlar' : 'Profile & Settings'}</span>
                  </button>

                  {onStartOnboarding && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onStartOnboarding();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef0f8]/60 text-sm font-medium text-[#6b6d78] cursor-pointer"
                    >
                      <Sparkles size={18} strokeWidth={1.5} />
                      <span>
                        {language === 'tr' ? 'Stil Testini Tekrarla' : 'Retake Style Quiz'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-[#a3a5b0] text-center">
                {language === 'tr'
                  ? 'Ücretsiz Demo Modu Aktif'
                  : 'Free Demo Mode Active'}
              </div>
            </div>
          </div>
        )}

        {/* Share Toast */}
        {shareToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#141418] text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5">
            <Check size={14} />
            <span>
              {language === 'tr' ? 'Kombin bağlantısı kopyalandı' : 'Look copied to clipboard'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
