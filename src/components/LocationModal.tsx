import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  X, 
  Search, 
  MapPin, 
  Navigation, 
  Sparkles, 
  History, 
  Check, 
  Loader2, 
  Globe, 
  Trash2,
  ChevronRight,
  Map as MapIcon,
  List
} from 'lucide-react';
import { CityLocation } from '../types';
import { calculateQibla, searchGlobalCities, reverseGeocodeLocation } from '../services/apiService';
import { useTranslation } from '../i18n/LanguageContext';
import { soundManager } from '../utils/soundEffects';
import { GoogleMosqueMap } from './GoogleMosqueMap';
import { acquireHighPrecisionGPS, GPSProgressUpdate } from '../utils/gpsEngine';

interface LocationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSelectCity: (city: CityLocation) => void;
  currentCity: CityLocation;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen = true,
  onClose,
  onSelectCity,
  currentCity,
}) => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gpsLiveStatus, setGpsLiveStatus] = useState<string | null>(null);

  // Load user's saved recent locations from cache (IndexedDB / LocalStorage)
  const [recentLocations, setRecentLocations] = useState<CityLocation[]>(() => {
    try {
      const saved = localStorage.getItem('sajda_recent_locations') || localStorage.getItem('sakinward_recent_locations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out unverified default placeholders
          const valid = parsed.filter((c: CityLocation) => c && (c.isVerifiedByUser || c.isGpsExact || c.street || c.mahalla));
          if (valid.length > 0) return valid;
        }
      }
    } catch {}
    
    // Only seed with user's current city if it is verified or GPS exact
    if (currentCity && (currentCity.isVerifiedByUser || currentCity.isGpsExact || currentCity.street || currentCity.mahalla)) {
      return [currentCity];
    }
    return [];
  });

  // Reset search when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setLocationError(null);
      setGpsLiveStatus(null);
    }
  }, [isOpen]);

  // Debounced search logic for fast local + global search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchGlobalCities(searchQuery, language);
        setSearchResults(results);
      } catch (err) {
        console.warn('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, language]);

  const handleCityPick = (city: CityLocation) => {
    soundManager.playBeadClick();
    const verifiedCity: CityLocation = {
      ...city,
      isVerifiedByUser: true,
    };
    onSelectCity(verifiedCity);

    // Save to recents without duplicates
    try {
      const updated = [
        verifiedCity,
        ...recentLocations.filter((c) => c.displayName !== verifiedCity.displayName && !(Math.abs(c.lat - verifiedCity.lat) < 0.005 && Math.abs(c.lng - verifiedCity.lng) < 0.005)),
      ].slice(0, 10);
      setRecentLocations(updated);
      localStorage.setItem('sajda_recent_locations', JSON.stringify(updated));
      localStorage.setItem('sakinward_recent_locations', JSON.stringify(updated));
    } catch {}

    onClose();
  };

  const handleClearRecents = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playBeadClick();
    setRecentLocations([]);
    try {
      localStorage.removeItem('sajda_recent_locations');
      localStorage.removeItem('sakinward_recent_locations');
    } catch {}
  };

  // High-Precision Multi-Sample GPS Location Detection
  const handleUseGPS = async () => {
    soundManager.playBeadClick();
    setLocating(true);
    setLocationError(null);
    setGpsLiveStatus(language === 'uz' ? '🛰️ Sun’iy yo‘ldosh signali qidirilmoqda...' : '🛰️ Поиск спутников...');

    try {
      const result = await acquireHighPrecisionGPS(
        language,
        (progress: GPSProgressUpdate) => {
          if (progress.message) {
            setGpsLiveStatus(progress.message);
          }
          if (progress.status === 'error') {
            setLocationError(progress.message);
          }
        },
        10000
      );

      const verifiedCity: CityLocation = {
        ...result.city,
        isGpsExact: true,
        isVerifiedByUser: true,
      };

      setGpsLiveStatus(
        language === 'uz'
          ? `✅ Aniq manzil topildi: ${verifiedCity.street || verifiedCity.mahalla || verifiedCity.displayName}`
          : `✅ Найдено: ${verifiedCity.displayName}`
      );

      setTimeout(() => {
        handleCityPick(verifiedCity);
      }, 400);
    } catch (err: any) {
      console.warn('GPS detection failed:', err);
      setLocationError(err.message || (language === 'uz' ? 'GPS xatoligi yuz berdi. Iltimos shahringizni qidiruvdan tanlang.' : 'Ошибка GPS. Выберите город из поиска.'));
      setGpsLiveStatus(null);
    } finally {
      setLocating(false);
    }
  };

  if (isOpen === false) return null;

  return (
    <div 
      className="relative z-10 w-full max-w-xl md:max-w-2xl mx-auto min-h-screen flex flex-col p-4 sm:p-6 pb-32 animate-in fade-in duration-200 select-none overflow-y-auto no-scrollbar"
      style={{ 
        color: 'var(--nur-color-on-bg)',
        WebkitOverflowScrolling: 'touch' 
      }}
    >
      <div className="w-full flex flex-col relative">
        
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between pt-1 pb-4">
          <button
            onClick={() => {
              soundManager.playBeadClick();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-2xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 active:scale-95 text-xs sm:text-sm font-semibold transition shadow-lg"
            style={{ color: 'var(--nur-color-on-bg)' }}
          >
            <ArrowLeft className="w-4 h-4 text-[#DBC66E]" />
            <span>{t.back || 'Back'}</span>
          </button>

          <button
            id="btn-close-location-top"
            onClick={() => {
              soundManager.playBeadClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full backdrop-blur-2xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 flex items-center justify-center transition active:scale-95 shadow-lg shrink-0"
            style={{ color: 'var(--nur-color-on-bg)' }}
            aria-label={t.close || 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title Header */}
        <div className="pb-3">
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight leading-snug font-brand-display" style={{ color: 'var(--nur-color-on-bg)' }}>
            {language === 'uz' ? (
              <>
                Joylashuv va<br />
                <span className="font-semibold text-[#DBC66E]">Masjidlar xaritasi</span>
              </>
            ) : language === 'ru' ? (
              <>
                Местоположение и<br />
                <span className="font-semibold text-[#DBC66E]">Карта мечетей</span>
              </>
            ) : (
              <>
                Location &<br />
                <span className="font-semibold text-[#DBC66E]">Mosques Map</span>
              </>
            )}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--nur-color-on-bg-tertiary)' }}>
            {language === 'uz' 
              ? 'Aniq namoz vaqtlari, Qibla yo‘nalishi va dunyo bo‘ylab Islom masjidlari' 
              : language === 'ru'
              ? 'Точное расписание намаза, направление Киблы и мечети по всему миру'
              : 'Exact prayer timings, Qibla direction and Islamic mosques worldwide'}
          </p>
        </div>

        {/* Main View Tab Switcher: List vs Mosques Map */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/15 my-2 backdrop-blur-xl">
          <button
            type="button"
            id="btn-tab-city-list"
            onClick={() => {
              soundManager.playBeadClick();
              setActiveTab('list');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
              activeTab === 'list'
                ? 'bg-[#DBC66E] text-[#070D1E] shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <List className="w-4 h-4 shrink-0" />
            <span className="truncate">{language === 'uz' ? 'Shaharlar' : language === 'ru' ? 'Города' : 'Cities'}</span>
          </button>

          <button
            type="button"
            id="btn-tab-mosque-map"
            onClick={() => {
              soundManager.playBeadClick();
              setActiveTab('map');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
              activeTab === 'map'
                ? 'bg-[#DBC66E] text-[#070D1E] shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <MapIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">{language === 'uz' ? 'Masjidlar' : language === 'ru' ? 'Мечети' : 'Mosques'}</span>
          </button>
        </div>

        {/* TAB 1: LIST & SEARCH VIEW */}
        {activeTab === 'list' && (
          <div className="flex flex-col animate-in fade-in duration-200">
            {/* Search Input & GPS Location Button Row */}
            <div className="flex items-center gap-2.5 my-3">
              {/* iOS Liquid Glassmorphic Search Box */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60 text-[#DBC66E]" />
                <input
                  id="input-city-search"
                  type="text"
                  placeholder={t.searchCityPlaceholder || 'Search city or district...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-3 rounded-2xl backdrop-blur-2xl bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.14] border border-white/20 focus:border-[#DBC66E]/60 text-sm outline-none transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] placeholder:text-white/40"
                  style={{ color: 'var(--nur-color-on-bg)' }}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#DBC66E]" />
                )}
                {searchQuery && !isSearching && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full opacity-60 hover:opacity-100 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* GPS Quick Button (Liquid Glass) */}
              <button
                id="btn-gps-location"
                onClick={handleUseGPS}
                disabled={locating}
                className="h-[46px] px-4 rounded-2xl backdrop-blur-2xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 flex items-center justify-center gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition shrink-0 group active:scale-95 cursor-pointer"
                style={{ color: 'var(--nur-color-on-bg)' }}
                title={t.detectGPS || 'Auto-detect GPS Location'}
              >
                <Navigation className={`w-4 h-4 text-[#DBC66E] ${locating ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
                <span className="text-xs font-bold hidden min-[400px]:inline">
                  {locating ? 'GPS...' : 'GPS'}
                </span>
              </button>
            </div>

            {/* GPS Live Progress Banner */}
            {gpsLiveStatus && (
              <div className="p-3 rounded-2xl backdrop-blur-2xl bg-[#DBC66E]/15 border border-[#DBC66E]/40 text-xs text-[#FAF8F3] flex items-center gap-2 my-2 shadow-lg animate-pulse">
                <Navigation className="w-3.5 h-3.5 text-[#DBC66E] animate-spin shrink-0" />
                <span className="flex-1 font-medium">{gpsLiveStatus}</span>
              </div>
            )}

            {/* GPS Error Notification Banner */}
            {locationError && !gpsLiveStatus && (
              <div className="p-3 rounded-2xl backdrop-blur-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2 my-2 shadow-lg">
                <span>⚠️</span>
                <span className="flex-1">{locationError}</span>
              </div>
            )}

            {/* SEARCH RESULTS OR RECENTS */}
            {searchQuery.trim().length > 0 ? (
              <div className="mt-2 space-y-2 flex-1">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#DBC66E]">
                    {t.searchResults || 'Search Results'} ({searchResults.length})
                  </h3>
                  <span className="text-[10px] opacity-60">Global OpenStreetMap & Google</span>
                </div>

                <div className="space-y-2">
                  {searchResults.length === 0 && !isSearching ? (
                    <div 
                      className="p-8 text-center rounded-3xl backdrop-blur-2xl bg-white/[0.05] border border-white/15 space-y-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
                    >
                      <Globe className="w-8 h-8 opacity-40 mx-auto text-[#DBC66E]" />
                      <p className="text-sm font-semibold">
                        {t.noCitiesFound || 'No cities found'}
                      </p>
                      <p className="text-xs opacity-60">
                        {language === 'uz' 
                          ? 'Iltimos, shahar nomini to‘g‘ri yozing yoki GPS tugmasidan foydalaning.' 
                          : language === 'ru'
                          ? 'Пожалуйста, проверьте название или используйте автоопределение GPS.'
                          : 'Try typing city name or use GPS auto-detect.'}
                      </p>
                    </div>
                  ) : (
                    searchResults.map((city) => {
                      const isSelected = currentCity.displayName === city.displayName;
                      const { distanceKm } = calculateQibla(city.lat, city.lng);
                      const title = city.street 
                        ? `${city.street}${city.mahalla ? `, ${city.mahalla}` : ''}`
                        : (city.mahalla || city.name || city.displayName.split(',')[0]);
                      const subtitle = city.district 
                        ? `${city.district}, ${city.city || city.country}`
                        : (city.displayName.includes(',') ? city.displayName.substring(city.displayName.indexOf(',') + 1).trim() : city.country);

                      return (
                        <div
                          key={`search-${city.displayName}-${city.lat}-${city.lng}`}
                          onClick={() => handleCityPick(city)}
                          className={`relative overflow-hidden p-4 rounded-2xl flex items-center justify-between border cursor-pointer transition-all duration-200 active:scale-[0.98] shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] ${
                            isSelected
                              ? 'backdrop-blur-2xl bg-gradient-to-r from-[#DBC66E]/25 via-white/[0.12] to-white/[0.06] border-[#DBC66E]/70 ring-1 ring-[#DBC66E]/40'
                              : 'backdrop-blur-2xl bg-white/[0.07] hover:bg-white/[0.14] border-white/15 hover:border-white/30'
                          }`}
                          style={{ color: 'var(--nur-color-on-bg)' }}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                              isSelected ? 'bg-[#DBC66E] text-[#070D1E]' : 'backdrop-blur-md bg-white/[0.1] border border-white/20 text-[#DBC66E]'
                            }`}>
                              {['Mecca', 'Medina', 'Jerusalem'].includes(city.name) ? (
                                <Sparkles className="w-5 h-5" />
                              ) : (
                                <MapPin className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold truncate flex items-center gap-1.5">
                                <span>{title}</span>
                                {city.isGpsExact && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#DBC66E]/20 text-[#DBC66E] border border-[#DBC66E]/30 font-semibold shrink-0">
                                    🛰️ GPS
                                  </span>
                                )}
                              </div>
                              <div className="text-xs truncate opacity-70 mt-0.5">
                                <span>{subtitle}</span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 pl-2">
                            {isSelected ? (
                              <div className="w-6 h-6 rounded-full bg-[#DBC66E] text-[#070D1E] flex items-center justify-center font-bold shadow-md">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <ChevronRight className="w-4 h-4 opacity-40" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* RECENTS LIST */
              <div className="mt-2 space-y-3 flex-1">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#DBC66E]">
                    <History className="w-4 h-4 text-[#DBC66E]" />
                    <span>{t.recentLocations || 'Recent Locations'}</span>
                  </div>
                  {recentLocations.length > 0 && (
                    <button
                      onClick={handleClearRecents}
                      className="text-[11px] opacity-60 hover:opacity-100 hover:text-red-300 flex items-center gap-1 transition px-2 py-0.5 rounded-lg hover:bg-white/[0.05]"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{t.clear || 'Clear'}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {recentLocations.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl backdrop-blur-md bg-white/[0.04] border border-white/10 text-xs opacity-60">
                      {language === 'uz' 
                        ? 'Saqlangan joylashuvlar yo‘q. Yuqoridagi GPS tugmasi orqali aniqlang yoki qidiruvdan tanlang.' 
                        : 'Нет сохраненных мест. Определите через GPS или выберите из поиска.'}
                    </div>
                  ) : recentLocations.map((rCity) => {
                    const isSelected = currentCity.displayName === rCity.displayName || 
                      (Math.abs(currentCity.lat - rCity.lat) < 0.005 && Math.abs(currentCity.lng - rCity.lng) < 0.005);
                    const { distanceKm } = calculateQibla(rCity.lat, rCity.lng);
                    const title = rCity.street 
                      ? `${rCity.street}${rCity.mahalla ? `, ${rCity.mahalla}` : ''}`
                      : (rCity.mahalla || rCity.name || rCity.displayName.split(',')[0]);
                    const subtitle = rCity.district 
                      ? `${rCity.district}, ${rCity.city || rCity.country}`
                      : (rCity.displayName.includes(',') ? rCity.displayName.substring(rCity.displayName.indexOf(',') + 1).trim() : rCity.country);

                    return (
                      <div
                        key={`recent-${rCity.displayName}-${rCity.lat}`}
                        onClick={() => handleCityPick(rCity)}
                        className={`relative overflow-hidden p-4 rounded-2xl flex items-center justify-between border cursor-pointer transition-all duration-200 active:scale-[0.98] shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] ${
                          isSelected
                            ? 'backdrop-blur-2xl bg-gradient-to-r from-[#DBC66E]/25 via-white/[0.12] to-white/[0.06] border-[#DBC66E]/70 ring-1 ring-[#DBC66E]/40'
                            : 'backdrop-blur-2xl bg-white/[0.07] hover:bg-white/[0.14] border-white/15 hover:border-white/30'
                        }`}
                        style={{ color: 'var(--nur-color-on-bg)' }}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                            isSelected 
                              ? 'bg-[#DBC66E] text-[#070D1E]' 
                              : 'backdrop-blur-md bg-white/[0.1] border border-white/20 text-[#DBC66E]'
                          }`}>
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold truncate flex items-center gap-1.5">
                              <span>{title}</span>
                              {rCity.isGpsExact && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#DBC66E]/20 text-[#DBC66E] border border-[#DBC66E]/30 font-semibold shrink-0">
                                  🛰️ GPS
                                </span>
                              )}
                            </div>
                            <div className="text-xs truncate opacity-70 mt-0.5">
                              <span>{subtitle}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 pl-2 flex items-center gap-2">
                          {isSelected && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DBC66E]/20 text-[#DBC66E] border border-[#DBC66E]/40">
                              {t.active || 'Active'}
                            </span>
                          )}
                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-[#DBC66E] text-[#070D1E] flex items-center justify-center font-bold shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <ChevronRight className="w-4 h-4 opacity-40" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GOOGLE MAPS & MOSQUES INTERACTIVE VIEW */}
        {activeTab === 'map' && (
          <div className="mt-2 animate-in fade-in duration-200">
            <GoogleMosqueMap
              currentCity={currentCity}
              onPickCoordinates={(newCity) => {
                onSelectCity(newCity);
                try {
                  const updated = [
                    newCity,
                    ...recentLocations.filter((c) => c.displayName !== newCity.displayName && !(Math.abs(c.lat - newCity.lat) < 0.005 && Math.abs(c.lng - newCity.lng) < 0.005)),
                  ].slice(0, 10);
                  setRecentLocations(updated);
                  localStorage.setItem('sajda_recent_locations', JSON.stringify(updated));
                  localStorage.setItem('sakinward_recent_locations', JSON.stringify(updated));
                } catch {}
              }}
              language={language}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default LocationModal;
