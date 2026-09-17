import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Play,
  Search,
  Bookmark,
  BookmarkCheck,
  Share2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Tv,
  Smartphone,
  BookOpen,
  Compass,
  CheckCircle2,
  Layers,
  Eye,
  Youtube,
  GraduationCap,
  Flame,
  Plus,
  Heart,
  RotateCcw,
  Check,
  Edit3,
  SlidersHorizontal,
  Smile,
  ListOrdered,
  FolderHeart,
  Radio,
  Video,
  Globe
} from 'lucide-react';
import { AcademyChannel, AcademyVideo } from '../types';
import { ACADEMY_CHANNELS, ACADEMY_VIDEOS, ALL_ACADEMY_VIDEOS } from '../data/academyData';
import { useTranslation } from '../i18n/LanguageContext';
import { soundManager } from '../utils/soundEffects';

interface AcademyModalProps {
  onClose: () => void;
  onOpenSakinAiWithQuery?: (prompt: string) => void;
}

type OrientationFilter = 'all' | 'vertical' | 'horizontal';
type CategoryFilter = 'all' | 'for_you' | 'channels_stream' | 'series' | 'shorts' | 'prayer' | 'guidance' | 'quran_science';
type SpiritualMood = 'all' | 'calm' | 'prayer' | 'knowledge' | 'repentance' | 'motivation';

interface ActivePlaylistEmbed {
  title: string;
  channelName: string;
  playlistId?: string;
  searchQuery?: string;
  description: string;
}

const LANGUAGES_LIST = [
  { code: 'all', name: 'Barcha Tillar', flag: '🌐' },
  { code: 'uz', name: 'O‘zbekcha', flag: '🇺🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

// Helper Component for Robust YouTube Thumbnail Fallbacks (Starting at 1080p / 720p HD)
const ThumbnailImage: React.FC<{
  youtubeId: string;
  alt: string;
  className?: string;
}> = ({ youtubeId, alt, className = '' }) => {
  const [failedCount, setFailedCount] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);

  const sources = useMemo(
    () => [
      `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${youtubeId}/hq720.jpg`,
      `https://i.ytimg.com/vi/${youtubeId}/sddefault.jpg`,
      `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${youtubeId}/0.jpg`,
    ],
    [youtubeId]
  );

  const handleError = () => {
    if (failedCount < sources.length - 1) {
      setFailedCount((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-amber-950/40 flex flex-col items-center justify-center p-3 text-center border border-neutral-800 ${className}`}>
        <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mb-1.5 border border-red-500/30">
          <Youtube className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold text-neutral-300 line-clamp-2 leading-tight">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={sources[failedCount]}
      alt={alt}
      onError={handleError}
      className={className}
      loading="lazy"
    />
  );
};

export const AcademyModal: React.FC<AcademyModalProps> = ({
  onClose,
  onOpenSakinAiWithQuery,
}) => {
  const { language } = useTranslation();

  // Active view filters
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    const availableLangs = ['uz', 'en', 'ru', 'ar', 'id', 'ur', 'bn', 'fr', 'es'];
    return availableLangs.includes(language) ? language : 'all';
  });

  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<CategoryFilter>('for_you');
  const [orientationFilter, setOrientationFilter] = useState<OrientationFilter>('all');
  const [selectedChannelId, setSelectedChannelId] = useState<string | 'all'>('all');
  const [selectedSeries, setSelectedSeries] = useState<string | 'all'>('all');
  const [selectedMood, setSelectedMood] = useState<SpiritualMood>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [showWatchedOnly, setShowWatchedOnly] = useState<boolean>(false);

  // Custom User-Added Videos from localStorage
  const [customVideos, setCustomVideos] = useState<AcademyVideo[]>(() => {
    try {
      const stored = localStorage.getItem('sakinward_custom_academy_videos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Saved bookmarks in localStorage
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sakinward_saved_academy_videos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Watched / Completed video IDs in localStorage
  const [watchedVideoIds, setWatchedVideoIds] = useState<string[]>(() => {
    try {
      const watched = localStorage.getItem('sakinward_watched_academy_videos');
      return watched ? JSON.parse(watched) : [];
    } catch {
      return [];
    }
  });

  // User Notes per video
  const [userNotes, setUserNotes] = useState<Record<string, string>>(() => {
    try {
      const notes = localStorage.getItem('sakinward_academy_user_notes');
      return notes ? JSON.parse(notes) : {};
    } catch {
      return {};
    }
  });

  // Active individual video
  const [activeVideo, setActiveVideo] = useState<AcademyVideo | null>(null);
  // Active Playlist / Stream embed
  const [activePlaylistEmbed, setActivePlaylistEmbed] = useState<ActivePlaylistEmbed | null>(null);
  // Sakin AI Takeaways drawer
  const [aiSummaryVideo, setAiSummaryVideo] = useState<AcademyVideo | null>(null);
  // Toast state
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [activeNoteText, setActiveNoteText] = useState<string>('');

  // Debounce lock for wheel scroll in Shorts mode
  const wheelLockRef = useRef<boolean>(false);

  // Touch coordinates for mobile swipe-to-scroll navigation
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  // Lock background scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Sync active note when activeVideo changes
  useEffect(() => {
    if (activeVideo) {
      setActiveNoteText(userNotes[activeVideo.id] || '');
      markAsWatched(activeVideo.id);
    }
  }, [activeVideo]);

  // Pagination for smooth performance
  const [visibleCount, setVisibleCount] = useState<number>(36);

  useEffect(() => {
    setVisibleCount(36);
  }, [
    selectedLanguage,
    selectedChannelId,
    selectedSeries,
    selectedMood,
    orientationFilter,
    activeTab,
    searchQuery,
    showSavedOnly,
    showWatchedOnly,
  ]);

  // Live YouTube Multi-Channel Auto-Sync (Server Background Engine)
  const [liveVideos, setLiveVideos] = useState<AcademyVideo[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveCatalog = async () => {
      try {
        const res = await fetch('/api/youtube/live-catalog');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && isMounted) {
            setLiveVideos(data.items);
          }
        }
      } catch {}
    };

    fetchLiveCatalog();
    const timer = setInterval(fetchLiveCatalog, 2 * 60 * 1000); // 2 min polling
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Channel Avatar Lookup Map
  const channelAvatarMap = useMemo(() => {
    const map: Record<string, string> = {
      'towards_eternity_uz': 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=150&auto=format&fit=crop&q=80',
      'towards_eternity_en': 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=150&auto=format&fit=crop&q=80',
      'sajda_app_official': 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=150&auto=format&fit=crop&q=80',
      'towards_eternity_ru': 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=150&auto=format&fit=crop&q=80',
      'towards_eternity_ar': 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=150&auto=format&fit=crop&q=80',
    };
    ACADEMY_CHANNELS.forEach((ch) => {
      if (ch.id) map[ch.id] = ch.avatarUrl;
      if (ch.name) map[ch.name] = ch.avatarUrl;
      if (ch.handle) map[ch.handle] = ch.avatarUrl;
    });
    return map;
  }, []);

  const getChannelAvatar = useCallback((video: AcademyVideo) => {
    if (video.channelId && channelAvatarMap[video.channelId]) {
      return channelAvatarMap[video.channelId];
    }
    if (video.channelName && channelAvatarMap[video.channelName]) {
      return channelAvatarMap[video.channelName];
    }
    return 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=150&auto=format&fit=crop&q=80';
  }, [channelAvatarMap]);

  // Combine custom, live synced, and indexed catalog
  const allVideos = useMemo(() => {
    return [...liveVideos, ...customVideos, ...ALL_ACADEMY_VIDEOS];
  }, [liveVideos, customVideos]);

  // Toggle bookmark
  const toggleSaveVideo = (videoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playBeadClick();
    setSavedVideoIds((prev) => {
      const next = prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId];
      localStorage.setItem('sakinward_saved_academy_videos', JSON.stringify(next));
      return next;
    });
  };

  // Toggle watched status
  const toggleWatchStatus = (videoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playBeadClick();
    setWatchedVideoIds((prev) => {
      const next = prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId];
      localStorage.setItem('sakinward_watched_academy_videos', JSON.stringify(next));
      return next;
    });
  };

  const markAsWatched = (videoId: string) => {
    setWatchedVideoIds((prev) => {
      if (prev.includes(videoId)) return prev;
      const next = [...prev, videoId];
      localStorage.setItem('sakinward_watched_academy_videos', JSON.stringify(next));
      return next;
    });
  };

  // Save note
  const handleSaveNote = () => {
    if (!activeVideo) return;
    soundManager.playBeadClick();
    setUserNotes((prev) => {
      const next = { ...prev, [activeVideo.id]: activeNoteText };
      localStorage.setItem('sakinward_academy_user_notes', JSON.stringify(next));
      return next;
    });
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  // Filtered channels
  const filteredChannels = useMemo(() => {
    if (selectedLanguage === 'all') return ACADEMY_CHANNELS;
    return ACADEMY_CHANNELS.filter(
      (c) => c.language === selectedLanguage || c.id === 'sajda_app_official'
    );
  }, [selectedLanguage]);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return allVideos.filter((video) => {
      if (showSavedOnly && !savedVideoIds.includes(video.id)) {
        return false;
      }
      if (showWatchedOnly && !watchedVideoIds.includes(video.id)) {
        return false;
      }
      if (
        selectedLanguage !== 'all' &&
        video.language !== selectedLanguage &&
        video.channelId !== 'sajda_app_official' &&
        !video.customAdded
      ) {
        return false;
      }
      if (selectedChannelId !== 'all') {
        if (selectedChannelId === 'towards_eternity') {
          if (!video.channelId?.startsWith('towards_eternity') && !video.channelName?.toLowerCase().includes('towards eternity')) {
            return false;
          }
        } else if (
          video.channelId !== selectedChannelId &&
          video.channelHandle !== selectedChannelId &&
          !video.channelName?.toLowerCase().includes(selectedChannelId.toLowerCase().replace('@', ''))
        ) {
          return false;
        }
      }
      if (selectedSeries !== 'all' && video.series !== selectedSeries) {
        return false;
      }
      if (selectedMood !== 'all' && (!video.spiritualMood || !video.spiritualMood.includes(selectedMood))) {
        return false;
      }
      if (orientationFilter !== 'all' && video.orientation !== orientationFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = video.title.toLowerCase().includes(q);
        const matchesDesc = (video.description || '').toLowerCase().includes(q);
        const matchesChannel = (video.channelName || '').toLowerCase().includes(q);
        const matchesSeries = video.series ? video.series.toLowerCase().includes(q) : false;
        const matchesTags = video.tags ? video.tags.some((t) => t.toLowerCase().includes(q)) : false;
        if (!matchesTitle && !matchesDesc && !matchesChannel && !matchesSeries && !matchesTags) {
          return false;
        }
      }

      if (activeTab === 'for_you') {
        return true;
      } else if (activeTab === 'series') {
        return !!video.series;
      } else if (activeTab === 'channels_stream') {
        return true;
      } else if (activeTab !== 'all' && video.category !== activeTab) {
        return false;
      }

      return true;
    });
  }, [
    allVideos,
    selectedLanguage,
    selectedChannelId,
    selectedSeries,
    selectedMood,
    orientationFilter,
    activeTab,
    searchQuery,
    showSavedOnly,
    showWatchedOnly,
    savedVideoIds,
    watchedVideoIds,
  ]);

  // Vertical (Shorts) and Horizontal Videos
  const filteredVerticalVideos = useMemo(() => {
    return filteredVideos.filter((v) => v.orientation === 'vertical');
  }, [filteredVideos]);

  const filteredHorizontalVideos = useMemo(() => {
    return filteredVideos.filter((v) => v.orientation === 'horizontal');
  }, [filteredVideos]);

  const displayedVerticalVideos = useMemo(() => {
    return filteredVerticalVideos.slice(0, visibleCount);
  }, [filteredVerticalVideos, visibleCount]);

  const displayedHorizontalVideos = useMemo(() => {
    return filteredHorizontalVideos.slice(0, visibleCount);
  }, [filteredHorizontalVideos, visibleCount]);

  // Robust Sharing with Clipboard Fallback & Instant Feedback
  const handleShareVideo = (video: AcademyVideo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playBeadClick();
    const videoUrl = video.youtubeUrl || `https://www.youtube.com/watch?v=${video.youtubeId}`;

    let copied = false;

    // 1. Perform synchronous document copy immediately while user gesture is active
    try {
      const textArea = document.createElement('textarea');
      textArea.value = videoUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      copied = document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch {
      copied = false;
    }

    // 2. Try modern async clipboard API
    if (!copied && navigator.clipboard) {
      navigator.clipboard.writeText(videoUrl).then(() => {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2500);
      }).catch(() => {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2500);
      });
    } else {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }

    // 3. Optional native Web Share API
    if (navigator.share) {
      navigator
        .share({
          title: video.title,
          text: `${video.title} — Sakin Akademiya`,
          url: videoUrl,
        })
        .catch(() => {});
    }
  };

  // Next / Prev Video Index
  const currentVideoIndex = useMemo(() => {
    if (!activeVideo) return -1;
    return filteredVideos.findIndex((v) => v.id === activeVideo.id);
  }, [activeVideo, filteredVideos]);

  const handleNextVideo = () => {
    if (currentVideoIndex < filteredVideos.length - 1) {
      soundManager.playBeadClick();
      setActiveVideo(filteredVideos[currentVideoIndex + 1]);
    }
  };

  const handlePrevVideo = () => {
    if (currentVideoIndex > 0) {
      soundManager.playBeadClick();
      setActiveVideo(filteredVideos[currentVideoIndex - 1]);
    }
  };

  // Wheel scrolling handler for YouTube Shorts Player
  const handleShortsWheel = (e: React.WheelEvent) => {
    if (!activeVideo || activeVideo.orientation !== 'vertical' || wheelLockRef.current) return;
    wheelLockRef.current = true;
    setTimeout(() => {
      wheelLockRef.current = false;
    }, 450);

    if (e.deltaY > 20) {
      handleNextVideo();
    } else if (e.deltaY < -20) {
      handlePrevVideo();
    }
  };

  // Touch Swiping handlers for seamless mobile/tablet video navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!activeVideo) return;

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;

    const deltaY = touchEndY - touchStartY.current;
    const deltaX = touchEndX - touchStartX.current;

    const threshold = 45; // min swipe distance in px to register a swipe

    // Determine swipe axis based on which delta is larger
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      // Vertical swipe: Up/Down
      if (Math.abs(deltaY) > threshold) {
        if (deltaY < 0) {
          // Swiped UP -> Next video
          handleNextVideo();
        } else {
          // Swiped DOWN -> Previous video
          handlePrevVideo();
        }
      }
    } else {
      // Horizontal swipe: Left/Right
      if (Math.abs(deltaX) > threshold) {
        if (deltaX < 0) {
          // Swiped LEFT -> Next video
          handleNextVideo();
        } else {
          // Swiped RIGHT -> Previous video
          handlePrevVideo();
        }
      }
    }
  };

  const selectedLangObj = LANGUAGES_LIST.find((l) => l.code === selectedLanguage) || LANGUAGES_LIST[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-0 sm:p-4 select-none">
      <div
        className="w-full h-full sm:h-[95vh] sm:max-w-6xl sm:rounded-[36px] flex flex-col shadow-2xl overflow-hidden border sm:border-[var(--nur-border-glass)]"
        style={{
          background: 'var(--nur-card-bg)',
          color: 'var(--nur-color-on-bg)',
        }}
      >
        {/* ========================================================================= */}
        {/* 1. YOUTUBE 1:1 TOP HEADER & SEARCH BAR */}
        {/* ========================================================================= */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-neutral-800 bg-[#0f0f10] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center justify-between w-full sm:w-auto shrink-0 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-7 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-black flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <span className="font-brand-display text-base sm:text-xl font-black tracking-tight text-white">
                Sakin<span className="text-amber-400"> Academy</span>
              </span>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={() => {
                  soundManager.playBeadClick();
                  setIsLangModalOpen(true);
                }}
                className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-bold text-amber-400 flex items-center gap-1.5"
              >
                <span>{selectedLangObj.flag}</span>
                <span>{selectedLangObj.code.toUpperCase()}</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center YouTube 1:1 Search Bar */}
          <div className="w-full sm:max-w-xl mx-0 sm:mx-4 relative">
            <div className="flex items-center w-full rounded-full bg-neutral-900 border border-neutral-800 focus-within:border-amber-400/80 transition-all overflow-hidden shadow-inner">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="YouTube dan darslar, siyrat, suralar yoki mavzulardan qidirish..."
                className="w-full px-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="px-4 py-2 bg-neutral-800 text-neutral-300 border-l border-neutral-800 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {/* Motion Language Selector Button */}
            <button
              onClick={() => {
                soundManager.playBeadClick();
                setIsLangModalOpen(true);
              }}
              className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-neutral-900 text-xs text-neutral-200 border border-neutral-800 hover:border-neutral-700 transition font-semibold cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{selectedLangObj.flag} {selectedLangObj.name}</span>
            </button>

            {/* Close Button */}
            <button
              id="btn-close-academy"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white transition cursor-pointer"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SINGLE YOUTUBE 1:1 HORIZONTAL FILTER CHIP BAR */}
        {/* ========================================================================= */}
        <div className="px-4 py-2.5 border-b border-neutral-800/80 bg-[#0f0f10] overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              soundManager.playBeadClick();
              setOrientationFilter('all');
              setActiveTab('for_you');
              setSelectedChannelId('all');
              setSelectedMood('all');
              setShowSavedOnly(false);
              setShowWatchedOnly(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              orientationFilter === 'all' &&
              activeTab === 'for_you' &&
              selectedChannelId === 'all' &&
              selectedMood === 'all' &&
              !showSavedOnly &&
              !showWatchedOnly
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/50'
            }`}
          >
            Barchasi
          </button>

          <button
            onClick={() => {
              soundManager.playBeadClick();
              setOrientationFilter(orientationFilter === 'vertical' ? 'all' : 'vertical');
              setShowSavedOnly(false);
              setShowWatchedOnly(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              orientationFilter === 'vertical'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Shorts (9:16)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBeadClick();
              setOrientationFilter(orientationFilter === 'horizontal' ? 'all' : 'horizontal');
              setShowSavedOnly(false);
              setShowWatchedOnly(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              orientationFilter === 'horizontal'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/50'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Uzun Darslar (16:9)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBeadClick();
              setSelectedChannelId(selectedChannelId === 'towards_eternity' ? 'all' : 'towards_eternity');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              selectedChannelId === 'towards_eternity'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/50'
            }`}
          >
            Towards Eternity
          </button>

          <button
            onClick={() => {
              soundManager.playBeadClick();
              setSelectedChannelId(selectedChannelId === 'sajda_app_official' ? 'all' : 'sajda_app_official');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              selectedChannelId === 'sajda_app_official'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/50'
            }`}
          >
            Sajda Media
          </button>

          <button
            onClick={() => {
              soundManager.playBeadClick();
              setActiveTab(activeTab === 'series' ? 'for_you' : 'series');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              activeTab === 'series'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/50'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Silsilalar & Kurslar</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBeadClick();
              setActiveTab(activeTab === 'prayer' ? 'for_you' : 'prayer');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              activeTab === 'prayer'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Namoz & Tahorat</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBeadClick();
              setActiveTab(activeTab === 'quran_science' ? 'for_you' : 'quran_science');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              activeTab === 'quran_science'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Qur'on Ilmlari</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBeadClick();
              setSelectedMood(selectedMood === 'calm' ? 'all' : 'calm');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              selectedMood === 'calm'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/50'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Qalb Taskini</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBeadClick();
              setShowSavedOnly(!showSavedOnly);
              setShowWatchedOnly(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              showSavedOnly
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saqlanganlar ({savedVideoIds.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBeadClick();
              setShowWatchedOnly(!showWatchedOnly);
              setShowSavedOnly(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              showWatchedOnly
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ko‘rilganlar ({watchedVideoIds.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN CONTENT AREA */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ======================================================================= */}
          {/* TAB 1: 10 RASMIY KANAL & DIRECT STREAM HUB */}
          {/* ======================================================================= */}
          {activeTab === 'channels_stream' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-500">
                      To‘liq Jonli Oqim & Barcha Videolar
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold">
                    10 Rasmiy YouTube Kanalining Barcha Videolari
                  </h2>
                  <p className="text-xs opacity-75 max-w-2xl">
                    Har bir kanalning to‘liq arxivini to‘g‘ridan-to‘g‘ri ilova ichida tomosha qiling.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className="p-5 rounded-3xl border border-[var(--nur-border-glass)] space-y-4 shadow-lg hover:border-amber-500/40 transition-all flex flex-col justify-between"
                    style={{ background: 'var(--nur-card-bg)' }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={channel.avatarUrl}
                            alt={channel.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-amber-500/30 shadow-md"
                          />
                          <div>
                            <h3 className="text-sm sm:text-base font-bold leading-tight">
                              {channel.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs opacity-75 mt-0.5">
                              <span className="font-semibold text-amber-500">{channel.subscribers} obunachi</span>
                              <span>•</span>
                              <span className="font-bold text-emerald-400">{channel.videoCount}</span>
                            </div>
                          </div>
                        </div>

                        <a
                          href={channel.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white flex items-center justify-center transition"
                          title="YouTube da ochish"
                        >
                          <Youtube className="w-4 h-4" />
                        </a>
                      </div>

                      <p className="text-xs opacity-75 leading-relaxed">
                        {channel.description}
                      </p>

                      {channel.officialPlaylists && channel.officialPlaylists.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] font-bold opacity-80 flex items-center gap-1 text-amber-500">
                            <ListOrdered className="w-3.5 h-3.5" />
                            <span>Rasmiy Silsilalar & To‘plamlar:</span>
                          </span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {channel.officialPlaylists.map((pl) => (
                              <button
                                key={pl.id}
                                onClick={() => {
                                  soundManager.playBeadClick();
                                  setActivePlaylistEmbed({
                                    title: pl.title,
                                    channelName: channel.name,
                                    playlistId: pl.playlistId,
                                    description: pl.description,
                                  });
                                }}
                                className="w-full text-left p-2.5 rounded-xl bg-black/20 hover:bg-amber-500/15 border border-[var(--nur-border-glass)] hover:border-amber-500/30 transition flex items-center justify-between gap-2 cursor-pointer group"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-black transition">
                                    <Play className="w-3 h-3 fill-current ml-0.5" />
                                  </div>
                                  <div className="truncate">
                                    <span className="text-xs font-bold block truncate">{pl.title}</span>
                                    <span className="text-[10px] opacity-65 block truncate">{pl.description}</span>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/40 text-amber-400 shrink-0 font-mono">
                                  {pl.videoCount}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[var(--nur-border-glass)] flex items-center justify-between">
                      <button
                        onClick={() => {
                          soundManager.playBeadClick();
                          setActivePlaylistEmbed({
                            title: `${channel.name} — Barcha Videolar Oqimi`,
                            channelName: channel.name,
                            searchQuery: channel.name,
                            description: `${channel.name} kanalining barcha videolari to‘g‘ridan-to‘g‘ri oqimda.`,
                          });
                        }}
                        className="w-full py-2.5 rounded-2xl bg-amber-500 text-black font-bold text-xs flex items-center justify-center gap-2 hover:brightness-105 shadow-md cursor-pointer"
                      >
                        <Radio className="w-4 h-4" />
                        <span>Barcha Videolarni Ko‘rish</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* GENERAL VIDEO FEED */}
          {/* ======================================================================= */}
          {activeTab !== 'channels_stream' && (
            <>
              {/* Empty State */}
              {filteredVideos.length === 0 && (
                <div className="py-16 text-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center shadow-inner">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold">Hech qanday dars topilmadi</h3>
                  <p className="text-xs opacity-75 max-w-sm mx-auto">
                    Qidiruv so‘zini o‘zgartiring yoki filtrlarni tozalang.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedLanguage('all');
                      setActiveTab('for_you');
                      setOrientationFilter('all');
                      setSelectedChannelId('all');
                      setSelectedSeries('all');
                      setSelectedMood('all');
                      setShowSavedOnly(false);
                      setShowWatchedOnly(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:opacity-90 cursor-pointer mt-2"
                  >
                    Filtrlarni tozalash
                  </button>
                </div>
              )}

              {/* Active Channel Filter Banner */}
              {selectedChannelId !== 'all' && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      📌 Saralangan kanal darslari: <strong>{ACADEMY_CHANNELS.find(c => c.id === selectedChannelId || c.handle === selectedChannelId)?.name || selectedChannelId}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playBeadClick();
                      setSelectedChannelId('all');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white transition cursor-pointer flex items-center gap-1"
                  >
                    <span>Tozalash</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* VERTICAL SHORTS FEED (9:16) */}
              {filteredVerticalVideos.length > 0 &&
                orientationFilter !== 'horizontal' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {displayedVerticalVideos.map((video) => {
                        const isSaved = savedVideoIds.includes(video.id);
                        const isWatched = watchedVideoIds.includes(video.id);
                        return (
                          <div
                            key={video.id}
                            onClick={() => {
                              soundManager.playBeadClick();
                              setActiveVideo(video);
                            }}
                            className="group relative rounded-2xl overflow-hidden border border-neutral-800 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between bg-neutral-900"
                            style={{
                              aspectRatio: '9/16',
                            }}
                          >
                            <ThumbnailImage
                              youtubeId={video.youtubeId}
                              alt={video.title}
                              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-300 pointer-events-none"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/60 pointer-events-none" />

                            {/* Top Badges & Actions */}
                            <div className="p-2.5 flex items-center justify-between relative z-10">
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-black/80 text-amber-400 backdrop-blur-sm border border-amber-400/30">
                                {video.duration || '0:60'}
                              </span>
                              <div className="flex items-center gap-1">
                                {isWatched && (
                                  <span className="w-6 h-6 rounded-full bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center text-black shadow-sm" title="O‘rganilgan">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </span>
                                )}
                                <button
                                  onClick={(e) => toggleSaveVideo(video.id, e)}
                                  className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:text-amber-400 transition cursor-pointer"
                                  aria-label="Saqlash"
                                >
                                  {isSaved ? (
                                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                                  ) : (
                                    <Bookmark className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Center Play Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-12 h-12 rounded-full bg-amber-500/90 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-amber-400 transition-all">
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              </div>
                            </div>

                            {/* Bottom Info Overlay */}
                            <div className="p-3 relative z-10 bg-gradient-to-t from-black via-black/90 to-transparent space-y-1.5 text-white pointer-events-auto">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  soundManager.playBeadClick();
                                  if (video.channelId) setSelectedChannelId(video.channelId);
                                  setActiveTab('for_you');
                                }}
                                className="flex items-center gap-1.5 cursor-pointer hover:text-amber-400 transition-colors group/ch"
                              >
                                <img
                                  src={getChannelAvatar(video)}
                                  alt={video.channelName}
                                  className="w-5 h-5 rounded-full object-cover border border-amber-500/40 shadow-sm shrink-0"
                                />
                                <span className="truncate font-semibold text-[11px] text-neutral-300 group-hover/ch:text-amber-400">{video.channelName}</span>
                                <span className="text-[10px] text-neutral-500 font-mono">• {video.views}</span>
                              </div>
                              <h3 className="text-xs font-bold line-clamp-2 leading-tight">
                                {video.title}
                              </h3>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* HORIZONTAL DEEP LESSONS (16:9) */}
              {filteredHorizontalVideos.length > 0 &&
                orientationFilter !== 'vertical' && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-7">
                      {displayedHorizontalVideos.map((video) => {
                        const isSaved = savedVideoIds.includes(video.id);
                        const isWatched = watchedVideoIds.includes(video.id);

                        return (
                          <div
                            key={video.id}
                            onClick={() => {
                              soundManager.playBeadClick();
                              setActiveVideo(video);
                            }}
                            className="group flex flex-col justify-between cursor-pointer space-y-3"
                          >
                            {/* 16:9 Thumbnail Box */}
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 transition-all shadow-md">
                              <ThumbnailImage
                                youtubeId={video.youtubeId}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors pointer-events-none" />

                              {/* Duration Badge */}
                              <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[11px] font-bold z-10 shadow">
                                {video.duration}
                              </span>

                              {isWatched && (
                                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-emerald-500 text-black font-bold text-[10px] z-10 flex items-center gap-1 shadow">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Ko‘rilgan</span>
                                </span>
                              )}

                              {/* Play Hover Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <div className="w-12 h-12 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                              </div>
                            </div>

                            {/* YouTube 1:1 Info Section below Thumbnail */}
                            <div className="flex items-start gap-3">
                              {/* Channel Avatar */}
                              <img
                                src={getChannelAvatar(video)}
                                alt={video.channelName}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  soundManager.playBeadClick();
                                  if (video.channelId) setSelectedChannelId(video.channelId);
                                  setActiveTab('for_you');
                                }}
                                className="w-9 h-9 rounded-full object-cover border border-amber-500/40 shadow-md shrink-0 mt-0.5 hover:scale-110 transition cursor-pointer"
                                title={`${video.channelName} kanalining barcha darslarini saralash`}
                              />

                              {/* Metadata Column */}
                              <div className="flex-1 min-w-0 space-y-1">
                                <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                                  {video.title}
                                </h3>

                                <div className="text-xs text-neutral-400 flex items-center gap-1">
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      soundManager.playBeadClick();
                                      if (video.channelId) setSelectedChannelId(video.channelId);
                                      setActiveTab('for_you');
                                    }}
                                    className="truncate hover:text-amber-400 hover:underline transition-colors cursor-pointer font-semibold"
                                  >
                                    {video.channelName}
                                  </span>
                                </div>

                                <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-2">
                                  <span>{video.views} ko‘rilgan</span>
                                  <span>•</span>
                                  <span className="text-amber-400/80 font-semibold">{video.series || 'Dars'}</span>
                                </div>
                              </div>

                              {/* Quick Bookmark / Save Action */}
                              <button
                                onClick={(e) => toggleSaveVideo(video.id, e)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 transition cursor-pointer shrink-0"
                                title="Saqlash"
                              >
                                {isSaved ? (
                                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                                ) : (
                                  <Bookmark className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* PAGINATION / LOAD MORE BUTTON */}
              {(filteredVerticalVideos.length > visibleCount || filteredHorizontalVideos.length > visibleCount) && (
                <div className="pt-6 pb-4 text-center">
                  <button
                    onClick={() => {
                      soundManager.playBeadClick();
                      setVisibleCount((prev) => prev + 36);
                    }}
                    className="px-6 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 font-bold text-xs shadow-lg transition-all cursor-pointer"
                  >
                    Yana Darslarni Yuklash...
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. MOTION LANGUAGE SELECTOR MODAL (ZOOM IN / ZOOM OUT) */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isLangModalOpen && (
            <div
              className="fixed inset-0 z-80 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
              onClick={() => setIsLangModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl border border-neutral-800 bg-[#141416] text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold text-sm">
                      🌐
                    </div>
                    <h3 className="text-sm font-bold">Ilova Tili / Select Language</h3>
                  </div>
                  <button
                    onClick={() => setIsLangModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-1.5 max-h-[50vh] overflow-y-auto no-scrollbar py-1">
                  {LANGUAGES_LIST.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        soundManager.playBeadClick();
                        setSelectedLanguage(lang.code);
                        setSelectedChannelId('all');
                        setIsLangModalOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedLanguage === lang.code
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                          : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      {selectedLanguage === lang.code && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* 5. YOUTUBE SHORTS 1:1 DEDICATED PLAYER OR 16:9 PLAYER */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {activeVideo && (
            <div
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-2 sm:p-4 cursor-grab active:cursor-grabbing select-none"
              onClick={() => setActiveVideo(null)}
              onWheel={handleShortsWheel}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="flex items-center justify-center max-w-full max-h-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* YOUTUBE SHORTS TALL DESKTOP FORMAT */}
                {activeVideo.orientation === 'vertical' ? (
                  <div className="relative flex items-center justify-center h-[88vh] sm:h-[92vh] max-h-screen">
                    {/* Main Tall 9:16 Video Frame */}
                    <div className="relative h-full aspect-[9/16] bg-black rounded-[28px] sm:rounded-[36px] overflow-hidden border border-neutral-800 shadow-2xl flex flex-col justify-between">
                      {/* Floating Top Badge */}
                      <div className="absolute top-3 left-3 z-20 pointer-events-none">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold border border-white/10 text-white">
                          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                          <span>Shorts</span>
                        </div>
                      </div>

                      {/* Vertical 9:16 iframe Player */}
                      <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&playsinline=1&vq=hd1080&hd=1`}
                          title={activeVideo.title}
                          className="w-full h-full border-0 pointer-events-auto"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>

                      {/* Bottom Info Overlay */}
                      <div className="absolute left-0 right-0 bottom-0 p-4 z-20 bg-gradient-to-t from-black via-black/80 to-transparent space-y-1.5 pointer-events-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center text-xs">
                            {activeVideo.channelName.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-white">{activeVideo.channelName}</span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                          {activeVideo.title}
                        </h3>
                      </div>
                    </div>

                    {/* OUTSIDE RIGHT ACTION BUTTONS (Positioned next to video border) */}
                    <div className="flex flex-col items-center gap-3.5 ml-3 sm:ml-5 shrink-0 z-30">
                      {/* Close button */}
                      <button
                        onClick={() => setActiveVideo(null)}
                        className="w-11 h-11 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition cursor-pointer shadow-xl"
                        title="Yopish"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      {/* Bookmark button */}
                      <button
                        onClick={() => toggleSaveVideo(activeVideo.id)}
                        className="flex flex-col items-center gap-1 group cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-full bg-neutral-900/90 text-white backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-amber-500 group-hover:text-black transition shadow-xl">
                          {savedVideoIds.includes(activeVideo.id) ? (
                            <BookmarkCheck className="w-5 h-5 text-amber-400 group-hover:text-black" />
                          ) : (
                            <Bookmark className="w-5 h-5" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-white drop-shadow">Saqlash</span>
                      </button>

                      {/* Share button */}
                      <button
                        onClick={(e) => handleShareVideo(activeVideo, e)}
                        className="flex flex-col items-center gap-1 group cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-full bg-neutral-900/90 text-white backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-amber-500 group-hover:text-black transition shadow-xl">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-white drop-shadow">Ulashish</span>
                      </button>

                      {/* Open in YouTube Direct Link */}
                      <a
                        href={activeVideo.youtubeUrl || `https://www.youtube.com/shorts/${activeVideo.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 group cursor-pointer"
                        title="YouTube dasturida ochish"
                      >
                        <div className="w-11 h-11 rounded-full bg-red-600 text-white backdrop-blur-md flex items-center justify-center border border-red-400/40 group-hover:bg-red-500 transition shadow-xl">
                          <Youtube className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-red-400 drop-shadow">YouTube</span>
                      </a>

                      {/* Up/Down Navigation Chevrons */}
                      <div className="flex flex-col gap-2 pt-1">
                        <button
                          onClick={handlePrevVideo}
                          disabled={currentVideoIndex <= 0}
                          className="w-10 h-10 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-white flex items-center justify-center disabled:opacity-30 border border-white/20 shadow-xl cursor-pointer transition"
                          title="Oldingi Short"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleNextVideo}
                          disabled={currentVideoIndex >= filteredVideos.length - 1}
                          className="w-10 h-10 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-white flex items-center justify-center disabled:opacity-30 border border-white/20 shadow-xl cursor-pointer transition"
                          title="Keyingi Short"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* STANDARD 16:9 HORIZONTAL VIDEO PLAYER */
                  <div className="w-full max-w-4xl rounded-[32px] flex flex-col shadow-2xl overflow-hidden border border-neutral-800 bg-[#0f0f10] text-white">
                    {/* Player Top Bar */}
                    <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between bg-black/60 shrink-0">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </div>
                        <span className="text-xs font-bold truncate">
                          {activeVideo.channelName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSaveVideo(activeVideo.id)}
                          className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 text-white hover:text-amber-400 transition cursor-pointer"
                          title="Saqlash"
                        >
                          {savedVideoIds.includes(activeVideo.id) ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={(e) => handleShareVideo(activeVideo, e)}
                          className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 text-white hover:text-amber-400 transition cursor-pointer"
                          title="Ulashish"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setActiveVideo(null)}
                          className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white transition cursor-pointer"
                          title="Yopish"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* YouTube 16:9 Frame */}
                    <div
                      className="relative w-full bg-black flex items-center justify-center overflow-hidden"
                      style={{ aspectRatio: '16/9', maxHeight: '60vh' }}
                    >
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&playsinline=1&vq=hd1080&hd=1`}
                        title={activeVideo.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>

                    {/* Player Details & Navigation */}
                    <div className="p-4 space-y-3.5">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold leading-snug">
                          {activeVideo.title}
                        </h3>
                        {activeVideo.description && (
                          <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                            {activeVideo.description}
                          </p>
                        )}
                      </div>

                      {/* Navigator & Direct YouTube Watch Link */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                        <button
                          onClick={handlePrevVideo}
                          disabled={currentVideoIndex <= 0}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold disabled:opacity-30 cursor-pointer transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Oldingi Dars</span>
                        </button>

                        <a
                          href={activeVideo.youtubeUrl || `https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold transition shadow-md"
                        >
                          <Youtube className="w-4 h-4" />
                          <span>YouTube-da ko‘rish</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>

                        <button
                          onClick={handleNextVideo}
                          disabled={currentVideoIndex >= filteredVideos.length - 1}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold disabled:opacity-30 shadow-md cursor-pointer transition"
                        >
                          <span>Keyingi Dars</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* 6. FULL CHANNEL PLAYLIST EMBED MODAL */}
        {/* ========================================================================= */}
        {activePlaylistEmbed && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 backdrop-blur-xl p-0 sm:p-4"
            onClick={() => setActivePlaylistEmbed(null)}
          >
            <div
              className="w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-[36px] flex flex-col shadow-2xl overflow-hidden border border-neutral-800 bg-[#0f0f10] text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between bg-black/40 shrink-0">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold truncate block">
                      {activePlaylistEmbed.title}
                    </span>
                    <span className="text-[10px] opacity-75 font-semibold text-amber-400">
                      {activePlaylistEmbed.channelName} • Barcha Videolar Oqimi
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActivePlaylistEmbed(null)}
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                className="relative w-full bg-black flex items-center justify-center overflow-hidden"
                style={{ aspectRatio: '16/9', maxHeight: '60vh' }}
              >
                <iframe
                  src={
                    activePlaylistEmbed.playlistId
                      ? `https://www.youtube.com/embed/videoseries?list=${activePlaylistEmbed.playlistId}&autoplay=1`
                      : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
                          activePlaylistEmbed.searchQuery || activePlaylistEmbed.title
                        )}&autoplay=1`
                  }
                  title={activePlaylistEmbed.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold">{activePlaylistEmbed.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{activePlaylistEmbed.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast */}
        {copiedToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-100 px-5 py-2.5 rounded-full bg-amber-500 text-black font-extrabold text-xs shadow-2xl border border-amber-400 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4.5 h-4.5 text-black" />
            <span>Video havolasi buferga nusxalandi!</span>
          </div>
        )}
      </div>
    </div>
  );
};
