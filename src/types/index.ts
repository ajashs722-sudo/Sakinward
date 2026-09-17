export type ActiveTab = 
  | 'home' 
  | 'quran' 
  | 'qibla' 
  | 'menu' 
  | 'zikr' 
  | 'names' 
  | 'calendar' 
  | 'settings' 
  | 'story' 
  | 'location' 
  | 'makkah_live'
  | 'qazo'
  | 'roza'
  | 'academy'
  | 'landing'
  | 'soundscapes'
  | 'hijri_calendar'
  | 'sakin_ai';

export interface AcademyChannel {
  id: string;
  handle: string;
  name: string;
  subscribers: string;
  videoCount: string;
  language: string;
  languageLabel: string;
  avatarUrl: string;
  youtubeUrl: string;
  description: string;
  specialtyTags: string[];
  channelPlaylistId?: string; // YouTube uploads playlist or user_uploads ID
  officialPlaylists?: {
    id: string;
    title: string;
    playlistId: string;
    description: string;
    videoCount: string;
    orientation?: 'vertical' | 'horizontal';
  }[];
}

export interface AcademyVideo {
  id: string; // Unique ID or YouTube ID
  youtubeId: string; // Exact real YouTube video / shorts ID for embed
  title: string;
  channelId: string;
  channelName: string;
  channelHandle: string;
  language: string;
  orientation: 'vertical' | 'horizontal'; // 9:16 (shorts) vs 16:9 (darslar)
  duration: string;
  views: string;
  category: 'shorts' | 'guidance' | 'prayer' | 'quran_science' | 'youth_society';
  series?: string; // Playlist/Series name e.g. 'Ey Rasululloh (Siyrat)', 'Jannat Onalari', etc.
  tags?: string[];
  spiritualMood?: ('calm' | 'prayer' | 'knowledge' | 'repentance' | 'motivation')[];
  description: string;
  takeaways: string[]; // Sakin AI quick summary points
  isFeatured?: boolean;
  publishedDate?: string;
  youtubeUrl: string;
  customAdded?: boolean;
}

export interface SakinAiAction {
  type: 'open_quran' | 'open_zikr' | 'open_names' | 'open_qibla' | 'open_calendar' | 'open_roza' | 'open_soundscapes' | 'open_makkah' | 'open_academy';
  label: string;
  param?: string | number;
  subParam?: string | number;
}

export interface SakinAiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actions?: SakinAiAction[];
  sources?: { title: string; uri: string }[];
  grounded?: boolean;
  timestamp: number;
}

import { SupportedLanguage } from '../i18n/translations';

export type Language = SupportedLanguage;

export interface PrayerTimes {
  Fajr: string;      // Bomdod
  Sunrise: string;   // Quyosh
  Dhuhr: string;     // Peshin
  Asr: string;       // Asr
  Sunset: string;    // Shom
  Maghrib: string;   // Shom
  Isha: string;      // Xufton
  Imsak?: string;
  Midnight?: string;
  tomorrowFajr?: string;
  timezone?: string;
  dateStr?: string;
  hijriDate?: string;
  hijriDay?: number;
  hijriMonth?: string;
  hijriYear?: number;
  providerName?: string;
  nearestMosque?: {
    name: string;
    distanceKm: number;
    district?: string;
  };
}

export interface CityLocation {
  name: string;
  country: string;
  displayName: string;
  lat: number;
  lng: number;
  timezone: string;
  street?: string;
  mahalla?: string;
  district?: string;
  city?: string;
  state?: string;
  addressLine?: string;
  isGpsExact?: boolean;
  isVerifiedByUser?: boolean;
}

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  uzbekName?: string;
  uzbekTranslation?: string;
  startJuz: number;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
  translation?: string;
  audio?: string;
}

export interface JuzMeta {
  juzNumber: number;
  surahNumber: number;
  surahName: string;
  startAyah: number;
  pageNumber: number;
  quarters: { ayah: number; surah: string; label: string }[];
}

export interface AllahName {
  number: number;
  arabic: string;
  transliteration: string;
  uzbekMeaning: string;
  englishMeaning: string;
  explanation: string;
  isFavorite?: boolean;
}

export interface ZikrItem {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  targetCount: number;
  currentCount: number;
  reward?: string;
  category: 'tongi' | 'kechki' | 'namozdan_keyin' | 'salovat' | 'istighfar' | 'duo' | 'barcha';
  isFavorite?: boolean;
}

export interface DailyStory {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  body: string[];
  moral: string;
  source: string;
  date: string;
}

export interface AcademyGuide {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  badge?: string;
  iconType: string;
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    arabic?: string;
    transcription?: string;
    tips?: string;
  }[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface WallpaperOption {
  id: string;
  name: string;
  type: 'yurt' | 'gradient' | 'water' | 'kaaba' | 'emerald' | 'gold_mosque' | 'none';
  previewColor: string;
  gradientStyle: string;
  description?: string;
}

export interface AppIconOption {
  id: string;
  name: string;
  bgGradient: string;
  iconColor: string;
  isPlus?: boolean;
  glyphType?: 'crescent' | 'dome' | 'kaaba' | 'geometric' | 'star';
}

export interface QazoRecord {
  bomdod: number;
  peshin: number;
  asr: number;
  shom: number;
  xufton: number;
  vitr: number;
}
