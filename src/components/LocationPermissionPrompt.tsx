import React, { useState } from 'react';
import { Navigation, Search, AlertCircle, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';
import { CityLocation } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { acquireHighPrecisionGPS, GPSProgressUpdate } from '../utils/gpsEngine';
import { soundManager } from '../utils/soundEffects';

interface LocationPermissionPromptProps {
  isOpen: boolean;
  onLocationSelected: (city: CityLocation) => void;
  onOpenManualSearch: () => void;
  initialError?: string | null;
}

export const LocationPermissionPrompt: React.FC<LocationPermissionPromptProps> = ({
  isOpen,
  onLocationSelected,
  onOpenManualSearch,
  initialError,
}) => {
  const { language } = useTranslation();
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);
  const [liveProgress, setLiveProgress] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestGPS = async () => {
    soundManager.playBeadClick();
    setIsLocating(true);
    setErrorMessage(null);
    setLiveProgress(
      language === 'uz' 
        ? '🛰️ Sun’iy yo‘ldosh signali qidirilmoqda...' 
        : '🛰️ Поиск спутников GPS...'
    );

    try {
      const result = await acquireHighPrecisionGPS(
        language,
        (progress: GPSProgressUpdate) => {
          if (progress.message) {
            setLiveProgress(progress.message);
          }
          if (progress.status === 'error') {
            setErrorMessage(progress.message);
          }
        },
        10000
      );

      setLiveProgress(
        language === 'uz'
          ? `✅ Manzil aniqlandi: ${result.city.street || result.city.mahalla || result.city.displayName}`
          : `✅ Местоположение определено: ${result.city.displayName}`
      );

      setTimeout(() => {
        onLocationSelected({
          ...result.city,
          isVerifiedByUser: true,
          isGpsExact: true,
        });
      }, 500);
    } catch (err: any) {
      console.warn('GPS Request failed:', err);
      setErrorMessage(
        err.message || 
        (language === 'uz' 
          ? 'GPS ruxsati berilmadi. Iltimos brauzer sozlamalarida Geolokatsiyaga ruxsat bering yoki qidiruvdan foydalaning.' 
          : 'Доступ к GPS не получен. Разрешите доступ в браузере или выберите город из поиска.')
      );
      setLiveProgress(null);
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-300 select-none">
      <div 
        className="w-full max-w-md rounded-3xl backdrop-blur-3xl bg-[#0B132B]/90 border border-white/20 p-6 sm:p-7 shadow-[0_16px_60px_rgba(0,0,0,0.8)] flex flex-col text-white relative overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#DBC66E]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Top Icon Badge */}
        <div className="mx-auto mb-4 w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#DBC66E]/20 to-white/10 border border-[#DBC66E]/40 flex items-center justify-center shadow-lg relative">
          <Navigation className={`w-8 h-8 text-[#DBC66E] ${isLocating ? 'animate-spin' : ''}`} />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0B132B] flex items-center justify-center">
            <ShieldCheck className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-xl sm:text-2xl font-bold text-center tracking-tight font-brand-display">
          {language === 'uz' ? (
            <>
              Aniq Joylashuvni<br />
              <span className="text-[#DBC66E]">Aniqlash Zarur</span>
            </>
          ) : language === 'ru' ? (
            <>
              Требуется<br />
              <span className="text-[#DBC66E]">Точное Местоположение</span>
            </>
          ) : (
            <>
              Precise Location<br />
              <span className="text-[#DBC66E]">Required</span>
            </>
          )}
        </h2>

        {/* Explanation */}
        <p className="text-xs sm:text-sm text-white/75 text-center mt-2.5 leading-relaxed font-sans">
          {language === 'uz' 
            ? 'Namoz vaqtlari, azon ovozi, Qibla yo‘nalishi va jome masjidlari aniq bo‘lishi uchun siz turgan joy (ko‘cha, mahalla, tuman) zarur. Ilova noto‘g‘ri yoki soxta hudud bilan ishlamaydi.'
            : language === 'ru'
            ? 'Для точного времени намаза, азана и направления Киблы требуется ваше реальное местоположение (улица, махалля, район).'
            : 'Exact prayer times, azan and Qibla direction require your precise location (street, district, city).'}
        </p>

        {/* Live Progress or Error Banner */}
        {liveProgress && (
          <div className="mt-4 p-3 rounded-2xl bg-[#DBC66E]/15 border border-[#DBC66E]/40 text-xs text-[#FAF8F3] flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-[#DBC66E] shrink-0" />
            <span className="font-medium">{liveProgress}</span>
          </div>
        )}

        {errorMessage && !liveProgress && (
          <div className="mt-4 p-3.5 rounded-2xl bg-red-950/50 border border-red-500/50 text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-left leading-snug">
              <span className="font-semibold block mb-0.5">
                {language === 'uz' ? 'GPS ruxsati cheklangan:' : 'Доступ к GPS ограничен:'}
              </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          {/* Main GPS Auto Detect Button */}
          <button
            id="btn-permit-gps-exact"
            onClick={handleRequestGPS}
            disabled={isLocating}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#DBC66E] to-[#FAF8F3] text-[#070D1E] font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_8px_25px_rgba(219,198,110,0.4)] active:scale-[0.98] transition cursor-pointer hover:brightness-105 disabled:opacity-60"
          >
            <Navigation className={`w-4 h-4 text-[#070D1E] ${isLocating ? 'animate-spin' : ''}`} />
            <span>
              {isLocating 
                ? (language === 'uz' ? 'Sun’iy yo‘ldoshga ulanmoqda...' : 'Поиск спутников...')
                : (language === 'uz' ? '🛰️ GPS Orqali Aniq Aniqlash' : '🛰️ Определить через GPS')}
            </span>
          </button>

          {/* Secondary Manual Search Button */}
          <button
            id="btn-choose-manual-location"
            onClick={() => {
              soundManager.playBeadClick();
              onOpenManualSearch();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#DBC66E]" />
            <span>
              {language === 'uz' 
                ? '🔍 Qidiruvdan Mahallangiz / Shahringizni Tanlash' 
                : '🔍 Выбрать махаллю / город из поиска'}
            </span>
          </button>
        </div>

        {/* Bottom privacy info */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/50">
          <MapPin className="w-3.5 h-3.5 text-[#DBC66E]" />
          <span>
            {language === 'uz' 
              ? 'GPS ma’lumotlari faqat sizning qurilmangizda hisoblanadi' 
              : 'Данные GPS обрабатываются локально на устройстве'}
          </span>
        </div>
      </div>
    </div>
  );
};
export default LocationPermissionPrompt;
