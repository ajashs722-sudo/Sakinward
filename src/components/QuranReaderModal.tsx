import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Search,
  Play,
  Pause,
  Volume2,
  VolumeX,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  Bookmark,
  ChevronRight,
  Radio,
  SkipBack,
  SkipForward,
  X,
  Sparkles,
  Share2,
  Sliders,
  Compass,
} from 'lucide-react';
import { Ayah, SurahMeta } from '../types';
import {
  ALL_114_SURAHS,
  ALL_30_JUZ,
  QURAN_RECITERS,
  QuranReciter,
  getAyahAudioUrl,
} from '../data/quranData';
import { fetchSurahVerses } from '../services/apiService';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';

interface QuranReaderModalProps {
  onClose: () => void;
  initialSurahNumber?: number;
  initialAyahNumber?: number;
  nurTheme?: 'nur-dark' | 'nur-light';
}

type TabType = 'surahs' | 'juzs' | 'bookmarks' | 'reader';
type SurahFilterType = 'all' | 'meccan' | 'medinan';
type RepeatMode = 1 | 3 | 5 | 'infinite';

/**
 * Avatar with fallback when image fails to load
 */
const ReciterAvatar: React.FC<{
  reciter: QuranReciter;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  isPlaying?: boolean;
  isLight?: boolean;
}> = ({ reciter, size = 'md', isActive = false, isPlaying = false, isLight = false }) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const isFailed = failedUrl === reciter.imageUrl;

  const sizeClasses = {
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-16 h-16 text-sm',
  };

  const imgSizeClass = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="relative inline-block select-none shrink-0">
      <div
        className={`p-[2px] rounded-full transition-all duration-300 ${
          isActive
            ? isLight
              ? 'bg-gradient-to-tr from-[#8A7410] to-[#DBC66E] shadow-[0_0_12px_rgba(138,116,16,0.35)] ring-2 ring-[#8A7410]/30 scale-105'
              : 'bg-gradient-to-tr from-amber-400 via-[#DBC66E] to-yellow-200 shadow-[0_0_14px_rgba(219,198,110,0.45)] ring-2 ring-[#DBC66E]/40 scale-105'
            : isLight
            ? 'bg-black/5 hover:bg-black/10'
            : 'bg-white/10 hover:bg-white/25'
        }`}
      >
        <div className={`p-[1.5px] rounded-full ${isLight ? 'bg-white' : 'bg-[#050B14]'}`}>
          {!isFailed && reciter.imageUrl ? (
            <img
              src={reciter.imageUrl}
              alt={reciter.name}
              onError={() => setFailedUrl(reciter.imageUrl)}
              className={`${imgSizeClass[size]} rounded-full object-cover object-top ${
                isLight ? 'border border-black/10 bg-stone-100' : 'border border-white/10 bg-slate-900'
              }`}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${
                reciter.avatarBg || 'from-amber-700 to-stone-900'
              } flex flex-col items-center justify-center text-white border border-white/15 shadow-inner`}
            >
              <span className="font-serif font-bold leading-none">
                {reciter.shortName ? reciter.shortName.slice(0, 2).toUpperCase() : 'QR'}
              </span>
              {size !== 'sm' && <span className="text-[10px] opacity-75 mt-0.5">{reciter.flag}</span>}
            </div>
          )}
        </div>
      </div>

      {isPlaying ? (
        <div
          className={`absolute -bottom-1 -right-1 rounded-full p-1 shadow-lg border flex items-center justify-center ${
            isLight
              ? 'bg-[#8A7410] text-white border-white'
              : 'bg-amber-400 text-black border-black'
          }`}
        >
          <div className="flex items-end gap-[1.5px] h-2.5 px-0.5">
            <span className="w-[2px] h-2 bg-current rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-[2px] h-3.5 bg-current rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-[2px] h-2 bg-current rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      ) : (
        <div
          className={`absolute -bottom-0.5 -right-0.5 text-xs drop-shadow rounded-full px-0.5 border ${
            isLight
              ? 'bg-white/90 border-black/10 text-black'
              : 'bg-black/70 border-white/10 text-white'
          }`}
        >
          {reciter.flag}
        </div>
      )}
    </div>
  );
};

export const QuranReaderModal: React.FC<QuranReaderModalProps> = ({
  onClose,
  initialSurahNumber,
  initialAyahNumber,
  nurTheme,
}) => {
  const { language } = useTranslation();

  // Determine light or dark theme mode
  const [localTheme] = useState<'nur-dark' | 'nur-light'>(() => {
    try {
      return (localStorage.getItem('sajda_nur_theme') as 'nur-dark' | 'nur-light') || 'nur-dark';
    } catch {
      return 'nur-dark';
    }
  });
  const effectiveTheme = nurTheme || localTheme;
  const isLight = effectiveTheme === 'nur-light';

  // Navigation State: Open to surahs list when initialSurahNumber is undefined
  const [activeTab, setActiveTab] = useState<TabType>(
    initialSurahNumber !== undefined ? 'reader' : 'surahs'
  );
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(() => {
    if (initialSurahNumber !== undefined) {
      return ALL_114_SURAHS.find((s) => s.number === initialSurahNumber) || ALL_114_SURAHS[0];
    }
    return ALL_114_SURAHS[0];
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [surahFilter, setSurahFilter] = useState<SurahFilterType>('all');
  const [expandedJuz, setExpandedJuz] = useState<number | null>(null);

  // Reader Settings
  const [fontSize, setFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('sakinward_quran_font_size') || '28', 10);
  });
  const [translationFontSize, setTranslationFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('sakinward_quran_trans_size') || '15', 10);
  });
  const [showTranslation, setShowTranslation] = useState<boolean>(() => {
    return localStorage.getItem('sakinward_quran_show_trans') !== 'false';
  });
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(1);
  const [currentRepeatCount, setCurrentRepeatCount] = useState<number>(1);
  const [isAutoPlayNext, setIsAutoPlayNext] = useState<boolean>(true);

  // Reciter State (Default: Mishary Rashid Alafasy)
  const [selectedReciter, setSelectedReciter] = useState<QuranReciter>(() => {
    const savedId = localStorage.getItem('sakinward_selected_reciter_id');
    const match = QURAN_RECITERS.find((r) => r.id === savedId);
    return match || QURAN_RECITERS[0];
  });
  const [showReciterModal, setShowReciterModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [reciterSearchQuery, setReciterSearchQuery] = useState<string>('');

  // Verses & Audio Playback
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loadingVerses, setLoadingVerses] = useState<boolean>(false);
  const [playingAyah, setPlayingAyah] = useState<Ayah | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedAyahNum, setCopiedAyahNum] = useState<number | null>(null);

  // Bookmarks
  const [bookmarkedVerses, setBookmarkedVerses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sakinward_quran_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  // References for bulletproof unbroken playback without stale closure issues
  const ayahsRef = useRef<Ayah[]>([]);
  const currentAyahIndexRef = useRef<number>(-1);
  const isAutoPlayNextRef = useRef<boolean>(isAutoPlayNext);
  const selectedReciterRef = useRef<QuranReciter>(selectedReciter);
  const selectedSurahRef = useRef<SurahMeta | null>(selectedSurah);
  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  const repeatCountRef = useRef<number>(currentRepeatCount);
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  const isMutedRef = useRef<boolean>(isMuted);

  // Keep references in sync on every render
  ayahsRef.current = ayahs;
  isAutoPlayNextRef.current = isAutoPlayNext;
  selectedReciterRef.current = selectedReciter;
  selectedSurahRef.current = selectedSurah;
  repeatModeRef.current = repeatMode;
  repeatCountRef.current = currentRepeatCount;
  playbackSpeedRef.current = playbackSpeed;
  isMutedRef.current = isMuted;

  // Persist settings
  useEffect(() => {
    localStorage.setItem('sakinward_selected_reciter_id', selectedReciter.id);
  }, [selectedReciter]);

  useEffect(() => {
    localStorage.setItem('sakinward_quran_font_size', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('sakinward_quran_trans_size', translationFontSize.toString());
  }, [translationFontSize]);

  useEffect(() => {
    localStorage.setItem('sakinward_quran_show_trans', showTranslation.toString());
  }, [showTranslation]);

  // Load verses when Surah or Language changes in reader mode
  useEffect(() => {
    if (!selectedSurah || activeTab !== 'reader') return;
    let isMounted = true;
    setLoadingVerses(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setPlayingAyah(null);
    currentAyahIndexRef.current = -1;

    fetchSurahVerses(selectedSurah.number, language)
      .then((data) => {
        if (!isMounted) return;
        ayahsRef.current = data;
        setAyahs(data);
        setLoadingVerses(false);

        if (initialAyahNumber) {
          setTimeout(() => {
            const el = document.getElementById(`ayah-${initialAyahNumber}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      })
      .catch((err) => {
        console.warn('Failed to load surah verses:', err);
        if (isMounted) setLoadingVerses(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSurah, language, activeTab]);

  // Unified Bulletproof Audio Player - Single persistent listener
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }
    const audio = audioRef.current;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = (e: Event) => {
      console.warn('Audio loading error handled gracefully:', e);
      setIsPlaying(false);
    };

    const onEnded = () => {
      const repMode = repeatModeRef.current;
      const repCount = repeatCountRef.current;

      // 1. Ayah Repeat Check
      if (repMode !== 1) {
        if (repMode === 'infinite' || repCount < (repMode as number)) {
          setCurrentRepeatCount((c) => c + 1);
          audio.currentTime = 0;
          audio.play().catch(console.warn);
          return;
        } else {
          setCurrentRepeatCount(1);
        }
      }

      // 2. Continuous seamless playback across the Surah from beginning to end
      if (isAutoPlayNextRef.current) {
        const nextIndex = currentAyahIndexRef.current + 1;
        const list = ayahsRef.current;
        if (nextIndex < list.length) {
          playAyahByIndex(nextIndex);
          return;
        }
      }

      // End of Surah reached
      setIsPlaying(false);
      setPlayingAyah(null);
      currentAyahIndexRef.current = -1;
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Play Ayah by its direct index (0 to length - 1)
  const playAyahByIndex = (index: number) => {
    const list = ayahsRef.current;
    if (index < 0 || index >= list.length) return;
    const ayah = list[index];
    currentAyahIndexRef.current = index;

    // 1. Instant state update for immediate UI glow and indicator
    setPlayingAyah(ayah);
    setIsPlaying(true);
    setCurrentRepeatCount(1);

    // 2. Smoothly scroll target ayah into view with center alignment
    requestAnimationFrame(() => {
      const el = document.getElementById(`ayah-${ayah.numberInSurah}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // 3. Play master audio stream
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }
    const audio = audioRef.current;
    const currentUrl = getAyahAudioUrl(
      selectedReciterRef.current.id,
      ayah.number,
      selectedSurahRef.current?.number,
      ayah.numberInSurah
    );

    if (audio.src !== currentUrl) {
      audio.src = currentUrl;
    }
    audio.playbackRate = playbackSpeedRef.current;
    audio.muted = isMutedRef.current;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Playback error for ayah', ayah.numberInSurah, err);
      });
    }

    // 4. Preload next ayah audio immediately so next transition is 0-delay
    const nextIndex = index + 1;
    if (nextIndex < list.length) {
      const nextAyah = list[nextIndex];
      const nextUrl = getAyahAudioUrl(
        selectedReciterRef.current.id,
        nextAyah.number,
        selectedSurahRef.current?.number,
        nextAyah.numberInSurah
      );
      if (!preloadAudioRef.current) {
        preloadAudioRef.current = new Audio();
      }
      preloadAudioRef.current.src = nextUrl;
      preloadAudioRef.current.preload = 'auto';
    }
  };

  // Master Play/Pause Toggle for Surah
  const togglePlaySurah = () => {
    const list = ayahsRef.current;
    if (list.length === 0) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (currentAyahIndexRef.current >= 0 && audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(() => playAyahByIndex(currentAyahIndexRef.current));
      setIsPlaying(true);
      return;
    }

    // Start from first ayah of surah
    playAyahByIndex(0);
  };

  // Play or pause specific Ayah
  const playAyah = (ayah: Ayah) => {
    const index = ayahsRef.current.findIndex((a) => a.numberInSurah === ayah.numberInSurah);
    if (index === -1) return;

    if (currentAyahIndexRef.current === index && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(console.warn);
        setIsPlaying(true);
      }
      return;
    }

    playAyahByIndex(index);
  };

  const playNextAyah = () => {
    const list = ayahsRef.current;
    if (list.length === 0) return;
    const nextIndex = currentAyahIndexRef.current + 1;
    if (nextIndex < list.length) {
      playAyahByIndex(nextIndex);
    }
  };

  const playPrevAyah = () => {
    const list = ayahsRef.current;
    if (list.length === 0) return;
    const prevIndex = Math.max(0, currentAyahIndexRef.current - 1);
    playAyahByIndex(prevIndex);
  };

  const toggleBookmark = (surahNum: number, ayahNum: number) => {
    const key = `${surahNum}:${ayahNum}`;
    let updated: string[];
    if (bookmarkedVerses.includes(key)) {
      updated = bookmarkedVerses.filter((k) => k !== key);
    } else {
      updated = [...bookmarkedVerses, key];
    }
    setBookmarkedVerses(updated);
    localStorage.setItem('sakinward_quran_bookmarks', JSON.stringify(updated));
    soundManager.playBeadClick();
  };

  const copyAyah = (ayah: Ayah) => {
    const text = `${ayah.text}\n\n${ayah.translation || ''}\n(Qur'on, ${selectedSurah?.englishName || ''} ${selectedSurah?.number}:${ayah.numberInSurah})`;
    navigator.clipboard.writeText(text);
    setCopiedAyahNum(ayah.numberInSurah);
    soundManager.playBeadClick();
    setTimeout(() => setCopiedAyahNum(null), 2000);
  };

  // Filter Surahs based on search and category
  const filteredSurahs = useMemo(() => {
    return ALL_114_SURAHS.filter((s) => {
      if (surahFilter === 'meccan' && s.revelationType !== 'Meccan') return false;
      if (surahFilter === 'medinan' && s.revelationType !== 'Medinan') return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        s.englishName.toLowerCase().includes(q) ||
        s.uzbekName.toLowerCase().includes(q) ||
        s.name.includes(q) ||
        s.number.toString() === q ||
        s.uzbekTranslation.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, surahFilter]);

  // Reciters for modal search
  const filteredReciters = useMemo(() => {
    if (!reciterSearchQuery.trim()) return QURAN_RECITERS;
    const q = reciterSearchQuery.toLowerCase().trim();
    return QURAN_RECITERS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.shortName.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.style.toLowerCase().includes(q) ||
        r.arabicName.includes(q) ||
        r.subname.toLowerCase().includes(q)
    );
  }, [reciterSearchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex flex-col select-none overflow-hidden backdrop-blur-sm ${
        isLight ? 'text-[#0A1233]' : 'text-[#FAF8F3]'
      }`}
      style={{
        background: isLight
          ? 'linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(248,245,238,0.10) 50%, rgba(255,255,255,0.22) 100%)'
          : 'linear-gradient(180deg, rgba(5,11,20,0.58) 0%, rgba(0,0,0,0.40) 50%, rgba(5,11,20,0.68) 100%)',
      }}
    >
      {/* Subtle Atmospheric Light & Glass Shimmer Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full blur-3xl ${
            isLight
              ? 'bg-gradient-to-b from-amber-400/15 via-emerald-400/10 to-transparent'
              : 'bg-gradient-to-b from-amber-500/10 via-emerald-500/5 to-transparent'
          }`}
        />
        <div
          className={`absolute bottom-10 right-[-10%] w-80 h-80 rounded-full blur-3xl ${
            isLight ? 'bg-amber-300/10' : 'bg-emerald-500/10'
          }`}
        />
      </div>

      {/* =========================================================================
          TOP STANDARD APP BAR (GLASSMORPHIC)
          ========================================================================= */}
      <div
        className={`w-full max-w-3xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between border-b sticky top-0 z-30 shadow-lg backdrop-blur-2xl transition-colors ${
          isLight
            ? 'border-[#8A7410]/20 bg-white/70 text-[#0A1233]'
            : 'border-white/15 bg-black/40 text-white'
        }`}
      >
        <button
          onClick={() => {
            soundManager.playBeadClick();
            if (activeTab === 'reader') {
              setActiveTab('surahs');
            } else {
              onClose();
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border active:scale-95 text-xs sm:text-sm font-medium backdrop-blur-md transition shadow-sm ${
            isLight
              ? 'bg-white/80 hover:bg-white border-[#8A7410]/25 text-[#0A1233]'
              : 'bg-white/10 hover:bg-white/20 border-white/20 text-white/90'
          }`}
        >
          <ChevronLeft className={`w-4 h-4 ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`} />
          <span>
            {activeTab === 'reader'
              ? language === 'uz'
                ? 'Suralar ro‘yxati'
                : 'Surahs List'
              : language === 'uz'
              ? 'Orqaga'
              : 'Back'}
          </span>
        </button>

        {activeTab === 'reader' && selectedSurah ? (
          <div className="text-center">
            <h2 className={`font-semibold text-sm sm:text-base tracking-wide ${isLight ? 'text-[#0A1233]' : 'text-white'}`}>
              {selectedSurah.number}. {language === 'uz' ? selectedSurah.uzbekName : selectedSurah.englishName}
            </h2>
            <p className={`text-[11px] font-medium ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`}>
              {selectedSurah.numberOfAyahs} {language === 'uz' ? 'oyat' : 'ayahs'} •{' '}
              {selectedSurah.revelationType === 'Meccan'
                ? language === 'uz'
                  ? 'Makkiy'
                  : 'Meccan'
                : language === 'uz'
                ? 'Madaniy'
                : 'Medinan'}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className={`font-serif font-bold text-sm sm:text-base tracking-wide ${isLight ? 'text-[#0A1233]' : 'text-white'}`}>
              {language === 'uz' ? "Qur'oni Karim" : 'The Noble Quran'}
            </h2>
            <p className={`text-[11px] ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`}>
              {language === 'uz' ? "114 ta Sura • 30 ta Juz" : '114 Surahs • 30 Juz'}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          {activeTab === 'reader' && (
            <>
              <button
                onClick={() => {
                  soundManager.playBeadClick();
                  setShowReciterModal(true);
                }}
                className={`p-2 rounded-full border transition active:scale-95 ${
                  isLight
                    ? 'bg-white/80 hover:bg-white border-[#8A7410]/25 text-[#0A1233]'
                    : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/90'
                }`}
                title={language === 'uz' ? 'Qori tanlash' : 'Select Reciter'}
              >
                <Radio className={`w-4 h-4 ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`} />
              </button>

              <button
                onClick={() => {
                  soundManager.playBeadClick();
                  setShowSettingsModal(true);
                }}
                className={`p-2 rounded-full border transition active:scale-95 ${
                  isLight
                    ? 'bg-white/80 hover:bg-white border-[#8A7410]/25 text-[#0A1233]'
                    : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/90'
                }`}
                title={language === 'uz' ? 'Sozlamalar' : 'Settings'}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className={`p-2 rounded-full border transition active:scale-95 ${
              isLight
                ? 'bg-white/80 hover:bg-white border-[#8A7410]/25 text-[#0A1233]'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white/80'
            }`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        ref={readerContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 max-w-3xl w-full mx-auto no-scrollbar scroll-smooth"
      >
        {/* =========================================================================
            SURAHS / JUZ / BOOKMARKS DIRECTORY
            ========================================================================= */}
        {activeTab !== 'reader' && (
          <div className="space-y-3.5 pb-28">
            {/* =========================================================================
                INSTAGRAM STORY STYLE RECITERS CAROUSEL (TOP ROW)
                ========================================================================= */}
            <div
              className={`p-3 rounded-2xl border backdrop-blur-xl shadow-md space-y-2 ${
                isLight
                  ? 'bg-white/65 border-[#8A7410]/20'
                  : 'bg-black/35 border-white/15'
              }`}
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`} />
                  <span className={`text-xs font-bold tracking-wide uppercase ${isLight ? 'text-[#0A1233]' : 'text-white/90'}`}>
                    {language === 'uz' ? 'Qorilar (Qiroat ustozlari)' : 'Quran Reciters'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    soundManager.playBeadClick();
                    setShowReciterModal(true);
                  }}
                  className={`text-[11px] font-semibold flex items-center gap-1 transition active:scale-95 ${
                    isLight
                      ? 'text-[#8A7410] hover:text-[#0A1233]'
                      : 'text-[#DBC66E] hover:text-white'
                  }`}
                >
                  <span>{language === 'uz' ? `Barchasi (${QURAN_RECITERS.length})` : `All (${QURAN_RECITERS.length})`}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Horizontal Story Scroll Row */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-1 -mx-1">
                {QURAN_RECITERS.map((reciter) => {
                  const isSelected = selectedReciter.id === reciter.id;
                  return (
                    <button
                      key={reciter.id}
                      onClick={() => {
                        const oldPlaying = playingAyah;
                        const wasPlaying = isPlaying;
                        setSelectedReciter(reciter);
                        soundManager.playBeadClick();
                        if (oldPlaying && wasPlaying && audioRef.current) {
                          const newUrl = getAyahAudioUrl(
                            reciter.id,
                            oldPlaying.number,
                            selectedSurah?.number,
                            oldPlaying.numberInSurah
                          );
                          audioRef.current.src = newUrl;
                          audioRef.current.play().catch(console.warn);
                        }
                      }}
                      className="flex flex-col items-center gap-1 shrink-0 group active:scale-95 transition"
                      style={{ width: '64px' }}
                    >
                      {/* Instagram Story Gradient Ring */}
                      <div
                        className={`p-[2.5px] rounded-full transition-all duration-300 ${
                          isSelected
                            ? isLight
                              ? 'bg-gradient-to-tr from-[#8A7410] via-amber-500 to-[#DBC66E] shadow-[0_0_12px_rgba(138,116,16,0.4)] ring-2 ring-[#8A7410]/35 scale-105'
                              : 'bg-gradient-to-tr from-amber-400 via-[#DBC66E] to-yellow-200 shadow-[0_0_14px_rgba(219,198,110,0.5)] ring-2 ring-[#DBC66E]/40 scale-105'
                            : isLight
                            ? 'bg-gradient-to-tr from-stone-300 via-amber-200/50 to-stone-200 group-hover:from-[#8A7410]/40 group-hover:to-amber-300'
                            : 'bg-gradient-to-tr from-white/20 via-white/10 to-white/5 group-hover:from-[#DBC66E]/40 group-hover:to-white/30'
                        }`}
                      >
                        <div className={`p-[1.5px] rounded-full ${isLight ? 'bg-white' : 'bg-[#050B14]'}`}>
                          <div className="relative">
                            <ReciterAvatar
                              reciter={reciter}
                              size="md"
                              isActive={isSelected}
                              isPlaying={isSelected && isPlaying}
                              isLight={isLight}
                            />
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-medium leading-tight text-center truncate w-full px-0.5 transition ${
                          isSelected
                            ? isLight
                              ? 'text-[#8A7410] font-bold'
                              : 'text-[#DBC66E] font-bold'
                            : isLight
                            ? 'text-[#0A1233]/80 group-hover:text-[#0A1233]'
                            : 'text-white/70 group-hover:text-white'
                        }`}
                      >
                        {reciter.shortName || reciter.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}

                {/* View More Button Story Circle */}
                <button
                  onClick={() => {
                    soundManager.playBeadClick();
                    setShowReciterModal(true);
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 group active:scale-95 transition"
                  style={{ width: '64px' }}
                >
                  <div
                    className={`w-12 h-12 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition shadow-sm ${
                      isLight
                        ? 'border-[#8A7410]/35 bg-white/70 hover:bg-white text-[#8A7410]'
                        : 'border-white/25 bg-white/10 hover:bg-white/20 text-white/80'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    <span className="text-[9px] font-bold mt-0.5">+{QURAN_RECITERS.length}</span>
                  </div>
                  <span
                    className={`text-[10px] font-medium leading-tight text-center truncate w-full px-0.5 ${
                      isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'
                    }`}
                  >
                    {language === 'uz' ? 'Barchasi' : 'View All'}
                  </span>
                </button>
              </div>
            </div>

            {/* Top Navigation Tabs */}
            <div
              className={`flex items-center p-1.5 rounded-2xl border backdrop-blur-xl shadow-md ${
                isLight
                  ? 'bg-white/70 border-[#8A7410]/20'
                  : 'bg-black/35 border-white/15'
              }`}
            >
              <button
                onClick={() => {
                  setActiveTab('surahs');
                  soundManager.playBeadClick();
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'surahs'
                    ? isLight
                      ? 'bg-[#8A7410] text-white shadow-md'
                      : 'bg-[#DBC66E] text-black shadow-md'
                    : isLight
                    ? 'text-[#5E657D] hover:text-[#0A1233]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{language === 'uz' ? 'Suralar (114)' : 'Surahs (114)'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('juzs');
                  soundManager.playBeadClick();
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'juzs'
                    ? isLight
                      ? 'bg-[#8A7410] text-white shadow-md'
                      : 'bg-[#DBC66E] text-black shadow-md'
                    : isLight
                    ? 'text-[#5E657D] hover:text-[#0A1233]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'uz' ? 'Juzlar (30)' : 'Juz (30)'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('bookmarks');
                  soundManager.playBeadClick();
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'bookmarks'
                    ? isLight
                      ? 'bg-[#8A7410] text-white shadow-md'
                      : 'bg-[#DBC66E] text-black shadow-md'
                    : isLight
                    ? 'text-[#5E657D] hover:text-[#0A1233]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{language === 'uz' ? 'Xatcho‘plar' : 'Bookmarks'}</span>
              </button>
            </div>

            {/* -------------------------------------------------------------
                SURAH LIST (TAB 1)
                ------------------------------------------------------------- */}
            {activeTab === 'surahs' && (
              <div className="space-y-3">
                {/* Search & Filter Bar */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                        isLight ? 'text-[#8A7410]/70' : 'text-white/40'
                      }`}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        language === 'uz'
                          ? "Sura nomi, raqami yoki ma'nosi bo'yicha qidiring..."
                          : 'Search by surah name, number or meaning...'
                      }
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none transition shadow-inner backdrop-blur-md ${
                        isLight
                          ? 'bg-white/70 border-[#8A7410]/25 text-[#0A1233] placeholder-[#5E657D]/60 focus:border-[#8A7410]'
                          : 'bg-black/30 border-white/15 text-white placeholder-white/50 focus:border-[#DBC66E]/70'
                      }`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${
                          isLight ? 'text-black/50 hover:text-black' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {(['all', 'meccan', 'medinan'] as SurahFilterType[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setSurahFilter(f);
                          soundManager.playBeadClick();
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap border ${
                          surahFilter === f
                            ? isLight
                              ? 'bg-[#8A7410] text-white border-[#8A7410] shadow-sm'
                              : 'bg-[#DBC66E] text-black border-[#DBC66E] shadow-sm font-semibold'
                            : isLight
                            ? 'bg-white/60 hover:bg-white text-[#0A1233] border-[#8A7410]/15'
                            : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                        }`}
                      >
                        {f === 'all'
                          ? language === 'uz'
                            ? 'Barcha suralar (114)'
                            : 'All Surahs (114)'
                          : f === 'meccan'
                          ? language === 'uz'
                            ? 'Makkiy suralar (86)'
                            : 'Meccan Surahs (86)'
                          : language === 'uz'
                          ? 'Madaniy suralar (28)'
                            : 'Medinan Surahs (28)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Surahs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredSurahs.map((surah) => (
                    <div
                      key={surah.number}
                      onClick={() => {
                        setSelectedSurah(surah);
                        setActiveTab('reader');
                        soundManager.playBeadClick();
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group backdrop-blur-xl shadow-md ${
                        isLight
                          ? 'bg-white/65 hover:bg-white/85 border-[#8A7410]/15 hover:border-[#8A7410]/50 hover:shadow-lg'
                          : 'bg-black/30 hover:bg-black/45 border-white/15 hover:border-[#DBC66E]/50 shadow-lg'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs transition shadow-sm ${
                            isLight
                              ? 'bg-[#8A7410]/10 border-[#8A7410]/25 text-[#8A7410] group-hover:bg-[#8A7410] group-hover:text-white'
                              : 'bg-[#DBC66E]/15 border-[#DBC66E]/30 text-[#DBC66E] group-hover:bg-[#DBC66E] group-hover:text-black'
                          }`}
                        >
                          {surah.number}
                        </div>
                        <div>
                          <h4
                            className={`font-semibold text-xs sm:text-sm transition ${
                              isLight
                                ? 'text-[#0A1233] group-hover:text-[#8A7410]'
                                : 'text-white group-hover:text-[#DBC66E]'
                            }`}
                          >
                            {language === 'uz' ? surah.uzbekName : surah.englishName}
                          </h4>
                          <p className={`text-[11px] ${isLight ? 'text-[#5E657D]' : 'text-white/60'}`}>
                            {language === 'uz' ? surah.uzbekTranslation : surah.englishNameTranslation} •{' '}
                            {surah.numberOfAyahs} {language === 'uz' ? 'oyat' : 'ayahs'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-serif text-base sm:text-lg block transition ${
                            isLight ? 'text-[#0A1233] group-hover:text-[#8A7410]' : 'text-[#DBC66E]'
                          }`}
                          dir="rtl"
                        >
                          {surah.name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border inline-block mt-0.5 ${
                            isLight
                              ? 'bg-[#8A7410]/10 border-[#8A7410]/20 text-[#8A7410]'
                              : 'bg-white/10 border-white/10 text-white/50'
                          }`}
                        >
                          {surah.revelationType === 'Meccan'
                            ? language === 'uz'
                              ? 'Makkiy'
                              : 'Meccan'
                            : language === 'uz'
                            ? 'Madaniy'
                            : 'Medinan'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                JUZ LIST (TAB 2) — RICH WITH SURAHS IN EACH JUZ
                ------------------------------------------------------------- */}
            {activeTab === 'juzs' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {ALL_30_JUZ.map((juz) => {
                    const isExpanded = expandedJuz === juz.juzNumber;
                    // Find all surahs starting in or covered in this juz
                    const matchingSurahs = ALL_114_SURAHS.filter(
                      (s) => s.startJuz === juz.juzNumber || (juz.quarters && juz.quarters.some((q) => q.surah.toLowerCase() === s.englishName.toLowerCase() || q.surah.toLowerCase() === s.uzbekName.toLowerCase()))
                    );
                    const primarySurah = ALL_114_SURAHS.find((s) => s.number === juz.surahNumber) || ALL_114_SURAHS[0];

                    return (
                      <div
                        key={juz.juzNumber}
                        className={`rounded-2xl border transition-all backdrop-blur-xl shadow-md overflow-hidden ${
                          isLight
                            ? 'bg-white/65 border-[#8A7410]/20 hover:border-[#8A7410]/40'
                            : 'bg-black/35 border-white/15 hover:border-[#DBC66E]/40'
                        }`}
                      >
                        {/* Juz Main Row */}
                        <div
                          onClick={() => {
                            setExpandedJuz(isExpanded ? null : juz.juzNumber);
                            soundManager.playBeadClick();
                          }}
                          className="p-3.5 flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs transition shadow-sm ${
                                isLight
                                  ? 'bg-[#8A7410]/15 border-[#8A7410]/30 text-[#8A7410] group-hover:bg-[#8A7410] group-hover:text-white'
                                  : 'bg-[#DBC66E]/15 border-[#DBC66E]/30 text-[#DBC66E] group-hover:bg-[#DBC66E] group-hover:text-black'
                              }`}
                            >
                              {juz.juzNumber}
                            </div>
                            <div>
                              <h4
                                className={`font-semibold text-xs sm:text-sm transition flex items-center gap-2 ${
                                  isLight
                                    ? 'text-[#0A1233] group-hover:text-[#8A7410]'
                                    : 'text-white group-hover:text-[#DBC66E]'
                                }`}
                              >
                                <span>{juz.juzNumber}-{language === 'uz' ? 'Juz' : 'Juz'}</span>
                                <span className={`text-[11px] font-normal ${isLight ? 'text-[#5E657D]' : 'text-white/60'}`}>
                                  ({primarySurah.uzbekName}: {juz.startAyah}-oyatdan)
                                </span>
                              </h4>
                              <p className={`text-[11px] ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`}>
                                {language === 'uz' ? 'Boshlanish surasi' : 'Starting surah'}: {juz.surahName} • {juz.pageNumber}-{language === 'uz' ? 'bet' : 'page'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSurah(primarySurah);
                                setActiveTab('reader');
                                soundManager.playBeadClick();
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center gap-1 ${
                                isLight
                                  ? 'bg-[#8A7410] text-white shadow-sm hover:bg-[#8A7410]/90'
                                  : 'bg-[#DBC66E] text-black shadow-sm hover:bg-[#DBC66E]/90'
                              }`}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>{language === 'uz' ? "O'qish" : 'Read'}</span>
                            </button>

                            <div
                              className={`p-1 rounded-full transition transform ${
                                isExpanded ? 'rotate-90' : ''
                              } ${isLight ? 'text-black/50' : 'text-white/50'}`}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Juz Expanded Details: List of Surahs and Sections inside this Juz */}
                        {isExpanded && (
                          <div
                            className={`px-3.5 pb-3.5 pt-2 border-t ${
                              isLight ? 'border-[#8A7410]/15 bg-[#FAF8F3]/60' : 'border-white/10 bg-black/25'
                            }`}
                          >
                            <p className={`text-[11px] font-semibold mb-2 ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`}>
                              {language === 'uz' ? 'Ushbu juzdagi suralar va qismlar:' : 'Surahs in this Juz:'}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {juz.quarters?.map((quarter, idx) => {
                                const targetSurah = ALL_114_SURAHS.find(
                                  (s) =>
                                    s.englishName.toLowerCase() === quarter.surah.toLowerCase() ||
                                    s.uzbekName.toLowerCase() === quarter.surah.toLowerCase() ||
                                    s.name.includes(quarter.surah)
                                );

                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      if (targetSurah) {
                                        setSelectedSurah(targetSurah);
                                        setActiveTab('reader');
                                        soundManager.playBeadClick();
                                      }
                                    }}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition active:scale-95 flex items-center gap-1.5 ${
                                      isLight
                                        ? 'bg-white hover:bg-[#8A7410]/10 border-[#8A7410]/20 text-[#0A1233]'
                                        : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/90'
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#DBC66E]" />
                                    <span>{quarter.label || `${quarter.surah} ${quarter.ayah}`}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                BOOKMARKS (TAB 3)
                ------------------------------------------------------------- */}
            {activeTab === 'bookmarks' && (
              <div className="space-y-3">
                {bookmarkedVerses.length === 0 ? (
                  <div
                    className={`py-16 text-center space-y-2 rounded-2xl border backdrop-blur-md ${
                      isLight
                        ? 'bg-white/70 border-[#8A7410]/20 text-[#5E657D]'
                        : 'bg-black/20 border-white/10 text-white/50'
                    }`}
                  >
                    <Bookmark className="w-8 h-8 opacity-40 mx-auto" />
                    <p className={`text-sm font-medium ${isLight ? 'text-[#0A1233]' : 'text-white/80'}`}>
                      {language === 'uz'
                        ? 'Hali hech qanday xatcho‘p saqlanmagan'
                        : 'No bookmarked verses yet'}
                    </p>
                    <p className="text-xs opacity-75">
                      {language === 'uz'
                        ? "O'qish paytida xatcho'p belgisini bosib oyatni saqlang"
                        : 'Tap the bookmark icon while reading to save verses'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookmarkedVerses.map((key) => {
                      const [sNumStr, aNumStr] = key.split(':');
                      const sNum = parseInt(sNumStr, 10);
                      const aNum = parseInt(aNumStr, 10);
                      const sMeta = ALL_114_SURAHS.find((s) => s.number === sNum);

                      return (
                        <div
                          key={key}
                          onClick={() => {
                            if (sMeta) {
                              setSelectedSurah(sMeta);
                              setActiveTab('reader');
                              soundManager.playBeadClick();
                            }
                          }}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition backdrop-blur-xl shadow-md ${
                            isLight
                              ? 'bg-white/85 hover:bg-white border-[#8A7410]/15 hover:border-[#8A7410]/40'
                              : 'bg-black/30 hover:bg-black/45 border-white/15 hover:border-[#DBC66E]/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs shadow-sm ${
                                isLight
                                  ? 'bg-[#8A7410]/15 text-[#8A7410] border-[#8A7410]/30'
                                  : 'bg-amber-400/15 text-amber-400 border-amber-400/30'
                              }`}
                            >
                              <Bookmark className="w-4 h-4 fill-current" />
                            </div>
                            <div>
                              <h4 className={`font-semibold text-xs ${isLight ? 'text-[#0A1233]' : 'text-white'}`}>
                                {sMeta?.number}. {sMeta?.uzbekName} ({aNum}-oyat)
                              </h4>
                              <p className={`text-[11px] ${isLight ? 'text-[#5E657D]' : 'text-white/50'}`}>
                                {sMeta?.uzbekTranslation}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(sNum, aNum);
                            }}
                            className={`p-1.5 rounded-lg border transition ${
                              isLight
                                ? 'bg-black/5 hover:bg-black/10 border-black/10 text-black/60 hover:text-red-500'
                                : 'bg-white/10 hover:bg-white/20 border-white/10 text-white/60 hover:text-red-400'
                            }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            READER SCREEN (SURAH AYAH BY AYAH VIEW)
            ========================================================================= */}
        {activeTab === 'reader' && selectedSurah && (
          <div className="space-y-4 pt-3 pb-36">
            {/* Top Surah Info Header Banner */}
            <div
              className={`p-5 rounded-3xl border backdrop-blur-xl text-center space-y-3.5 shadow-xl ${
                isLight
                  ? 'bg-white/70 border-[#8A7410]/20 text-[#0A1233]'
                  : 'bg-black/35 border-white/15 text-white'
              }`}
            >
              <div
                className={`font-serif text-3xl sm:text-4xl drop-shadow-sm ${
                  isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'
                }`}
                dir="rtl"
              >
                {selectedSurah.name}
              </div>
              <div>
                <h2 className={`text-base sm:text-lg font-bold drop-shadow-sm ${isLight ? 'text-[#0A1233]' : 'text-white'}`}>
                  {selectedSurah.number}. {language === 'uz' ? selectedSurah.uzbekName : selectedSurah.englishName}
                </h2>
                <p className={`text-xs ${isLight ? 'text-[#5E657D]' : 'text-white/70'}`}>
                  {language === 'uz' ? selectedSurah.uzbekTranslation : selectedSurah.englishNameTranslation} •{' '}
                  {selectedSurah.numberOfAyahs} {language === 'uz' ? 'oyat' : 'ayahs'} • {selectedSurah.revelationType === 'Meccan' ? (language === 'uz' ? 'Makkiy' : 'Meccan') : (language === 'uz' ? 'Madaniy' : 'Medinan')}
                </p>
              </div>

              {/* =========================================================================
                  SINGLE UNIFIED MASTER QURAN AUDIO PLAYER
                  ========================================================================= */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner ${
                  isLight
                    ? 'bg-amber-50/60 border-[#8A7410]/20'
                    : 'bg-white/5 border-white/15'
                }`}
              >
                {/* Active Reciter Selection */}
                <button
                  onClick={() => setShowReciterModal(true)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs active:scale-95 transition shadow-sm w-full sm:w-auto justify-between sm:justify-start ${
                    isLight
                      ? 'bg-white/90 hover:bg-white border-[#8A7410]/30 text-[#0A1233]'
                      : 'bg-black/40 hover:bg-black/60 border-white/20 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ReciterAvatar reciter={selectedReciter} size="sm" isPlaying={isPlaying} isLight={isLight} />
                    <div className="text-left">
                      <div className={`font-semibold text-xs leading-tight ${isLight ? 'text-[#0A1233]' : 'text-white'}`}>
                        {selectedReciter.name}
                      </div>
                      <div className={`text-[10px] ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`}>
                        {selectedReciter.style} ({selectedReciter.country})
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isLight ? 'text-black/40' : 'text-white/50'}`} />
                </button>

                {/* Central Audio Playback Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={playPrevAyah}
                    className={`p-2 rounded-xl active:scale-90 transition border ${
                      isLight
                        ? 'bg-white/80 hover:bg-white border-[#8A7410]/25 text-[#0A1233]'
                        : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                    }`}
                    title={language === 'uz' ? 'Oldingi oyat' : 'Previous Ayah'}
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={togglePlaySurah}
                    className={`px-5 py-2.5 rounded-2xl active:scale-95 transition shadow-lg flex items-center gap-2 text-xs sm:text-sm font-bold ${
                      isLight
                        ? 'bg-[#8A7410] hover:bg-[#72600D] text-white shadow-[#8A7410]/25'
                        : 'bg-[#DBC66E] hover:bg-[#c9b45e] text-black shadow-[#DBC66E]/20'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>{language === 'uz' ? "To'xtatish" : 'Pause'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>
                          {playingAyah
                            ? (language === 'uz' ? 'Davom ettirish' : 'Resume')
                            : (language === 'uz' ? "Surani tinglash" : 'Play Surah')}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={playNextAyah}
                    className={`p-2 rounded-xl active:scale-90 transition border ${
                      isLight
                        ? 'bg-white/80 hover:bg-white border-[#8A7410]/25 text-[#0A1233]'
                        : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                    }`}
                    title={language === 'uz' ? 'Keyingi oyat' : 'Next Ayah'}
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Playing Status Pill */}
                <div className="text-xs font-semibold">
                  {playingAyah ? (
                    <span className={`px-2.5 py-1 rounded-lg border ${
                      isLight ? 'bg-amber-100/80 border-[#8A7410]/30 text-[#8A7410]' : 'bg-[#DBC66E]/15 border-[#DBC66E]/30 text-[#DBC66E]'
                    }`}>
                      {playingAyah.numberInSurah} / {selectedSurah.numberOfAyahs} {language === 'uz' ? 'oyat' : 'ayah'}
                    </span>
                  ) : (
                    <span className={`text-[11px] opacity-70 ${isLight ? 'text-[#5E657D]' : 'text-white/60'}`}>
                      {language === 'uz' ? 'Tinglashga tayyor' : 'Ready to play'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* BISMILLAH CARD (HIGH CONTRAST & ROYAL ISLAMIC ORNAMENTATION) */}
            {selectedSurah.number !== 9 && (
              <div
                className={`py-5 px-4 rounded-3xl border backdrop-blur-xl text-center space-y-2 shadow-lg relative overflow-hidden ${
                  isLight
                    ? 'bg-gradient-to-b from-amber-50/75 via-white/80 to-amber-100/70 border-[#8A7410]/25 text-[#0A1233]'
                    : 'bg-gradient-to-b from-black/45 via-black/35 to-black/50 border-[#DBC66E]/30 text-[#FAF8F3]'
                }`}
              >
                {/* Decorative Islamic Frame Pattern */}
                <div className="flex items-center justify-center gap-3 opacity-60">
                  <span className={`h-[1px] w-12 sm:w-20 ${isLight ? 'bg-[#8A7410]' : 'bg-[#DBC66E]'}`} />
                  <Sparkles className={`w-4 h-4 ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`} />
                  <span className={`h-[1px] w-12 sm:w-20 ${isLight ? 'bg-[#8A7410]' : 'bg-[#DBC66E]'}`} />
                </div>

                {/* Calligraphic Bismillah */}
                <div
                  className={`font-serif text-2xl sm:text-3xl font-bold tracking-wide leading-relaxed drop-shadow-md py-1 ${
                    isLight ? 'text-[#8A7410]' : 'text-[#F5E6AB]'
                  }`}
                  dir="rtl"
                >
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </div>

                {/* High Contrast Translation Banner */}
                {showTranslation && (
                  <div className="pt-1">
                    <div
                      className={`inline-block px-4 py-1.5 rounded-full border text-xs sm:text-sm font-medium backdrop-blur-md shadow-sm ${
                        isLight
                          ? 'bg-[#8A7410]/10 border-[#8A7410]/25 text-[#0A1233]'
                          : 'bg-black/40 border-white/20 text-[#FAF8F3]'
                      }`}
                    >
                      {language === 'uz'
                        ? 'Mehribon va Rahmli Allohning nomi bilan'
                        : language === 'ru'
                        ? 'Во имя Аллаха, Милостивого, Милосердного'
                        : 'In the name of Allah, the Entirely Merciful, the Especially Merciful'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loading Indicator */}
            {loadingVerses && (
              <div
                className={`py-20 text-center space-y-3 rounded-3xl border backdrop-blur-xl ${
                  isLight
                    ? 'bg-white/70 border-[#8A7410]/20 text-[#0A1233]'
                    : 'bg-black/25 border-white/10 text-white'
                }`}
              >
                <div
                  className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto ${
                    isLight ? 'border-[#8A7410]' : 'border-[#DBC66E]'
                  }`}
                />
                <p className={`text-xs ${isLight ? 'text-[#5E657D]' : 'text-white/60'}`}>
                  {language === 'uz' ? 'Oyatlar yuklanmoqda...' : 'Loading verses...'}
                </p>
              </div>
            )}

            {/* Verses List (Clean Ayah Cards - Click to Play with Single Player) */}
            {!loadingVerses && (
              <div className="space-y-3">
                {ayahs.map((ayah) => {
                  const isCurrentPlaying = playingAyah?.numberInSurah === ayah.numberInSurah;
                  const isBookmarked = bookmarkedVerses.includes(
                    `${selectedSurah.number}:${ayah.numberInSurah}`
                  );

                  return (
                    <motion.div
                      key={ayah.numberInSurah}
                      id={`ayah-${ayah.numberInSurah}`}
                      onClick={() => playAyah(ayah)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 backdrop-blur-xl shadow-md cursor-pointer relative overflow-hidden ${
                        isCurrentPlaying
                          ? isLight
                            ? 'bg-gradient-to-br from-[#FFFDF7] via-[#FAF4E4] to-[#FFF9E6] border-2 border-[#8A7410] shadow-[0_4px_30px_rgba(138,116,16,0.3)] ring-4 ring-[#8A7410]/20'
                            : 'bg-gradient-to-br from-[#DBC66E]/25 via-black/50 to-[#DBC66E]/15 border-2 border-[#DBC66E] shadow-[0_0_32px_rgba(219,198,110,0.45)] ring-4 ring-[#DBC66E]/30'
                          : isLight
                          ? 'bg-white/70 border-[#8A7410]/15 hover:border-[#8A7410]/40 hover:bg-white/90'
                          : 'bg-black/30 border-white/15 hover:border-white/30 hover:bg-black/45'
                      }`}
                    >
                      {/* Luminous Top Glow Stripe for Active Ayah */}
                      {isCurrentPlaying && (
                        <div
                          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                            isLight
                              ? 'from-[#8A7410]/40 via-[#8A7410] to-[#8A7410]/40'
                              : 'from-[#DBC66E]/40 via-[#DBC66E] to-[#DBC66E]/40'
                          }`}
                        />
                      )}

                      {/* Ayah Actions Strip */}
                      <div
                        className={`flex items-center justify-between pb-3 border-b text-xs ${
                          isCurrentPlaying
                            ? isLight
                              ? 'border-[#8A7410]/30 text-[#8A7410]'
                              : 'border-[#DBC66E]/30 text-[#DBC66E]'
                            : isLight
                            ? 'border-[#8A7410]/15 text-[#5E657D]'
                            : 'border-white/10 text-white/60'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs transition-colors ${
                              isCurrentPlaying
                                ? isLight
                                  ? 'bg-[#8A7410] text-white border-[#8A7410] shadow-sm ring-2 ring-[#8A7410]/30'
                                  : 'bg-[#DBC66E] text-black font-bold border-[#DBC66E] shadow-sm ring-2 ring-[#DBC66E]/40'
                                : isLight
                                ? 'bg-[#8A7410]/10 border-[#8A7410]/25 text-[#8A7410]'
                                : 'bg-white/10 border-white/15 text-[#DBC66E]'
                            }`}
                          >
                            {ayah.numberInSurah}
                          </span>
                          <span className={`text-[10px] ${isLight ? 'text-[#5E657D]' : 'text-white/50'}`}>
                            Juz {ayah.juz}
                          </span>
                          {isCurrentPlaying && (
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                                isLight
                                  ? 'bg-[#8A7410] text-white border-[#8A7410]'
                                  : 'bg-[#DBC66E] text-black border-[#DBC66E]'
                              }`}
                            >
                              <span className="flex items-center gap-0.5">
                                <span className="w-1 h-3 bg-current rounded-full animate-pulse" />
                                <span className="w-1 h-4 bg-current rounded-full animate-pulse [animation-delay:150ms]" />
                                <span className="w-1 h-2 bg-current rounded-full animate-pulse [animation-delay:300ms]" />
                              </span>
                              <span>
                                {isPlaying
                                  ? language === 'uz'
                                    ? 'Qiroat qilinmoqda...'
                                    : 'Now Reciting'
                                  : language === 'uz'
                                  ? 'To‘xtatildi'
                                  : 'Paused'}
                              </span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleBookmark(selectedSurah.number, ayah.numberInSurah)}
                            className={`p-2 rounded-xl border transition active:scale-90 ${
                              isBookmarked
                                ? isLight
                                  ? 'bg-[#8A7410]/15 text-[#8A7410] border-[#8A7410]/30'
                                  : 'text-[#DBC66E] bg-white/10 border-white/15'
                                : isLight
                                ? 'bg-black/5 hover:bg-black/10 text-black/60 border-black/10'
                                : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/60'
                            }`}
                            title="Xatcho‘p"
                          >
                            <Bookmark className="w-4 h-4 fill-current" />
                          </button>

                          <button
                            onClick={() => copyAyah(ayah)}
                            className={`p-2 rounded-xl border transition active:scale-90 ${
                              isLight
                                ? 'bg-black/5 hover:bg-black/10 text-black/60 hover:text-black border-black/10'
                                : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/60 hover:text-white'
                            }`}
                            title="Nusxalash"
                          >
                            {copiedAyahNum === ayah.numberInSurah ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Arabic Text with Illuminated Focus on Active Ayah */}
                      <div
                        className={`py-4 font-serif text-right leading-[2.4] transition-all duration-200 ${
                          isCurrentPlaying
                            ? isLight
                              ? 'text-[#8A7410] font-bold drop-shadow-sm scale-[1.005]'
                              : 'text-[#FAF0CA] font-bold drop-shadow-[0_2px_8px_rgba(219,198,110,0.4)] scale-[1.005]'
                            : isLight
                            ? 'text-[#0A1233] drop-shadow-sm'
                            : 'text-white/95 drop-shadow-sm'
                        }`}
                        dir="rtl"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {ayah.text}
                      </div>

                      {/* Translation */}
                      {showTranslation && ayah.translation && (
                        <div
                          className={`pt-2 font-sans leading-relaxed border-t transition-colors duration-200 ${
                            isCurrentPlaying
                              ? isLight
                                ? 'text-[#0A1233] border-[#8A7410]/25 font-medium bg-[#8A7410]/5 p-2.5 rounded-xl mt-1'
                                : 'text-white border-[#DBC66E]/25 font-medium bg-white/5 p-2.5 rounded-xl mt-1'
                              : isLight
                              ? 'text-[#1C2541] border-[#8A7410]/15 font-medium'
                              : 'text-white/85 border-white/10'
                          }`}
                          style={{ fontSize: `${translationFontSize}px` }}
                        >
                          {ayah.translation}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Surah Navigation (Prev/Next) */}
            <div
              className={`flex items-center justify-between pt-6 border-t ${
                isLight ? 'border-[#8A7410]/20' : 'border-white/15'
              }`}
            >
              <button
                disabled={selectedSurah.number <= 1}
                onClick={() => {
                  const prev = ALL_114_SURAHS.find((s) => s.number === selectedSurah.number - 1);
                  if (prev) {
                    setSelectedSurah(prev);
                    readerContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`px-4 py-2.5 rounded-xl border backdrop-blur-xl disabled:opacity-30 disabled:pointer-events-none text-xs font-medium transition flex items-center gap-1.5 shadow-md ${
                  isLight
                    ? 'bg-white/90 hover:bg-white border-[#8A7410]/25 text-[#0A1233]'
                    : 'bg-black/35 hover:bg-black/50 border-white/15 text-white'
                }`}
              >
                <ChevronLeft className={`w-4 h-4 ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`} />
                <span>{language === 'uz' ? 'Oldingi sura' : 'Previous Surah'}</span>
              </button>

              <button
                disabled={selectedSurah.number >= 114}
                onClick={() => {
                  const next = ALL_114_SURAHS.find((s) => s.number === selectedSurah.number + 1);
                  if (next) {
                    setSelectedSurah(next);
                    readerContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`px-4 py-2.5 rounded-xl border backdrop-blur-xl disabled:opacity-30 disabled:pointer-events-none text-xs font-medium transition flex items-center gap-1.5 shadow-md ${
                  isLight
                    ? 'bg-white/90 hover:bg-white border-[#8A7410]/25 text-[#0A1233]'
                    : 'bg-black/35 hover:bg-black/50 border-white/15 text-white'
                }`}
              >
                <span>{language === 'uz' ? 'Keyingi sura' : 'Next Surah'}</span>
                <ChevronRight className={`w-4 h-4 ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          STANDARD FLOATING AUDIO CONTROLLER DOCK
          ========================================================================= */}
      <AnimatePresence>
        {playingAyah && selectedSurah && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className={`fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40 border rounded-2xl p-3 shadow-2xl backdrop-blur-2xl flex items-center justify-between ${
              isLight
                ? 'bg-[#FAF8F3]/95 border-[#8A7410]/30 text-[#0A1233]'
                : 'bg-black/60 border-white/20 text-white'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <ReciterAvatar reciter={selectedReciter} size="sm" isPlaying={isPlaying} isLight={isLight} />
              <div className="truncate">
                <h4 className={`font-semibold text-xs truncate ${isLight ? 'text-[#0A1233]' : 'text-white'}`}>
                  {selectedSurah.number}. {selectedSurah.uzbekName} ({playingAyah.numberInSurah}-oyat)
                </h4>
                <p className={`text-[11px] font-medium truncate ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`}>
                  {selectedReciter.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={playPrevAyah}
                className={`p-2 rounded-xl active:scale-90 transition ${
                  isLight
                    ? 'bg-black/5 hover:bg-black/10 text-black/70'
                    : 'bg-white/5 hover:bg-white/15 text-white/70'
                }`}
                title="Oldingi oyat"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) {
                    if (isPlaying) audioRef.current.pause();
                    else audioRef.current.play();
                  }
                }}
                className={`p-2.5 rounded-xl active:scale-90 transition shadow-md ${
                  isLight
                    ? 'bg-[#8A7410] text-white font-bold'
                    : 'bg-[#DBC66E] text-black font-bold'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={playNextAyah}
                className={`p-2 rounded-xl active:scale-90 transition ${
                  isLight
                    ? 'bg-black/5 hover:bg-black/10 text-black/70'
                    : 'bg-white/5 hover:bg-white/15 text-white/70'
                }`}
                title="Keyingi oyat"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause();
                  setPlayingAyah(null);
                  setIsPlaying(false);
                }}
                className={`p-2 rounded-xl active:scale-90 transition text-xs ml-1 ${
                  isLight
                    ? 'bg-black/5 hover:bg-black/10 text-black/50 hover:text-black'
                    : 'bg-white/5 hover:bg-white/15 text-white/50 hover:text-white'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          RECITERS SELECTION MODAL (REDESIGNED BASED ON SCREENSHOT & GLASSMORPHISM)
          ========================================================================= */}
      <AnimatePresence>
        {showReciterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 20 }}
              className={`w-full max-w-lg rounded-3xl p-4 sm:p-5 space-y-3.5 max-h-[85vh] flex flex-col shadow-2xl backdrop-blur-2xl border ${
                isLight
                  ? 'bg-[#FAF8F3]/95 border-[#8A7410]/25 text-[#0A1233]'
                  : 'bg-[#0B132B]/95 border-white/20 text-white'
              }`}
            >
              {/* Modal Header */}
              <div
                className={`flex items-center justify-between pb-3 border-b ${
                  isLight ? 'border-[#8A7410]/20' : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                      isLight
                        ? 'bg-[#8A7410]/15 text-[#8A7410] border-[#8A7410]/30'
                        : 'bg-[#DBC66E]/20 text-[#DBC66E] border-[#DBC66E]/30'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm sm:text-base ${isLight ? 'text-[#0A1233]' : 'text-white'}`}>
                      {language === 'uz' ? 'Qori tanlash' : 'Select Reciter'}
                    </h3>
                    <p className={`text-[10px] ${isLight ? 'text-[#5E657D]' : 'text-white/60'}`}>
                      {language === 'uz' ? '18 ta mashhur qori ovozlari' : '18 verified world reciters'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReciterModal(false)}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition active:scale-95 ${
                    isLight
                      ? 'bg-black/5 hover:bg-black/10 border-black/10 text-black/70'
                      : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/80'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Reciter Search */}
              <div className="relative">
                <Search
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    isLight ? 'text-[#8A7410]/70' : 'text-white/40'
                  }`}
                />
                <input
                  type="text"
                  value={reciterSearchQuery}
                  onChange={(e) => setReciterSearchQuery(e.target.value)}
                  placeholder={
                    language === 'uz'
                      ? "Qori ismi, uslubi yoki davlatini qidiring..."
                      : 'Search reciter name, style or country...'
                  }
                  className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs focus:outline-none transition shadow-inner backdrop-blur-md ${
                    isLight
                      ? 'bg-white border-[#8A7410]/25 text-[#0A1233] placeholder-[#5E657D]/60 focus:border-[#8A7410]'
                      : 'bg-white/10 border-white/15 text-white placeholder-white/50 focus:border-[#DBC66E]/70'
                  }`}
                />
                {reciterSearchQuery && (
                  <button
                    onClick={() => setReciterSearchQuery('')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${
                      isLight ? 'text-black/50 hover:text-black' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Reciters List (Refined Cards with Safe Padding) */}
              <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 py-1 no-scrollbar">
                {filteredReciters.map((reciter) => {
                  const isSelected = selectedReciter.id === reciter.id;
                  return (
                    <div
                      key={reciter.id}
                      onClick={() => {
                        setSelectedReciter(reciter);
                        selectedReciterRef.current = reciter;
                        setShowReciterModal(false);
                        soundManager.playBeadClick();
                        if (isPlaying && currentAyahIndexRef.current >= 0) {
                          playAyahByIndex(currentAyahIndexRef.current);
                        }
                      }}
                      className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group shadow-sm active:scale-[0.99] ${
                        isSelected
                          ? isLight
                            ? 'bg-[#8A7410]/15 border-[#8A7410] text-[#0A1233] shadow-md ring-1 ring-[#8A7410]'
                            : 'bg-[#DBC66E]/20 border-[#DBC66E] text-white shadow-md ring-1 ring-[#DBC66E]/50'
                          : isLight
                          ? 'bg-white/90 hover:bg-white border-[#8A7410]/15 hover:border-[#8A7410]/40 text-[#0A1233]'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/25 text-white/90'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <ReciterAvatar
                          reciter={reciter}
                          size="md"
                          isActive={isSelected}
                          isPlaying={isSelected && isPlaying}
                          isLight={isLight}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`font-semibold text-xs sm:text-sm truncate ${
                                isLight ? 'text-[#0A1233]' : 'text-white'
                              }`}
                            >
                              {reciter.name}
                            </h4>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                                isLight
                                  ? 'bg-[#8A7410]/10 border-[#8A7410]/25 text-[#8A7410]'
                                  : 'bg-[#DBC66E]/20 border-[#DBC66E]/30 text-[#DBC66E]'
                              }`}
                            >
                              {reciter.style}
                            </span>
                          </div>
                          <p
                            className={`text-[11px] mt-0.5 truncate ${
                              isLight ? 'text-[#5E657D]' : 'text-white/60'
                            }`}
                          >
                            {reciter.subname}
                          </p>
                        </div>
                      </div>

                      <div className="pl-2 shrink-0">
                        {isSelected && (
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                              isLight
                                ? 'bg-[#8A7410] text-white'
                                : 'bg-[#DBC66E] text-black font-bold'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          SETTINGS MODAL
          ========================================================================= */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl backdrop-blur-2xl border ${
                isLight
                  ? 'bg-[#FAF8F3]/95 border-[#8A7410]/25 text-[#0A1233]'
                  : 'bg-[#0B132B]/95 border-white/20 text-white'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-2 border-b ${
                  isLight ? 'border-[#8A7410]/20' : 'border-white/10'
                }`}
              >
                <h3 className={`font-semibold text-sm ${isLight ? 'text-[#0A1233]' : 'text-white'}`}>
                  {language === 'uz' ? "O'qish sozlamalari" : 'Reading Settings'}
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition active:scale-95 ${
                    isLight
                      ? 'bg-black/5 hover:bg-black/10 border-black/10 text-black/70'
                      : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/80'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Arabic Font Size */}
              <div className="space-y-1.5">
                <div
                  className={`flex justify-between text-xs ${
                    isLight ? 'text-[#5E657D]' : 'text-white/70'
                  }`}
                >
                  <span>{language === 'uz' ? "Arabcha matn o'lchami" : 'Arabic Font Size'}</span>
                  <span className={`font-bold ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`}>
                    {fontSize}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="44"
                  step="2"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-[#DBC66E]"
                />
              </div>

              {/* Translation Font Size */}
              <div className="space-y-1.5">
                <div
                  className={`flex justify-between text-xs ${
                    isLight ? 'text-[#5E657D]' : 'text-white/70'
                  }`}
                >
                  <span>{language === 'uz' ? "Tarjima o'lchami" : 'Translation Font Size'}</span>
                  <span className={`font-bold ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`}>
                    {translationFontSize}
                  </span>
                </div>
                <input
                  type="range"
                  min="13"
                  max="24"
                  step="1"
                  value={translationFontSize}
                  onChange={(e) => setTranslationFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-[#DBC66E]"
                />
              </div>

              {/* Show Translation Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className={`text-xs ${isLight ? 'text-[#0A1233]' : 'text-white/80'}`}>
                  {language === 'uz' ? "Tarjimani ko'rsatish" : 'Show Translation'}
                </span>
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`w-11 h-6 rounded-full transition p-1 ${
                    showTranslation
                      ? isLight
                        ? 'bg-[#8A7410]'
                        : 'bg-[#DBC66E]'
                      : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition transform ${
                      showTranslation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Auto Play Next Ayah Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className={`text-xs ${isLight ? 'text-[#0A1233]' : 'text-white/80'}`}>
                  {language === 'uz' ? "Keyingi oyatga avtomatik o'tish" : 'Auto Play Next Ayah'}
                </span>
                <button
                  onClick={() => setIsAutoPlayNext(!isAutoPlayNext)}
                  className={`w-11 h-6 rounded-full transition p-1 ${
                    isAutoPlayNext
                      ? isLight
                        ? 'bg-[#8A7410]'
                        : 'bg-[#DBC66E]'
                      : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition transform ${
                      isAutoPlayNext ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs active:scale-95 transition shadow-md ${
                  isLight
                    ? 'bg-[#8A7410] text-white'
                    : 'bg-[#DBC66E] text-black'
                }`}
              >
                {language === 'uz' ? 'Tayyor' : 'Done'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuranReaderModal;
