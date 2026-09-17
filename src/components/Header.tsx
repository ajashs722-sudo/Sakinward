import React, { useState } from 'react';
import { MapPin, ChevronDown, Settings, Globe } from 'lucide-react';
import { CityLocation } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageModal } from './LanguageModal';
import { HijriDateModal } from './HijriDateModal';

interface HeaderProps {
  currentCity: CityLocation;
  hijriDate: string;
  hijriOffset: number;
  onAdjustHijri: (delta: number) => void;
  onOpenLocation: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenLanding: () => void;
  onOpenHijriCalendar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  hijriDate,
  hijriOffset,
  onAdjustHijri,
  onOpenLocation,
  onOpenSettings,
  onOpenLanding,
  onOpenHijriCalendar,
}) => {
  const { t, language } = useTranslation();
  const [showLangModal, setShowLangModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cityName = currentCity.street 
    ? `${currentCity.street}${currentCity.mahalla ? `, ${currentCity.mahalla}` : ''}`
    : (currentCity.mahalla || currentCity.district || currentCity.name || currentCity.displayName.split(',')[0]);

  return (
    <header className="relative z-30 w-full pt-2 sm:pt-4 pb-2 px-2.5 sm:px-6 flex flex-col items-center select-none">
      {/* Symmetrical Elegant Top Navigation Bar - Full Pill Rounded */}
      <div 
        className="w-full max-w-xl md:max-w-2xl flex items-center justify-between gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 px-3 sm:px-4 rounded-full shadow-xl border-[1.5px] border-white/30 mb-2.5 sm:mb-3 min-h-[52px] sm:min-h-[58px] bg-black/25 backdrop-blur-md text-white"
      >
        {/* Left: Brand Logo & Title */}
        <a
          id="btn-brand-landing"
          href="/landingpage"
          onClick={(e) => {
            e.preventDefault();
            onOpenLanding();
          }}
          className="flex items-center gap-2.5 group transition active:scale-95 text-left py-0.5 pl-1 shrink-0 cursor-pointer"
          title="Sakinward - /landingpage"
        >
          {!imgError ? (
            <img
              src="https://sakinward.aluvantis.uz/Logo/89t8bVrDJpSbugTCKLHOuA.png"
              alt="Sakinward"
              onError={() => setImgError(true)}
              className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-[0_2px_10px_rgba(219,198,110,0.5)] transition-transform group-hover:scale-105 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#8A7410] via-[#DBC66E] to-[#FAF8F3] p-[1.5px] shadow-md shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#060B20] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#DBC66E]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8A9.056 9.056 0 0 0 12 3z"/>
                </svg>
              </div>
            </div>
          )}
          <span 
            className="font-brand-display text-sm sm:text-base md:text-lg font-bold leading-none tracking-wide transition group-hover:text-[#DBC66E] whitespace-nowrap hidden min-[400px]:inline text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
          >
            Sakinward
          </span>
        </a>

        {/* Center: Location Button */}
        <button
          id="btn-location-select"
          onClick={onOpenLocation}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-white max-w-[140px] min-[360px]:max-w-[180px] sm:max-w-[240px] shadow-md transition active:scale-95 border min-h-[36px] sm:min-h-[38px] shrink ${
            currentCity.isGpsExact 
              ? 'bg-black/25 hover:bg-black/40 border-[#DBC66E]/40'
              : (!currentCity.isVerifiedByUser 
                  ? 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-400/60 animate-pulse' 
                  : 'bg-black/20 hover:bg-black/35 border-white/25')
          }`}
          title={currentCity.addressLine || currentCity.displayName || cityName}
        >
          <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 drop-shadow-sm ${currentCity.isGpsExact ? 'text-[#DBC66E]' : 'text-[#FAF8F3]'}`} />
          <span 
            className="text-xs sm:text-sm font-bold tracking-tight truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
          >
            {cityName}
          </span>
          {currentCity.isGpsExact && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="GPS Aniq" />
          )}
          <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 opacity-80" />
        </button>

        {/* Right: Quick Language & Settings */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Quick Lang Modal Trigger */}
          <button
            id="btn-quick-lang"
            onClick={() => setShowLangModal(true)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-black/20 hover:bg-black/35 text-white shadow-md transition active:scale-95 border border-white/25 min-h-[36px] sm:min-h-[38px]"
            title="Language"
          >
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#DBC66E] drop-shadow-sm" />
            <span 
              className="uppercase text-[11px] sm:text-xs font-bold tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            >
              {language}
            </span>
          </button>

          {/* Settings Button */}
          <button
            id="btn-settings-header"
            onClick={onOpenSettings}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center active:scale-95 shadow-md transition border border-white/25 shrink-0"
            aria-label="Open Settings"
            title={t.settings}
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm" />
          </button>
        </div>
      </div>

      {/* 100% Transparent Hijri Date Pill - Opens Full Hijri Calendar Page */}
      <button 
        id="btn-hijri-details"
        onClick={onOpenHijriCalendar}
        className="cursor-pointer px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-black/15 hover:bg-black/30 text-white text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-2 shadow-md transition active:scale-[0.98] border border-white/25 min-h-[34px]"
        title={t.hijriCalendar || 'Hijri Calendar'}
      >
        <span className="text-sm">🌙</span>
        <span 
          className="font-brand-body font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        >
          {hijriDate}
        </span>
        {hijriOffset !== 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#DBC66E] text-[#0A1233] shadow-sm">
            {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset}
          </span>
        )}
      </button>

      {/* Language Modal */}
      <LanguageModal
        isOpen={showLangModal}
        onClose={() => setShowLangModal(false)}
      />
    </header>
  );
};
export default Header;
