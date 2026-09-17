import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Settings,
  X,
  MapPin,
  ChevronRight,
  Compass,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Trash2,
  Check,
  Smartphone,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { CityLocation, Language, WallpaperOption } from '../types';
import { soundManager } from '../utils/soundEffects';
import { ambientSound } from '../utils/ambientSoundManager';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageModal } from './LanguageModal';
import { CalcMethodModal, CALC_METHODS } from './CalcMethodModal';
import { BackgroundPickerModal } from './BackgroundPickerModal';
import { getBackgroundById } from '../data/backgroundData';
import { getLanguageMeta } from '../data/languagesData';
import { clearMediaCache } from '../services/videoCacheService';

interface SettingsModalProps {
  currentWallpaper?: WallpaperOption;
  onSelectWallpaper?: (wp: WallpaperOption) => void;
  currentBgId: string;
  onSelectBackground: (bgId: string) => void;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  currentCity?: CityLocation;
  onOpenLocation?: () => void;
  onClose: () => void;
  nurTheme: 'nur-dark' | 'nur-light';
  onSelectNurTheme: (theme: 'nur-dark' | 'nur-light') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentBgId,
  onSelectBackground,
  currentCity,
  onOpenLocation,
  onClose,
  nurTheme,
  onSelectNurTheme,
}) => {
  const { t, language } = useTranslation();
  const isLight = nurTheme === 'nur-light';

  // GSAP animation refs
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Submodals
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showBgModal, setShowBgModal] = useState(false);

  // Ambient Audio State
  const [isBgMuted, setIsBgMuted] = useState(() => ambientSound.getIsMuted());
  const [bgVolume, setBgVolume] = useState(() => ambientSound.getVolume());

  // UI Sound FX
  const [soundFxEnabled, setSoundFxEnabled] = useState(() => soundManager.isSoundFxEnabled());

  // Cache Clear State
  const [cacheClearing, setCacheClearing] = useState(false);
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false);

  // Responsive screen check
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // GSAP Entrance Animation
  useEffect(() => {
    if (!modalRef.current) return;

    const ctx = gsap.context(() => {
      // Animate modal backdrop/container in
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );

      // Animate Header
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', delay: 0.05 }
        );
      }

      // Animate settings category cards sequentially
      gsap.fromTo(
        '.settings-section-card',
        { y: 25, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power3.out',
          clearProps: 'transform,opacity,scale',
        }
      );
    }, modalRef);

    return () => ctx.revert();
  }, []);

  // Sync ambient sound manager
  useEffect(() => {
    return ambientSound.subscribe(() => {
      setIsBgMuted(ambientSound.getIsMuted());
      setBgVolume(ambientSound.getVolume());
    });
  }, []);

  // Fiqh School (Hanafi vs Shafi/Jumhur)
  const [fiqhSchool, setFiqhSchool] = useState<'hanafi' | 'shafi'>(() => {
    try {
      const saved = localStorage.getItem('sakinward_fiqh_school') || localStorage.getItem('sajda_school');
      return saved === '2' ? 'shafi' : 'hanafi';
    } catch {
      return 'hanafi';
    }
  });

  const handleFiqhSchoolChange = (school: 'hanafi' | 'shafi') => {
    soundManager.playBeadClick();
    setFiqhSchool(school);
    const schoolVal = school === 'hanafi' ? '1' : '2';
    try {
      localStorage.setItem('sakinward_fiqh_school', schoolVal);
      localStorage.setItem('sajda_school', schoolVal);
      window.dispatchEvent(
        new CustomEvent('prayer_settings_changed', {
          detail: { school: schoolVal, method: calcMethod },
        })
      );
    } catch {}
  };

  // Calculation Method
  const [calcMethod, setCalcMethod] = useState<string>(() => {
    const saved = localStorage.getItem('sakinward_calc_method') || localStorage.getItem('sajda_calc_method');
    if (!saved || saved === '1') {
      return 'auto';
    }
    return saved;
  });

  const handleMethodChange = (id: string) => {
    soundManager.playBeadClick();
    setCalcMethod(id);
    localStorage.setItem('sakinward_calc_method', id);
    localStorage.setItem('sajda_calc_method', id);
    window.dispatchEvent(
      new CustomEvent('prayer_settings_changed', {
        detail: { method: id, school: fiqhSchool === 'hanafi' ? '1' : '2' },
      })
    );
  };

  const handleToggleSoundFx = () => {
    const next = soundManager.toggleSoundFx();
    setSoundFxEnabled(next);
    if (next) {
      soundManager.playBeadClick();
    }
  };

  const handleClearCache = async () => {
    setCacheClearing(true);
    soundManager.playBeadClick();
    try {
      await clearMediaCache();
      setCacheClearedSuccess(true);
      setTimeout(() => {
        setCacheClearedSuccess(false);
      }, 3000);
    } finally {
      setCacheClearing(false);
    }
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    soundManager.playBeadClick();

    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  const currentLangMeta = getLanguageMeta(language);
  const currentCalcMeta = CALC_METHODS.find((m) => m.id === calcMethod) || CALC_METHODS[0];
  const activeBg = getBackgroundById(currentBgId);

  const getLocalizedBgName = () => {
    if (language === 'uz') return activeBg.name.uz;
    if (language === 'ru') return activeBg.name.ru;
    return activeBg.name.en;
  };

  const isSubModalOpen = showLanguageModal || showCalcModal || showBgModal;

  // Lock body scroll when SettingsModal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      ref={modalRef}
      id="settings-modal"
      className={`fixed inset-0 z-50 flex flex-col select-none ${
        isSubModalOpen ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'
      } ${isLight ? 'bg-[#FAF8F3] text-[#0F172A]' : 'bg-[#060B20] text-white'}`}
      style={{
        background: isLight
          ? 'radial-gradient(circle at 50% 0%, #FAF8F2 0%, #F5F1E6 60%, #EBE3D3 100%)'
          : 'radial-gradient(circle at 50% 0%, #152258 0%, #0A1233 50%, #05081A 100%)',
      }}
    >
      {/* Floating Compact Glass Header */}
      <div ref={headerRef} className="sticky top-2 sm:top-3 z-30 px-3 sm:px-4 max-w-2xl w-full mx-auto pt-2">
        <div
          className={`rounded-2xl sm:rounded-3xl backdrop-blur-2xl px-4 py-2.5 flex items-center justify-between shadow-sm border transition-colors duration-200 ${
            isLight
              ? 'bg-white/90 border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-[#0F172A]'
              : 'bg-[#0A1233]/90 border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold ${
                isLight ? 'bg-[#8A7410]/15 text-[#8A7410]' : 'bg-[#DBC66E]/20 text-[#DBC66E]'
              }`}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight font-serif leading-tight">
                {t.settings || (language === 'ru' ? 'Настройки' : 'Sozlamalar')}
              </h1>
              <p
                className={`text-[11px] sm:text-xs leading-tight font-medium ${
                  isLight ? 'text-[#64748B]' : 'text-white/60'
                }`}
              >
                {language === 'ru'
                  ? 'Основные параметры'
                  : language === 'uz'
                  ? 'Ilovaning asosiy sozlamalari'
                  : 'General preferences'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-settings"
            onClick={handleClose}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition active:scale-95 border ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 text-[#0F172A] border-[#E2E8F0]'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            }`}
            aria-label="Close settings"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Settings List */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 pb-28 space-y-5">
        {/* 1. MAVZU VA KO'RINISH / ТЕМА И ОФОРМЛЕНИЕ */}
        <div className="settings-section-card space-y-1.5">
          <h2
            className={`text-xs font-extrabold uppercase tracking-wider px-1 ${
              isLight ? 'text-[#334155]' : 'text-[#DBC66E]'
            }`}
          >
            {language === 'ru' ? 'Тема оформления' : language === 'uz' ? 'Mavzu va Ko‘rinish' : 'Theme & Appearance'}
          </h2>

          <div
            className={`rounded-2xl p-2 sm:p-2.5 border grid grid-cols-2 gap-2 shadow-sm transition-colors duration-200 ${
              isLight
                ? 'bg-white/95 border-[#E2E8F0]'
                : 'bg-[#0D173E]/90 border-white/10'
            }`}
          >
            {/* Dark Theme Button */}
            <button
              onClick={() => {
                soundManager.playBeadClick();
                onSelectNurTheme('nur-dark');
              }}
              className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 border text-sm font-bold active:scale-95 ${
                nurTheme === 'nur-dark'
                  ? 'bg-[#060B20] text-[#DBC66E] border-[#DBC66E] shadow-md ring-1 ring-[#DBC66E]/50'
                  : isLight
                  ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                  : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>{language === 'ru' ? 'Тёмная' : language === 'uz' ? 'Qorong‘u' : 'Dark'}</span>
              {nurTheme === 'nur-dark' && <Check className="w-4 h-4 ml-1" />}
            </button>

            {/* Light Theme Button */}
            <button
              onClick={() => {
                soundManager.playBeadClick();
                onSelectNurTheme('nur-light');
              }}
              className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 border text-sm font-bold active:scale-95 ${
                nurTheme === 'nur-light'
                  ? 'bg-[#FAF8F3] text-[#0A1233] border-[#8A7410] shadow-md ring-1 ring-[#8A7410]/50 font-extrabold'
                  : isLight
                  ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                  : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10'
              }`}
            >
              <Sun className="w-4 h-4 text-[#8A7410]" />
              <span>{language === 'ru' ? 'Светлая' : language === 'uz' ? 'Yorug‘' : 'Light'}</span>
              {nurTheme === 'nur-light' && <Check className="w-4 h-4 ml-1 text-[#8A7410]" />}
            </button>
          </div>
        </div>

        {/* 2. JONLI FON / ФОН И САХНА */}
        <div className="settings-section-card space-y-1.5">
          <h2
            className={`text-xs font-extrabold uppercase tracking-wider px-1 ${
              isLight ? 'text-[#334155]' : 'text-[#DBC66E]'
            }`}
          >
            {language === 'ru' ? 'Фон главного экрана' : language === 'uz' ? 'Asosiy ekran foni' : 'Background Scene'}
          </h2>

          <div
            className={`rounded-2xl border overflow-hidden shadow-sm transition-colors duration-200 ${
              isLight ? 'bg-white/95 border-[#E2E8F0]' : 'bg-[#0D173E]/90 border-white/10'
            }`}
          >
            <div
              onClick={() => {
                soundManager.playBeadClick();
                setShowBgModal(true);
              }}
              className={`p-3.5 sm:p-4 flex items-center justify-between cursor-pointer transition active:scale-[0.99] ${
                isLight ? 'hover:bg-[#F8FAFC]' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm border ${
                    isLight ? 'border-[#E2E8F0] bg-black/5' : 'border-white/15 bg-black/40'
                  }`}
                >
                  <img
                    src={isMobileScreen ? activeBg.mobile.photo : activeBg.desktop.photo}
                    alt={getLocalizedBgName()}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold block leading-tight">
                      {getLocalizedBgName()}
                    </span>
                    {activeBg.isShader ? (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          isLight
                            ? 'bg-[#8A7410]/15 text-[#8A7410] border-[#8A7410]/30'
                            : 'bg-[#DBC66E]/20 text-[#DBC66E] border-[#DBC66E]/30'
                        }`}
                      >
                        Shader
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          isLight
                            ? 'bg-black/5 text-[#0F172A] border-[#E2E8F0]'
                            : 'bg-white/10 text-white border-white/20'
                        }`}
                      >
                        4K Video
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs block mt-0.5 font-medium ${
                      isLight ? 'text-[#64748B]' : 'text-white/60'
                    }`}
                  >
                    {language === 'ru'
                      ? 'Нажмите, чтобы выбрать другой фон'
                      : language === 'uz'
                      ? 'Boshqa fon tanlash uchun bosing'
                      : 'Tap to change background'}
                  </span>
                </div>
              </div>

              <div
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'
                }`}
              >
                <span>{language === 'ru' ? 'Выбрать' : language === 'uz' ? 'Tanlash' : 'Change'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. OVOZ VA TOVUSHLAR / ЗВУКИ И АУДИО */}
        <div className="settings-section-card space-y-1.5">
          <h2
            className={`text-xs font-extrabold uppercase tracking-wider px-1 ${
              isLight ? 'text-[#334155]' : 'text-[#DBC66E]'
            }`}
          >
            {language === 'ru' ? 'Звук и аудио' : language === 'uz' ? 'Ovoz va Tovushlar' : 'Sound & Audio'}
          </h2>

          <div
            className={`rounded-2xl border overflow-hidden shadow-sm divide-y transition-colors duration-200 ${
              isLight
                ? 'bg-white/95 border-[#E2E8F0] divide-[#E2E8F0]'
                : 'bg-[#0D173E]/90 border-white/10 divide-white/10'
            }`}
          >
            {/* 1. Ambient Sound Toggle & Slider */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      isLight
                        ? 'bg-[#F8FAFC] border-[#E2E8F0]'
                        : 'bg-white/10 border-white/10'
                    }`}
                  >
                    {!isBgMuted ? (
                      <Volume2 className={`w-5 h-5 ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`} />
                    ) : (
                      <VolumeX className={`w-5 h-5 ${isLight ? 'text-[#94A3B8]' : 'text-white/40'}`} />
                    )}
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-bold block leading-tight">
                      {language === 'ru'
                        ? 'Фоновые звуки природы'
                        : language === 'uz'
                        ? 'Tabiat va fon tovushlari'
                        : 'Ambient nature sound'}
                    </span>
                    <span
                      className={`text-xs block font-medium ${
                        isLight ? 'text-[#64748B]' : 'text-white/60'
                      }`}
                    >
                      {!isBgMuted
                        ? language === 'ru'
                          ? `Громкость: ${Math.round(bgVolume * 100)}%`
                          : `Ovoz: ${Math.round(bgVolume * 100)}%`
                        : language === 'ru'
                        ? 'Выключено'
                        : 'O‘chirilgan'}
                    </span>
                  </div>
                </div>

                {/* Standard Toggle Switch */}
                <button
                  onClick={() => {
                    soundManager.playBeadClick();
                    ambientSound.toggleMute();
                  }}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative flex items-center ${
                    !isBgMuted ? (isLight ? 'bg-[#8A7410]' : 'bg-[#DBC66E]') : isLight ? 'bg-[#CBD5E1]' : 'bg-white/20'
                  }`}
                  aria-label="Toggle ambient sound"
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                      !isBgMuted ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Volume Slider Bar */}
              {!isBgMuted && (
                <div
                  className={`pt-2 pb-1 space-y-2 border-t ${
                    isLight ? 'border-[#E2E8F0]' : 'border-white/10'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between text-xs font-semibold ${
                      isLight ? 'text-[#64748B]' : 'text-white/60'
                    }`}
                  >
                    <span>0%</span>
                    <span
                      className={`text-xs font-bold font-mono ${
                        isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'
                      }`}
                    >
                      {Math.round(bgVolume * 100)}%
                    </span>
                    <span>100%</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={bgVolume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      ambientSound.setVolume(val);
                    }}
                    className="sakin-slider w-full"
                    style={{
                      background: `linear-gradient(to right, ${isLight ? '#8A7410' : '#DBC66E'} 0%, ${
                        isLight ? '#8A7410' : '#DBC66E'
                      } ${bgVolume * 100}%, ${isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.2)'} ${
                        bgVolume * 100
                      }%, ${isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.2)'} 100%)`,
                    }}
                    aria-label="Volume slider"
                  />
                </div>
              )}
            </div>

            {/* 2. UI Sound Effects Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isLight
                      ? 'bg-[#F8FAFC] border-[#E2E8F0]'
                      : 'bg-white/10 border-white/10'
                  }`}
                >
                  <Smartphone className={`w-5 h-5 ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`} />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-bold block leading-tight">
                    {language === 'ru'
                      ? 'Звуки кнопок и тасбиха'
                      : language === 'uz'
                      ? 'Tugma va tasbeh tovushi'
                      : 'Button & Tasbih clicks'}
                  </span>
                  <span
                    className={`text-xs block font-medium ${
                      isLight ? 'text-[#64748B]' : 'text-white/60'
                    }`}
                  >
                    {soundFxEnabled
                      ? language === 'ru'
                        ? 'Включено'
                        : 'Yoniq'
                      : language === 'ru'
                      ? 'Выключено'
                      : 'O‘chirilgan'}
                  </span>
                </div>
              </div>

              {/* Standard Toggle Switch */}
              <button
                onClick={handleToggleSoundFx}
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative flex items-center ${
                  soundFxEnabled ? (isLight ? 'bg-[#8A7410]' : 'bg-[#DBC66E]') : isLight ? 'bg-[#CBD5E1]' : 'bg-white/20'
                }`}
                aria-label="Toggle sound fx"
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    soundFxEnabled ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 4. NAMOZ VA JOYLASHUV / НАМАЗ И ЛОКАЦИЯ */}
        <div className="settings-section-card space-y-1.5">
          <h2
            className={`text-xs font-extrabold uppercase tracking-wider px-1 ${
              isLight ? 'text-[#334155]' : 'text-[#DBC66E]'
            }`}
          >
            {language === 'ru' ? 'Намаз и расчёт времени' : language === 'uz' ? 'Namoz va Joylashuv' : 'Prayer & Fiqh'}
          </h2>

          <div
            className={`rounded-2xl border overflow-hidden shadow-sm divide-y transition-colors duration-200 ${
              isLight
                ? 'bg-white/95 border-[#E2E8F0] divide-[#E2E8F0]'
                : 'bg-[#0D173E]/90 border-white/10 divide-white/10'
            }`}
          >
            {/* 1. Location / City */}
            {currentCity && (
              <div
                onClick={() => {
                  soundManager.playBeadClick();
                  onOpenLocation?.();
                }}
                className={`p-4 flex items-center justify-between cursor-pointer transition active:scale-[0.99] ${
                  isLight ? 'hover:bg-[#F8FAFC]' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      isLight
                        ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#8A7410]'
                        : 'bg-white/10 border-white/10 text-[#DBC66E]'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span
                      className={`text-xs font-semibold block ${
                        isLight ? 'text-[#64748B]' : 'text-white/60'
                      }`}
                    >
                      {language === 'ru' ? 'Город / Местоположение' : language === 'uz' ? 'Hozirgi shahar' : 'Location'}
                    </span>
                    <span className="text-sm sm:text-base font-bold block leading-tight">
                      {currentCity.displayName}
                    </span>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1 text-xs font-bold ${
                    isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'
                  }`}
                >
                  <span>{language === 'ru' ? 'Изменить' : language === 'uz' ? 'O‘zgartirish' : 'Change'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* 2. Fiqhiy Mazhab (Hanafi vs Shafi) */}
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold block leading-tight">
                  {language === 'ru' ? 'Мазхаб (Время Асра)' : language === 'uz' ? 'Fiqhiy mazhab (Asr vaqti)' : 'Fiqh School (Asr)'}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    isLight ? 'text-[#64748B]' : 'text-white/60'
                  }`}
                >
                  {fiqhSchool === 'hanafi'
                    ? language === 'ru' ? 'Ханафи (2 тени)' : 'Hanafiy (2 soya)'
                    : language === 'ru' ? 'Шафии / Другие (1 тень)' : 'Shofeiy (1 soya)'}
                </span>
              </div>

              <div
                className={`grid grid-cols-2 gap-2 p-1 rounded-xl border ${
                  isLight
                    ? 'bg-[#F8FAFC] border-[#E2E8F0]'
                    : 'bg-black/30 border-white/10'
                }`}
              >
                <button
                  onClick={() => handleFiqhSchoolChange('hanafi')}
                  className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                    fiqhSchool === 'hanafi'
                      ? isLight
                        ? 'bg-[#8A7410] text-white shadow-sm font-extrabold'
                        : 'bg-[#DBC66E] text-[#0A1233] shadow-md font-bold'
                      : isLight
                      ? 'text-[#475569] hover:bg-black/5'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <span>{language === 'ru' ? 'Ханафи' : 'Hanafiy'}</span>
                  {fiqhSchool === 'hanafi' && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => handleFiqhSchoolChange('shafi')}
                  className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                    fiqhSchool === 'shafi'
                      ? isLight
                        ? 'bg-[#8A7410] text-white shadow-sm font-extrabold'
                        : 'bg-[#DBC66E] text-[#0A1233] shadow-md font-bold'
                      : isLight
                      ? 'text-[#475569] hover:bg-black/5'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <span>{language === 'ru' ? 'Шафии / Другие' : 'Shofeiy'}</span>
                  {fiqhSchool === 'shafi' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 3. Calculation Method */}
            <div
              onClick={() => {
                soundManager.playBeadClick();
                setShowCalcModal(true);
              }}
              className={`p-4 flex items-center justify-between cursor-pointer transition active:scale-[0.99] ${
                isLight ? 'hover:bg-[#F8FAFC]' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isLight
                      ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#8A7410]'
                      : 'bg-white/10 border-white/10 text-[#DBC66E]'
                  }`}
                >
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <span
                    className={`text-xs font-semibold block ${
                      isLight ? 'text-[#64748B]' : 'text-white/60'
                    }`}
                  >
                    {language === 'ru' ? 'Метод расчёта намаза' : language === 'uz' ? 'Namoz hisoblash usuli' : 'Calculation Method'}
                  </span>
                  <span className="text-sm sm:text-base font-bold block leading-tight">
                    {currentCalcMeta.name}
                  </span>
                </div>
              </div>

              <div
                className={`flex items-center gap-1 text-xs font-bold ${
                  isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'
                }`}
              >
                <span>{language === 'ru' ? 'Изменить' : language === 'uz' ? 'O‘zgartirish' : 'Change'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* 5. ILOVA TILI / ЯЗЫК */}
        <div className="settings-section-card space-y-1.5">
          <h2
            className={`text-xs font-extrabold uppercase tracking-wider px-1 ${
              isLight ? 'text-[#334155]' : 'text-[#DBC66E]'
            }`}
          >
            {language === 'ru' ? 'Язык' : language === 'uz' ? 'Ilova Tili' : 'Language'}
          </h2>

          <div
            className={`rounded-2xl border overflow-hidden shadow-sm transition-colors duration-200 ${
              isLight ? 'bg-white/95 border-[#E2E8F0]' : 'bg-[#0D173E]/90 border-white/10'
            }`}
          >
            <div
              onClick={() => {
                soundManager.playBeadClick();
                setShowLanguageModal(true);
              }}
              className={`p-4 flex items-center justify-between cursor-pointer transition active:scale-[0.99] ${
                isLight ? 'hover:bg-[#F8FAFC]' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${
                    isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/10 border-white/10'
                  }`}
                >
                  {currentLangMeta.flag}
                </div>
                <div>
                  <span
                    className={`text-xs font-semibold block ${
                      isLight ? 'text-[#64748B]' : 'text-white/60'
                    }`}
                  >
                    {language === 'ru' ? 'Текущий язык' : language === 'uz' ? 'Tanlangan til' : 'Current Language'}
                  </span>
                  <span className="text-sm sm:text-base font-bold block leading-tight">
                    {currentLangMeta.nativeName}
                  </span>
                </div>
              </div>

              <div
                className={`flex items-center gap-1 text-xs font-bold ${
                  isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'
                }`}
              >
                <span>{language === 'ru' ? 'Выбрать другой' : language === 'uz' ? 'O‘zgartirish' : 'Change'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* 6. XOTIRA VA TIZIM / СИСТЕМА И КЭШ */}
        <div className="settings-section-card space-y-1.5">
          <h2
            className={`text-xs font-extrabold uppercase tracking-wider px-1 ${
              isLight ? 'text-[#334155]' : 'text-[#DBC66E]'
            }`}
          >
            {language === 'ru' ? 'Система и память' : language === 'uz' ? 'Xotira va Tizim' : 'System & Storage'}
          </h2>

          <div
            className={`rounded-2xl border overflow-hidden shadow-sm divide-y transition-colors duration-200 ${
              isLight
                ? 'bg-white/95 border-[#E2E8F0] divide-[#E2E8F0]'
                : 'bg-[#0D173E]/90 border-white/10 divide-white/10'
            }`}
          >
            {/* Clear Media Cache */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-bold block leading-tight">
                    {language === 'ru' ? 'Очистить кэш медиа' : language === 'uz' ? 'Media keshini tozalash' : 'Clear Media Cache'}
                  </span>
                  <span
                    className={`text-xs block font-medium ${
                      isLight ? 'text-[#64748B]' : 'text-white/60'
                    }`}
                  >
                    {cacheClearedSuccess
                      ? language === 'ru' ? 'Кэш успешно очищен!' : 'Kesh muvaffaqiyatli tozalandi!'
                      : language === 'ru' ? 'Освободить память устройства' : 'Qurilma xotirasini bo‘shatadi'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleClearCache}
                disabled={cacheClearing}
                className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-500 border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5"
              >
                {cacheClearing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {cacheClearing
                    ? language === 'ru' ? 'Очистка...' : 'Tozalanmoqda...'
                    : language === 'ru' ? 'Очистить' : 'Tozalash'}
                </span>
              </button>
            </div>

            {/* App Version & Credits */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isLight
                      ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#8A7410]'
                      : 'bg-white/10 border-white/10 text-[#DBC66E]'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-bold block leading-tight">
                    Sakinward Spiritual Suite
                  </span>
                  <span
                    className={`text-xs block font-medium ${
                      isLight ? 'text-[#64748B]' : 'text-white/60'
                    }`}
                  >
                    {language === 'ru'
                      ? 'Версия 2.5 • Офлайн и Аудио'
                      : language === 'uz'
                      ? 'Versiya 2.5 • Offline & Audio Ready'
                      : 'Version 2.5 • Offline & Audio Ready'}
                  </span>
                </div>
              </div>

              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                  isLight
                    ? 'bg-black/5 text-[#475569] border-[#E2E8F0]'
                    : 'bg-white/10 text-white/80 border-white/15'
                }`}
              >
                v2.5
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Submodal 1: Background Scene Picker */}
      <BackgroundPickerModal
        isOpen={showBgModal}
        onClose={() => setShowBgModal(false)}
        currentBgId={currentBgId}
        onSelectBackground={onSelectBackground}
        isLight={isLight}
      />

      {/* Submodal 2: Calculation Method Selector */}
      <CalcMethodModal
        isOpen={showCalcModal}
        onClose={() => setShowCalcModal(false)}
        currentMethod={calcMethod}
        onSelectMethod={handleMethodChange}
        isLight={isLight}
      />

      {/* Submodal 3: Language Selector */}
      <LanguageModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        isLight={isLight}
      />
    </div>
  );
};

export default SettingsModal;
