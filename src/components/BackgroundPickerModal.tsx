import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { X, Check, Sparkles, Video, Compass, Mountain, Moon, Coffee, Landmark } from 'lucide-react';
import { DYNAMIC_BACKGROUNDS, DynamicBackgroundItem } from '../data/backgroundData';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';
import { cacheVideoInBackground } from '../services/videoCacheService';

interface BackgroundPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBgId: string;
  onSelectBackground: (bgId: string) => void;
  isLight?: boolean;
}

type CategoryType = 'all' | 'holy' | 'shader' | 'nature' | 'night' | 'cozy';

export const BackgroundPickerModal: React.FC<BackgroundPickerModalProps> = ({
  isOpen,
  onClose,
  currentBgId,
  onSelectBackground,
  isLight = false,
}) => {
  const { language, t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [hoveredBgId, setHoveredBgId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  useEffect(() => {
    const checkScreen = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // GSAP Entrance Animation on Open
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    setIsClosing(false);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.bg-picker-header',
        { y: -15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.05 }
      );
      gsap.fromTo(
        '.bg-card-item',
        { opacity: 0, y: 20, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          stagger: 0.03,
          ease: 'power3.out',
          clearProps: 'transform,opacity,scale',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isOpen]);

  // Animate grid cards on category change
  useEffect(() => {
    if (!isOpen || !gridRef.current) return;

    gsap.fromTo(
      gridRef.current.children,
      { opacity: 0, scale: 0.96, y: 15 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.025,
        ease: 'power2.out',
        clearProps: 'transform,opacity,scale',
      }
    );
  }, [selectedCategory, isOpen]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    soundManager.playBeadClick();

    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getLocalizedName = (item: DynamicBackgroundItem) => {
    if (language === 'uz') return item.name.uz;
    if (language === 'ru') return item.name.ru;
    return item.name.en;
  };

  const getLocalizedDesc = (item: DynamicBackgroundItem) => {
    if (language === 'uz') return item.description?.uz || '';
    return item.description?.en || '';
  };

  const categories = [
    {
      id: 'all' as CategoryType,
      label: t.allCategory || (language === 'ru' ? 'Все' : 'Barchasi'),
      icon: Compass,
      count: DYNAMIC_BACKGROUNDS.length,
    },
    {
      id: 'holy' as CategoryType,
      label: t.holyCategory || (language === 'ru' ? 'Святые места' : 'Muqaddas Qadamjolar'),
      icon: Landmark,
      count: DYNAMIC_BACKGROUNDS.filter((b) => b.category === 'holy').length,
    },
    {
      id: 'shader' as CategoryType,
      label: t.interactiveShader || (language === 'ru' ? 'Интерактивные' : 'Interaktiv'),
      icon: Sparkles,
      count: DYNAMIC_BACKGROUNDS.filter((b) => b.isShader).length,
    },
    {
      id: 'nature' as CategoryType,
      label: t.natureCategory || (language === 'ru' ? 'Природа' : 'Tabiat'),
      icon: Mountain,
      count: DYNAMIC_BACKGROUNDS.filter((b) => b.category === 'nature' && !b.isShader).length,
    },
    {
      id: 'night' as CategoryType,
      label: t.nightCategory || (language === 'ru' ? 'Ночь & Вечер' : 'Tun & Oqshom'),
      icon: Moon,
      count: DYNAMIC_BACKGROUNDS.filter((b) => b.category === 'night' && !b.isShader).length,
    },
    {
      id: 'cozy' as CategoryType,
      label: t.cozyCategory || (language === 'ru' ? 'Уютные' : 'Iliq & Shinam'),
      icon: Coffee,
      count: DYNAMIC_BACKGROUNDS.filter((b) => b.category === 'cozy' && !b.isShader).length,
    },
  ];

  const filteredBackgrounds = DYNAMIC_BACKGROUNDS.filter((item) => {
    if (selectedCategory === 'shader') return item.isShader;
    if (selectedCategory !== 'all') return item.category === selectedCategory && !item.isShader;
    return true;
  });

  const handleSelect = (item: DynamicBackgroundItem) => {
    soundManager.playBeadClick();
    onSelectBackground(item.id);

    const videoUrl = isMobileScreen ? item.mobile.video : item.desktop.video;
    if (videoUrl) {
      cacheVideoInBackground(videoUrl);
    }
  };

  const modalContent = (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[120] flex flex-col backdrop-blur-3xl select-none overflow-hidden ${
        isLight ? 'bg-[#FAF8F3]/98 text-[#0F172A]' : 'bg-[#060B20]/95 text-white'
      }`}
      onClick={handleClose}
    >
      {/* Top Floating Glass Header */}
      <div
        className="bg-picker-header sticky top-2 z-30 px-3 sm:px-6 max-w-5xl w-full mx-auto pt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`rounded-2xl sm:rounded-3xl backdrop-blur-2xl px-4 py-2.5 flex items-center justify-between shadow-sm border transition-colors ${
            isLight
              ? 'bg-white/95 border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-[#0F172A]'
              : 'bg-[#0A1233]/90 border-white/10 shadow-md text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold ${
                isLight ? 'bg-[#8A7410]/15 text-[#8A7410]' : 'bg-[#DBC66E]/20 text-[#DBC66E]'
              }`}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight font-serif leading-tight">
                {t.dynamicBackgrounds || (language === 'ru' ? 'Фоны и сцены' : 'Jonli Fonlar')}
              </h2>
              <p
                className={`text-[11px] sm:text-xs leading-tight font-medium ${
                  isLight ? 'text-[#64748B]' : 'text-white/60'
                }`}
              >
                {t.curated4kScenes ||
                  (language === 'ru' ? '4K видео, святые места и шейдеры' : '4K video va muqaddas maskanlar')}
              </p>
            </div>
          </div>

          <button
            id="btn-close-bg-picker"
            onClick={handleClose}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition active:scale-95 border ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 text-[#0F172A] border-[#E2E8F0]'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            }`}
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div
        className="px-3 sm:px-6 pt-3 pb-2 max-w-5xl w-full mx-auto flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundManager.playBeadClick();
                  setSelectedCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 border active:scale-95 ${
                  isSelected
                    ? isLight
                      ? 'bg-[#8A7410] text-white border-[#8A7410] shadow-sm font-extrabold'
                      : 'bg-[#DBC66E] text-[#0A1233] border-transparent shadow-md font-bold'
                    : isLight
                    ? 'bg-white text-[#475569] hover:bg-[#F1F5F9] border-[#E2E8F0] shadow-sm'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? isLight
                        ? 'bg-white/25 text-white'
                        : 'bg-[#0A1233]/20 text-[#0A1233]'
                      : isLight
                      ? 'bg-[#F1F5F9] text-[#64748B]'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wallpaper Grid */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain no-scrollbar px-3 sm:px-6 py-2 pb-24 max-w-5xl w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredBackgrounds.map((item) => {
            const isCurrent = currentBgId === item.id;
            const photoUrl = isMobileScreen ? item.mobile.photo : item.desktop.photo;
            const videoUrl = isMobileScreen ? item.mobile.video : item.desktop.video;
            const isHovered = hoveredBgId === item.id;

            return (
              <div
                key={item.id}
                id={`bg-card-${item.id}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHoveredBgId(item.id)}
                onMouseLeave={() => setHoveredBgId(null)}
                className={`bg-card-item group relative aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.97] bg-black shadow-md ${
                  isCurrent
                    ? isLight
                      ? 'ring-3 ring-[#8A7410] border-2 border-white shadow-[0_0_20px_rgba(138,116,16,0.35)]'
                      : 'ring-3 ring-[#DBC66E] border-2 border-white shadow-[0_0_20px_rgba(219,198,110,0.4)]'
                    : isLight
                    ? 'border border-[#CBD5E1] hover:border-[#8A7410]/50'
                    : 'border border-white/15 hover:border-white/40'
                }`}
                style={{ willChange: 'transform' }}
              >
                {/* Background Media */}
                {isHovered && videoUrl && !isMobileScreen ? (
                  <video
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <img
                    src={photoUrl}
                    alt={getLocalizedName(item)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    loading="lazy"
                  />
                )}

                {/* Dark Gradient Overlay for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                {/* Top Badge Tag */}
                <div className="absolute top-2 left-2 flex items-center gap-1 z-10 pointer-events-none">
                  {item.isShader ? (
                    <span className="text-[9px] font-bold text-white bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/20 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#DBC66E]" /> Shader
                    </span>
                  ) : item.category === 'holy' ? (
                    <span className="text-[9px] font-bold text-[#DBC66E] bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-[#DBC66E]/40 flex items-center gap-1">
                      <Landmark className="w-2.5 h-2.5 text-[#DBC66E]" /> Muqaddas
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-white bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/20 flex items-center gap-1">
                      <Video className="w-2.5 h-2.5 text-[#DBC66E]" /> 4K Video
                    </span>
                  )}
                </div>

                {/* Selected Checkmark Badge */}
                {isCurrent && (
                  <div
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg font-bold z-10 ${
                      isLight ? 'bg-[#8A7410] text-white' : 'bg-[#DBC66E] text-[#060B20]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                  </div>
                )}

                {/* Bottom Title & Description */}
                <div className="absolute bottom-2.5 inset-x-2.5 text-left pointer-events-none space-y-0.5 z-10">
                  <span className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-1 drop-shadow-md">
                    {getLocalizedName(item)}
                  </span>
                  <p className="text-[10px] text-white/80 line-clamp-1">
                    {getLocalizedDesc(item)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BackgroundPickerModal;
