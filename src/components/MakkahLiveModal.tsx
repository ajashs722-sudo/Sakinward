import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ChevronLeft,
  RefreshCw,
  Building2,
  Compass,
  ExternalLink,
  Tv,
  Clock,
  Radio,
  Play,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';

interface MakkahLiveModalProps {
  onClose: () => void;
}

interface LocationData {
  id: 'makkah' | 'madinah';
  title: string;
  arabicTitle: string;
  city: string;
  channelName: string;
  descriptionUz: string;
  descriptionEn: string;
  descriptionRu: string;
  youtubeLiveUrl: string;
  saudiOfficialUrl: string;
  surahQuoteUz: string;
  surahQuoteEn: string;
  surahQuoteRu: string;
  surahRefUz: string;
  surahRefEn: string;
  surahRefRu: string;
}

const LOCATIONS: LocationData[] = [
  {
    id: 'makkah',
    title: 'Masjid al-Haram (Ka‘batulloh)',
    arabicTitle: 'المسجد الحرام - مكة المكرمة',
    city: 'Makka al-Mukarrama',
    channelName: 'Saudi Quran TV (قناة القرآن الكريم)',
    descriptionUz: 'Ayni daqiqadagi Ka\'batulloh va Tavof maydoni to‘g‘ridan-to‘g‘ri efiri.',
    descriptionEn: 'Live 24/7 stream of the Holy Kaaba and Tawaf courtyard in Makkah.',
    descriptionRu: 'Прямая 24/7 трансляция Священной Каабы и площади Таваф в Мекке.',
    youtubeLiveUrl: 'https://www.youtube.com/@SaudiQuranTv/live',
    saudiOfficialUrl: 'https://sba.sa/live/quran',
    surahQuoteUz: '«Albatta, odamlar (ibodati) uchun qurilgan birinchi Uy – Bakkadagi (Makkadagi) muborak va butun olamlar uchun hidoyat manbaidir.»',
    surahQuoteEn: '«Indeed, the first House [of worship] established for mankind was that at Bakkah - blessed and a guidance for the worlds.»',
    surahQuoteRu: '«Воистину, первым домом, который был заложен для людей, является тот, который находится в Бакке (Мекке). Он был ниспослан как благословение и руководство для миров.»',
    surahRefUz: 'Oli Imron surasi, 96-oyat',
    surahRefEn: 'Surah Ali \'Imran [3:96]',
    surahRefRu: 'Сура Аль-Имран, 96 аят',
  },
  {
    id: 'madinah',
    title: 'Masjid an-Nabaviy',
    arabicTitle: 'المسجد النبوي - المدينة المنورة',
    city: 'Madina al-Munavvara',
    channelName: 'Saudi Sunnah TV (قناة السنة النبوية)',
    descriptionUz: 'Ayni daqiqadagi Payg‘ambarimiz (s.a.v.) masjidlarining to‘g‘ridan-to‘g‘ri efiri.',
    descriptionEn: 'Live 24/7 stream from the Prophet\'s Mosque (Al-Masjid An-Nabawi) in Madinah.',
    descriptionRu: 'Прямая 24/7 трансляция из Мечети Пророка (Аль-Масджид ан-Набави) в Медине.',
    youtubeLiveUrl: 'https://www.youtube.com/@SaudiSunnahTv/live',
    saudiOfficialUrl: 'https://sba.sa/live/sunnah',
    surahQuoteUz: '«Ey Payg‘ambar! Biz seni guvoh, xushxabarchi va ogohlantiruvchi qilib yubordik.»',
    surahQuoteEn: '«O Prophet, indeed We have sent you as a witness and a bringer of good tidings and a warner.»',
    surahQuoteRu: '«О Пророк! Мы отправили тебя свидетелем, добрым вестником и предостерегающим увещевателем.»',
    surahRefUz: 'Ahzob surasi, 45-oyat',
    surahRefEn: 'Surah Al-Ahzab [33:45]',
    surahRefRu: 'Сура Аль-Ахзаб, 45 аят',
  },
];

export const MakkahLiveModal: React.FC<MakkahLiveModalProps> = ({ onClose }) => {
  const { language, t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'makkah' | 'madinah'>('makkah');
  const [makkahTime, setMakkahTime] = useState<string>('');

  // Saudiya (Makkah) ayni vaqtini aniqlash (UTC+3)
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Riyadh',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setMakkahTime(timeStr);
      } catch {
        setMakkahTime('--:--:--');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const active = LOCATIONS.find((l) => l.id === activeTab) || LOCATIONS[0];

  const handleTabChange = (id: 'makkah' | 'madinah') => {
    soundManager.playBeadClick();
    soundManager.triggerHaptic();
    setActiveTab(id);
  };

  const openLiveStream = (url: string) => {
    soundManager.playBeadClick();
    soundManager.triggerHaptic();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-between p-3 sm:p-4 h-[100dvh] max-h-screen overflow-hidden text-[#FAF8F3] select-none animate-in fade-in duration-200"
      style={{
        // 100% Shaffof video/shader orqa fon to'liq ko'rinadi
        background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.45) 100%)',
      }}
    >
      {/* 1. Floating Glass Top Navbar */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg mx-auto pt-1 shrink-0 z-20"
      >
        <div className="flex items-center justify-between p-1.5 px-3 rounded-full bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl">
          <button
            id="btn-back-makkah-live"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-md transition active:scale-95 text-[#FAF8F3]"
          >
            <ChevronLeft className="w-4 h-4 text-[#DBC66E]" />
            <span>{t.back || 'Back'}</span>
          </button>

          <div className="text-center px-1">
            <h1 className="font-brand-display text-sm sm:text-base font-bold tracking-tight text-[#FAF8F3] flex items-center justify-center gap-1.5">
              <span>{t.makkahLive || 'Jonli Efir'}</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </h1>
            <p className="text-[10px] text-[#DBC66E]/90 font-medium">
              {active.city}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-close-makkah-top"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition active:scale-95 text-white/80"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* 2. Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain max-w-lg w-full mx-auto space-y-3.5 my-2 px-0.5 pb-20 scrollbar-none">
        
        {/* Stream Location Switcher - Glass Capsule */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="flex items-center p-1.5 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/15 shadow-xl gap-1.5"
        >
          <button
            id="tab-stream-makkah"
            onClick={() => handleTabChange('makkah')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'makkah'
                ? 'bg-[#DBC66E] text-[#050A18] shadow-lg scale-[1.02]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Makkah (Ka‘ba)</span>
          </button>

          <button
            id="tab-stream-madinah"
            onClick={() => handleTabChange('madinah')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'madinah'
                ? 'bg-[#DBC66E] text-[#050A18] shadow-lg scale-[1.02]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Madina (Nabaviy)</span>
          </button>
        </motion.div>

        {/* Real-Time Live Stream Card Frame (100% Real Time) */}
        <motion.div 
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="relative w-full rounded-3xl p-5 bg-black/45 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col items-center justify-between text-center overflow-hidden space-y-4"
        >
          {/* Top Live Indicators */}
          <div className="w-full flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>LIVE • 24/7 EFIR</span>
            </div>

            {/* Makkah Real-time Clock */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-[#DBC66E]" />
              <span>{makkahTime}</span>
              <span className="text-[9px] text-white/50">KSA</span>
            </div>
          </div>

          {/* Central Channel & Status Display */}
          <div className="py-3 space-y-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#DBC66E]/30 to-[#DBC66E]/10 border border-[#DBC66E]/40 flex items-center justify-center mx-auto shadow-inner text-[#DBC66E]">
              {activeTab === 'makkah' ? <Building2 className="w-8 h-8" /> : <Compass className="w-8 h-8" />}
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {active.title}
              </h2>
              <p className="text-xs text-[#DBC66E] font-medium mt-0.5">
                {active.arabicTitle}
              </p>
              <p className="text-[11px] text-white/60 mt-1 max-w-xs mx-auto">
                {language === 'uz' ? active.descriptionUz : language === 'ru' ? active.descriptionRu : active.descriptionEn}
              </p>
            </div>
          </div>

          {/* Guaranteed Real-Time Live Stream Actions */}
          <div className="w-full space-y-2 pt-2 border-t border-white/10">
            {/* Primary Action: Official YouTube Live Stream (Ayni daqiqadagi haqiqiy jonli efir) */}
            <button
              id="btn-open-realtime-youtube"
              onClick={() => openLiveStream(active.youtubeLiveUrl)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl transition active:scale-95 border border-white/20"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
              </div>
              <div className="text-left">
                <div className="font-extrabold">{t.watchOnYouTube || 'Haqiqiy Jonli Efirni Ko‘rish (HD)'}</div>
                <div className="text-[10px] text-white/80 font-normal">{active.channelName}</div>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto opacity-80" />
            </button>

            {/* Secondary Action: Saudi Broadcasting Authority (SBA) Official Portal */}
            <button
              id="btn-open-official-sba"
              onClick={() => openLiveStream(active.saudiOfficialUrl)}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-[#DBC66E]" />
              <span>{t.officialSaudiStream || 'Saudiya Davlat Teleradiosi (SBA) Portali'}</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
            </button>
          </div>
        </motion.div>

        {/* Real-time Verification Note */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="rounded-2xl p-3 bg-emerald-500/10 backdrop-blur-2xl border border-emerald-500/25 shadow-xl flex items-center gap-2.5"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-[11px] text-emerald-200/90 leading-tight">
            <span className="font-bold">{t.verifiedStream || 'Haqiqiylik kafolati:'}</span>{' '}
            {t.verifiedStreamDesc || 'Barcha efirlar Saudiya Arabistoni rasmiy davlat kanallari orqali ayni daqiqadagi (real-time) jonli tavof va namozlarni ko‘rsatadi.'}
          </div>
        </motion.div>

        {/* Spiritual Quranic Ayah Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.18 }}
          className="rounded-2xl p-3.5 bg-black/35 backdrop-blur-2xl border border-white/15 shadow-xl text-center space-y-1"
        >
          <p className="text-xs font-medium text-white/90 leading-relaxed italic">
            {language === 'uz' ? active.surahQuoteUz : language === 'ru' ? active.surahQuoteRu : active.surahQuoteEn}
          </p>
          <div className="text-[10px] font-semibold text-[#DBC66E]/80">
            {language === 'uz' ? active.surahRefUz : language === 'ru' ? active.surahRefRu : active.surahRefEn}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default MakkahLiveModal;
