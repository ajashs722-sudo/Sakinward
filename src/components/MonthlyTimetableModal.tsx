import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { CityLocation } from '../types';
import { fetchMonthlyCalendar, MonthlyDayPrayer } from '../services/apiService';
import { getCityLocalNow, nowInCity } from '../services/prayerEngine';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';

interface MonthlyTimetableModalProps {
  currentCity: CityLocation;
  onClose: () => void;
}

export const MonthlyTimetableModal: React.FC<MonthlyTimetableModalProps> = ({
  currentCity,
  onClose,
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
    <div 
      className="fixed inset-0 z-50 flex flex-col p-3 md:p-6 overflow-y-auto no-scrollbar backdrop-blur-2xl animate-in fade-in duration-200 select-none"
      style={{
        background: 'var(--nur-gradient-page)',
        color: 'var(--nur-color-on-bg)',
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--nur-border-glass)] max-w-3xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm backdrop-blur-xl bg-white/10 dark:bg-black/30 border border-[var(--nur-border-glass)]">
            <CalendarIcon className="w-5 h-5" style={{ color: 'var(--nur-color-accent)' }} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold font-brand-display" style={{ color: 'var(--nur-color-on-bg)' }}>{t.monthlyTimetable}</h1>
            <p className="text-xs opacity-75 flex items-center gap-1 font-medium" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>
              <MapPin className="w-3.5 h-3.5" />
              {currentCity.displayName}
            </p>
          </div>
        </div>

        <button
          id="btn-close-calendar"
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition active:scale-95 border border-[var(--nur-border-glass)] backdrop-blur-xl bg-white/10 dark:bg-black/30"
          aria-label="Close"
        >
          <X className="w-5 h-5" style={{ color: 'var(--nur-color-on-bg)' }} />
        </button>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto space-y-4 my-4 pb-20">
        {/* Liquid Glass Month Selector Bar */}
        <div className="rounded-2xl p-3.5 flex items-center justify-between border border-[var(--nur-border-glass)] shadow-lg backdrop-blur-2xl bg-white/10 dark:bg-black/30">
          <button
            onClick={handlePrevMonth}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition active:scale-95 bg-white/10 dark:bg-black/20 border border-[var(--nur-border-glass)]"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--nur-color-on-bg)' }} />
          </button>

          <div className="text-sm sm:text-base font-bold capitalize font-brand-display" style={{ color: 'var(--nur-color-on-bg)' }}>
            {formattedMonthYear}
          </div>

          <button
            onClick={handleNextMonth}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition active:scale-95 bg-white/10 dark:bg-black/20 border border-[var(--nur-border-glass)]"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--nur-color-on-bg)' }} />
          </button>
        </div>

        {/* Liquid Glass Timetable Table Card */}
        <div 
          className="rounded-3xl p-3 sm:p-5 border border-[var(--nur-border-glass)] overflow-x-auto no-scrollbar shadow-2xl backdrop-blur-2xl bg-white/10 dark:bg-black/35"
        >
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-[var(--nur-color-accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold opacity-75" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>
                {t.loadingPrayerTimes || t.loading || 'Calculating prayer times...'}
              </span>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[340px]">
              <thead>
                <tr className="border-b border-[var(--nur-border-glass)] font-bold text-xs" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>
                  <th className="py-3 px-2.5">{t.calendar}</th>
                  <th className="py-3 px-2">{t.fajr}</th>
                  <th className="py-3 px-2">{t.sunrise}</th>
                  <th className="py-3 px-2">{t.dhuhr}</th>
                  <th className="py-3 px-2">{t.asr}</th>
                  <th className="py-3 px-2">{t.maghrib}</th>
                  <th className="py-3 px-2">{t.isha}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nur-border-glass)]/25 font-mono text-xs sm:text-sm">
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
                          ? 'bg-[var(--nur-color-accent)]/25 font-bold shadow-sm'
                          : 'hover:bg-white/10 dark:hover:bg-white/5'
                      }`}
                      style={{ color: 'var(--nur-color-on-bg)' }}
                    >
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <span className="font-bold">{d.day}</span>
                        <span className="text-[10px] ml-1 font-sans opacity-70">({d.weekday.slice(0, 2)})</span>
                        {isToday && (
                          <span className="ml-1.5 text-[9px] bg-[var(--nur-color-accent)] text-[#0A1233] px-1.5 py-0.5 rounded-full font-bold uppercase font-sans">
                            {t.today || 'Today'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 font-bold">{d.fajr}</td>
                      <td className="py-3 px-2 opacity-70">{d.sunrise}</td>
                      <td className="py-3 px-2">{d.dhuhr}</td>
                      <td className="py-3 px-2">{d.asr}</td>
                      <td className="py-3 px-2 font-bold">{d.maghrib}</td>
                      <td className="py-3 px-2">{d.isha}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
export default MonthlyTimetableModal;
