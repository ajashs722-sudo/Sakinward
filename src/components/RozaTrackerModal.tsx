import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  Check, 
  Heart, 
  ChevronLeft,
  Flame,
  Calendar,
  BookOpen,
  Share2,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';

interface RozaTrackerModalProps {
  onClose: () => void;
}

interface FastingDayRecord {
  date: string;
  completed: boolean;
  type: 'ramadan' | 'sunnah' | 'qazo' | 'nafl';
}

const FASTING_DUAS = [
  {
    id: 'saharlik',
    title: 'Saharlik (Og‘iz yopish) Duosi',
    subtitle: 'Niyat qilish va Ro‘zaga kirish duosi',
    type: 'saharlik',
    arabic: 'نَوَيْتُ أَنْ أَصُومَ صَوْمَ شَهْرِ رَمَضَانَ مِنَ الْفَجْرِ إِلَى الْمَغْرِبِ، خَالِصًا لِلَّهِ تَعَالَى',
    transliteration: '«Nawaytu an asooma sawma shahri ramadaana minal-fajri ilal-maghribi, khalisan lillahi ta\'ala. Allahu Akbar.»',
    meaningUz: '«Ramazon oyining ro‘zasini tongdan to quyosh botguncha, xolis Alloh taolo uchun tutishni niyat qildim. Alloh buyukdir.»',
    meaningEn: '«I intend to keep the fast for the month of Ramadan from dawn to sunset, sincerely for the sake of Allah the Almighty.»',
    reference: 'Imom Termiziy & Abu Dovud rivoyatlari asosida',
  },
  {
    id: 'iftorlik',
    title: 'Iftorlik (Og‘iz ochish) Duosi',
    subtitle: 'Ramazon va Nafl ro‘zani ochish paytida',
    type: 'iftorlik',
    arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ، فَاغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ',
    transliteration: '«Allahumma laka sumtu wa bika aamantu wa \'alayka tawakkaltu wa \'ala rizqika aftartu, faghfirli ma qaddamtu wa ma akhkhartu.»',
    meaningUz: '«Yo Alloh! Sening roziliging uchun ro‘za tutdim, Senga iymon keltirdim, Senga tavakkul qildim va bergan rizqing bilan og‘iz ochdim. Avvalgi va keyingi gunohlarimni kechir!»',
    meaningEn: '«O Allah! I fasted for Your sake, believed in You, put my trust in You, and broke my fast with Your provision. Forgive my past and future sins.»',
    reference: 'Abu Dovud rivoyati (2358)',
  },
  {
    id: 'iftorlik_sunnah',
    title: 'Iftordan so‘ng aytiladigan Sunnat Duo',
    subtitle: 'Chanqoq bosilganda aytiladigan zikr',
    type: 'iftorlik',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration: '«Zahabaz-zama’u wabtallatil-‘urooqu wa sabatal-ajru in sha’Allah.»',
    meaningUz: '«Chanqoq ketdi, tomirlar namlandi va inshaalloh ajr-savob sobit bo‘ldi.»',
    meaningEn: '«The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.»',
    reference: 'Abu Dovud (2357), Sahih',
  },
  {
    id: 'mehmon_iftorlik',
    title: 'Birovning uyida iftor qilganda aytiladigan Duo',
    subtitle: 'Mezbon haqqiga qilinadigan baraka duosi',
    type: 'iftorlik',
    arabic: 'أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ، وَأَكَلَ طَعَامَكُمُ الْأَبْرَارُ، وَصَلَّتْ عَلَيْكُمُ الْمَلَائِكَةُ',
    transliteration: '«Aftara ‘indakumus-saa’imoon, wa akala ta‘aamakumul-abraar, wa sallat ‘alaykumul-malaa’ikah.»',
    meaningUz: '«Huzuringizda ro‘zadorlar iftor qilsin, taomingizni solihlar yesin va farishtalar sizga salavot aytsin!»',
    meaningEn: '«May the fasting people break fast with you, may the righteous eat your food, and may the angels pray for you.»',
    reference: 'Abu Dovud & Ibn Moja',
  }
];

export const RozaTrackerModal: React.FC<RozaTrackerModalProps> = ({ onClose }) => {
  const { t, language } = useTranslation();

  const [isFastingToday, setIsFastingToday] = useState(() => {
    return localStorage.getItem('sajda_is_fasting_today') === 'true';
  });

  const [totalFastedDays, setTotalFastedDays] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('sajda_total_fasted_days') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [fastingStreak, setFastingStreak] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('sajda_fasting_streak') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [selectedDuaIndex, setSelectedDuaIndex] = useState<number>(0);
  const [activeDuaTab, setActiveDuaTab] = useState<'saharlik' | 'iftorlik'>('saharlik');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [fastType, setFastType] = useState<'ramadan' | 'sunnah' | 'qazo' | 'nafl'>('ramadan');
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('sajda_total_fasted_days', totalFastedDays.toString());
      localStorage.setItem('sajda_fasting_streak', fastingStreak.toString());
    } catch {}
  }, [totalFastedDays, fastingStreak]);

  const toggleFastingStatus = () => {
    soundManager.playBeadClick();
    soundManager.triggerHaptic();

    const next = !isFastingToday;
    setIsFastingToday(next);
    localStorage.setItem('sajda_is_fasting_today', next.toString());

    if (next) {
      setTotalFastedDays((prev) => prev + 1);
      setFastingStreak((prev) => prev + 1);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#DBC66E', '#10B981', '#FFFFFF', '#FAF8F3']
        });
      } catch {}
    } else {
      setTotalFastedDays((prev) => Math.max(0, prev - 1));
      setFastingStreak((prev) => Math.max(0, prev - 1));
    }
  };

  const playDuaTTS = (arabicText: string) => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(arabicText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.82;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    } else {
      soundManager.playChime();
    }
  };

  const activeDuas = FASTING_DUAS.filter(d => d.type === activeDuaTab);
  const currentDua = activeDuas[selectedDuaIndex] || activeDuas[0] || FASTING_DUAS[0];

  const handleShareDua = (dua: typeof FASTING_DUAS[0]) => {
    const text = `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n${language === 'uz' ? dua.meaningUz : dua.meaningEn}\n\n— Sakinward`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
      soundManager.playBeadClick();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-between p-3 sm:p-4 h-[100dvh] max-h-screen overflow-hidden text-[#FAF8F3] select-none animate-in fade-in duration-200"
      style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.45) 100%)',
      }}
    >
      {/* 1. Glass Top Navigation Bar */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg mx-auto pt-1 shrink-0 z-20"
      >
        <div className="flex items-center justify-between p-1.5 px-3 rounded-full bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl">
          <button
            id="btn-back-roza"
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-md transition active:scale-95 text-[#FAF8F3]"
          >
            <ChevronLeft className="w-4 h-4 text-[#DBC66E]" />
            <span>{t.back || 'Back'}</span>
          </button>

          <div className="text-center px-1">
            <h1 className="font-brand-display text-sm sm:text-base font-bold tracking-tight text-[#FAF8F3] flex items-center justify-center gap-1.5">
              <span>{t.ramadanAndRoza || 'Ro‘za & Duolar'}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#DBC66E]" />
            </h1>
            <p className="text-[10px] text-[#DBC66E]/90 font-medium">
              {t.rozaSubtitle || 'Saharlik, Iftorlik duolari va hisobi'}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-close-roza-top"
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition active:scale-95 text-white/80"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* 2. Scrollable Content Body */}
      <main className="flex-1 overflow-y-auto overscroll-contain max-w-lg w-full mx-auto space-y-3 my-2 px-0.5 pb-24 scrollbar-none">
        
        {/* Fasting Commitment Hero Card */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-3xl p-5 bg-black/35 backdrop-blur-2xl border border-white/20 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-[#DBC66E]/15 blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1 max-w-[72%]">
              <span className="text-[11px] font-bold text-[#DBC66E] uppercase tracking-wider flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" />
                {t.fastingStatus}
              </span>
              <div className="text-base sm:text-lg font-bold text-[#FAF8F3] leading-snug">
                {isFastingToday ? t.fastingToday : t.intendToFast}
              </div>
              <p className="text-[11px] text-white/70">
                {isFastingToday ? t.fastingAccepted : t.recordFasting}
              </p>
            </div>

            <button
              id="btn-toggle-fasting-hero"
              onClick={toggleFastingStatus}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 shadow-xl border ${
                isFastingToday
                  ? 'bg-gradient-to-tr from-[#8A7410] via-[#DBC66E] to-[#FAF8F3] text-[#0A1233] border-white ring-4 ring-[#DBC66E]/30 font-bold scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white/40 border-white/20'
              }`}
              title={isFastingToday ? (t.cancel || 'Cancel') : (t.save || 'Save')}
            >
              <Check className={`w-7 h-7 stroke-[3] ${isFastingToday ? 'text-[#0A1233]' : 'opacity-40'}`} />
            </button>
          </div>

          {/* Quick Metrics Bar: Fasting Streak & Total Days */}
          <div className="mt-4 pt-3.5 border-t border-white/10 grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-white/60 block font-medium">
                  {t.dailyStreak || t.dayStreak}
                </span>
                <span className="text-sm font-bold font-mono text-[#DBC66E]">
                  {fastingStreak} {t.today ? '' : 'days'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-white/60 block font-medium">
                  {t.completedTasks || t.todayCount}
                </span>
                <span className="text-sm font-bold font-mono text-[#FAF8F3]">
                  {totalFastedDays} {t.itemsUnit || ''}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. Dua Category Switcher (Saharlik / Iftorlik) */}
        <div className="flex items-center p-1 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/20 shadow-lg">
          <button
            id="tab-saharlik-dua"
            onClick={() => {
              soundManager.playBeadClick();
              setActiveDuaTab('saharlik');
              setSelectedDuaIndex(0);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeDuaTab === 'saharlik'
                ? 'bg-[#DBC66E] text-[#0A1233] shadow-md font-bold'
                : 'text-[#FAF8F3]/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>{t.suhoorDua || 'Saharlik Duolari'}</span>
          </button>

          <button
            id="tab-iftorlik-dua"
            onClick={() => {
              soundManager.playBeadClick();
              setActiveDuaTab('iftorlik');
              setSelectedDuaIndex(0);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeDuaTab === 'iftorlik'
                ? 'bg-[#DBC66E] text-[#0A1233] shadow-md font-bold'
                : 'text-[#FAF8F3]/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>{t.iftarDua || 'Iftorlik Duolari'}</span>
          </button>
        </div>

        {/* 4. Sub-Dua Selector Pills if multiple */}
        {activeDuas.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {activeDuas.map((d, i) => (
              <button
                key={d.id}
                onClick={() => {
                  soundManager.playBeadClick();
                  setSelectedDuaIndex(i);
                }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition whitespace-nowrap border ${
                  selectedDuaIndex === i
                    ? 'bg-[#DBC66E]/20 border-[#DBC66E] text-[#DBC66E]'
                    : 'bg-black/25 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                {d.title.split('(')[0]}
              </button>
            ))}
          </div>
        )}

        {/* 5. Dynamic Active Dua Display Card */}
        <motion.div 
          key={currentDua.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl p-5 bg-black/35 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-4"
        >
          {/* Card Header with Audio & Copy/Share */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
            <div>
              <span className="text-xs font-bold text-[#DBC66E] block">
                {currentDua.title}
              </span>
              <span className="text-[10px] text-white/50">
                {currentDua.subtitle}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleShareDua(currentDua)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 flex items-center justify-center transition active:scale-95"
                title="Duoni nusxalash"
              >
                {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => playDuaTTS(currentDua.arabic)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition active:scale-95 ${
                  isPlayingAudio
                    ? 'bg-[#DBC66E] text-[#0A1233] border-white shadow-md'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-[#FAF8F3]'
                }`}
              >
                {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 opacity-70" />}
                <span>{isPlayingAudio ? (t.readingAudio || 'Playing...') : (t.arabicVoice || 'Arabcha Ovoz')}</span>
              </button>
            </div>
          </div>

          {/* Arabic Calligraphy Frame */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/30 border border-white/10 text-center relative overflow-hidden shadow-inner">
            <p 
              dir="rtl"
              className="text-2xl sm:text-3xl font-quran text-[#FAF8F3] leading-loose drop-shadow-md"
            >
              {currentDua.arabic}
            </p>
          </div>

          {/* Transliteration and Meanings */}
          <div className="space-y-2 text-xs">
            {/* Transliteration */}
            <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10">
              <span className="text-[10px] font-bold text-[#DBC66E] uppercase tracking-wider block mb-0.5">
                {t.transliterationLabel || 'O‘qilishi (Transkripsiya):'}
              </span>
              <p className="italic text-[#FAF8F3] leading-relaxed">
                {currentDua.transliteration}
              </p>
            </div>

            {/* Translation */}
            <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10">
              <span className="text-[10px] font-bold text-[#DBC66E] uppercase tracking-wider block mb-0.5">
                {t.meaningLabel || 'Ma’nosi va Tarjimasi:'}
              </span>
              <p className="text-white/80 leading-relaxed">
                {language === 'uz' ? currentDua.meaningUz : currentDua.meaningEn}
              </p>
            </div>

            {/* Hadith Reference */}
            {currentDua.reference && (
              <div className="text-right">
                <span className="text-[10px] text-white/50 italic">
                  {t.source || 'Manba'}: {currentDua.reference}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* 6. Virtues of Fasting (Hadis va Fazilatlar) */}
        <div className="p-4 rounded-3xl bg-black/35 backdrop-blur-2xl border border-white/15 text-xs space-y-1.5 shadow-xl">
          <div className="flex items-center gap-2 font-bold text-[#DBC66E]">
            <Heart className="w-4 h-4 fill-current" />
            <span>{t.joyOfFasting || 'Ro‘zadorning ikki quvonchi:'}</span>
          </div>
          <p className="text-[11px] text-white/80 leading-relaxed">
            {language === 'uz' 
              ? 'Rasululloh ﷺ marhamat qildilar: "Ro‘zador kishi uchun ikki xursandchilik bor: biri og‘iz ochgan paytida (iftorda), ikkinchisi esa Robbisi bilan uchrashgan paytida oladigan cheksiz mukofotidir."'
              : language === 'ru'
              ? 'Посланник Аллаха ﷺ сказал: «У постящегося две радости: одна — при разговении (ифтаре), а другая — при встрече со своим Господом.» (Сахих аль-Бухари и Муслим)'
              : 'The Messenger of Allah ﷺ said: "The fasting person experiences two joys: one when breaking the fast, and the other when meeting their Lord with their reward." (Sahih al-Bukhari & Muslim)'}
          </p>
        </div>

        {/* 7. Sunnah Fasting Reminders */}
        <div className="p-4 rounded-3xl bg-black/35 backdrop-blur-2xl border border-white/15 text-xs space-y-2 shadow-xl">
          <span className="text-[10px] font-bold text-[#DBC66E] uppercase tracking-wider block">
            {t.sunnahFastingDays || 'Muborak Sunnat Ro‘zalar:'}
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-white/80">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="font-bold text-white block">📅 {t.mondayThursday || 'Dushanba & Payshanba'}</span>
              <span className="text-[10px] text-white/60">{t.mondayThursdayDesc || 'Haftalik amallar ko‘tariladigan kunlar'}</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="font-bold text-white block">🌕 {t.whiteDays || 'Oq Kunlar (13, 14, 15)'}</span>
              <span className="text-[10px] text-white/60">{t.whiteDaysDesc || 'Har hijriy oyning to‘lin oyi kunlari'}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Copied Toast */}
      <AnimatePresence>
        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#DBC66E] text-[#0A1233] text-xs font-bold shadow-2xl z-50 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{t.copied || 'Duo matni nusxalandi!'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RozaTrackerModal;

