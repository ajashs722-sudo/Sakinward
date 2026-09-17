import React from 'react';
import { X, Calendar, Moon, Sparkles, ChevronRight, Plus, Minus, Info } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getHijriDate } from '../utils/hijriCalendar';

interface HijriDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  hijriOffset: number;
  onAdjustHijri: (delta: number) => void;
}

export const HijriDateModal: React.FC<HijriDateModalProps> = ({
  isOpen,
  onClose,
  hijriOffset,
  onAdjustHijri,
}) => {
  const { t, language } = useTranslation();

  if (!isOpen) return null;

  const today = new Date();
  const hijriInfo = getHijriDate(today, hijriOffset, language);

  const monthMeanings: Record<number, { uz: string; en: string; ru: string }> = {
    1: {
      uz: 'Muharram — Islomiy yilning birinchi oyi, 4 ta harom (urush man qilingan) oylardan biri.',
      en: 'Muharram — The first month of the Islamic year, one of the four sacred months.',
      ru: 'Мухаррам — Первый месяц исламского календаря, один из четырех запретных месяцев.',
    },
    2: {
      uz: 'Safar — Ikkinchi oy, yaxshilik va xayr-baraka oyi.',
      en: 'Safar — The second month of the lunar calendar.',
      ru: 'Сафар — Второй месяц лунного исламского календаря.',
    },
    3: {
      uz: 'Rabiulavval — Payg‘ambarimiz Muhammad sollallohu alayhi vasallam tavallud topgan muborak oy (Mavlid).',
      en: 'Rabi‘ al-Awwal — The blessed month in which Prophet Muhammad (pbuh) was born.',
      ru: 'Раби аль-Авваль — Благословенный месяц рождения Пророка Мухаммада (с.а.в.).',
    },
    4: {
      uz: 'Rabiuloxir — To‘rtinchi islomiy oy.',
      en: 'Rabi‘ al-Thani — The fourth month of the Hijri calendar.',
      ru: 'Раби аль-Ахир — Четвертый месяц исламского года.',
    },
    5: {
      uz: 'Jumadulavval — Beshinchi islomiy oy.',
      en: 'Jumada al-Ula — The fifth Islamic month.',
      ru: 'Джумада аль-Уля — Пятый месяц исламского календаря.',
    },
    6: {
      uz: 'Jumaduloxir — Oltinchi islomiy oy.',
      en: 'Jumada al-Akhirah — The sixth Islamic month.',
      ru: 'Джумада аль-Ахира — Шестой месяц календаря Хиджры.',
    },
    7: {
      uz: 'Rajab — Ulug‘ va harom oylardan biri, Isro va Me’roj kechasi ushbu oyda sodir bo‘lgan.',
      en: 'Rajab — One of the sacred months, featuring the night of Isra and Mi\'raj.',
      ru: 'Раджаб — Один из благословенных запретных месяцев (ночь Исра и Мирадж).',
    },
    8: {
      uz: 'Sha’bon — Ramazonga tayyorgarlik oyi, Barat kechasi joylashgan fayzli oy.',
      en: 'Sha‘ban — The preparatory month before Ramadan, containing Laylat al-Bara\'at.',
      ru: 'Шаабан — Месяц духовного приготовления к Рамадану.',
    },
    9: {
      uz: 'Ramazon — Qur’oni Karim nozil bo‘lgan, ro‘za farz qilingan eng buyuk va fazilatli oy.',
      en: 'Ramadan — The holiest month of fasting and Quran revelation (Laylat al-Qadr).',
      ru: 'Рамадан — Священный месяц обязательного поста и ниспослания Священного Корана.',
    },
    10: {
      uz: 'Shavvol — Ramazon hayiti (Iyd al-Fitr) nishonlanadigan va 6 kunlik nafl ro‘za oyi.',
      en: 'Shawwal — Marked by Eid al-Fitr celebration and the six voluntary fasting days.',
      ru: 'Шавваль — Месяц праздника Ураза-Байрам (Ид аль-Фитр).',
    },
    11: {
      uz: 'Zulqa’da — Harom oylardan biri, tinchlik va ibodat oyi.',
      en: 'Dhu al-Qi‘dah — A sacred month preceding the annual Hajj pilgrimage.',
      ru: 'Зуль-Каада — Один из запретных месяцев, предшествующий Хаджу.',
    },
    12: {
      uz: 'Zulhijja — Haj amallari ado etiladigan, Arafa va Qurbon hayiti (Iyd al-Adha) oyi.',
      en: 'Dhu al-Hijjah — The month of the sacred Hajj pilgrimage, Day of Arafah and Eid al-Adha.',
      ru: 'Зуль-Хиджа — Месяц великого паломничества Хадж, дня Арафа и праздника Курбан-Байрам.',
    },
  };

  const currentDesc =
    monthMeanings[hijriInfo.month]?.[language as 'uz' | 'en' | 'ru'] ||
    monthMeanings[hijriInfo.month]?.en ||
    monthMeanings[hijriInfo.month]?.uz ||
    'Muborak islomiy oy.';

  const gregorianFormatted = today.toLocaleDateString(
    language,
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-md rounded-3xl p-5 sm:p-6 text-white border border-white/20 shadow-2xl space-y-4 bg-[#070D1E]/90 backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#DBC66E] border border-white/15">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                {t.hijriCalendar || 'Hijri Calendar'}
              </h3>
              <p className="text-xs text-white/60">
                {t.hijriDesc || 'Lunar calendar calculation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95 text-white/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Spotlight Card */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/15 text-center space-y-1.5 shadow-inner">
          <div className="text-[11px] uppercase tracking-widest text-[#DBC66E] font-bold">
            {t.currentIslamicDate || 'Current Islamic Date'}
          </div>
          <div className="text-xl sm:text-2xl font-bold font-brand-display text-white tracking-wide">
            {hijriInfo.formatted}
          </div>
          <div className="text-xs text-white/70 flex items-center justify-center gap-1.5 pt-1">
            <Calendar className="w-3.5 h-3.5 text-[#DBC66E]" />
            <span>{gregorianFormatted}</span>
          </div>
        </div>

        {/* Month Description */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#DBC66E]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{hijriInfo.monthName}</span>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            {currentDesc}
          </p>
        </div>

        {/* Fine-Tuning Date Adjustment */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white/90">
              {t.fineTuneHijri || 'Hilol ko‘rinishiga moslash (+/- 1 kun)'}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#DBC66E]/20 text-[#DBC66E] border border-[#DBC66E]/30">
              {hijriOffset === 0 ? '0' : hijriOffset > 0 ? `+${hijriOffset}` : `${hijriOffset}`} {t.day || 'kun'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAdjustHijri(-1)}
              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/10"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>-1 {t.day || 'Day'}</span>
            </button>
            <button
              onClick={() => onAdjustHijri(-hijriOffset)}
              disabled={hijriOffset === 0}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-40 active:scale-95 text-xs font-semibold transition border border-white/10"
            >
              {t.reset || 'Reset'}
            </button>
            <button
              onClick={() => onAdjustHijri(1)}
              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+1 {t.day || 'Day'}</span>
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#DBC66E] hover:bg-[#E7D685] text-[#070D1E] font-bold text-xs sm:text-sm tracking-wide shadow-lg transition active:scale-[0.99]"
        >
          {t.close || 'Close'}
        </button>
      </div>
    </div>
  );
};
