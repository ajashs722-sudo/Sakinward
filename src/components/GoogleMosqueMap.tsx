import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Building2, 
  Compass, 
  Landmark, 
  Globe2, 
  ExternalLink,
  Navigation
} from 'lucide-react';
import { CityLocation } from '../types';
import { soundManager } from '../utils/soundEffects';
import { reverseGeocodeLocation } from '../services/apiService';
import { useTranslation } from '../i18n/LanguageContext';

interface GoogleMosqueMapProps {
  currentCity: CityLocation;
  onPickCoordinates?: (city: CityLocation) => void;
  language: string;
}

export const GoogleMosqueMap: React.FC<GoogleMosqueMapProps> = ({
  currentCity,
  onPickCoordinates,
  language,
}) => {
  const { t } = useTranslation();

  // 2 modes inside the mosques tab: 'mosques' (Masjidlar) and 'pinpoint' (Mening joylashuvim / Aniq GPS)
  const [viewMode, setViewMode] = useState<'mosques' | 'pinpoint'>('mosques');

  const [detailedAddress, setDetailedAddress] = useState<{
    manzil: string;
    hudud: string;
    shahar: string;
    davlat: string;
  }>(() => deriveAddressFields(currentCity));

  function deriveAddressFields(loc: CityLocation) {
    const parts = (loc.displayName || '').split(',').map((p) => p.trim());
    const country = loc.country || parts[parts.length - 1] || 'O‘zbekiston';
    const city = loc.city || loc.name || (parts.length > 1 ? parts[parts.length - 2] : 'Toshkent');
    const district = loc.district || loc.state || (parts.length > 2 ? parts[parts.length - 3] : city);
    const manzil = loc.addressLine || loc.mahalla || loc.street || loc.name || parts[0] || 'Markaziy hudud';

    return {
      manzil,
      hudud: district || city,
      shahar: city,
      davlat: country,
    };
  }

  // Reverse geocode if detailed street/mahalla is missing
  useEffect(() => {
    setDetailedAddress(deriveAddressFields(currentCity));

    if (!currentCity.street && !currentCity.mahalla && !currentCity.district && currentCity.lat && currentCity.lng) {
      let isMounted = true;
      reverseGeocodeLocation(currentCity.lat, currentCity.lng, language)
        .then((geo) => {
          if (isMounted) {
            setDetailedAddress(deriveAddressFields(geo));
            if (onPickCoordinates && (geo.street || geo.mahalla || geo.district)) {
              onPickCoordinates(geo);
            }
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [currentCity, language, onPickCoordinates]);

  const lat = currentCity.lat || 41.311081;
  const lng = currentCity.lng || 69.240562;

  // Search query for Google Maps embed
  // 'mosques' mode searches for Islamic mosques around the user coordinates
  // 'pinpoint' mode zeroes in on the exact user coordinates
  const mapSearchQuery = viewMode === 'mosques'
    ? `Islamic mosque near ${lat},${lng}`
    : `${lat},${lng}`;

  const mapZoom = viewMode === 'mosques' ? 14 : 16;
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&output=embed&z=${mapZoom}`;

  // Direct link to Google Maps
  const externalGoogleMapsUrl = viewMode === 'mosques'
    ? `https://www.google.com/maps/search/Islamic+mosque/@${lat},${lng},14z`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div 
      className="w-full flex flex-col gap-3 rounded-3xl p-3.5 sm:p-5 shadow-2xl animate-in fade-in duration-300 backdrop-blur-2xl border"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        color: '#FFFFFF',
      }}
    >
      {/* Top Header: Title and Google Maps External Link */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#DBC66E]/20 text-[#DBC66E] flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
              {language === 'uz' 
                ? 'Google Maps & Masjidlar' 
                : language === 'ru' 
                ? 'Google Maps и мечети' 
                : 'Google Maps & Mosques'}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {viewMode === 'mosques' 
                  ? (language === 'uz' ? 'Atrofdagi jome masjidlari' : language === 'ru' ? 'Мечети поблизости' : 'Nearby mosques')
                  : (language === 'uz' ? 'Aniq GPS joylashuvingiz' : language === 'ru' ? 'Точная точка GPS' : 'Exact GPS point')}
              </span>
            </div>
          </div>
        </div>

        <a
          href={externalGoogleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition active:scale-95 shadow-sm shrink-0"
          title={language === 'uz' ? 'Google Maps ilovasida ochish' : 'Открыть в Google Maps'}
        >
          <span className="text-[11px] font-medium hidden sm:inline">Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#DBC66E]" />
        </a>
      </div>

      {/* 2 Internal View Tabs: [Masjidlar] and [Mening joylashuvim / Aniq GPS] */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-xl">
        <button
          type="button"
          id="btn-mode-mosques"
          onClick={() => {
            soundManager.playBeadClick();
            setViewMode('mosques');
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
            viewMode === 'mosques'
              ? 'bg-[#DBC66E] text-[#070D1E] shadow-md'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {language === 'uz' ? 'Masjidlar' : language === 'ru' ? 'Мечети' : 'Mosques'}
          </span>
        </button>

        <button
          type="button"
          id="btn-mode-pinpoint"
          onClick={() => {
            soundManager.playBeadClick();
            setViewMode('pinpoint');
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
            viewMode === 'pinpoint'
              ? 'bg-[#DBC66E] text-[#070D1E] shadow-md'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <MapPin className="w-4 h-4 shrink-0 text-red-500" />
          <span className="truncate">
            {language === 'uz' ? 'Mening joylashuvim' : language === 'ru' ? 'Мое местоположение' : 'My Location'}
          </span>
        </button>
      </div>

      {/* Structured Address Details Card */}
      <div className="w-full rounded-2xl bg-slate-900/95 border border-white/20 p-3 sm:p-3.5 shadow-md space-y-2">
        {/* Manzil (Ko‘cha / Mahalla) */}
        <div className="flex items-start gap-2.5 pb-2 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-[#DBC66E]/20 text-[#DBC66E] flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DBC66E]">
                {t.address || 'Manzil (Ko‘cha / Mahalla)'}
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                ● {language === 'uz' ? 'Aniq GPS' : language === 'ru' ? 'Точный GPS' : 'Exact GPS'}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-white truncate drop-shadow-sm mt-0.5">
              {detailedAddress.manzil}
            </div>
          </div>
        </div>

        {/* Grid: Hudud / Tuman, Shahar, Davlat */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
          {/* Hudud / Tuman */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/10">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Compass className="w-3 h-3" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                {t.district || 'Tuman / Hudud'}
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {detailedAddress.hudud}
              </div>
            </div>
          </div>

          {/* Shahar */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/10">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Landmark className="w-3 h-3" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                {t.city || 'Shahar'}
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {detailedAddress.shahar}
              </div>
            </div>
          </div>

          {/* Davlat */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/10">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Globe2 className="w-3 h-3" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                {t.country || 'Davlat'}
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {detailedAddress.davlat}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps Interactive Frame */}
      <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-white/20 bg-slate-950 shadow-inner">
        <iframe
          key={`gmap-frame-${viewMode}-${lat}-${lng}`}
          title="Google Maps"
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full filter brightness-100 contrast-100"
        />

        {/* Center Target Indicator in Pinpoint Mode */}
        {viewMode === 'pinpoint' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-[0_0_15px_rgba(239,68,68,1)] animate-ping opacity-75" />
          </div>
        )}
      </div>

      {/* Mode hint description */}
      <div className="flex items-center justify-between text-[11px] text-white/60 px-1">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-[#DBC66E]" />
          <span>
            {viewMode === 'mosques' 
              ? (language === 'uz' ? 'Xarita atrofingizdagi Islom jome masjidlarini ko‘rsatmoqda' : language === 'ru' ? 'Карта показывает мечети вокруг вас' : 'Showing nearby Islamic mosques')
              : (language === 'uz' ? 'Xarita sizning aniq koordinatangizga qaratilgan' : language === 'ru' ? 'Карта сфокусирована на вашей точке GPS' : 'Focused on your exact GPS position')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GoogleMosqueMap;
