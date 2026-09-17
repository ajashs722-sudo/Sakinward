import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Moon,
  Sun,
  Play,
  Pause,
  Heart,
  Copy,
  Sparkles,
  ArrowRight,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Navigation,
  Languages,
  Globe,
  FileText,
  Mail,
  Compass,
  Radio,
  Instagram,
  Send,
  Bot,
  Volume2,
  VolumeX,
  BookOpen,
  SkipBack,
  SkipForward,
  Wifi,
  Battery,
  Smartphone,
  ChevronUp,
  Layers,
  Check,
  GraduationCap,
  Tv,
  Youtube
} from 'lucide-react';
import { ActiveTab } from '../types';
import { soundManager } from '../utils/soundEffects';
import { calculateAstronomicalPrayerTimes } from '../services/prayerEngine';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageModal } from './LanguageModal';
import { getLanguageMeta } from '../data/languagesData';
import { reverseGeocodeLocation } from '../services/apiService';
import { getLandingTranslation } from '../i18n/landingTranslations';
import { subscribeCompass, getShortestAngleDiff } from '../utils/compassEngine';
import { getHijriDate } from '../utils/hijriCalendar';
import { ZetrHeroScroll } from './ZetrHeroScroll';
import { ScrollTextLines } from './ScrollTextLines';
import { SakinAiSection } from './SakinAiSection';
import { ScrollHighlightText, ScrollHighlightCard, ParallaxLayer } from './ScrollHighlight';

interface SakinwardLandingPageProps {
  onEnterApp: () => void;
  onNavigateTab?: (tab: ActiveTab, params?: any) => void;
  onOpenSakinAi?: () => void;
}

// Calculate distance in km using Haversine formula
function calculateDistanceToMakkah(lat: number, lng: number): number {
  const R = 6371; // Earth radius km
  const makkahLat = 21.4225 * (Math.PI / 180);
  const makkahLng = 39.8262 * (Math.PI / 180);
  const userLat = lat * (Math.PI / 180);
  const userLng = lng * (Math.PI / 180);
  const dLat = makkahLat - userLat;
  const dLng = makkahLng - userLng;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLat) * Math.cos(makkahLat) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Calculate Qibla azimuth bearing in degrees
function calculateQiblaBearing(lat: number, lng: number): number {
  const makkahLat = 21.4225 * (Math.PI / 180);
  const makkahLng = 39.8262 * (Math.PI / 180);
  const phi = lat * (Math.PI / 180);
  const lambda = lng * (Math.PI / 180);
  const y = Math.sin(makkahLng - lambda);
  const x = Math.cos(phi) * Math.tan(makkahLat) - Math.sin(phi) * Math.cos(makkahLng - lambda);
  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((qibla + 360) % 360);
}

// Al-Faatiha verses sequence for continuous audio recitation by Sheikh Mahmoud Khalil al-Husary
const FATIHA_VERSES = [
  {
    surah: 1,
    ayah: 1,
    url: 'https://everyayah.com/data/Husary_128kbps/001001.mp3',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    title: 'Al-Faatiha 1:1',
  },
  {
    surah: 1,
    ayah: 2,
    url: 'https://everyayah.com/data/Husary_128kbps/001002.mp3',
    arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
    title: 'Al-Faatiha 1:2',
  },
  {
    surah: 1,
    ayah: 3,
    url: 'https://everyayah.com/data/Husary_128kbps/001003.mp3',
    arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
    title: 'Al-Faatiha 1:3',
  },
  {
    surah: 1,
    ayah: 4,
    url: 'https://everyayah.com/data/Husary_128kbps/001004.mp3',
    arabic: 'مَالِكِ يَوْمِ الدِّينِ',
    title: 'Al-Faatiha 1:4',
  },
  {
    surah: 1,
    ayah: 5,
    url: 'https://everyayah.com/data/Husary_128kbps/001005.mp3',
    arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    title: 'Al-Faatiha 1:5',
  },
  {
    surah: 1,
    ayah: 6,
    url: 'https://everyayah.com/data/Husary_128kbps/001006.mp3',
    arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    title: 'Al-Faatiha 1:6',
  },
  {
    surah: 1,
    ayah: 7,
    url: 'https://everyayah.com/data/Husary_128kbps/001007.mp3',
    arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    title: 'Al-Faatiha 1:7',
  },
];

export const SakinwardLandingPage: React.FC<SakinwardLandingPageProps> = ({
  onEnterApp,
  onNavigateTab,
  onOpenSakinAi,
}) => {
  // Global Translation Hook (Supports all 70+ languages)
  const { language, t } = useTranslation();
  const currentLangMeta = getLanguageMeta(language);
  const tLanding = useMemo(() => getLandingTranslation(language), [language]);

  // Unified Sakin AI navigation handler
  const handleOpenAi = () => {
    if (onOpenSakinAi) {
      onOpenSakinAi();
    } else if (onNavigateTab) {
      onNavigateTab('sakin_ai');
    } else {
      onEnterApp();
    }
  };

  // Navigation / UI States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  
  // Default to Light Mode as requested ("лайтмод дефолтный")
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Autonomous Dynamic Location State (No static city arrays - 100% dynamic)
  const [locationState, setLocationState] = useState<{
    isGps: boolean;
    name: string;
    lat: number;
    lng: number;
    tz: number;
    provider?: string;
  }>({
    isGps: true,
    name: 'Toshkent',
    lat: 41.2995,
    lng: 69.2401,
    tz: 5,
    provider: 'Avtonom GPS',
  });

  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [selectedPrayerKey, setSelectedPrayerKey] = useState<string | null>(null);

  // Audio Player State (Al-Faatiha continuous recitation - Mahmoud Khalil al-Husary)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(6);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Azan audio preview inside phone mockup
  const [isPlayingAzan, setIsPlayingAzan] = useState(false);
  const azanAudioRef = useRef<HTMLAudioElement | null>(null);

  // Active Mushaf interactive state
  const [isLiked, setIsLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 99 Names Interactive Card
  const [activeNameIndex, setActiveNameIndex] = useState(0);

  // Current Live Time & Second Ticker
  const [now, setNow] = useState<Date>(new Date());

  // Compass Sensor states for Landing Page
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [isSensorActive, setIsSensorActive] = useState<boolean>(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);

  // Subscribe to real hardware compass orientation sensors (throttled for high FPS)
  useEffect(() => {
    let received = false;
    let lastUpdate = 0;
    const unsub = subscribeCompass(
      (data) => {
        received = true;
        setIsSensorActive(true);
        const nowMs = Date.now();
        if (nowMs - lastUpdate >= 100) {
          lastUpdate = nowMs;
          setDeviceHeading(Math.round(data.heading * 10) / 10);
        }
      },
      (err) => {
        console.warn('Compass sensor on landing page:', err);
      }
    );

    const timer = setTimeout(() => {
      if (!received) {
        setIsSensorActive(false);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  // Real Hijri date calculation for current language
  const currentHijri = useMemo(() => {
    return getHijriDate(now, 0, language);
  }, [now, language]);

  // Policy & Terms Modal state
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);

  // Toast notifier helper
  const showToast = (msg: string) => {
    soundManager.playBeadClick();
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Translations data for Al-Faatiha 1:2 automatically adapted to global language
  const currentQuranVerse = useMemo(() => {
    if (language === 'ru') {
      return {
        author: "Эльмир Кулиев",
        lang: "Русский",
        text: "Хвала Аллаху, Господу миров,",
      };
    }
    if (language === 'en') {
      return {
        author: "Sahih International",
        lang: "English",
        text: "[All] praise is [due] to Allah, Lord of the worlds.",
      };
    }
    if (language === 'tr') {
      return {
        author: "Diyanet İşleri Başkanlığı",
        lang: "Türkçe",
        text: "Hamd, Âlemlerin Rabbi olan Allah'a mahsustur.",
      };
    }
    if (language === 'ar') {
      return {
        author: "التفسير الميسر",
        lang: "العربية",
        text: "الحمد لله رب العالمين والثناء التام لله رب كل شيء وخالقه.",
      };
    }
    if (language === 'kk') {
      return {
        author: "Халифа Алтай",
        lang: "Қазақша",
        text: "Барлық мақтау бүкіл әлемнің Раббысы Аллаға тән.",
      };
    }
    // Default Uzbek
    return {
      author: "Shayx Muhammad Sodiq Muhammad Yusuf",
      lang: "O'zbekcha",
      text: "Barcha maqtov va shukrlar butun olamlar Parvardigori — Allohgadir.",
    };
  }, [language]);

  // 70+ Translation Flags Matrix
  const flagTranslations = [
    { country: "O'zbekiston", flag: '🇺🇿' },
    { country: 'Saudiya Arabistoni', flag: '🇸🇦' },
    { country: 'Turkiya', flag: '🇹🇷' },
    { country: 'Malayziya', flag: '🇲🇾' },
    { country: 'Indoneziya', flag: '🇮🇩' },
    { country: 'Ozarbayjon', flag: '🇦🇿' },
    { country: 'Qozogʻiston', flag: '🇰🇿' },
    { country: 'Qirgʻiziston', flag: '🇰🇬' },
    { country: 'Tojikiston', flag: '🇹🇯' },
    { country: 'Turkmaniston', flag: '🇹🇲' },
    { country: 'Rossiya', flag: '🇷🇺' },
    { country: 'Buyuk Britaniya', flag: '🇬🇧' },
    { country: 'Germaniya', flag: '🇩🇪' },
    { country: 'Fransiya', flag: '🇫🇷' },
    { country: 'Misr', flag: '🇪🇬' },
    { country: 'BAA (Birlashgan Arab Amirliklari)', flag: '🇦🇪' },
    { country: 'Pokiston', flag: '🇵🇰' },
    { country: 'Bangladesh', flag: '🇧🇩' },
    { country: 'Eron', flag: '🇮🇷' },
    { country: 'Ispaniya', flag: '🇪🇸' },
  ];

  // 99 Names of Allah Sample Data
  const namesOfAllah = [
    {
      name: 'Alloh',
      arabic: 'اللَّهُ',
      meaningUz: 'Yagona, barcha ibodatga loyiq bo‘lgan Zot.',
    },
    {
      name: 'Al-Quddus',
      arabic: 'الْقُدُّوسُ',
      meaningUz: 'Barcha ayb-nuqsonlardan mutlaqo pok va muqaddas Zot.',
    },
    {
      name: 'Ar-Rahmon',
      arabic: 'الرَّحْمَٰنُ',
      meaningUz: 'Barcha maxluqotlarga cheksiz marhamatli va mehribon Zot.',
    },
  ];

  // Sacred Islamic Milestones - authentic Hijri dates based on lunar sighting
  const hijriEvents = useMemo(() => {
    if (language === 'ru') {
      return [
        { title: 'Рамадан (Священный месяц поста)', hijriDate: '1 Рамадан', dayBadge: '1', monthBadge: 'РАМ', note: 'Обязательный пост' },
        { title: 'Ляйлят аль-Кадр (Ночь предопределения)', hijriDate: '27 Рамадан', dayBadge: '27', monthBadge: 'РАМ', note: 'Лучше 1000 месяцев' },
        { title: 'Ураза-байрам (Ид аль-Фитр)', hijriDate: '1 Шавваль', dayBadge: '1', monthBadge: 'ШАВ', note: 'Праздник разговения' },
        { title: 'День Арафа (Стояние на Арафате)', hijriDate: '9 Зуль-хиджа', dayBadge: '9', monthBadge: 'ЗУЛЬ', note: 'Великий день дуа' },
        { title: 'Курбан-байрам (Ид аль-Адха)', hijriDate: '10 Зуль-хиджа', dayBadge: '10', monthBadge: 'ЗУЛЬ', note: 'Праздник жертвы' },
        { title: 'Мавлид ан-Набави (Рождение Пророка ﷺ)', hijriDate: '12 Раби аль-авваль', dayBadge: '12', monthBadge: 'РАБ', note: 'Благословение миров' },
        { title: 'День Ашура (Спасение Мусы а.с.)', hijriDate: '10 Мухаррам', dayBadge: '10', monthBadge: 'МУХ', note: 'Сунна-пост' },
      ];
    }
    if (language === 'tr') {
      return [
        { title: 'Ramazan-ı Şerif (Oruç Başlangıcı)', hijriDate: '1 Ramazan', dayBadge: '1', monthBadge: 'RAM', note: 'Farz oruç ayı' },
        { title: 'Kadir Gecesi (Leyletü\'l-Kadr)', hijriDate: '27 Ramazan', dayBadge: '27', monthBadge: 'RAM', note: 'Bin aydan hayırlı' },
        { title: 'Ramazan Bayramı (Îd-i Fıtır)', hijriDate: '1 Şevval', dayBadge: '1', monthBadge: 'ŞEV', note: 'Şükür bayramı' },
        { title: 'Arefe Günü (Arafat Vakfesi)', hijriDate: '9 Zilhicce', dayBadge: '9', monthBadge: 'ZİL', note: 'Büyük dua günü' },
        { title: 'Kurban Bayramı (Îd-i Adhâ)', hijriDate: '10 Zilhicce', dayBadge: '10', monthBadge: 'ZİL', note: 'Kurban ibadeti' },
        { title: 'Mevlid Kandili (Peygamberimiz ﷺ)', hijriDate: '12 Rebiülevvel', dayBadge: '12', monthBadge: 'REB', note: 'Kutlu doğum' },
        { title: 'Aşure Günü (Musa a.s. kurtuluşu)', hijriDate: '10 Muharrem', dayBadge: '10', monthBadge: 'MUH', note: 'Faziletli oruç' },
      ];
    }
    if (language === 'ar') {
      return [
        { title: 'شهر رمضان المبارك (بداية الصيام)', hijriDate: '1 رمضان', dayBadge: '١', monthBadge: 'رمضان', note: 'فرض الصيام' },
        { title: 'ليلة القدر المباركة', hijriDate: '27 رمضان', dayBadge: '٢٧', monthBadge: 'رمضان', note: 'خير من ألف شهر' },
        { title: 'عيد الفطر المبارك', hijriDate: '1 شوال', dayBadge: '١', monthBadge: 'شوال', note: 'يوم الجائزة والشكر' },
        { title: 'يوم عرفة المبارك', hijriDate: '9 ذو الحجة', dayBadge: '٩', monthBadge: 'ذو الحجة', note: 'أعظم أيام الدعاء' },
        { title: 'عيد الأضحى المبارك', hijriDate: '10 ذو الحجة', dayBadge: '١٠', monthBadge: 'ذو الحجة', note: 'يوم النحر والتقرب' },
        { title: 'المولد النبوي الشريف ﷺ', hijriDate: '12 ربيع الأول', dayBadge: '١٢', monthBadge: 'ربيع ١', note: 'مولد خير الأنام' },
        { title: 'يوم عاشوراء (نجاة موسى عليه السلام)', hijriDate: '10 محرم', dayBadge: '١٠', monthBadge: 'محرم', note: 'صيام مبارك' },
      ];
    }
    if (language === 'en') {
      return [
        { title: 'Ramadan (Beginning of Fasting)', hijriDate: '1 Ramadan', dayBadge: '1', monthBadge: 'RAM', note: 'Month of divine mercy' },
        { title: 'Laylat al-Qadr (Night of Power)', hijriDate: '27 Ramadan', dayBadge: '27', monthBadge: 'RAM', note: 'Better than 1,000 months' },
        { title: 'Eid al-Fitr (Festival of Breaking Fast)', hijriDate: '1 Shawwal', dayBadge: '1', monthBadge: 'SHW', note: 'Gratitude & celebration' },
        { title: 'Day of Arafah', hijriDate: '9 Dhul Hijjah', dayBadge: '9', monthBadge: 'DHU', note: 'Standing at Arafat' },
        { title: 'Eid al-Adha (Feast of Sacrifice)', hijriDate: '10 Dhul Hijjah', dayBadge: '10', monthBadge: 'DHU', note: 'Sacrifice & remembrance' },
        { title: 'Mawlid an-Nabi (Prophet\'s ﷺ Birthday)', hijriDate: '12 Rabi al-Awwal', dayBadge: '12', monthBadge: 'RAB', note: 'Blessing to all creation' },
        { title: 'Day of Ashura', hijriDate: '10 Muharram', dayBadge: '10', monthBadge: 'MUH', note: 'Deliverance of Prophet Musa' },
      ];
    }
    // Default Uzbek
    return [
      { title: 'Ramazon oyi (Muborak ro‘za boshlanishi)', hijriDate: '1-Ramazon', dayBadge: '1', monthBadge: 'RAM', note: 'Farz ro‘za ibodati' },
      { title: 'Qadr kechasi (Laylatul Qadr)', hijriDate: '27-Ramazon', dayBadge: '27', monthBadge: 'RAM', note: 'Ming oydan afzal kecha' },
      { title: 'Ramazon Hayiti (Iyd al-Fitr)', hijriDate: '1-Shavvol', dayBadge: '1', monthBadge: 'SHV', note: 'Shukrona va quvonch bayrami' },
      { title: 'Arafa kuni (Arafotda turish)', hijriDate: '9-Zulhijja', dayBadge: '9', monthBadge: 'ZUL', note: 'Ulug‘ ro‘za va duo kuni' },
      { title: 'Qurbon Hayiti (Iyd al-Adha)', hijriDate: '10-Zulhijja', dayBadge: '10', monthBadge: 'ZUL', note: 'Qurbonlik va takbir bayrami' },
      { title: 'Mavlid an-Nabaviy (Payg‘ambarimiz ﷺ)', hijriDate: '12-Rabiulavval', dayBadge: '12', monthBadge: 'RAB', note: 'Olamlarga rahmat kuni' },
      { title: 'Ashuro kuni (Muso a.s. najoti)', hijriDate: '10-Muharram', dayBadge: '10', monthBadge: 'MUH', note: 'Fazilatli sunnat ro‘za' },
    ];
  }, [language]);

  // Dynamic astronomical prayer times calculated dynamically for GPS or static city
  const computedTimes = useMemo(() => {
    try {
      return calculateAstronomicalPrayerTimes(
        now,
        locationState.lat,
        locationState.lng,
        locationState.tz,
        'uzb'
      );
    } catch {
      return {
        Fajr: '04:38',
        Sunrise: '06:05',
        Dhuhr: '12:35',
        Asr: '16:45',
        Maghrib: '19:04',
        Isha: '20:30',
      };
    }
  }, [now, locationState]);

  // Prayer list with rakats and descriptions
  const prayerSlots = useMemo(() => {
    return [
      {
        key: 'Fajr',
        name: 'Bomdod',
        time: computedTimes.Fajr || '04:38',
        info: '2 rakat sunnat, 2 rakat farz',
      },
      {
        key: 'Sunrise',
        name: 'Quyosh',
        time: computedTimes.Sunrise || '06:05',
        info: 'Quyosh chiqish vaqti (Makruh vaqt)',
      },
      {
        key: 'Dhuhr',
        name: 'Peshin',
        time: computedTimes.Dhuhr || '12:35',
        info: '4 rakat sunnat, 4 farz, 2 sunnat',
      },
      {
        key: 'Asr',
        name: 'Asr',
        time: computedTimes.Asr || '16:45',
        info: '4 rakat farz',
      },
      {
        key: 'Maghrib',
        name: 'Shom',
        time: computedTimes.Maghrib || '19:04',
        info: '3 rakat farz, 2 rakat sunnat',
      },
      {
        key: 'Isha',
        name: 'Xufton',
        time: computedTimes.Isha || '20:30',
        info: '4 farz, 2 sunnat, 3 vitr vojib',
      },
    ];
  }, [computedTimes]);

  // Next prayer detection & accurate countdown
  const { nextSlot, countdownString, currentTimeString } = useMemo(() => {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const curTimeString = `${hours}:${minutes}`;

    const currentTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const parsedSlots = prayerSlots.map((slot) => {
      const [hStr, mStr] = (slot.time || '00:00').split(':');
      const h = parseInt(hStr, 10) || 0;
      const m = parseInt(mStr, 10) || 0;
      return {
        ...slot,
        totalSec: h * 3600 + m * 60,
      };
    });

    let target = parsedSlots.find((s) => s.totalSec > currentTotalSec);
    let diffSec = 0;

    if (target) {
      diffSec = target.totalSec - currentTotalSec;
    } else {
      // Past Isha, next is tomorrow's Fajr
      target = parsedSlots[0];
      diffSec = 24 * 3600 - currentTotalSec + target.totalSec;
    }

    const remH = Math.floor(diffSec / 3600);
    const remM = Math.floor((diffSec % 3600) / 60);
    const remS = diffSec % 60;

    const countStr = `${String(remH).padStart(2, '0')}:${String(remM).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;

    return {
      nextSlot: target,
      countdownString: countStr,
      currentTimeString: curTimeString,
    };
  }, [now, prayerSlots]);

  // Qibla Azimuth & Distance dynamically based on current location
  const currentQibla = useMemo(() => {
    const bearing = calculateQiblaBearing(locationState.lat, locationState.lng);
    const distance = calculateDistanceToMakkah(locationState.lat, locationState.lng);
    return {
      bearing,
      distance,
    };
  }, [locationState]);

  // Remaining angular difference for turn guidance (1:1 with QiblaModal)
  const qiblaSignedDiff = useMemo(() => {
    return getShortestAngleDiff(currentQibla.bearing, deviceHeading);
  }, [currentQibla.bearing, deviceHeading]);
  const qiblaAbsDiff = Math.abs(Math.round(qiblaSignedDiff));
  const isQiblaAligned = isSensorActive && qiblaAbsDiff <= 4;

  const compassCardinal = useMemo(() => {
    const d = (deviceHeading + 360) % 360;
    if (d >= 337.5 || d < 22.5) return 'N';
    if (d >= 22.5 && d < 67.5) return 'NE';
    if (d >= 67.5 && d < 112.5) return 'E';
    if (d >= 112.5 && d < 157.5) return 'SE';
    if (d >= 157.5 && d < 202.5) return 'S';
    if (d >= 202.5 && d < 247.5) return 'SW';
    if (d >= 247.5 && d < 292.5) return 'W';
    return 'NW';
  }, [deviceHeading]);

  // Autonomous Multi-Provider Location Acquisition (GPS -> IP Geolocation -> Timezone fallback)
  const detectAutonomousLocation = async (forceFresh = false) => {
    soundManager.playBeadClick();
    setIsLocatingGPS(true);
    if (forceFresh) {
      showToast(tLanding.gpsLocating || "Aniq geomanzil aniqlanmoqda...");
    }

    // Provider 1: Hardware/Browser High-Precision GPS
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 6500,
            maximumAge: forceFresh ? 0 : 300000,
          });
        });

        const { latitude, longitude } = position.coords;
        const geoInfo = await reverseGeocodeLocation(latitude, longitude, language);
        const parsedTz = typeof geoInfo.timezone === 'number'
          ? geoInfo.timezone
          : (typeof geoInfo.timezone === 'string' ? parseFloat(geoInfo.timezone) : null);
        const autoTz = (parsedTz && !isNaN(parsedTz)) ? parsedTz : (Math.round(longitude / 15) || 5);
        const displayName = geoInfo.name || geoInfo.city || geoInfo.district || 'Aniq GPS';

        setLocationState({
          isGps: true,
          name: displayName,
          lat: latitude,
          lng: longitude,
          tz: autoTz,
          provider: 'GPS Yuqori Aniqlik',
        });
        setIsLocatingGPS(false);
        if (forceFresh) {
          showToast(`📍 ${displayName} aniqlandi!`);
        }
        return;
      } catch (gpsErr) {
        console.warn('GPS hardware bypassed or denied, switching to IP fallback provider...', gpsErr);
      }
    }

    // Provider 2: Autonomous IP Geolocation Fallback
    try {
      const ipController = new AbortController();
      const ipTimeout = setTimeout(() => ipController.abort(), 4000);
      const ipRes = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client', {
        signal: ipController.signal,
      });
      clearTimeout(ipTimeout);

      if (ipRes.ok) {
        const ipData = await ipRes.json();
        const lat = ipData.latitude || 41.2995;
        const lng = ipData.longitude || 69.2401;
        const locality = ipData.locality || ipData.city || ipData.principalSubdivision || 'Toshkent';
        const autoTz = Math.round(lng / 15) || 5;

        setLocationState({
          isGps: true,
          name: locality,
          lat,
          lng,
          tz: autoTz,
          provider: 'IP Avtonom Provayder',
        });
        setIsLocatingGPS(false);
        if (forceFresh) {
          showToast(`📍 ${locality} (Avtonom tarmoq orqali) aniqlandi`);
        }
        return;
      }
    } catch (ipErr) {
      console.warn('IP fallback failed, falling back to system timezone...', ipErr);
    }

    // Provider 3: Autonomous Timezone-based Geolocation Fallback
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tashkent';
    let fallbackName = 'Toshkent';
    let fallbackLat = 41.2995;
    let fallbackLng = 69.2401;
    let fallbackTz = 5;

    if (tz.includes('Samarkand')) {
      fallbackName = 'Samarqand';
      fallbackLat = 39.6542;
      fallbackLng = 66.9597;
    } else if (tz.includes('Dubai') || tz.includes('Riyadh')) {
      fallbackName = 'Makka (Haram)';
      fallbackLat = 21.4225;
      fallbackLng = 39.8262;
      fallbackTz = 3;
    } else if (tz.includes('Istanbul')) {
      fallbackName = 'Istanbul';
      fallbackLat = 41.0082;
      fallbackLng = 28.9784;
      fallbackTz = 3;
    } else if (tz.includes('Moscow')) {
      fallbackName = 'Moskva';
      fallbackLat = 55.7558;
      fallbackLng = 37.6173;
      fallbackTz = 3;
    } else if (tz.includes('Almaty')) {
      fallbackName = 'Olmaota';
      fallbackLat = 43.2389;
      fallbackLng = 76.8897;
      fallbackTz = 5;
    }

    setLocationState({
      isGps: false,
      name: fallbackName,
      lat: fallbackLat,
      lng: fallbackLng,
      tz: fallbackTz,
      provider: 'Tizim mintaqasi',
    });
    setIsLocatingGPS(false);
    if (forceFresh) {
      showToast(`📍 ${fallbackName} (Standart mintaqa) belgilandi`);
    }
  };

  // Autonomous location acquisition on mount
  useEffect(() => {
    detectAutonomousLocation(false);
  }, []);

  // Cleanup audio objects on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (azanAudioRef.current) {
        azanAudioRef.current.pause();
        azanAudioRef.current = null;
      }
    };
  }, []);

  // Audio Playback Engine - Real sequential recitation of Mahmoud Khalil al-Husary
  const playTrack = (index: number) => {
    if (index < 0 || index >= FATIHA_VERSES.length) {
      setIsPlayingAudio(false);
      setCurrentVerseIndex(0);
      setAudioProgress(0);
      return;
    }

    const verse = FATIHA_VERSES[index];
    setCurrentVerseIndex(index);
    setAudioProgress(0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = verse.url;
    } else {
      audioRef.current = new Audio(verse.url);
    }

    const audio = audioRef.current;
    audio.ontimeupdate = () => {
      if (audio.duration) {
        setAudioProgress(Math.floor(audio.currentTime));
        setAudioDuration(Math.floor(audio.duration));
      }
    };

    audio.onended = () => {
      // Auto-advance to next ayah seamlessly!
      if (index + 1 < FATIHA_VERSES.length) {
        playTrack(index + 1);
      } else {
        setIsPlayingAudio(false);
        setCurrentVerseIndex(0);
        setAudioProgress(0);
      }
    };

    audio
      .play()
      .then(() => {
        setIsPlayingAudio(true);
      })
      .catch((err) => {
        console.warn('Audio play prevented or network error:', err);
        setIsPlayingAudio(false);
      });
  };

  // Audio Playback Handler - Toggles recitation or starts from current ayah
  const toggleAudioPlayback = () => {
    soundManager.playBeadClick();
    if (isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingAudio(false);
    } else {
      playTrack(currentVerseIndex);
    }
  };

  const skipToNextAyah = () => {
    soundManager.playBeadClick();
    const nextIdx = (currentVerseIndex + 1) % FATIHA_VERSES.length;
    playTrack(nextIdx);
  };

  const skipToPrevAyah = () => {
    soundManager.playBeadClick();
    const prevIdx = currentVerseIndex === 0 ? FATIHA_VERSES.length - 1 : currentVerseIndex - 1;
    playTrack(prevIdx);
  };

  // Azan Audio Preview Handler
  const toggleAzanPreview = () => {
    soundManager.playBeadClick();
    if (!azanAudioRef.current) {
      const azan = new Audio('https://everyayah.com/data/Husary_128kbps/001001.mp3');
      azan.onended = () => setIsPlayingAzan(false);
      azanAudioRef.current = azan;
    }

    if (isPlayingAzan) {
      azanAudioRef.current.pause();
      setIsPlayingAzan(false);
      showToast("Azon to'xtatildi");
    } else {
      azanAudioRef.current.play().catch(() => {});
      setIsPlayingAzan(true);
      showToast("Azon qiroati yangramoqda");
    }
  };

  // Live time ticker (optimized interval to eliminate CPU re-render thrashing)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);

    return () => {
      clearInterval(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (azanAudioRef.current) {
        azanAudioRef.current.pause();
        azanAudioRef.current = null;
      }
    };
  }, []);

  // Theme-aware tokens
  const textColorPrimary = isDarkMode ? 'text-[#F7F4EC]' : 'text-[#0A1233]';
  const textColorSecondary = isDarkMode ? 'text-[#F7F4EC]/75' : 'text-[#0A1233]/75';
  const cardMainBg = isDarkMode
    ? 'bg-[#0D173E] border-[#DBC66E]/20 shadow-2xl'
    : 'bg-white border-[#8A7410]/20 shadow-md';
  const innerWidgetBg = isDarkMode
    ? 'bg-[#0A1233] border-[#DBC66E]/30 shadow-xl'
    : 'bg-[#FAF8F3] border-[#8A7410]/25 shadow-sm';
  const subBoxBg = isDarkMode
    ? 'bg-[#0A1233]/70 border-[#DBC66E]/15'
    : 'bg-[#FAF8F3] border-[#8A7410]/20';
  const goldHeading = isDarkMode ? 'text-[#DBC66E]' : 'text-[#8A7410]';

  return (
    <div
      className={`relative w-full min-h-screen transition-colors duration-300 font-sans pb-0 ${
        isDarkMode ? 'bg-[#0A1233] text-[#F7F4EC]' : 'bg-[#FAF8F3] text-[#0A1233]'
      }`}
      style={{
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] px-5 py-3 rounded-full bg-[#0A1233] text-[#F7F4EC] border border-[#DBC66E]/40 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-[#DBC66E]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO SECTION WITH ZETR HERO SCROLL (Architectural 3D Perspective + Sacred Mecca background) */}
      <section className="relative w-full overflow-hidden bg-[#060B20] text-[#F7F4EC]">
        {/* Sacred Mecca Background Image from Sakinward Official CDN */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="https://sakinward.aluvantis.uz/Mecca-desktop-tablet/Photo/poster.jpg"
            alt="Masjid al-Haram Mecca"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-25 brightness-90 filter contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1233] via-[#0A1233]/75 to-[#060B20]/90" />
          <div className="absolute inset-0 bg-radial from-[#DBC66E]/10 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Top Navbar: Authentic Uzbek, Clean & Balanced, Fast App Entry */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-30 w-full px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3"
        >
          {/* Left Controls: Menu & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <motion.button
              id="btn-landing-menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Menu"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F7F4EC]/10 hover:bg-[#F7F4EC]/20 transition backdrop-blur-md flex items-center justify-center text-[#F7F4EC] border border-[#DBC66E]/30 cursor-pointer shadow-lg"
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            <motion.button
              id="btn-landing-theme"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle Theme"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F7F4EC]/10 hover:bg-[#F7F4EC]/20 transition backdrop-blur-md flex items-center justify-center text-[#F7F4EC] border border-[#DBC66E]/30 cursor-pointer shadow-lg"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-[#DBC66E]" /> : <Moon className="w-5 h-5 text-[#DBC66E]" />}
            </motion.button>
          </div>

          {/* Center Brand Identity */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer"
            onClick={onEnterApp}
          >
            <img
              src="https://sakinward.aluvantis.uz/Logo/89t8bVrDJpSbugTCKLHOuA.png"
              alt="Sakinward Logo"
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_2px_12px_rgba(219,198,110,0.6)]"
            />
            <div className="flex flex-col">
              <span className="font-brand-display text-base sm:text-xl font-bold tracking-tight text-[#F7F4EC] whitespace-nowrap leading-tight">
                Sakinward
              </span>
              <span className="text-[10px] tracking-wider text-[#DBC66E] uppercase font-semibold">
                Islomiy Platforma
              </span>
            </div>
          </motion.div>

          {/* Right Action: Language Selector with clean flag & code indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              id="btn-landing-language"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsLanguageModalOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#F7F4EC]/10 hover:bg-[#F7F4EC]/20 transition border border-[#DBC66E]/40 text-[#F7F4EC] font-semibold text-xs sm:text-sm backdrop-blur-md shadow-lg cursor-pointer"
              title={tLanding.languageSelect}
            >
              <span className="text-base leading-none shrink-0" role="img" aria-label="Flag">
                {currentLangMeta?.flag || '🇺🇿'}
              </span>
              <span className="font-bold tracking-wider uppercase text-xs text-[#DBC66E]">
                {language.toUpperCase()}
              </span>
              <span className="hidden sm:inline-block max-w-[95px] truncate text-white/90 font-medium">
                {currentLangMeta?.nativeName || 'O‘zbekcha'}
              </span>
            </motion.button>
          </div>
        </motion.header>

        {/* ZETR HERO SCROLL: Architectural 3D Scroll Showcase */}
        <ZetrHeroScroll
          isDarkMode={isDarkMode}
          scrollHint={tLanding.scrollHint}
          header={
            <div className="w-full flex flex-col items-center sm:items-start gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://sakinward.aluvantis.uz/Logo/89t8bVrDJpSbugTCKLHOuA.png"
                  alt="Sakinward Logo"
                  className="w-8 sm:w-9 h-8 sm:h-9 object-contain drop-shadow-[0_2px_12px_rgba(219,198,110,0.6)]"
                />
                <span className="font-brand-display text-xl sm:text-2xl font-bold tracking-tight text-[#F7F4EC]">
                  {tLanding.appName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#DBC66E]/20 border border-[#DBC66E]/40 text-[#DBC66E] text-[11px] font-semibold">
                  70+ Tillarda
                </span>
              </div>

              <h1 className="font-brand-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F7F4EC] max-w-2xl leading-[1.2]">
                {tLanding.heroHeadline}
              </h1>
              <p className="text-sm sm:text-base text-[#F7F4EC]/80 max-w-xl">
                {tLanding.heroSubheadline}
              </p>

              {/* Action CTAs: Direct entry to app */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onEnterApp}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#DBC66E] to-[#C8B052] text-[#0A1233] font-bold text-sm shadow-[0_10px_25px_rgba(219,198,110,0.3)] hover:brightness-105 transition flex items-center gap-2 cursor-pointer"
                >
                  <span>{tLanding.openApp}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (onNavigateTab) {
                      onNavigateTab('quran');
                    } else {
                      onEnterApp();
                    }
                  }}
                  className="px-5 py-3 rounded-full bg-[#F7F4EC]/10 hover:bg-[#F7F4EC]/20 text-[#F7F4EC] font-semibold text-sm border border-[#DBC66E]/40 backdrop-blur-md transition flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#DBC66E]" />
                  <span>{tLanding.quranTitle}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleOpenAi}
                  className="px-5 py-3 rounded-full bg-[#F7F4EC]/10 hover:bg-[#F7F4EC]/20 text-[#F7F4EC] font-semibold text-sm border border-[#DBC66E]/40 backdrop-blur-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#DBC66E]" />
                  <span>{tLanding.sakinAiTitle}</span>
                </motion.button>
              </div>
            </div>
          }
        >
          {/* Floating Titanium Phone Chassis */}
          <div className="relative w-full max-w-[305px] sm:max-w-[335px] aspect-[9/18.8] rounded-[48px] p-3 sm:p-3.5 bg-gradient-to-b from-[#182348] via-[#0D1537] to-[#060B20] border-[3px] border-[#DBC66E]/50 shadow-[0_30px_90px_rgba(0,0,0,0.92),0_0_35px_rgba(219,198,110,0.18)] flex flex-col justify-between overflow-hidden">
            {/* Dynamic Island with Live Camera, Mic & Equalizer Audio Visualizer */}
            <div className="w-full flex justify-center items-center pt-0.5 pb-1.5 shrink-0">
                <div className="h-6 px-3 rounded-full bg-black/95 border border-white/15 flex items-center justify-between gap-2.5 shadow-md min-w-[115px]">
                  {/* Camera lens */}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#111827] border border-white/20 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#38bdf8]/40" />
                  </div>
                  
                  {/* Azan / Audio Equalizer Indicator */}
                  {isPlayingAzan ? (
                    <div className="flex items-center gap-1">
                      <span className="w-0.5 h-2 bg-[#DBC66E] rounded-full animate-pulse" />
                      <span className="w-0.5 h-3 bg-[#DBC66E] rounded-full animate-pulse delay-75" />
                      <span className="w-0.5 h-2 bg-[#DBC66E] rounded-full animate-pulse delay-150" />
                      <span className="text-[9px] font-mono text-[#DBC66E] ml-1 font-bold">AZON</span>
                    </div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                  )}

                  {/* Microphone sensor dot */}
                  <div className="w-1.5 h-1.5 rounded-full bg-[#222]" />
                </div>
              </div>

              {/* Inner App Interface Screen */}
              <div className="flex-1 w-full rounded-[36px] p-3 sm:p-3.5 bg-gradient-to-b from-[#101C49] via-[#0A1233] to-[#050A1C] text-[#F7F4EC] flex flex-col justify-between shadow-inner overflow-hidden border border-[#DBC66E]/20 relative">
                
                {/* Phone Status Bar: Live Clock, 5G, Wi-Fi & Battery */}
                <div className="flex items-center justify-between text-[10px] text-[#F7F4EC]/75 font-mono pb-1.5 border-b border-white/10">
                  <span className="font-bold text-[#F7F4EC]">{currentTimeString}</span>
                  <div className="flex items-center gap-1.5 opacity-85">
                    <span className="text-[9px] font-bold text-[#DBC66E]">5G</span>
                    <Wifi className="w-3 h-3 text-[#F7F4EC]" />
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>

                {/* Autonomous Geomanzil Live Bar */}
                <div className="pt-1.5 pb-1 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 min-w-0">
                    <MapPin className="w-3 h-3 text-[#DBC66E] shrink-0" />
                    <span className="text-[11px] font-bold truncate text-[#F7F4EC]">
                      {locationState.name}
                    </span>
                  </div>

                  <button
                    id="btn-mockup-geomanzil"
                    onClick={() => detectAutonomousLocation(true)}
                    disabled={isLocatingGPS}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0A1233]/90 border border-[#DBC66E]/50 text-[10px] font-semibold text-[#DBC66E] hover:bg-[#DBC66E]/20 active:scale-95 transition cursor-pointer shadow-sm shrink-0"
                    title={`${locationState.name} (${locationState.provider || 'GPS'}) — ${tLanding.refreshLocation}`}
                  >
                    {isLocatingGPS ? (
                      <Navigation className="w-2.5 h-2.5 text-[#DBC66E] animate-spin shrink-0" />
                    ) : (
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                    )}
                    <span>{isLocatingGPS ? tLanding.gpsLocating : (locationState.provider ? 'GPS' : 'Avtonom')}</span>
                  </button>
                </div>

                {/* Next Prayer Glowing Hero Card inside mockup */}
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#1A2655] to-[#0A1233] border border-[#DBC66E]/40 text-center shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#DBC66E] font-bold">
                      {nextSlot?.name || 'Navbatdagi'}
                    </span>
                    <button
                      onClick={toggleAzanPreview}
                      className="flex items-center gap-1 text-[9px] text-[#0A1233] bg-[#DBC66E] hover:bg-[#C8B052] font-bold px-2 py-0.5 rounded-full cursor-pointer transition active:scale-95 shadow"
                      title="Azon audiosini sinash"
                    >
                      {isPlayingAzan ? (
                        <>
                          <VolumeX className="w-2.5 h-2.5" />
                          <span>To'xtatish</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-2.5 h-2.5" />
                          <span>Azon</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Countdown Timer with seconds */}
                  <div className="text-lg sm:text-xl font-extrabold font-mono text-[#F7F4EC] tracking-wider my-0.5">
                    {countdownString}
                  </div>
                  <div className="text-[10px] text-[#F7F4EC]/70">
                    {tLanding.nextPrayerLabel || 'qoldi'}
                  </div>
                </div>

                {/* Prayer Times Schedule Table */}
                <div className="space-y-1 py-1 text-[11px]">
                  {prayerSlots.map((slot) => {
                    const isNext = nextSlot?.key === slot.key;
                    const isSelected = selectedPrayerKey === slot.key;

                    return (
                      <div
                        key={slot.key}
                        onClick={() => {
                          soundManager.playBeadClick();
                          setSelectedPrayerKey(isSelected ? null : slot.key);
                          showToast(`${slot.name}: ${slot.info}`);
                        }}
                        className={`flex items-center justify-between px-2 py-1 rounded-xl transition cursor-pointer ${
                          isNext
                            ? 'bg-[#DBC66E]/25 border border-[#DBC66E]/60 text-[#DBC66E] font-bold shadow-sm'
                            : isSelected
                            ? 'bg-white/15 border border-white/20 text-white font-semibold'
                            : 'hover:bg-white/5 text-[#F7F4EC]/85 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {isNext && <span className="w-1.5 h-1.5 rounded-full bg-[#DBC66E] animate-ping" />}
                          <span>{slot.name}</span>
                        </div>
                        <span className="font-mono font-semibold">{slot.time}</span>
                      </div>
                    );
                  })}
                </div>

                {/* In-App Mini Navigation Bar */}
                <div className="pt-1.5 border-t border-white/10 flex items-center justify-around text-[#F7F4EC]/70 text-[9px]">
                  <div className="flex flex-col items-center gap-0.5 text-[#DBC66E] font-bold">
                    <Clock className="w-3 h-3" />
                    <span>Vaqtlar</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 hover:text-[#DBC66E] transition cursor-pointer" onClick={onEnterApp}>
                    <BookOpen className="w-3 h-3" />
                    <span>Qur'on</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 hover:text-[#DBC66E] transition cursor-pointer" onClick={onEnterApp}>
                    <Compass className="w-3 h-3" />
                    <span>Qibla</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 hover:text-[#DBC66E] transition cursor-pointer" onClick={onEnterApp}>
                    <Sparkles className="w-3 h-3" />
                    <span>AI</span>
                  </div>
                </div>

              </div>

              {/* Home Indicator bar */}
              <div className="w-28 h-1 bg-[#F7F4EC]/35 rounded-full mx-auto mt-2 shrink-0" />
          </div>
        </ZetrHeroScroll>
      </section>

      {/* 1. SCROLL DIVIDER: Sokinlik va Ma'naviyat Oyati (Divine Reveal) */}
      <ScrollTextLines
        type="reveal"
        isDarkMode={isDarkMode}
        badge={language === 'ru' ? 'Духовный покой' : language === 'en' ? 'Spiritual Peace' : 'Sokinlik va Xotirjamlik'}
        lines={
          language === 'ru'
            ? [
                '«Разве не поминанием Аллаха утешаются сердца?»',
                'Обретите душевный покой и умиротворение через ежедневное поминание.',
              ]
            : language === 'en'
            ? [
                '«Verily, in the remembrance of Allah do hearts find rest»',
                'Discover inner tranquility and divine presence through mindful reflection.',
              ]
            : [
                '«Albatta, qalblar Allohning zikri ila orom topur»',
                'Kundalik zikr va ma\'naviyat bilan qalbingizga haqiqiy taskin baxsh eting.',
              ]
        }
        citation={
          language === 'ru'
            ? 'Сура Ар-Ра\'д, аят 28'
            : language === 'en'
            ? 'Surah Ar-Ra\'d, Ayah 28'
            : 'Ra\'d surasi, 28-oyat'
        }
      />

      {/* 70+ Languages Global Selector Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        isLight={!isDarkMode}
      />

      {/* 2. SECTION: INTERACTIVE ISLAMIC SUITE CARDS (With ZETR 3D Perspective Scroll) */}
      <ZetrHeroScroll
        variant="section"
        isDarkMode={isDarkMode}
        badge="Qur'on Ekotizimi"
        title="Qur'oni Karim & Mashhur Qorilar"
        subtitle={
          language === 'ru'
            ? 'Аудиодекодер высшего качества, 130+ чтецов и переводы смыслов'
            : language === 'en'
            ? 'Lossless audio streaming, 130+ world-renowned reciters & multi-language tafsir'
            : 'Yuqori sifatli audio oqim, 130+ mashhur qorilar va mo‘tabar tafsirlar'
        }
      >
        <div className="space-y-6">
        {/* CARD 1: Qur'on Audio Player with REAL reciter photo */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          whileHover={{ y: -3 }}
          className={`rounded-[36px] p-6 sm:p-8 transition-colors border shadow-xl ${cardMainBg}`}
        >
          <h2 className={`font-brand-display text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 ${goldHeading}`}>
            Qur'on
          </h2>

          {/* Floating Audio Player Widget */}
          <div className={`rounded-3xl p-5 sm:p-6 mb-6 transition-all border ${innerWidgetBg}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0A1233] border border-[#DBC66E]/40 text-[#DBC66E] flex items-center justify-center shadow-lg shrink-0">
                <BookOpen className="w-7 h-7" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`text-base sm:text-lg font-bold truncate ${textColorPrimary}`}>
                  {FATIHA_VERSES[currentVerseIndex]?.title || 'Al-Faatiha 1:1'}
                </h3>
                <div className="flex items-center gap-2.5 mt-1">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-[#DBC66E]/40 shrink-0 shadow-sm">
                    <img
                      src="/reciters/husary.jpg"
                      alt="Mahmoud Khalil al-Husary"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className={`text-xs font-semibold truncate ${goldHeading}`}>
                    Mahmoud Khalil al-Husary
                  </span>
                </div>
              </div>
            </div>

            {/* Audio Progress Slider */}
            <div className="space-y-1">
              <div className="w-full bg-[#8A7410]/20 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#DBC66E] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${audioDuration > 0 ? (audioProgress / audioDuration) * 100 : 0}%` }}
                />
              </div>
              <div className={`flex items-center justify-between text-[11px] font-mono ${goldHeading}`}>
                <span>0:{audioProgress < 10 ? `0${audioProgress}` : audioProgress}</span>
                <span>-{Math.max(0, audioDuration - audioProgress)}s</span>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center gap-8 pt-3">
              <button
                onClick={skipToPrevAyah}
                className={`hover:text-[#DBC66E] transition cursor-pointer ${textColorPrimary}`}
                title={tLanding.prevVerse}
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={toggleAudioPlayback}
                className="w-12 h-12 rounded-full bg-[#DBC66E] text-[#0A1233] flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg cursor-pointer"
                title={isPlayingAudio ? tLanding.pauseRecitation : tLanding.listenRecitation}
              >
                {isPlayingAudio ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={skipToNextAyah}
                className={`hover:text-[#DBC66E] transition cursor-pointer ${textColorPrimary}`}
                title={tLanding.nextVerse}
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>
            </div>
          </div>

          <div className={`rounded-2xl p-5 border ${subBoxBg}`}>
            <h4 className={`text-base font-bold ${textColorPrimary}`}>
              {tLanding.savedVersesNotes}
            </h4>
            <p className={`text-sm mt-1 ${textColorSecondary}`}>
              {tLanding.savedVersesDesc2}
            </p>
          </div>
        </motion.div>

        {/* CARD 2: Mushaf Rejimi & Oyat Tarjimasi */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          whileHover={{ y: -3 }}
          className={`rounded-[36px] p-6 sm:p-8 transition-colors border shadow-xl ${cardMainBg}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`font-brand-display text-2xl sm:text-3xl font-extrabold tracking-tight ${goldHeading}`}>
              {tLanding.quranTitle}
            </h2>

            <button
              onClick={() => setIsLanguageModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-semibold transition cursor-pointer border border-transparent hover:border-[#DBC66E]/40"
              title={tLanding.languageSelect}
            >
              <Globe className="w-3.5 h-3.5 text-[#DBC66E]" />
              <span>{currentLangMeta?.nativeName || 'Til'}</span>
            </button>
          </div>

          {/* Mushaf Page Sample with Action Column */}
          <div className="relative flex items-start gap-4 mb-6">
            <div className={`flex-1 rounded-3xl p-6 sm:p-8 space-y-4 text-center border transition-all duration-300 ${innerWidgetBg}`}>
              <div
                className={`text-sm font-serif transition-all duration-300 ${
                  isPlayingAudio && currentVerseIndex === 0
                    ? 'text-[#DBC66E] font-bold scale-105 drop-shadow-[0_0_8px_rgba(219,198,110,0.6)]'
                    : goldHeading
                }`}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>

              <div
                className={`font-serif text-2xl sm:text-3xl font-bold leading-relaxed py-2 transition-all duration-300 ${
                  isPlayingAudio && currentVerseIndex === 1
                    ? 'text-[#DBC66E] scale-105 drop-shadow-[0_0_12px_rgba(219,198,110,0.8)]'
                    : textColorPrimary
                }`}
              >
                ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#DBC66E]/60 text-xs ml-2 font-mono text-[#DBC66E]">
                  ۲
                </span>
              </div>

              {/* Dynamic Translated Verse Text adapted to global language */}
              <div className="pt-3 border-t border-[#8A7410]/20">
                <div className="text-[11px] font-bold text-[#8A7410] dark:text-[#DBC66E] mb-1">
                  {currentQuranVerse.author} ({currentQuranVerse.lang})
                </div>
                <p className={`text-xs sm:text-sm italic font-serif leading-relaxed ${textColorSecondary}`}>
                  "{currentQuranVerse.text}"
                </p>
              </div>
            </div>

            {/* Right Action Icons Column */}
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => {
                  setIsLiked(!isLiked);
                  showToast(isLiked ? tLanding.verseUnliked : tLanding.verseLiked);
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer shadow-sm ${
                  isLiked
                    ? 'bg-rose-500 text-white'
                    : isDarkMode
                    ? 'bg-[#0A1233] border border-[#DBC66E]/30 text-rose-400 hover:bg-rose-500/20'
                    : 'bg-white border border-[#8A7410]/30 text-rose-500 hover:bg-rose-50'
                }`}
                title="Yoqdi"
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={toggleAudioPlayback}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer shadow-sm ${
                  isPlayingAudio
                    ? 'bg-[#DBC66E] text-[#0A1233] shadow-[0_0_12px_rgba(219,198,110,0.5)] scale-105'
                    : isDarkMode
                    ? 'bg-[#0A1233] border border-[#DBC66E]/30 text-[#DBC66E] hover:bg-[#DBC66E]/20'
                    : 'bg-white border border-[#8A7410]/30 text-[#8A7410] hover:bg-[#FAF8F3]'
                }`}
                title={isPlayingAudio ? "To'xtatish" : "Tinglash"}
              >
                {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ");
                  showToast(tLanding.verseCopySuccess);
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer shadow-sm ${
                  isDarkMode
                    ? 'bg-[#0A1233] border border-[#DBC66E]/30 text-[#F7F4EC] hover:bg-[#DBC66E]/20'
                    : 'bg-white border border-[#8A7410]/30 text-[#0A1233] hover:bg-[#FAF8F3]'
                }`}
                title="Nusxalash"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className={`rounded-2xl p-5 border ${subBoxBg}`}>
            <h4 className={`text-base font-bold ${textColorPrimary}`}>
              {tLanding.mushafMode}
            </h4>
            <p className={`text-sm mt-1 ${textColorSecondary}`}>
              {tLanding.mushafDesc}
            </p>
          </div>
        </motion.div>

        {/* CARD 3: 70+ Tillardagi Mo'tabar Tarjimalar */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          whileHover={{ y: -3 }}
          className={`rounded-[36px] p-6 sm:p-8 transition-colors border shadow-xl ${cardMainBg}`}
        >
          <div className="space-y-1 mb-6">
            <h2 className={`font-brand-display text-2xl sm:text-3xl font-extrabold tracking-tight ${goldHeading}`}>
              {tLanding.languagesCardTitle}
            </h2>
            <p className={`text-sm sm:text-base font-semibold ${textColorPrimary}`}>
              {tLanding.languagesCardSubtitle}
            </p>
          </div>

          <div className={`rounded-3xl p-6 mb-6 border ${innerWidgetBg}`}>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 items-center justify-items-center py-2">
              {flagTranslations.map((flagItem, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.15 }}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-md flex items-center justify-center text-2xl sm:text-3xl cursor-pointer transition ${
                    isDarkMode
                      ? 'bg-[#0D173E] border border-[#DBC66E]/30'
                      : 'bg-white border border-[#8A7410]/25'
                  }`}
                  title={flagItem.country}
                  onClick={() => {
                    soundManager.playBeadClick();
                    showToast(`Tarjima: ${flagItem.country}`);
                  }}
                >
                  <span>{flagItem.flag}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-5 border ${subBoxBg}`}>
            <h4 className={`text-base font-bold ${textColorPrimary}`}>
              {tLanding.languagesCardTitle}
            </h4>
            <p className={`text-sm mt-1 ${textColorSecondary}`}>
              {tLanding.languagesCardDesc}
            </p>
          </div>
        </motion.div>
      </div>
    </ZetrHeroScroll>

      {/* 2. SCROLL DIVIDER: Qur'on Ekotizimi Kinetik Lentasi (Dual Opposing Bands) */}
      <ScrollTextLines
        type="kinetic"
        isDarkMode={isDarkMode}
        line1={[
          "QUR'ONI KARIM",
          "114 TA SURA",
          "130+ MASHHUR QORILAR",
          "MO'TABAR TAFSIRLAR",
          "70+ JAHON TILLARI",
        ]}
        line2={[
          "HIFZ VA TILOVAT",
          "MAHMOUD KHALIL AL-HUSARY",
          "MISHAARI RASHID AL-AFASY",
          "ABDULBASIT ABDUSSAMAD",
          "SAKINWARD 2026",
        ]}
      />

      {/* CARD 4: QIBLA — Real Dinamik Datchikli Kompas (With ZETR 3D Perspective Scroll) */}
      <ZetrHeroScroll
        variant="section"
        isDarkMode={isDarkMode}
        badge="Aniq Astronomik Yo'nalish"
        title={tLanding.qiblaTitle}
        subtitle={
          language === 'ru'
            ? 'Точный компас к Священной Каабе из любой точки мира с 360° гироскопом'
            : language === 'en'
            ? 'Astronomical precision compass towards the Holy Kaaba with 360° sensor'
            : 'Dunyoning istalgan nuqtasidan Ka‘baga tomon aniq yo‘nalish va 360° datchik'
        }
      >
        <div
          className={`rounded-[36px] p-6 sm:p-8 transition-colors border shadow-xl ${cardMainBg}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h2 className={`font-brand-display text-2xl sm:text-3xl font-extrabold tracking-tight ${goldHeading}`}>
                {tLanding.qiblaTitle}
              </h2>
              <p className={`text-sm sm:text-base font-medium ${textColorSecondary}`}>
                {language === 'ru'
                  ? 'Точный компас к Священной Каабе из любой точки мира'
                  : language === 'en'
                  ? 'Astronomical precision compass towards the Holy Kaaba'
                  : 'Dunyoning istalgan nuqtasidan Ka‘baga tomon aniq yo‘nalish'}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DBC66E]/15 border border-[#DBC66E]/30 text-xs font-bold text-[#8A7410] dark:text-[#DBC66E]">
              <Compass className="w-3.5 h-3.5" />
              <span>{isSensorActive ? 'Datchik faol' : 'Avtonom kompas'}</span>
            </div>
          </div>

          {/* Top Status & Turn Guidance Pill */}
          <div className="flex items-center justify-center mb-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 border border-[#DBC66E]/40 text-xs font-medium shadow-lg backdrop-blur-md">
              {isQiblaAligned ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{tLanding.qiblaAligned}</span>
                  <span>🕋</span>
                </span>
              ) : (
                <span className="text-[#DBC66E] flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#DBC66E]" />
                  <span>{tLanding.rotateTowardsKaaba}</span>
                </span>
              )}
            </div>
          </div>

          {/* AUTHENTIC NOCTURNAL COMPASS DIAL */}
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] mx-auto flex items-center justify-center select-none my-4">
            {/* Static Phone Alignment Marker */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
              <div className={`w-3.5 h-3.5 rotate-45 border-t-2 border-l-2 transition-colors duration-300 ${
                isQiblaAligned ? 'border-emerald-400 shadow-emerald-400/80 shadow-md' : 'border-[#DBC66E]'
              }`} />
            </div>

            {/* Outer Rotating Compass Disc */}
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center transition-transform duration-200 ease-out"
              style={{
                transform: `rotate(${-deviceHeading}deg)`,
              }}
            >
              {/* Outer Fine Glass Perimeter */}
              <div className={`absolute inset-0 rounded-full border-2 transition-all duration-500 shadow-2xl backdrop-blur-md ${
                isQiblaAligned 
                  ? 'border-emerald-400/80 bg-emerald-950/20 shadow-emerald-500/30' 
                  : 'border-[#DBC66E]/40 bg-[#070D24]/85'
              }`} />

              {/* Degree Graduation Ticks (Every 30 degrees) */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-full h-full flex flex-col items-center pointer-events-none"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <div className={`w-[1.5px] mt-1.5 ${deg % 90 === 0 ? 'h-3 bg-[#DBC66E]' : 'h-1.5 bg-white/40'}`} />
                </div>
              ))}

              {/* Dynamic Orbiting Kaaba Target Badge */}
              <div
                className="absolute inset-0 flex flex-col items-center pointer-events-none"
                style={{ transform: `rotate(${currentQibla.bearing}deg)` }}
              >
                <div className="relative -mt-4 sm:-mt-5 flex flex-col items-center">
                  <motion.div 
                    animate={{ scale: isQiblaAligned ? [1, 1.15, 1] : 1 }}
                    transition={{ repeat: isQiblaAligned ? Infinity : 0, duration: 1.6 }}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all duration-300 ${
                      isQiblaAligned
                        ? 'bg-white text-black border-emerald-400 shadow-emerald-400/60 shadow-lg scale-110'
                        : 'bg-white text-black border-[#DBC66E] shadow-black/80'
                    }`}
                  >
                    <span className="text-lg sm:text-xl">🕋</span>
                  </motion.div>

                  <div className={`w-2.5 h-2.5 rounded-full mt-1 transition-all duration-300 ${
                    isQiblaAligned 
                      ? 'bg-emerald-400 shadow-emerald-400/80 shadow-md scale-125 animate-ping' 
                      : 'bg-[#DBC66E] shadow-[#DBC66E]/50 shadow-sm'
                  }`} />
                </div>
              </div>

              {/* Inner Cardinal Crosshairs (N, E, S, W) */}
              <div className="relative w-[78%] h-[78%] rounded-full border border-dashed border-[#DBC66E]/20 flex items-center justify-center pointer-events-none">
                <span className="absolute top-2 text-xs font-black text-[#DBC66E] tracking-wider">
                  N
                </span>
                <span className="absolute right-3 text-xs font-bold text-white/70">
                  E
                </span>
                <span className="absolute bottom-2 text-xs font-bold text-white/70">
                  S
                </span>
                <span className="absolute left-3 text-xs font-bold text-white/70">
                  W
                </span>

                <div className="absolute w-[80%] h-[1px] bg-white/10" />
                <div className="absolute h-[80%] w-[1px] bg-white/10" />
              </div>
            </div>

            {/* Central Target Axis Needle */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ transform: `rotate(${-deviceHeading + currentQibla.bearing}deg)` }}
            >
              <div className={`w-[2.5px] h-[72%] transition-all duration-300 ${
                isQiblaAligned 
                  ? 'bg-gradient-to-t from-transparent via-emerald-400 to-emerald-300 shadow-emerald-400 shadow-lg' 
                  : 'bg-gradient-to-t from-transparent via-[#DBC66E]/30 to-[#DBC66E]/60'
              }`} />
            </div>

            {/* Center Digital Hub - Clean & Elegant */}
            <div className={`relative z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl backdrop-blur-2xl transition-all duration-300 pointer-events-none ${
              isQiblaAligned
                ? 'bg-emerald-950/85 border-emerald-400 text-white shadow-emerald-500/40 shadow-xl'
                : 'bg-black/75 border-[#DBC66E]/50 text-[#FAF8F3]'
            }`}>
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none">
                {Math.round(deviceHeading)}°
              </span>
              
              <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mt-1.5 ${
                isQiblaAligned ? 'text-emerald-300' : 'text-[#DBC66E]'
              }`}>
                {compassCardinal}
              </span>
            </div>
          </div>

          {/* Clean Telemetry Bar (No location clutter, high branding focus) */}
          <div className="space-y-3 mt-4">
            {/* Clean branding distance and sensor specs */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                isDarkMode
                  ? 'bg-white/10 border-white/20 text-[#F7F4EC]'
                  : 'bg-black/5 border-black/10 text-[#0A1233]'
              }`}>
                <span>🕋 ~{currentQibla.distance.toLocaleString()} km ({tLanding.qiblaDistanceToMakkah})</span>
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border ${
                isDarkMode ? 'bg-black/30 border-white/10 text-white/70' : 'bg-white/60 border-black/10 text-black/70'
              }`}>
                <span>360° Geomagnit datchik</span>
              </span>
            </div>

            {/* Direct button to open full immersive Qibla */}
            <button
              onClick={() => {
                soundManager.playBeadClick();
                if (onNavigateTab) {
                  onNavigateTab('qibla');
                } else {
                  onEnterApp();
                }
              }}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#DBC66E] to-[#C8B052] text-[#0A1233] font-bold text-xs sm:text-sm hover:brightness-105 active:scale-98 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Compass className="w-4 h-4" />
              <span>{tLanding.openFullQibla}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </ZetrHeroScroll>

      {/* 3. SCROLL DIVIDER: Qibla va Masjidul Haram Oyati (Divine Reveal) */}
      <ScrollTextLines
        type="reveal"
        isDarkMode={isDarkMode}
        badge={language === 'ru' ? 'Единая Кибла' : language === 'en' ? 'Unified Qibla' : 'Yagona Qibla'}
        lines={
          language === 'ru'
            ? [
                '«Где бы вы ни были, обращайте лица к Заповедной мечети»',
                'Единый духовный компас миллиардов верующих сердец по всему миру.',
              ]
            : language === 'en'
            ? [
                '«Turn your face in the direction of Al-Masjid Al-Haram»',
                'The unified sanctuary and celestial focal point for believers everywhere.',
              ]
            : [
                '«Qayerda bo‘lsangiz ham, yuzingizni Masjidul Haram tomon buring»',
                'Dunyoning qaysi burchagida bo‘lmang, barcha mo‘minlar yagona Ka‘baga yuzlanadi.',
              ]
        }
        citation={
          language === 'ru'
            ? 'Сура Аль-Бакара, аят 144'
            : language === 'en'
            ? 'Surah Al-Baqarah, Ayah 144'
            : 'Baqara surasi, 144-oyat'
        }
      />

      {/* CARD 5: SAKIN AI — Islomiy Sun'iy Intellekt Yordamchisi (With ZETR 3D Perspective Scroll & 2-Tone Naqsh Path-Drawing) */}
      <ZetrHeroScroll
        variant="section"
        isDarkMode={isDarkMode}
        badge="Sun'iy Intellekt & Hikmat"
        title={tLanding.sakinAiTitle}
        subtitle={
          language === 'ru'
            ? 'Исламский ИИ-ассистент на основе Корана, сунны и проверенных источников'
            : language === 'en'
            ? 'Islamic AI assistant based on Quran, Sunnah, and verified scholarly sources'
            : 'Qur\'on, sunnat va mo‘tabar manbalar asosida ishlovchi ishonchli yordamchi'
        }
      >
        <SakinAiSection
          isDarkMode={isDarkMode}
          language={language}
          onOpenAi={handleOpenAi}
        />
      </ZetrHeroScroll>

      {/* 4. SCROLL DIVIDER: Sakin AI Kinetik Lentasi (Dual Opposing Bands) */}
      <ScrollTextLines
        type="kinetic"
        isDarkMode={isDarkMode}
        line1={[
          "SAKIN AI",
          "ISLOMIY SUN'IY INTELLEKT",
          "ISHONCHLI MANBALAR",
          "ODOB VA AHKOMLAR",
          "QUR'ON VA SUNNAT",
        ]}
        line2={[
          "SHUBHALARDAN XOLI",
          "HAR QADAMDA HAMROH",
          "ILM VA MA'RIFAT",
          "SAKINWARD AI INTELLECT",
          "HALOL VA HAROM ASOSLARI",
        ]}
      />

      {/* CARD 6: HIJRIY TAQVIM — Real Dinamik Hijriy Ma'lumotlar (With ZETR 3D Perspective Scroll) */}
      <ZetrHeroScroll
        variant="section"
        isDarkMode={isDarkMode}
        badge="Islomiy Taqvim & Kosmos"
        title={tLanding.hijriTitle}
        subtitle={
          language === 'ru'
            ? 'Точный расчет исламских дат и благословенных событий'
            : language === 'en'
            ? 'Astronomical calculation and blessed Islamic milestones'
            : 'Aniq astronomik hisob-kitob va muborak islomiy kunlar'
        }
      >
        <div
          className={`rounded-[36px] p-6 sm:p-8 transition-colors border shadow-xl ${cardMainBg}`}
        >
          <div className="space-y-1 mb-6">
            <h2 className={`font-brand-display text-2xl sm:text-3xl font-extrabold tracking-tight ${goldHeading}`}>
              {tLanding.hijriTitle}
            </h2>
            <p className={`text-xl sm:text-2xl font-extrabold ${textColorPrimary}`}>
              {tLanding.hijriSubtitle}
            </p>
          </div>

          <div className={`rounded-3xl p-5 sm:p-6 mb-4 border ${innerWidgetBg}`}>
            {/* Header: Exact Day & Month */}
            <div className={`flex items-center justify-between pb-4 border-b ${
              isDarkMode ? 'border-[#DBC66E]/20' : 'border-[#8A7410]/20'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DBC66E] to-[#C8B052] text-[#0A1233] flex flex-col items-center justify-center font-bold shadow-md shrink-0">
                  <span className="text-xl font-black leading-none">{currentHijri.day}</span>
                  <span className="text-[9px] uppercase font-extrabold tracking-wider leading-none mt-0.5">{currentHijri.era}</span>
                </div>
                <div>
                  <div className={`text-base sm:text-lg font-bold ${textColorPrimary}`}>
                    {currentHijri.day} {currentHijri.monthName}, {currentHijri.year} {tLanding.hijriYearSuffix}
                  </div>
                  <div className={`text-xs font-medium ${textColorSecondary}`}>
                    {new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border shrink-0 ${
                isDarkMode
                  ? 'bg-[#F7F4EC]/10 text-[#DBC66E] border-[#DBC66E]/30'
                  : 'bg-[#8A7410]/10 text-[#8A7410] border-[#8A7410]/20'
              }`}>
                {currentHijri.year} {tLanding.hijriYearSuffix}
              </span>
            </div>

            {/* Theological note regarding crescent sighting */}
            <div className={`my-3.5 p-3 rounded-2xl text-xs flex items-start gap-2.5 border ${
              isDarkMode
                ? 'bg-[#DBC66E]/10 border-[#DBC66E]/20 text-[#DBC66E]'
                : 'bg-[#8A7410]/10 border-[#8A7410]/20 text-[#8A7410]'
            }`}>
              <span className="text-base shrink-0">🌙</span>
              <span className="leading-snug">
                {tLanding.lunarObservationNote}
              </span>
            </div>

            {/* Sacred Islamic Milestones — Toza va Qulay Ro‘yxat (Ortiqcha badge'larsiz) */}
            <div className="pt-2 space-y-2.5">
              <div className={`text-xs font-bold uppercase tracking-wider ${goldHeading}`}>
                {tLanding.sacredMilestones}
              </div>
              {hijriEvents.map((evt, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 text-left group cursor-pointer p-2.5 rounded-2xl transition hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-[#DBC66E]/20"
                  onClick={() => showToast(`${evt.title}: ${evt.hijriDate}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold leading-tight transition group-hover:text-[#DBC66E] ${textColorPrimary}`}>
                      {evt.title}
                    </div>
                    <div className="text-xs mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className={`font-bold ${isDarkMode ? 'text-[#DBC66E]' : 'text-[#8A7410]'}`}>
                        {evt.hijriDate}
                      </span>
                      <span className="opacity-40">•</span>
                      <span className={`${textColorSecondary}`}>
                        {evt.note}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-[#DBC66E] transition-all shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              if (onNavigateTab) {
                onNavigateTab('hijri_calendar');
              } else {
                onEnterApp();
              }
            }}
            className="w-full py-3.5 px-4 rounded-2xl border border-current text-xs font-bold hover:bg-[#DBC66E]/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{tLanding.viewFullCalendar}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </ZetrHeroScroll>

      {/* 5. SCROLL DIVIDER: Astronomiya va Vaqt Oyati (Divine Reveal) */}
      <ScrollTextLines
        type="reveal"
        isDarkMode={isDarkMode}
        badge={language === 'ru' ? 'Время и Космос' : language === 'en' ? 'Time & Cosmos' : 'Vaqt va Astronomiya'}
        lines={
          language === 'ru'
            ? [
                '«Солнце и луна движутся согласно установленному расчету»',
                'Священные месяцы и лунные фазы, упорядоченные божественной мудростью.',
              ]
            : language === 'en'
            ? [
                '«The sun and the moon move by precise calculation»',
                'Sacred lunar cycles and divine milestones guiding your spiritual year.',
              ]
            : [
                '«Quyosh va oy aniq hisob bilandir»',
                'Muborak hijriy oylar va fazilatli kunlar hikmat ila belgilangan.',
              ]
        }
        citation={
          language === 'ru'
            ? 'Сура Ар-Рахман, аят 5'
            : language === 'en'
            ? 'Surah Ar-Rahman, Ayah 5'
            : 'Rahmon surasi, 5-oyat'
        }
      />

      {/* CARD 7: ALLOHNING 99 ISMI (With ZETR 3D Perspective Scroll) */}
      <ZetrHeroScroll
        variant="section"
        isDarkMode={isDarkMode}
        badge="Asmo al-Husno"
        title={tLanding.namesTitle}
        subtitle={
          language === 'ru'
            ? '99 прекрасных имен Аллаха с толкованием смыслов и духовным созерцанием'
            : language === 'en'
            ? 'The 99 Beautiful Names of Allah with profound meanings and spiritual reflection'
            : 'Allohning 99 go‘zal ismi, sharhlari va ruhiy xotirjamlik zikrlari'
        }
      >
        <div
          className={`rounded-[36px] p-6 sm:p-8 transition-colors border shadow-xl ${cardMainBg}`}
        >
          <div className="space-y-1 mb-6">
            <h2 className={`font-brand-display text-2xl sm:text-3xl font-extrabold tracking-tight ${goldHeading}`}>
              {tLanding.namesTitle}
            </h2>
            <p className={`text-xl sm:text-2xl font-extrabold ${textColorPrimary}`}>
              {tLanding.namesSubtitle}
            </p>
          </div>

          {/* Floating Calligraphy Cards */}
          <div className="relative h-64 sm:h-72 w-full flex items-center justify-center my-6">
            <div className={`absolute top-4 left-6 sm:left-14 w-40 sm:w-48 h-40 sm:h-48 rounded-3xl p-4 shadow-md opacity-60 flex flex-col justify-between border ${
              isDarkMode
                ? 'bg-[#0A1233] border-[#DBC66E]/20'
                : 'bg-white border-[#8A7410]/20'
            }`}>
              <span className={`text-xs ${goldHeading}`}>Allah, God, The Creator</span>
              <span className={`text-2xl font-serif ${goldHeading}`}>الله</span>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                soundManager.playBeadClick();
                setActiveNameIndex(0);
                showToast("Alloh — Yagona va buyuk Zot");
              }}
              className="absolute top-0 right-8 sm:right-20 w-44 sm:w-52 h-44 sm:h-52 rounded-[32px] bg-gradient-to-br from-[#DBC66E] via-[#C8B052] to-[#8A7410] p-6 shadow-2xl flex flex-col items-center justify-center text-[#0A1233] cursor-pointer"
            >
              <span className="font-serif text-4xl sm:text-5xl font-bold drop-shadow-sm">
                اللَّهُ
              </span>
              <span className="text-sm sm:text-base font-bold mt-2">Allah</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                soundManager.playBeadClick();
                setActiveNameIndex(1);
                showToast("Al-Quddus — Barcha ayb-nuqsonlardan pok");
              }}
              className={`absolute -bottom-2 left-10 sm:left-24 w-44 sm:w-52 h-44 sm:h-52 rounded-[32px] p-6 shadow-xl flex flex-col items-center justify-center cursor-pointer border ${
                isDarkMode
                  ? 'bg-[#0A1233] border-[#DBC66E]/40 text-[#F7F4EC]'
                  : 'bg-white border-[#8A7410]/35 text-[#0A1233]'
              }`}
            >
              <span className={`font-serif text-3xl sm:text-4xl font-bold ${goldHeading}`}>
                الْقُدُّوسُ
              </span>
              <span className={`text-sm font-bold mt-2 ${textColorPrimary}`}>Al-Quddus</span>
            </motion.div>
          </div>

          <div className={`rounded-2xl p-5 text-center mt-6 border ${innerWidgetBg}`}>
            <div className={`text-lg font-bold ${goldHeading}`}>
              {namesOfAllah[activeNameIndex].name} ({namesOfAllah[activeNameIndex].arabic})
            </div>
            <p className={`text-sm mt-1 max-w-md mx-auto ${textColorSecondary}`}>
              {namesOfAllah[activeNameIndex].meaningUz}
            </p>
          </div>
        </div>
      </ZetrHeroScroll>

      {/* 6. SCROLL DIVIDER: Al-Asmo al-Husno Kinetik Lentasi (Dual Opposing Bands) */}
      <ScrollTextLines
        type="kinetic"
        isDarkMode={isDarkMode}
        line1={[
          "AL-ASMO AL-HUSNO",
          "ALLOHNING 99 GO'ZAL ISMI",
          "AR-RAHMAN",
          "AR-RAHEEM",
          "AL-MALIK",
          "AL-QUDDUS",
        ]}
        line2={[
          "AS-SALAM",
          "AL-MU'MIN",
          "AL-MUHAYMIN",
          "AL-AZIZ",
          "SOKINLIK VA XOTIRJAMLIK",
          "SAKINWARD EKOTIZIMI",
        ]}
      />

      {/* 7. SECTION: SAKIN AKADEMIYA — 10+ RASMIY ISLOMIY YOUTUBE KANALLAR & DARSLIKLAR */}
      <ZetrHeroScroll
        variant="section"
        isDarkMode={isDarkMode}
        badge="Global Ma’rifat Markazi"
        title="Sakin Akademiya"
        subtitle={
          language === 'ru'
            ? '10+ официальных каналов (Towards Eternity & Sajda): 9:16 Shorts и 16:9 глубокие лекции'
            : language === 'en'
            ? '10+ Official YouTube Channels: 9:16 Quick Wisdom Shorts & 16:9 Comprehensive Lessons'
            : '10+ rasmiy YouTube kanallar: 9:16 vertikal hikmatlar va 16:9 chuqur tahliliy darsliklar'
        }
      >
        <div
          className={`rounded-[36px] p-6 sm:p-8 transition-colors border shadow-xl ${cardMainBg}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>10+ Global Kanal</span>
                </span>
                <span className="text-xs font-mono opacity-70">Towards Eternity & Sajda Media</span>
              </div>
              <h3 className={`font-brand-display text-2xl sm:text-3xl font-extrabold tracking-tight ${goldHeading}`}>
                Sakin Akademiya
              </h3>
              <p className={`text-sm sm:text-base font-medium ${textColorSecondary}`}>
                Mobil ekranlar uchun mo‘ljallangan 9:16 vertikal qisqa lavhalar va kinoteatr formati (16:9).
              </p>
            </div>

            <button
              onClick={() => {
                soundManager.playBeadClick();
                if (onNavigateTab) onNavigateTab('academy');
                else onEnterApp();
              }}
              className="self-start sm:self-center px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs sm:text-sm hover:brightness-105 active:scale-95 transition shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Akademiyaga Kirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3-Card Interactive Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: 9:16 Vertical Shorts */}
            <div
              onClick={() => {
                soundManager.playBeadClick();
                if (onNavigateTab) onNavigateTab('academy');
                else onEnterApp();
              }}
              className={`p-5 rounded-3xl border cursor-pointer hover:scale-[1.02] transition shadow-md flex flex-col justify-between ${innerWidgetBg}`}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className={`text-base font-bold ${textColorPrimary}`}>
                  9:16 Vertikal Hikmatlar
                </h4>
                <p className={`text-xs ${textColorSecondary} leading-relaxed`}>
                  Telefon ekranida to‘xtovsiz ko‘rish uchun eng saralangan 60 soniyalik qisqa iboratli lavhalar.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--nur-border-glass)] flex items-center justify-between text-xs font-bold text-amber-500">
                <span>Vertikal darslar</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2: 16:9 Deep Courses */}
            <div
              onClick={() => {
                soundManager.playBeadClick();
                if (onNavigateTab) onNavigateTab('academy');
                else onEnterApp();
              }}
              className={`p-5 rounded-3xl border cursor-pointer hover:scale-[1.02] transition shadow-md flex flex-col justify-between ${innerWidgetBg}`}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-500 flex items-center justify-center font-bold">
                  <Tv className="w-5 h-5" />
                </div>
                <h4 className={`text-base font-bold ${textColorPrimary}`}>
                  16:9 Keng Qamrovli Darslar
                </h4>
                <p className={`text-xs ${textColorSecondary} leading-relaxed`}>
                  Namoz o‘rganish, tahorat qoidalari, iymonga kelganlar qissalari va sun’iy intellekt filmlari.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--nur-border-glass)] flex items-center justify-between text-xs font-bold text-teal-500">
                <span>To‘liq darsliklar</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3: Sakin AI Takeaways */}
            <div
              onClick={() => {
                soundManager.playBeadClick();
                if (onNavigateTab) onNavigateTab('academy');
                else onEnterApp();
              }}
              className={`p-5 rounded-3xl border cursor-pointer hover:scale-[1.02] transition shadow-md flex flex-col justify-between ${innerWidgetBg}`}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className={`text-base font-bold ${textColorPrimary}`}>
                  Sakin AI Dars Xulosalari
                </h4>
                <p className={`text-xs ${textColorSecondary} leading-relaxed`}>
                  Har bir videodan so‘ng 3 ta asosiy ma’naviy xulosa va to‘g‘ridan-to‘g‘ri AI bilan savol-javob imkoniyati.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--nur-border-glass)] flex items-center justify-between text-xs font-bold text-emerald-500">
                <span>AI Xulosalari</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </ZetrHeroScroll>

      {/* 3. SECTION: REDESIGNED MAJESTIC ARCHITECTURAL FOOTER */}
      {/* Top corners only rounded: rounded-t-[44px] sm:rounded-t-[60px] rounded-b-none */}
      <footer className="w-full bg-[#050A1C] text-[#F7F4EC] rounded-t-[44px] sm:rounded-t-[60px] rounded-b-none border-t border-[#DBC66E]/30 mt-14 pt-12 pb-28 sm:pb-24 px-6 sm:px-12 shadow-[0_-25px_60px_rgba(0,0,0,0.55)] relative overflow-hidden">
        {/* Subtle decorative golden arch glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-1 bg-gradient-to-r from-transparent via-[#DBC66E]/60 to-transparent" />
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Top Brand Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#DBC66E]/20">
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={onEnterApp}>
              <div className="w-12 h-12 rounded-2xl bg-[#0A1233] border border-[#DBC66E]/50 p-2 flex items-center justify-center shadow-lg">
                <img
                  src="https://sakinward.aluvantis.uz/Logo/89t8bVrDJpSbugTCKLHOuA.png"
                  alt="Sakinward Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-brand-display text-xl sm:text-2xl font-bold tracking-tight text-[#F7F4EC]">
                  Sakinward
                </h3>
                <p className="text-xs text-[#DBC66E] font-medium tracking-wide">
                  Global 70+ Tillik Islomiy Raqamli Platforma
                </p>
              </div>
            </div>

            {/* Quick Action in Footer */}
            <div className="flex items-center gap-3">
              <button
                onClick={onEnterApp}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#DBC66E] to-[#C8B052] text-[#0A1233] font-bold text-xs sm:text-sm hover:brightness-105 active:scale-95 transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>{tLanding.openApp}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-10 h-10 rounded-full bg-[#F7F4EC]/10 hover:bg-[#F7F4EC]/20 border border-[#DBC66E]/30 flex items-center justify-center text-[#F7F4EC] transition cursor-pointer"
                title="Yuqoriga qaytish"
              >
                <ChevronUp className="w-5 h-5 text-[#DBC66E]" />
              </button>
            </div>
          </div>

          {/* 4-Column Grid: Comprehensive & Zero Duplicate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 text-xs sm:text-sm">
            {/* Col 1: Platform haqida */}
            <div className="space-y-3">
              <h4 className="text-[#DBC66E] font-bold text-sm uppercase tracking-wider font-mono">
                Sakinward Haqida
              </h4>
              <p className="text-[#F7F4EC]/75 leading-relaxed text-xs">
                {tLanding.footerAbout1}
              </p>
              <p className="text-[#F7F4EC]/60 leading-relaxed text-xs">
                {tLanding.footerAbout2}
              </p>
            </div>

            {/* Col 2: Bo'limlar / Xizmatlar */}
            <div className="space-y-3">
              <h4 className="text-[#DBC66E] font-bold text-sm uppercase tracking-wider font-mono">
                Xizmatlar
              </h4>
              <ul className="space-y-2 text-[#F7F4EC]/85 font-medium">
                <li>
                  <button onClick={() => { if (onNavigateTab) onNavigateTab('home'); else onEnterApp(); }} className="hover:text-[#DBC66E] transition cursor-pointer flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#DBC66E]" />
                    <span>{tLanding.prayerTimesTitle}</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => { if (onNavigateTab) onNavigateTab('quran'); else onEnterApp(); }} className="hover:text-[#DBC66E] transition cursor-pointer flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#DBC66E]" />
                    <span>{tLanding.quranTitle}</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => { if (onNavigateTab) onNavigateTab('qibla'); else onEnterApp(); }} className="hover:text-[#DBC66E] transition cursor-pointer flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#DBC66E]" />
                    <span>{tLanding.qiblaTitle}</span>
                  </button>
                </li>
                <li>
                  <button onClick={handleOpenAi} className="hover:text-[#DBC66E] transition cursor-pointer flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#DBC66E]" />
                    <span>{tLanding.sakinAiTitle}</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => { if (onNavigateTab) onNavigateTab('zikr'); else onEnterApp(); }} className="hover:text-[#DBC66E] transition cursor-pointer flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-[#DBC66E]" />
                    <span>Zikr va Tasbeh</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => { if (onNavigateTab) onNavigateTab('academy'); else onEnterApp(); }} className="hover:text-[#DBC66E] transition cursor-pointer flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-[#DBC66E]" />
                    <span>Sakin Akademiya (10+ Kanal)</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => { if (onNavigateTab) onNavigateTab('names'); else onEnterApp(); }} className="hover:text-[#DBC66E] transition cursor-pointer flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#DBC66E]" />
                    <span>{tLanding.namesTitle || 'Allohning 99 ismi'}</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Huquqiy & Xavfsizlik */}
            <div className="space-y-3">
              <h4 className="text-[#DBC66E] font-bold text-sm uppercase tracking-wider font-mono">
                Huquqiy & Maxfiylik
              </h4>
              <ul className="space-y-2 text-[#F7F4EC]/85 font-medium">
                <li>
                  <button
                    onClick={() => setActiveModal('terms')}
                    className="hover:text-[#DBC66E] transition cursor-pointer flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#DBC66E]" />
                    <span>{tLanding.termsOfUse}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('privacy')}
                    className="hover:text-[#DBC66E] transition cursor-pointer flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#DBC66E]" />
                    <span>{tLanding.privacyPolicy}</span>
                  </button>
                </li>
                <li className="pt-2 text-[11px] text-[#F7F4EC]/60 leading-normal">
                  Foydalanuvchi ma'lumotlari to'liq himoyalangan va begona shaxslarga uzatilmaydi.
                </li>
              </ul>
            </div>

            {/* Col 4: Rasmiy Bog'lanish (Zero Duplication, Clean URLs) */}
            <div className="space-y-3">
              <h4 className="text-[#DBC66E] font-bold text-sm uppercase tracking-wider font-mono">
                Rasmiy Bog'lanish
              </h4>
              <div className="space-y-2.5 text-[#F7F4EC]/90 font-medium">
                {/* Official Website */}
                <div>
                  <a
                    href="https://sakinwardapp.aluvantis.uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#DBC66E] transition inline-flex items-center gap-2 group"
                  >
                    <Globe className="w-4 h-4 text-[#DBC66E] shrink-0" />
                    <span className="group-hover:underline">sakinwardapp.aluvantis.uz</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>

                {/* Telegram Channel */}
                <div>
                  <a
                    href="https://t.me/sakinward"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#DBC66E] transition inline-flex items-center gap-2 group"
                  >
                    <Send className="w-4 h-4 text-[#2AABEE] shrink-0" />
                    <span className="group-hover:underline">Telegram: @sakinward</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>

                {/* Telegram Bot */}
                <div>
                  <a
                    href="https://t.me/Sakinward_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#DBC66E] transition inline-flex items-center gap-2 group"
                  >
                    <Bot className="w-4 h-4 text-[#2AABEE] shrink-0" />
                    <span className="group-hover:underline">Bot: @Sakinward_bot</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>

                {/* Instagram */}
                <div>
                  <a
                    href="https://www.instagram.com/sakinward?igsi=MXI3dWtva3NmcnFtaQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#DBC66E] transition inline-flex items-center gap-2 group"
                  >
                    <Instagram className="w-4 h-4 text-[#E1306C] shrink-0" />
                    <span className="group-hover:underline">Instagram: @sakinward</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Row */}
          <div className="pt-6 border-t border-[#DBC66E]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F7F4EC]/60">
            <div className="flex items-center gap-2">
              <img
                src="https://sakinward.aluvantis.uz/Logo/89t8bVrDJpSbugTCKLHOuA.png"
                alt="Sakinward"
                className="w-5 h-5 object-contain"
              />
              <span>© {new Date().getFullYear()} Sakinward. {tLanding.allRightsReserved}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>{tLanding.digitalIslamicService}</span>
              <span>•</span>
              <span className="text-[#DBC66E]">sakinwardapp.aluvantis.uz</span>
            </div>
          </div>

        </div>
      </footer>

      {/* 4. FIXED BOTTOM APP BAR (Clean Sajda-Style: App Icon, Description & "Ilovani ochish" button) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 backdrop-blur-2xl border-t shadow-[0_-10px_35px_rgba(0,0,0,0.5)] transition-colors bg-[#070D24]/95 border-[#DBC66E]/30 text-[#F7F4EC]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#0A1233] border border-[#DBC66E]/40 p-1.5 flex items-center justify-center shrink-0 shadow-md">
              <img
                src="https://sakinward.aluvantis.uz/Logo/89t8bVrDJpSbugTCKLHOuA.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold truncate">{tLanding.appName}</h4>
              <p className="text-xs opacity-75 truncate">
                {tLanding.heroSubheadline}
              </p>
            </div>
          </div>

          <button
            id="btn-bottom-bar-enter-app"
            onClick={onEnterApp}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#DBC66E] to-[#C8B052] text-[#0A1233] font-bold text-xs sm:text-sm hover:brightness-105 active:scale-95 transition shadow-lg shrink-0 cursor-pointer whitespace-nowrap"
          >
            {tLanding.openApp}
          </button>
        </div>
      </div>

      {/* 5. SIDEBAR MENU DRAWER */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-[#0A1233] text-[#F7F4EC] border-r border-[#DBC66E]/30 p-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://sakinward.aluvantis.uz/Logo/89t8bVrDJpSbugTCKLHOuA.png"
                      alt="Logo"
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-brand-display text-lg font-bold text-[#F7F4EC]">
                      Sakinward
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-[#F7F4EC]/10 text-[#F7F4EC] transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5 text-sm font-semibold">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEnterApp();
                    }}
                    className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-[#111E4E] text-[#F7F4EC] hover:text-[#DBC66E] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>{tLanding.navPrayerTimes}</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onNavigateTab) onNavigateTab('quran');
                      else onEnterApp();
                    }}
                    className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-[#111E4E] text-[#F7F4EC] hover:text-[#DBC66E] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>{tLanding.navQuran}</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onNavigateTab) onNavigateTab('qibla');
                      else onEnterApp();
                    }}
                    className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-[#111E4E] text-[#F7F4EC] hover:text-[#DBC66E] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>{tLanding.navQibla}</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onNavigateTab) onNavigateTab('hijri_calendar');
                      else onEnterApp();
                    }}
                    className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-[#111E4E] text-[#F7F4EC] hover:text-[#DBC66E] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>{tLanding.navHijri}</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onNavigateTab) onNavigateTab('names');
                      else onEnterApp();
                    }}
                    className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-[#111E4E] text-[#F7F4EC] hover:text-[#DBC66E] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>{tLanding.navNames}</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleOpenAi();
                    }}
                    className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-[#111E4E] text-[#F7F4EC] hover:text-[#DBC66E] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>{tLanding.navAi}</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                </nav>
              </div>

              <div className="pt-4 border-t border-white/10 text-xs text-[#F7F4EC]/60">
                Sakinward • {tLanding.brandSlogan}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 6. POLICY & TERMS MODAL */}
      <AnimatePresence>
        {activeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md"
              onClick={() => setActiveModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[130] w-full max-w-lg max-h-[85vh] overflow-y-auto border rounded-3xl p-6 shadow-2xl space-y-4 ${
                isDarkMode
                  ? 'bg-[#0A1233] text-[#F7F4EC] border-[#DBC66E]/40'
                  : 'bg-white text-[#0A1233] border-[#8A7410]/40'
              }`}
            >
              <div className={`flex items-center justify-between pb-3 border-b ${
                isDarkMode ? 'border-[#DBC66E]/20' : 'border-[#8A7410]/20'
              }`}>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className={`w-5 h-5 ${goldHeading}`} />
                  <h3 className={`font-brand-display text-lg font-bold ${textColorPrimary}`}>
                    {activeModal === 'terms' ? tLanding.termsTitle : tLanding.privacyTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className={`p-1.5 rounded-full transition cursor-pointer ${
                    isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-black'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={`text-xs sm:text-sm space-y-3 leading-relaxed ${textColorSecondary}`}>
                {activeModal === 'terms' ? (
                  <>
                    <p>
                      <strong>1. {language === 'ru' ? 'Общие положения:' : language === 'en' ? 'General Terms:' : 'Umumiy qoidalar:'}</strong>{' '}
                      {language === 'ru'
                        ? 'Приложение Sakinward — это независимая платформа для мусульман, предоставляющая расписание намазов, хиджри-календарь, чтение Корана и духовные напоминания.'
                        : language === 'en'
                        ? 'Sakinward is a spiritual Islamic application designed to provide daily prayer times, Hijri calendar, Quran recitations, and faith reminders.'
                        : 'Sakinward ilovasi musulmonlar uchun kundalik ibodat, taqvim, Qur\'on tilovati va ma\'naviy eslatmalarni taqdim etuvchi xolis platformadir.'}
                    </p>
                    <p>
                      <strong>2. {language === 'ru' ? 'Религиозные источники:' : language === 'en' ? 'Religious Sources:' : 'Diniy manbalar:'}</strong>{' '}
                      {language === 'ru'
                        ? 'Все времена молитв, лунные расчеты и аяты сформированы на основе достоверных исламских астрономических формул и источников.'
                        : language === 'en'
                        ? 'All prayer timings, lunar milestones, and sacred verses are calculated using established astronomical formulas and recognized sources.'
                        : 'Ilovadagi barcha namoz vaqtlari, taqvim hisoblari va oyatlar ishonchli islomiy mezonlar asosida shakllantirilgan.'}
                    </p>
                    <p>
                      <strong>3. {language === 'ru' ? 'Использование:' : language === 'en' ? 'Personal Use:' : 'Xizmatdan foydalanish:'}</strong>{' '}
                      {language === 'ru'
                        ? 'Пользователь имеет право свободно использовать платформу в личных религиозных и познавательных целях.'
                        : language === 'en'
                        ? 'Users have the full right to use the platform freely for personal spiritual enrichment and worship guidance.'
                        : 'Foydalanuvchi platformadan shaxsiy ma\'rifiy va ibodat maqsadlarida bepul foydalanish huquqiga ega.'}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>1. {language === 'ru' ? 'Безопасность данных:' : language === 'en' ? 'Data Privacy:' : 'Ma\'lumotlar xavfsizligi:'}</strong>{' '}
                      {language === 'ru'
                        ? 'Sakinward уважает конфиденциальность пользователей и никогда не передает личные данные третьим лицам.'
                        : language === 'en'
                        ? 'Sakinward values your privacy and never shares or sells personal information to third parties.'
                        : 'Sakinward foydalanuvchilarning shaxsiy ma\'lumotlarini qadrlaydi va ularni uchinchi shaxslarga bermaydi.'}
                    </p>
                    <p>
                      <strong>2. {language === 'ru' ? 'Геолокация (GPS):' : language === 'en' ? 'Geolocation (GPS):' : 'Geolokatsiya (GPS):'}</strong>{' '}
                      {language === 'ru'
                        ? 'Местоположение устройства используется исключительно на устройстве для точного расчета времени намаза и направления Киблы.'
                        : language === 'en'
                        ? 'Device location is processed strictly on-device to compute astronomical prayer times and accurate Qibla heading.'
                        : 'Qurilmaning joylashuvi faqat namoz vaqtlarini va Qibla yo\'nalishini aniq hisoblash uchun ishlatiladi. Koordinatalar serverda saqlanmaydi.'}
                    </p>
                    <p>
                      <strong>3. {language === 'ru' ? 'Локальное хранение:' : language === 'en' ? 'Local Storage:' : 'Xavfsiz saqlash:'}</strong>{' '}
                      {language === 'ru'
                        ? 'Сохраненные аяты, заметки и счетчики зикров хранятся безопасно.'
                        : language === 'en'
                        ? 'Bookmarked verses, personal notes, and tasbih counts are stored securely on your device.'
                        : 'Saqlangan oyatlar, qaydlar va shaxsiy zikr hisoblagichlari xavfsiz tarzda saqlanadi.'}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 7. COMPASS CALIBRATION (FIGURE-8 GESTURE) MODAL */}
      <AnimatePresence>
        {showCalibrationModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-md"
              onClick={() => setShowCalibrationModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[150] w-full max-w-md border rounded-3xl p-6 shadow-2xl space-y-4 ${
                isDarkMode
                  ? 'bg-[#0A1233] text-[#F7F4EC] border-[#DBC66E]/40'
                  : 'bg-white text-[#0A1233] border-[#8A7410]/40'
              }`}
            >
              <div className={`flex items-center justify-between pb-3 border-b ${
                isDarkMode ? 'border-[#DBC66E]/20' : 'border-[#8A7410]/20'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Compass className={`w-5 h-5 ${goldHeading}`} />
                  <h3 className={`font-brand-display text-lg font-bold ${textColorPrimary}`}>
                    {tLanding.calibrateSensorModalTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setShowCalibrationModal(false)}
                  className={`p-1.5 rounded-full transition cursor-pointer ${
                    isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-black'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Animated Figure-8 Graphic */}
              <div className="py-4 flex flex-col items-center justify-center">
                <div className="relative w-36 h-20 flex items-center justify-center">
                  <svg viewBox="0 0 120 60" className="w-full h-full overflow-visible">
                    <path
                      d="M 30 30 C 30 15 50 15 60 30 C 70 45 90 45 90 30 C 90 15 70 15 60 30 C 50 45 30 45 30 30 Z"
                      fill="none"
                      stroke={isDarkMode ? '#DBC66E' : '#8A7410'}
                      strokeWidth="3"
                      strokeDasharray="6 4"
                      opacity="0.7"
                    />
                  </svg>
                  {/* Floating phone moving in figure-8 */}
                  <motion.div
                    animate={{
                      x: [0, 25, 0, -25, 0],
                      y: [0, -10, 0, 10, 0],
                      rotate: [0, 15, -15, 10, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: 'easeInOut',
                    }}
                    className="absolute w-8 h-14 rounded-md border-2 border-[#DBC66E] bg-[#0A1233]/90 shadow-lg flex items-center justify-center text-[10px]"
                  >
                    📱
                  </motion.div>
                </div>
                <span className="text-xs font-bold text-[#DBC66E] mt-3">
                  ♾️ 8-shakl harakati
                </span>
              </div>

              <div className="text-xs space-y-2.5 leading-relaxed">
                <p className={textColorSecondary}>
                  {tLanding.calibrateSensorModalDesc}
                </p>
                <div className="space-y-1.5 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">1.</span>
                    <span>{tLanding.calibrateTip1}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">2.</span>
                    <span>{tLanding.calibrateTip2}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">3.</span>
                    <span>{tLanding.calibrateTip3}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  soundManager.playBeadClick();
                  setShowCalibrationModal(false);
                }}
                className="w-full py-3 rounded-2xl bg-[#DBC66E] text-[#0A1233] font-bold text-xs hover:brightness-105 active:scale-95 transition cursor-pointer"
              >
                {tLanding.done}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SakinwardLandingPage;
