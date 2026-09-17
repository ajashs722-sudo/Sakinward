import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { PrayerTimes, CityLocation } from '../types';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';
import { getCityLocalNow, nowInCity } from '../services/prayerEngine';

interface PrayerCountdownProps {
  prayerTimes: PrayerTimes;
  city?: CityLocation;
  now?: Date;
  onOpenMonthlyCalendar: () => void;
}

export const PrayerCountdown: React.FC<PrayerCountdownProps> = ({
  prayerTimes,
  city,
  now: propNow,
  onOpenMonthlyCalendar,
}) => {
  const { t } = useTranslation();

  const [tick, setTick] = useState(0);

  // Ticks every second to drive real-time countdown
  useEffect(() => {
    if (propNow) return;

    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [propNow, city?.timezone, city?.lat, city?.lng]);

  // Compute exact city local current date & time on every tick or city prop change
  const activeNow = useMemo(() => {
    if (propNow) return propNow;
    return getCityLocalNow(city?.timezone, city?.lat, city?.lng, city?.country, city?.name);
  }, [propNow, city?.timezone, city?.lat, city?.lng, city?.country, city?.name, tick]);

  const { slots, nextPrayer, countdownStr, progressPercent } = useMemo(() => {
    const safeNow = activeNow instanceof Date && !isNaN(activeNow.getTime()) ? activeNow : new Date();

    const timeSlots = [
      { key: 'Fajr', name: t.fajr, time: prayerTimes?.Fajr || (prayerTimes as any)?.fajr || '05:00' },
      { key: 'Sunrise', name: t.sunrise, time: prayerTimes?.Sunrise || (prayerTimes as any)?.sunrise || '06:30' },
      { key: 'Dhuhr', name: t.dhuhr, time: prayerTimes?.Dhuhr || (prayerTimes as any)?.dhuhr || '12:30' },
      { key: 'Asr', name: t.asr, time: prayerTimes?.Asr || (prayerTimes as any)?.asr || '16:00' },
      { key: 'Maghrib', name: t.maghrib, time: prayerTimes?.Maghrib || (prayerTimes as any)?.maghrib || '18:30' },
      { key: 'Isha', name: t.isha, time: prayerTimes?.Isha || (prayerTimes as any)?.isha || '20:00' },
    ];

    const currentMinutes = safeNow.getHours() * 60 + safeNow.getMinutes();
    const currentSeconds = safeNow.getSeconds();
    const totalCurrentSec = currentMinutes * 60 + currentSeconds;

    const parsedSlots = timeSlots.map((slot) => {
      const [hStr, mStr] = (slot.time || '00:00').split(':');
      const h = parseInt(hStr, 10) || 0;
      const m = parseInt(mStr, 10) || 0;
      const slotTotalSec = (h * 60 + m) * 60;
      return { ...slot, totalSec: slotTotalSec };
    });

    let nextIndex = parsedSlots.findIndex((s) => s.totalSec > totalCurrentSec);
    let prevSlotSec = 0;
    let nextSlotSec = 0;
    let nextObj = parsedSlots[0];

    if (nextIndex === -1) {
      // Past Isha, next is Fajr tomorrow
      nextObj = parsedSlots[0];
      prevSlotSec = parsedSlots[parsedSlots.length - 1].totalSec;
      nextSlotSec = parsedSlots[0].totalSec + 24 * 3600;
    } else if (nextIndex === 0) {
      // Before Fajr today
      nextObj = parsedSlots[0];
      prevSlotSec = parsedSlots[parsedSlots.length - 1].totalSec - 24 * 3600;
      nextSlotSec = parsedSlots[0].totalSec;
    } else {
      nextObj = parsedSlots[nextIndex];
      prevSlotSec = parsedSlots[nextIndex - 1].totalSec;
      nextSlotSec = parsedSlots[nextIndex].totalSec;
    }

    let diffSec = nextSlotSec - totalCurrentSec;
    if (diffSec < 0) diffSec += 24 * 3600;

    const hoursLeft = Math.floor(diffSec / 3600);
    const minutesLeft = Math.floor((diffSec % 3600) / 60);
    const secondsLeft = diffSec % 60;

    const formattedCountdown = `${String(hoursLeft).padStart(2, '0')}:${String(
      minutesLeft
    ).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

    const totalWindowSec = Math.max(1, nextSlotSec - prevSlotSec);
    const elapsedSec = totalCurrentSec >= prevSlotSec ? totalCurrentSec - prevSlotSec : totalCurrentSec + 24 * 3600 - prevSlotSec;
    const progress = Math.min(100, Math.max(0, (elapsedSec / totalWindowSec) * 100));

    const finalSlots = parsedSlots.map((s) => ({
      ...s,
      isNext: nextIndex === -1 ? s.key === 'Fajr' : s.key === nextObj.key,
    }));

    return {
      slots: finalSlots,
      nextPrayer: nextObj,
      countdownStr: formattedCountdown,
      progressPercent: progress,
    };
  }, [activeNow, prayerTimes, t]);

  const handleScrollClick = () => {
    soundManager.playBeadClick();
    onOpenMonthlyCalendar();
  };

  return (
    <div className="relative z-10 w-full flex flex-col items-center select-none pt-2 sm:pt-4 pb-4 px-3 sm:px-6">
      {/* Central Clock & Next Prayer Indicator */}
      <div className="flex flex-col items-center text-center my-3 sm:my-6 max-w-xl w-full">
        {/* Next Prayer Badge - 100% Transparent, No Blur */}
        <div 
          className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md mb-3 sm:mb-4 border border-white/30 bg-transparent transition-all text-white"
        >
          <Sparkles className="w-4 h-4 text-[#DBC66E] drop-shadow-md" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            {t.untilPrayer} <strong className="font-bold underline underline-offset-4 text-[#DBC66E] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">{nextPrayer.name}</strong>
          </span>
        </div>

        {/* Large High-Contrast Countdown Display */}
        <div className="relative flex items-center justify-center my-2 sm:my-4 min-h-[80px] sm:min-h-[110px]">
          <div 
            className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight font-mono tabular-nums select-all text-white transition-all"
            style={{ 
              textShadow: '0 3px 18px rgba(0,0,0,0.95), 0 0 45px rgba(0,0,0,0.6)'
            }}
          >
            {countdownStr}
          </div>
        </div>

        {/* Dynamic Progress Bar - Clean Transparent Outline */}
        <div 
          className="w-48 sm:w-64 md:w-80 h-2 sm:h-2.5 rounded-full overflow-hidden mt-2 sm:mt-3 border border-white/30 bg-black/20 shadow-md"
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-[#DBC66E] via-[#E8D992] to-[#FAF8F3] shadow-[0_0_12px_rgba(219,198,110,0.7)]"
            style={{ 
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      {/* 6 Prayer Times Grid - 100% Transparent Cards, Zero Blur */}
      <div className="w-full max-w-xl md:max-w-2xl grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3 mt-4 sm:mt-6 px-1">
        {slots.map((slot) => {
          const isNextPrayer = slot.isNext;

          return (
            <div
              key={slot.key}
              id={`prayer-slot-${slot.key.toLowerCase()}`}
              className={`relative flex flex-col items-center justify-between py-3 sm:py-3.5 px-2 rounded-2xl sm:rounded-3xl min-h-[90px] sm:min-h-[102px] transition-all duration-200 ${
                isNextPrayer
                  ? 'bg-transparent shadow-[0_0_24px_rgba(219,198,110,0.4)] ring-2 ring-[#DBC66E] font-bold scale-[1.03] z-10 border-2 border-[#DBC66E]'
                  : 'bg-transparent shadow-md border border-white/30 hover:border-white/50 hover:bg-white/5'
              }`}
            >
              {/* Active Next Prayer Indicator Dot */}
              {isNextPrayer && (
                <div 
                  className="absolute -top-1.5 w-3 h-3 rounded-full bg-[#DBC66E] shadow-[0_0_8px_#DBC66E] animate-pulse"
                />
              )}

              {/* Top: Prayer Name */}
              <div className="flex flex-col items-center text-center">
                <span 
                  className={`text-xs sm:text-sm font-bold leading-tight truncate max-w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
                    isNextPrayer ? 'text-[#DBC66E]' : 'text-white'
                  }`}
                >
                  {slot.name}
                </span>
              </div>

              {/* Bottom: Prayer Time */}
              <div 
                className={`mt-1 text-sm sm:text-base md:text-lg font-extrabold tracking-tight font-mono tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
                  isNextPrayer ? 'text-[#DBC66E]' : 'text-white'
                }`}
              >
                {slot.time}
              </div>
            </div>
          );
        })}
      </div>

      {/* Animated Scroll Trigger Pill for Monthly Timetable - 100% Transparent, No Blur */}
      <div className="w-full flex flex-col items-center justify-center mt-6 sm:mt-8 mb-4">
        <button
          id="btn-scroll-timetable"
          onClick={handleScrollClick}
          className="group flex flex-col items-center gap-1.5 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full hover:bg-white/10 transition active:scale-95 border border-white/30 shadow-lg min-h-[46px] bg-transparent text-white"
          title="View Monthly Timetable"
        >
          <div className="w-10 h-1.5 rounded-full bg-[#DBC66E] group-hover:scale-110 transition-transform shadow-sm" />
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              {t.monthlyTimetable}
            </span>
            <ChevronDown className="w-4 h-4 text-[#DBC66E] animate-bounce" />
          </div>
        </button>
      </div>
    </div>
  );
};
export default PrayerCountdown;
