import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { Globe, Check, X, Search } from 'lucide-react';
import { SupportedLanguage } from '../i18n/translations';
import { useTranslation } from '../i18n/LanguageContext';
import { soundManager } from '../utils/soundEffects';
import { ALL_LANGUAGES, LanguageMeta, LanguageRegion } from '../data/languagesData';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
}

const REGION_TABS: { id: LanguageRegion; labelUz: string; labelEn: string; icon: string }[] = [
  { id: 'all', labelUz: 'Barchasi', labelEn: 'All', icon: '🌍' },
  { id: 'central_asia', labelUz: 'Markaziy Osiyo', labelEn: 'Central Asia', icon: '🏔️' },
  { id: 'middle_east', labelUz: 'Yaqin Sharq', labelEn: 'Middle East', icon: '🌙' },
  { id: 'south_asia', labelUz: 'Janubiy Osiyo', labelEn: 'South Asia', icon: '🕌' },
  { id: 'europe', labelUz: 'Yevropa', labelEn: 'Europe', icon: '🏛️' },
  { id: 'asia_pacific', labelUz: 'Osiyo & Tinch okeani', labelEn: 'Asia-Pacific', icon: '🌸' },
  { id: 'africa', labelUz: 'Afrika', labelEn: 'Africa', icon: '🦁' },
];

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose, isLight = false }) => {
  const { language, setLanguage, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<LanguageRegion>('all');
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Prevent background body scroll & reset search query when opening
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedRegion('all');
      return;
    }
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // GSAP Smooth Entrance
  useEffect(() => {
    if (!isOpen || !modalBoxRef.current) return;
    setIsClosing(false);

    gsap.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: 'power2.out' }
    );

    gsap.fromTo(
      modalBoxRef.current,
      { y: 50, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out', clearProps: 'transform,opacity,scale' }
    );
  }, [isOpen]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    soundManager.playBeadClick();

    if (modalBoxRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to(modalBoxRef.current, {
        y: 40,
        opacity: 0,
        scale: 0.97,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleSelectLanguage = (code: SupportedLanguage) => {
    soundManager.playBeadClick();
    setLanguage(code);
    handleClose();
  };

  // Multi-script search & region filtering logic
  const normalizedQuery = searchQuery.trim().toLowerCase().normalize('NFD');
  const filteredLanguages = ALL_LANGUAGES.filter((item: LanguageMeta) => {
    if (selectedRegion !== 'all' && item.region !== selectedRegion) {
      return false;
    }

    if (!normalizedQuery) return true;

    const haystack = [
      item.code,
      item.name,
      item.nativeName,
      ...(item.searchKeywords || []),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery) || haystack.normalize('NFD').includes(normalizedQuery);
  });

  const modalContent = (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal Container */}
      <div
        ref={modalBoxRef}
        className={`relative w-full sm:max-w-xl rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl flex flex-col gap-3.5 border-t sm:border max-h-[94vh] sm:max-h-[90vh] overflow-hidden ${
          isLight
            ? 'bg-[#FAF8F3] text-[#0F172A] border-[#E2E8F0]'
            : 'bg-[#070e22] text-white border-white/10'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Pill */}
        <div
          className={`w-12 h-1.5 rounded-full mx-auto sm:hidden -mt-1 mb-1 ${
            isLight ? 'bg-black/20' : 'bg-white/30'
          }`}
        />

        {/* Modal Header */}
        <div
          className={`flex items-center justify-between pb-2 border-b flex-shrink-0 ${
            isLight ? 'border-[#E2E8F0]' : 'border-white/15'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md font-bold shrink-0 ${
                isLight ? 'bg-[#8A7410] text-white' : 'bg-[#DBC66E] text-[#0A1233]'
              }`}
            >
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight font-serif flex items-center gap-2 leading-tight">
                <span>{t.language}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                    isLight
                      ? 'bg-[#8A7410]/15 text-[#8A7410] border-[#8A7410]/30'
                      : 'bg-[#DBC66E]/20 text-[#DBC66E] border-[#DBC66E]/30'
                  }`}
                >
                  {ALL_LANGUAGES.length}+
                </span>
              </h2>
              <p
                className={`text-xs font-medium ${
                  isLight ? 'text-[#64748B]' : 'text-white/70'
                }`}
              >
                {t.chooseLanguage || 'Tilni tanlang / Select language'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-lang-modal"
            onClick={handleClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 border shrink-0 ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 text-[#0F172A] border-[#E2E8F0]'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex-shrink-0">
          <div
            className={`absolute inset-y-0 left-3.5 flex items-center pointer-events-none ${
              isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'
            }`}
          >
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search language / Tilni izlash..."
            className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none transition shadow-sm border ${
              isLight
                ? 'bg-white border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#8A7410]'
                : 'bg-white/10 border-white/15 text-white placeholder-white/40 focus:border-[#DBC66E]'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute inset-y-0 right-3 flex items-center ${
                isLight ? 'text-[#64748B] hover:text-[#0F172A]' : 'text-white/60 hover:text-white'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-shrink-0">
          {REGION_TABS.map((tab) => {
            const isSelected = selectedRegion === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playBeadClick();
                  setSelectedRegion(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 border flex items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? isLight
                      ? 'bg-[#8A7410] text-white border-[#8A7410] shadow-sm font-extrabold'
                      : 'bg-[#DBC66E] text-[#0A1233] border-transparent shadow-md font-bold'
                    : isLight
                    ? 'bg-white text-[#475569] hover:bg-[#F1F5F9] border-[#E2E8F0] shadow-sm'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{language === 'uz' ? tab.labelUz : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Languages Grid */}
        <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar pr-0.5 space-y-1.5 max-h-[50vh]">
          {filteredLanguages.length === 0 ? (
            <div
              className={`py-12 text-center text-sm font-medium ${
                isLight ? 'text-[#64748B]' : 'text-white/50'
              }`}
            >
              Hech qanday til topilmadi
            </div>
          ) : (
            filteredLanguages.map((item: LanguageMeta) => {
              const isSelected = language === item.code;
              return (
                <button
                  key={item.code}
                  id={`lang-item-${item.code}`}
                  onClick={() => handleSelectLanguage(item.code)}
                  className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all duration-150 border active:scale-[0.98] ${
                    isSelected
                      ? isLight
                        ? 'bg-[#8A7410] text-white font-bold shadow-md border-transparent'
                        : 'bg-[#DBC66E] text-[#0A1233] font-bold shadow-md border-transparent'
                      : isLight
                      ? 'bg-white hover:bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0] shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">{item.flag}</span>
                    <div className="text-left truncate">
                      <span className="block text-xs sm:text-sm font-bold truncate">
                        {item.nativeName}
                      </span>
                      <span
                        className={`block text-[11px] truncate ${
                          isSelected
                            ? isLight
                              ? 'text-white/90'
                              : 'text-[#0A1233]/80'
                            : isLight
                            ? 'text-[#64748B]'
                            : 'text-white/60'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
                        isLight ? 'bg-white text-[#8A7410]' : 'bg-[#0A1233] text-[#DBC66E]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LanguageModal;
