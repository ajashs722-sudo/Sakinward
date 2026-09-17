import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { X, Check, Compass } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { soundManager } from '../utils/soundEffects';

export interface CalcMethodOption {
  id: string;
  name: string;
  desc?: string;
}

export const CALC_METHODS: CalcMethodOption[] = [
  {
    id: 'auto',
    name: '⚡ Auto (Smart Multi-Provider Fallback)',
    desc: 'Tavsiya etiladi: Joylashuvga qarab rasmiy davlat API provayderini avtomatik tanlaydi va uzluksiz zaxiralaydi',
  },
  { 
    id: 'uzb', 
    name: "O'zbekiston Musulmonlari Idorasi", 
    desc: 'Hanafiy 15°/15° (Oʻzbekiston va Markaziy Osiyo jome masjidlari rasmiy taqvimi)' 
  },
  { 
    id: 'mawaqit', 
    name: 'Mawaqit Real-Masjid Tizimi', 
    desc: '100+ davlatdagi minglab masjidlarning to‘g‘ridan-to‘g‘ri ichki elektron tablosi va iqomat vaqtlari' 
  },
  { 
    id: '4', 
    name: 'Umm Al-Qura University & Haramain (Saudiya)', 
    desc: 'Makka (Masjid al-Haram) va Madina (Masjid an-Nabawi) rasmiy taqvimi' 
  },
  { 
    id: '13', 
    name: 'T.C. Diyanet İşleri Başkanlığı (Turkiya)', 
    desc: 'Turkiya va Yevropadagi (DITIB) masjidlarining markaziy azon tarmoqlari' 
  },
  { 
    id: '5', 
    name: 'Egyptian General Authority of Survey & Awqaf', 
    desc: 'Misr Avqof Vazirligi, Qohira va Shimoliy Afrika davlat masjidlari' 
  },
  { 
    id: '17', 
    name: 'JAKIM e-Solat (Malayziya)', 
    desc: 'Malayziya Bosh Islom Taraqqiyoti Departamenti davlat azon tizimi' 
  },
  { 
    id: '15', 
    name: 'London Central Mosque & UK Unified (UK)', 
    desc: 'Buyuk Britaniya va London Markaziy Masjidi jamoat taqvimi' 
  },
  { 
    id: '16', 
    name: 'AWQAF BAA (Dubai & Abu Dhabi)', 
    desc: 'Birlashgan Arab Amirliklari Islom Boshqarmasi (BAA API)' 
  },
  { 
    id: '11', 
    name: 'MUIS (Singapur)', 
    desc: 'Singapur Islom Kengashi (MUIS API)' 
  },
  { 
    id: '20', 
    name: 'KEMENAG RI (Indoneziya)', 
    desc: 'Indoneziya Din Vazirligi (KEMENAG API)' 
  },
  { 
    id: '18', 
    name: 'Ministère des Habous (Marokash)', 
    desc: 'Marokash Islom Ishlari Vazirligi (Morocco API)' 
  },
  { 
    id: '1', 
    name: 'University of Islamic Sciences, Karachi', 
    desc: 'Pokiston, Bangladesh va Afg‘oniston' 
  },
  { 
    id: '7', 
    name: 'Tehron Universiteti Geofizika Instituti', 
    desc: 'Eron va atrofi' 
  },
  { 
    id: '9', 
    name: 'Kuwait Ministry of Awqaf', 
    desc: 'Quvayt Islom Ishlari Vazirligi' 
  },
  { 
    id: '10', 
    name: 'Qatar Ministry of Awqaf', 
    desc: 'Qatar Islom Ishlari Vazirligi' 
  },
  { 
    id: '14', 
    name: 'Rossiya Musulmonlari Diniy Nazorati (RMDN)', 
    desc: 'Rossiya va MDH davlatlari' 
  },
  { 
    id: '2', 
    name: 'Islamic Society of North America (ISNA)', 
    desc: 'AQSh va Kanada' 
  },
  { 
    id: '12', 
    name: 'UOIF (Fransiya)', 
    desc: 'Fransiya Islom Tashkilotlari Ittifoqi' 
  },
  { 
    id: '3', 
    name: 'Muslim World League (MWL)', 
    desc: 'Yevropa, Uzoq Sharq va Xalqaro standart' 
  },
];

interface CalcMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMethod: string;
  onSelectMethod: (methodId: string) => void;
  isLight?: boolean;
}

export const CalcMethodModal: React.FC<CalcMethodModalProps> = ({
  isOpen,
  onClose,
  currentMethod,
  onSelectMethod,
  isLight = false,
}) => {
  const { t } = useTranslation();
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Prevent background body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
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
        className={`relative w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl flex flex-col gap-4 border-t sm:border max-h-[85vh] overflow-hidden ${
          isLight
            ? 'bg-[#FAF8F3] text-[#0F172A] border-[#E2E8F0]'
            : 'bg-[#0c1328] text-white border-white/10'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Pill */}
        <div
          className={`w-12 h-1.5 rounded-full mx-auto sm:hidden -mt-1 mb-1 ${
            isLight ? 'bg-black/20' : 'bg-white/25'
          }`}
        />

        {/* Modal Header */}
        <div
          className={`flex items-center justify-between pb-3 border-b flex-shrink-0 ${
            isLight ? 'border-[#E2E8F0]' : 'border-white/15'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md font-bold ${
                isLight ? 'bg-[#8A7410] text-white' : 'bg-[#DBC66E] text-[#0A1233]'
              }`}
            >
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight font-serif leading-tight">
                {t.calcMethod}
              </h2>
              <p
                className={`text-xs font-medium ${
                  isLight ? 'text-[#64748B]' : 'text-white/70'
                }`}
              >
                {t.calcMethodDescription || 'Select calculation methodology'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-calc-modal"
            onClick={handleClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 border ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 text-[#0F172A] border-[#E2E8F0]'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calculation Methods List */}
        <div className="space-y-2 overflow-y-auto overscroll-contain no-scrollbar pr-0.5 max-h-[60vh]">
          {CALC_METHODS.map((item) => {
            const isSelected = currentMethod === item.id;
            return (
              <button
                key={item.id}
                id={`calc-method-${item.id}`}
                onClick={() => {
                  soundManager.playBeadClick();
                  onSelectMethod(item.id);
                  handleClose();
                }}
                className={`w-full px-4 py-3.5 rounded-2xl flex items-center justify-between text-left transition-all duration-150 border min-h-[58px] active:scale-[0.98] ${
                  isSelected
                    ? isLight
                      ? 'bg-[#8A7410] text-white font-bold shadow-md border-transparent'
                      : 'bg-[#DBC66E] text-[#0A1233] font-bold shadow-md border-transparent'
                    : isLight
                    ? 'bg-white hover:bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0] shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                }`}
              >
                <div className="pr-3">
                  <span className="block text-xs sm:text-sm font-bold leading-snug">
                    {item.name}
                  </span>
                  {item.desc && (
                    <span
                      className={`block text-[11px] mt-0.5 leading-tight ${
                        isSelected
                          ? isLight
                            ? 'text-white/90'
                            : 'text-[#0A1233]/80'
                          : isLight
                          ? 'text-[#64748B]'
                          : 'text-white/60'
                      }`}
                    >
                      {item.desc}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
                      isLight ? 'bg-white text-[#8A7410]' : 'bg-[#0A1233] text-[#DBC66E]'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CalcMethodModal;
