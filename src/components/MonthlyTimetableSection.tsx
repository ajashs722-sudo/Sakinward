import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, ArrowUp } from 'lucide-react';
import { CityLocation } from '../types';
import { fetchMonthlyCalendar, MonthlyDayPrayer } from '../services/apiService';
import { getCityLocalNow, nowInCity } from '../services/prayerEngine';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';

interface MonthlyTimetableSectionProps {
  currentCity: CityLocation;
  onScrollToTop: () => void;
}

export const MonthlyTimetableSection: React.FC<MonthlyTimetableSectionProps> = ({
  currentCity,
  onScrollToTop,
}) => {
  const { t, language } = useTranslation();
  const currentDate = useMemo(() => getCityLocalNow(currentCity.timezone, currentCity.lat, currentCity.lng, currentCity.country, currentCity.name), [currentCity]);
  const [selectedMonth, setSelectedMonth] = useState(() => currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => currentDate.getFullYear());
  const [calendarDays, setCalendarDays] = useState<MonthlyDayPrayer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadCalendar = () => {
      setLoading(true);
      fetchMonthlyCalendar(
        currentCity.name,
        currentCity.country,
        selectedMonth,
        selectedYear,
        currentCity.lat,
        currentCity.lng
      )
        .then((days) => {
          if (isMounted) {
            setCalendarDays(days);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    };

    loadCalendar();

    const handleSettingsChange = () => {
      loadCalendar();
    };

    window.addEventListener('prayer_settings_changed', handleSettingsChange);
    return () => {
      isMounted = false;
      window.removeEventListener('prayer_settings_changed', handleSettingsChange);
    };
  }, [selectedMonth, selectedYear, currentCity]);

  const handlePrevMonth = () => {
    soundManager.playBeadClick();
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    soundManager.playBeadClick();
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const monthDateObj = new Date(selectedYear, selectedMonth - 1, 1);
  const formattedMonthYear = monthDateObj.toLocaleDateString(language, { month: 'long', year: 'numeric' });

  return (
    <section 
      id="section-monthly-timetable" 
      className="relative z-20 w-full max-w-xl md:max-w-2xl mx-auto pt-6 pb-32 px-3 sm:px-6 select-none transition-all duration-500"
    >
      {/* Section Header & Return to Top */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/25">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md bg-transparent border border-white/30 text-[#DBC66E]">
            <CalendarIcon className="w-5 h-5 drop-shadow-md" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight font-brand-display text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              {t.monthlyTimetable}
            </h2>
            <p className="text-xs text-white/90 flex items-center gap-1 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              <MapPin className="w-3.5 h-3.5 text-[#DBC66E]" />
              {currentCity.displayName}
            </p>
          </div>
        </div>

        <button
          onClick={onScrollToTop}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold hover:bg-white/10 transition active:scale-95 border border-white/30 shadow-md bg-transparent text-white"
          title={t.clock || 'Clock'}
        >
          <ArrowUp className="w-4 h-4 text-[#DBC66E]" />
          <span>{t.clock || 'Clock'}</span>
        </button>
      </div>

      {/* 100% Transparent Month Navigator - No Blur */}
      <div className="rounded-2xl p-3 mb-4 flex items-center justify-between border border-white/30 shadow-lg bg-transparent text-white">
        <button
          onClick={handlePrevMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/15 transition active:scale-95 bg-black/15 border border-white/20 text-white"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-sm sm:text-base font-bold capitalize tracking-wide font-brand-display drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] text-white">
          {formattedMonthYear}
        </div>

        <button
          onClick={handleNextMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/15 transition active:scale-95 bg-black/15 border border-white/20 text-white"
          aria-label="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Timetable Table Card - 100% Transparent, No Blur */}
      <div 
        className="rounded-3xl p-3 sm:p-4 border border-white/30 overflow-x-auto no-scrollbar shadow-xl bg-transparent text-white"
      >
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#DBC66E] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-white drop-shadow-md">
              {t.loadingPrayerTimes || t.loading || 'Calculating prayer times...'}
            </span>
          </div>
        ) : (
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[340px]">
            <thead>
              <tr className="border-b border-white/30 font-bold text-xs text-[#DBC66E]">
                <th className="py-2.5 px-2.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{t.calendar}</th>
                <th className="py-2.5 px-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{t.fajr}</th>
                <th className="py-2.5 px-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{t.sunrise}</th>
                <th className="py-2.5 px-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{t.dhuhr}</th>
                <th className="py-2.5 px-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{t.asr}</th>
                <th className="py-2.5 px-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{t.maghrib}</th>
                <th className="py-2.5 px-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{t.isha}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/15 font-mono text-xs sm:text-sm">
              {calendarDays.map((d) => {
                const isToday =
                  d.day === currentDate.getDate() &&
                  selectedMonth === currentDate.getMonth() + 1 &&
                  selectedYear === currentDate.getFullYear();

                return (
                  <tr
                    key={d.day}
                    className={`transition-colors ${
                      isToday
                        ? 'bg-[#DBC66E]/20 font-bold shadow-md rounded-lg'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <td className="py-2.5 px-2.5 whitespace-nowrap text-white">
                      <span className="font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{d.day}</span>
                      <span className="text-[10px] ml-1 font-sans text-white/80">({d.weekday.slice(0, 2)})</span>
                      {isToday && (
                        <span className="ml-1.5 text-[9px] bg-[#DBC66E] text-[#0A1233] px-1.5 py-0.5 rounded-full font-bold uppercase font-sans shadow-md">
                          {t.today || 'Today'}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{d.fajr}</td>
                    <td className="py-2.5 px-2 text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{d.sunrise}</td>
                    <td className="py-2.5 px-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{d.dhuhr}</td>
                    <td className="py-2.5 px-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{d.asr}</td>
                    <td className="py-2.5 px-2 font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{d.maghrib}</td>
                    <td className="py-2.5 px-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{d.isha}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};
export default MonthlyTimetableSection;
