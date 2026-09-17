import React, { useState } from 'react';
import { 
  ArrowLeft, 
  X, 
  Moon, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Plus, 
  Minus, 
  RotateCcw,
  BookOpen,
  Star,
  Calculator,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  getHijriDate, 
  getMoonPhase, 
  ISLAMIC_EVENTS, 
  HIJRI_MONTHS 
} from '../utils/hijriCalendar';
import { soundManager } from '../utils/soundEffects';

interface HijriCalendarPageProps {
  onClose: () => void;
  hijriOffset: number;
  onAdjustHijri: (delta: number) => void;
}

export const HijriCalendarPage: React.FC<HijriCalendarPageProps> = ({
  onClose,
  hijriOffset,
  onAdjustHijri,
}) => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'months' | 'events' | 'converter'>('overview');

  // Date states for converter
  const today = new Date();
  const [convGregYear, setConvGregYear] = useState(today.getFullYear());
  const [convGregMonth, setConvGregMonth] = useState(today.getMonth() + 1);
  const [convGregDay, setConvGregDay] = useState(today.getDate());

  const currentHijri = getHijriDate(today, hijriOffset, language);
  const moonInfo = getMoonPhase(today, language);

  const gregorianFormatted = today.toLocaleDateString(
    language,
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  // Conversion result
  const convertedHijri = React.useMemo(() => {
    try {
      const targetDate = new Date(convGregYear, convGregMonth - 1, convGregDay);
      return getHijriDate(targetDate, hijriOffset, language);
    } catch {
      return currentHijri;
    }
  }, [convGregYear, convGregMonth, convGregDay, hijriOffset, language]);

  const monthsEncyclopedia: Record<number, {
    uzName: string;
    arName: string;
    status: string;
    descUz: string;
    descEn: string;
    descRu: string;
    virtuesUz: string[];
    isSacred: boolean;
  }> = {
    1: {
      uzName: 'Muharram',
      arName: 'مُحَرَّم',
      status: 'Haram (Muqaddas) oy',
      descUz: 'Hijriy yil hisobining birinchi oyi. 4 ta urush man qilingan muqaddas oylardan biri.',
      descEn: 'The first month of the Islamic year, one of the four sacred months.',
      descRu: 'Первый месяц исламского календаря, один из четырёх священных запретных месяцев.',
      virtuesUz: ['Ashuro kuni (10-kun) ro‘zasi', 'Yil boshi xayr-ehsonlari', 'Gunohlardan qat’iy tiyilish'],
      isSacred: true,
    },
    2: {
      uzName: 'Safar',
      arName: 'صَفَر',
      status: 'Oddiy oy',
      descUz: 'Hijriy yilning ikkinchi oyi. Islomda xosiyatli va xayrli amallar oyi.',
      descEn: 'The second month of the lunar calendar.',
      descRu: 'Второй месяц лунного исламского календаря.',
      virtuesUz: ['Barcha kunlar xayrli ekani e’tiqodi', 'Ilm va safar amallari', 'Sadaqa va duolarni ko‘paytirish'],
      isSacred: false,
    },
    3: {
      uzName: 'Rabiulavval',
      arName: 'رَبِيع الأَوَّل',
      status: 'Mavlid oyi',
      descUz: 'Payg‘ambarimiz Muhammad sollallohu alayhi vasallam dunyoga kelgan muborak va fazilatli oy.',
      descEn: 'The blessed month of the birth of the Prophet Muhammad (pbuh).',
      descRu: 'Благословенный месяц рождения Пророка Мухаммада (с.а.в.).',
      virtuesUz: ['Rasululloh (s.a.v.)ga salavotlar', 'Siyrat mutolaasi', 'Silai rahm'],
      isSacred: false,
    },
    4: {
      uzName: 'Rabiuloxir',
      arName: 'رَبِيع الآخِر',
      status: 'Oddiy oy',
      descUz: 'Hijriy to‘rtinchi oy.',
      descEn: 'The fourth month of the Islamic year.',
      descRu: 'Четвертый месяц исламского года.',
      virtuesUz: ['Doimiy zikr va ibodat', 'Qur’on mutolaasi'],
      isSacred: false,
    },
    5: {
      uzName: 'Jumadulavval',
      arName: 'جُمَادَى الأُولَى',
      status: 'Oddiy oy',
      descUz: 'Hijriy beshinchi oy.',
      descEn: 'The fifth month of the Islamic calendar.',
      descRu: 'Пятый месяц исламского календаря.',
      virtuesUz: ['Nafaqalar va xayriyalar', 'Kechki tahajjud namozlari'],
      isSacred: false,
    },
    6: {
      uzName: 'Jumaduloxir',
      arName: 'جُمَادَى الآخِرَة',
      status: 'Oddiy oy',
      descUz: 'Hijriy oltinchi oy. Rajab va Ramazonga yaqinlashish pallasi.',
      descEn: 'The sixth month of the Hijri calendar.',
      descRu: 'Шестой месяц календаря Хиджры.',
      virtuesUz: ['Rajab oyiga ruhiy tayyorgarlik', 'Qazo namozlarini o‘tash'],
      isSacred: false,
    },
    7: {
      uzName: 'Rajab',
      arName: 'رَجَب',
      status: 'Haram (Muqaddas) oy',
      descUz: 'Ulug‘ harom oylardan biri. Isro va Me’roj hodisasi ro‘y bergan, ekish va toat oyi.',
      descEn: 'One of the sacred months, featuring the miraculous Isra and Mi‘raj night.',
      descRu: 'Один из четырёх запретных месяцев, месяц Ночи Исра и Мирадж.',
      virtuesUz: ['Isro va Me’roj kechasi ibodatlari', 'Ko‘p istig‘for aytish', 'Nafl ro‘zalar'],
      isSacred: true,
    },
    8: {
      uzName: 'Sha’bon',
      arName: 'شَعْبَان',
      status: 'Ramazon darvozasi',
      descUz: 'Ramazon oyiga bevosita tayyorgarlik oyi. O‘rtasida Barat kechasi joylashgan.',
      descEn: 'The month directly preceding Ramadan, containing the Night of Bara‘at.',
      descRu: 'Месяц непосредственной подготовки к Рамадану, ночь Бараат.',
      virtuesUz: ['Barat kechasi duolari', 'Nafl ro‘zalar tutish', 'Qur’on bilan yaqinlik'],
      isSacred: false,
    },
    9: {
      uzName: 'Ramazon',
      arName: 'رَمَضَان',
      status: 'Muborak Ro‘za oyi',
      descUz: 'Oylarning sultoni! Qur’oni Karim nozil bo‘lgan, ro‘za farz qilingan, Qadr kechasi joylashgan eng buyuk oy.',
      descEn: 'The holiest month of the year, month of Quran revelation, fasting, and Laylat al-Qadr.',
      descRu: 'Священный месяц обязательного поста, ниспослания Корана и Ночи Предопределения.',
      virtuesUz: ['Farz ro‘za tutish', 'Qur’on xatmlari', 'Taroveh namozlari', 'Qadr kechasi'],
      isSacred: false,
    },
    10: {
      uzName: 'Shavvol',
      arName: 'شَوَّال',
      status: 'Hayit oyi',
      descUz: 'Ramazon hayiti (Iyd al-Fitr) nishonlanadigan va 6 kunlik nafl ro‘zasi bir yillik ro‘zaga tenglashtirilgan oy.',
      descEn: 'Month of Eid al-Fitr and the virtuous six days of fasting.',
      descRu: 'Месяц праздника Ураза-Байрам и шести дней добровольного поста.',
      virtuesUz: ['Iyd al-Fitr bayrami', '6 kunlik nafl ro‘za', 'Silai rahm'],
      isSacred: false,
    },
    11: {
      uzName: 'Zulqa’da',
      arName: 'ذُو القَعْدَة',
      status: 'Haram (Muqaddas) oy',
      descUz: 'Harom oylarning uchinchisi. Tinchlik, ibodat va Haj safariga hozirlik oyi.',
      descEn: 'One of the four sacred months, paving the way for Hajj.',
      descRu: 'Один из священных запретных месяцев перед сезоном Хаджа.',
      virtuesUz: ['Haj safariga tayyorgarlik', 'Tinchlik va birdamlik'],
      isSacred: true,
    },
    12: {
      uzName: 'Zulhijja',
      arName: 'ذُو الحِجَّة',
      status: 'Haj va Qurbonlik oyi',
      descUz: 'Ulug‘ harom oy. Dastlabki 10 kuni dunyoning eng afzal kunlari hisoblanadi. Arafa va Qurbon hayiti (Iyd al-Adha) oyi.',
      descEn: 'The month of the sacred Hajj pilgrimage, Day of Arafah, and Eid al-Adha.',
      descRu: 'Месяц великого паломничества Хадж, дня Арафат и праздника Курбан-Байрам.',
      virtuesUz: ['Avvalgi 10 kunlik ibodatlar', 'Arafa kuni ro‘zasi', 'Qurbonlik qilish'],
      isSacred: true,
    },
  };

  return (
    <div 
      className="relative z-10 w-full max-w-xl md:max-w-2xl mx-auto min-h-screen flex flex-col p-4 sm:p-6 pb-36 animate-in fade-in duration-200 select-none overflow-y-auto no-scrollbar"
      style={{ 
        color: 'var(--nur-color-on-bg)',
        WebkitOverflowScrolling: 'touch' 
      }}
    >
      <div className="w-full flex flex-col relative space-y-4">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/15 bg-[#0B132B]/75 backdrop-blur-2xl p-3.5 rounded-2xl shadow-lg">
          <button
            id="btn-hijri-back"
            onClick={() => {
              soundManager.playBeadClick();
              onClose();
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs sm:text-sm font-semibold transition border border-white/15 shadow-sm text-white"
          >
            <ArrowLeft className="w-4 h-4 text-[#DBC66E]" />
            <span>{t.back || 'Back'}</span>
          </button>

          <div className="text-center">
            <h1 className="text-base sm:text-lg font-bold font-brand-display tracking-wide text-white">
              {t.hijriCalendar || 'Hijri Calendar'}
            </h1>
            <p className="text-[11px] text-[#DBC66E] font-medium">
              {currentHijri.year} AH • {currentHijri.monthName}
            </p>
          </div>

          <button
            id="btn-hijri-close"
            onClick={() => {
              soundManager.playBeadClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition border border-white/15 shadow-sm"
            aria-label={t.close || 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Chips (Single Level, Clean) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => {
              soundManager.playBeadClick();
              setActiveTab('overview');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border backdrop-blur-xl ${
              activeTab === 'overview'
                ? 'bg-[#DBC66E] text-[#070D1E] border-white/60 shadow-[0_0_12px_rgba(219,198,110,0.3)]'
                : 'bg-[#0B132B]/75 text-white/80 hover:text-white hover:bg-[#0B132B]/90 border-white/15'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>{t.currentIslamicDate || 'Overview & Moon'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBeadClick();
              setActiveTab('events');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border backdrop-blur-xl ${
              activeTab === 'events'
                ? 'bg-[#DBC66E] text-[#070D1E] border-white/60 shadow-[0_0_12px_rgba(219,198,110,0.3)]'
                : 'bg-[#0B132B]/75 text-white/80 hover:text-white hover:bg-[#0B132B]/90 border-white/15'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.sacredEvents || 'Sacred Events'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBeadClick();
              setActiveTab('months');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border backdrop-blur-xl ${
              activeTab === 'months'
                ? 'bg-[#DBC66E] text-[#070D1E] border-white/60 shadow-[0_0_12px_rgba(219,198,110,0.3)]'
                : 'bg-[#0B132B]/75 text-white/80 hover:text-white hover:bg-[#0B132B]/90 border-white/15'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.hijriMonths || '12 Months'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playBeadClick();
              setActiveTab('converter');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border backdrop-blur-xl ${
              activeTab === 'converter'
                ? 'bg-[#DBC66E] text-[#070D1E] border-white/60 shadow-[0_0_12px_rgba(219,198,110,0.3)]'
                : 'bg-[#0B132B]/75 text-white/80 hover:text-white hover:bg-[#0B132B]/90 border-white/15'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{t.dateConverter || 'Date Converter'}</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & MOON PHASE */}
        {activeTab === 'overview' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            
            {/* Primary Hero Section: Hijri Date */}
            <div className="relative rounded-3xl p-6 bg-[#0B132B]/85 backdrop-blur-2xl border border-white/20 text-center shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#DBC66E]/15 rounded-full blur-3xl pointer-events-none" />
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBC66E]/10 border border-[#DBC66E]/20 text-[11px] font-bold text-[#DBC66E] uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                <span>{t.currentIslamicDate || 'Current Lunar Date'}</span>
              </div>

              {/* Main Display Date */}
              <div className="text-3xl sm:text-4xl font-bold font-brand-display tracking-wide text-white drop-shadow-sm">
                {currentHijri.formatted}
              </div>
              
              <div className="text-xs sm:text-sm flex items-center justify-center gap-2 mt-2 text-white/70">
                <CalendarIcon className="w-4 h-4 text-[#DBC66E]" />
                <span>{gregorianFormatted}</span>
              </div>
            </div>

            {/* Moon Phase Widget */}
            <div className="rounded-2xl p-4 bg-[#0B132B]/80 backdrop-blur-2xl border border-white/20 flex items-center gap-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-black/50 border border-white/15 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                {moonInfo.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white truncate">
                    {moonInfo.phase}
                  </span>
                  <span className="text-[11px] font-bold text-[#DBC66E] px-2 py-0.5 rounded-full bg-[#DBC66E]/10 border border-[#DBC66E]/20">
                    {moonInfo.illumination}% {t.illuminated || 'lit'}
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-0.5 line-clamp-1">
                  {moonInfo.description}
                </p>
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-[#DBC66E] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(5, moonInfo.illumination)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Calibration / Fine-Tuning Pill */}
            <div className="rounded-2xl p-3.5 bg-[#0B132B]/80 backdrop-blur-2xl border border-white/20 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2 text-xs">
                <Sliders className="w-4 h-4 text-[#DBC66E]" />
                <div>
                  <span className="font-semibold text-white/90 block">
                    {t.fineTuneHijri || 'Hilol ko‘rinishiga moslash'}
                  </span>
                  <span className="text-[10px] text-white/50">
                    {hijriOffset === 0 ? (t.standardCalculation || 'Standart astronomik hisob') : `${hijriOffset > 0 ? '+' : ''}${hijriOffset} ${t.dayAdjusted || 'kun siljigan'}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id="btn-hijri-minus-one"
                  onClick={() => {
                    soundManager.playBeadClick();
                    onAdjustHijri(-1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition flex items-center gap-1 border border-white/15"
                >
                  <Minus className="w-3 h-3" />
                  <span>1</span>
                </button>
                {hijriOffset !== 0 && (
                  <button
                    id="btn-hijri-reset"
                    onClick={() => {
                      soundManager.playBeadClick();
                      onAdjustHijri(-hijriOffset);
                    }}
                    className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 active:scale-95 text-[10px] font-medium text-white/70 transition border border-white/10"
                  >
                    {t.reset || 'Reset'}
                  </button>
                )}
                <button
                  id="btn-hijri-plus-one"
                  onClick={() => {
                    soundManager.playBeadClick();
                    onAdjustHijri(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition flex items-center gap-1 border border-white/15"
                >
                  <Plus className="w-3 h-3" />
                  <span>1</span>
                </button>
              </div>
            </div>

            {/* Sunnah Fasting (Ayyomul Biyz) Section */}
            <div className="rounded-3xl p-5 bg-[#0B132B]/85 backdrop-blur-2xl border border-white/20 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#DBC66E] uppercase tracking-wider">
                  <Star className="w-4 h-4 fill-[#DBC66E]" />
                  <span>{t.whiteDaysFasting || 'Ayyomul Biyz (Oq kunlar ro‘zasi)'}</span>
                </div>
                <span className="text-[10px] font-bold text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                  {t.sunnah || 'Sunnat'}
                </span>
              </div>

              <p className="text-xs text-white/80 leading-relaxed">
                {t.whiteDaysDesc || 'Har bir qamariy oyning 13, 14 va 15-kunlari ro‘za tutish Payg‘ambarimiz (s.a.v.)ning go‘zal sunnatlaridan bo‘lib, butun yil ro‘za tutganlik savobiga tenglashtiriladi.'}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[13, 14, 15].map((d) => {
                  const isToday = currentHijri.day === d;
                  const isPast = currentHijri.day > d;

                  return (
                    <div
                      key={d}
                      className={`p-2.5 text-center rounded-2xl transition border ${
                        isToday
                          ? 'bg-[#DBC66E] text-[#070D1E] border-white font-bold shadow-[0_0_15px_rgba(219,198,110,0.4)] ring-2 ring-[#DBC66E]/50'
                          : isPast
                          ? 'bg-white/[0.03] text-white/40 border-white/5'
                          : 'bg-white/[0.07] text-white/90 border-white/10 font-semibold'
                      }`}
                    >
                      <div className="text-xs">
                        {d}-{currentHijri.monthName}
                      </div>
                      <div className="text-[10px] mt-0.5 font-bold">
                        {isToday ? `✨ ${t.today || 'Bugun'}` : isPast ? (t.passed || 'O‘tdi') : (t.upcoming || 'Kelayotgan')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ISLAMIC SACRED EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                {t.annualSacredEvents || 'Yillik Islomiy Sana va Bayramlar'}
              </span>
              <span className="text-xs text-[#DBC66E] font-bold">
                {currentHijri.year} AH
              </span>
            </div>

            <div className="space-y-2.5">
              {ISLAMIC_EVENTS.map((event) => {
                const monthName = HIJRI_MONTHS[language]?.[event.hijriMonth - 1] || HIJRI_MONTHS.en[event.hijriMonth - 1];
                const isCurrentMonth = currentHijri.month === event.hijriMonth;

                return (
                  <div
                    key={event.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 backdrop-blur-2xl shadow-xl ${
                      isCurrentMonth
                        ? 'bg-[#0B132B]/90 border-[#DBC66E] ring-1 ring-[#DBC66E]/60 shadow-[0_0_20px_rgba(219,198,110,0.2)]'
                        : 'bg-[#0B132B]/80 border-white/20 hover:bg-[#0B132B]/95 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            {language === 'uz' ? event.titleUz : language === 'ru' ? event.titleRu : event.title}
                          </h3>
                          {event.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DBC66E]/20 text-[#DBC66E] border border-[#DBC66E]/30">
                              {event.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-[#DBC66E] mt-1">
                          {event.hijriDay} {monthName} ({event.titleAr})
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-sm">
                        🌙
                      </div>
                    </div>

                    <p className="text-xs text-white/80 mt-2 leading-relaxed">
                      {language === 'uz' ? event.descriptionUz : language === 'ru' ? event.descriptionRu : event.descriptionEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: 12 HIJRI MONTHS ENCYCLOPEDIA */}
        {activeTab === 'months' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                {t.hijriMonthsEncyclopedia || '12 ta Qamariy Oylar Ensiklopediyasi'}
              </span>
            </div>

            <div className="space-y-2.5">
              {Object.entries(monthsEncyclopedia).map(([mNum, meta]) => {
                const monthIndex = parseInt(mNum, 10);
                const isCurrentMonth = currentHijri.month === monthIndex;

                return (
                  <div
                    key={mNum}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 backdrop-blur-2xl shadow-xl ${
                      isCurrentMonth
                        ? 'bg-[#0B132B]/90 border-[#DBC66E] ring-1 ring-[#DBC66E]/60 shadow-[0_0_20px_rgba(219,198,110,0.2)]'
                        : 'bg-[#0B132B]/80 border-white/20 hover:bg-[#0B132B]/95 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isCurrentMonth ? 'bg-[#DBC66E] text-[#070D1E]' : 'bg-white/10 text-white'
                        }`}>
                          {mNum}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-bold text-white">
                              {HIJRI_MONTHS[language]?.[monthIndex - 1] || meta.uzName}
                            </span>
                            <span className="text-xs text-white/60 font-serif">
                              ({meta.arName})
                            </span>
                            {meta.isSacred && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {t.sacredMonth || 'Harom oy'}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#DBC66E] font-medium">
                            {meta.isSacred ? (t.sacredMonth || meta.status) : meta.status}
                          </span>
                        </div>
                      </div>

                      {isCurrentMonth && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DBC66E] text-[#070D1E]">
                          {t.currentMonth || 'Hozirgi oy'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-white/80 mt-2 leading-relaxed">
                      {language === 'uz' ? meta.descUz : language === 'ru' ? meta.descRu : meta.descEn}
                    </p>

                    {meta.virtuesUz && (
                      <div className="mt-2.5 pt-2 border-t border-white/15 flex flex-wrap gap-1.5">
                        {meta.virtuesUz.map((v, idx) => (
                          <span key={idx} className="text-[11px] px-2 py-0.5 rounded-lg bg-white/10 border border-white/15 text-white/90 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#DBC66E]" />
                            {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: GREGORIAN <-> HIJRI CONVERTER */}
        {activeTab === 'converter' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0B132B]/85 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#DBC66E]">
                <Calculator className="w-4 h-4" />
                <span>{t.dateConverter || 'Milodiy sanani Hijriyga o‘tkazish'}</span>
              </div>

              {/* Date Input Pickers */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-white/60 block mb-1">
                    {t.day || 'Kun'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={convGregDay}
                    onChange={(e) => setConvGregDay(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-bold text-center outline-none focus:border-[#DBC66E]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-white/60 block mb-1">
                    {t.month || 'Oy'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={convGregMonth}
                    onChange={(e) => setConvGregMonth(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-bold text-center outline-none focus:border-[#DBC66E]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-white/60 block mb-1">
                    {t.year || 'Yil'}
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    value={convGregYear}
                    onChange={(e) => setConvGregYear(parseInt(e.target.value) || 2026)}
                    className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-bold text-center outline-none focus:border-[#DBC66E]"
                  />
                </div>
              </div>

              {/* Quick Set to Today */}
              <button
                onClick={() => {
                  soundManager.playBeadClick();
                  const t = new Date();
                  setConvGregYear(t.getFullYear());
                  setConvGregMonth(t.getMonth() + 1);
                  setConvGregDay(t.getDate());
                }}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 border border-white/15"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.resetToToday || 'Bugungi sanaga qaytish'}</span>
              </button>

              {/* Result Spotlight Card */}
              <div className="p-4 rounded-2xl bg-black/40 border border-[#DBC66E]/40 text-center space-y-1 shadow-inner">
                <div className="text-[10px] uppercase tracking-widest text-[#DBC66E] font-bold">
                  {t.hijriResult || 'Islomiy Hijriy Sana Natijasi'}
                </div>
                <div className="text-xl sm:text-2xl font-bold font-brand-display text-white tracking-wide">
                  {convertedHijri.formatted}
                </div>
                <div className="text-xs text-white/70">
                  {convertedHijri.day}-{t.day || 'kun'}, {convertedHijri.monthName} {t.month || 'oyi'}, {convertedHijri.year}-{t.year || 'hijriy yil'}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HijriCalendarPage;
