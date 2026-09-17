import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveTab, CityLocation, PrayerTimes, WallpaperOption } from './types';
import { CITIES_DATA, INITIAL_PRAYER_TIMES, WALLPAPER_OPTIONS } from './data/islamicData';
import { DEFAULT_BACKGROUND_ID } from './data/backgroundData';
import { fetchPrayerTimes } from './services/apiService';
import { getCityLocalNow, getSynchronousPrayerTimes, nowInCity } from './services/prayerEngine';
import { getHijriDate } from './utils/hijriCalendar';
import { acquireHighPrecisionGPS } from './utils/gpsEngine';
import { useTranslation } from './i18n/LanguageContext';
import { CelestialBackground } from './components/CelestialBackground';
import { Header } from './components/Header';
import { PrayerCountdown } from './components/PrayerCountdown';
import { BottomNavigation } from './components/BottomNavigation';
import { QuranReaderModal } from './components/QuranReaderModal';
import { QiblaModal } from './components/QiblaModal';
import { ZikrModal } from './components/ZikrModal';
import { NamesOfAllahModal } from './components/NamesOfAllahModal';
import { MonthlyTimetableModal } from './components/MonthlyTimetableModal';
import { MonthlyTimetableSection } from './components/MonthlyTimetableSection';
import { SettingsModal } from './components/SettingsModal';
import { MakkahLiveModal } from './components/MakkahLiveModal';
import { StoryModal } from './components/StoryModal';
import { LocationModal } from './components/LocationModal';
import { UserProfileModal } from './components/UserProfileModal';
import { QazoTrackerModal } from './components/QazoTrackerModal';
import { RozaTrackerModal } from './components/RozaTrackerModal';
import { SakinwardLandingModal } from './components/SakinwardLandingModal';
import { SakinwardLandingPage } from './components/SakinwardLandingPage';
import { HijriCalendarPage } from './components/HijriCalendarPage';
import { AcademyModal } from './components/AcademyModal';
import { FloatingSakinAi } from './components/FloatingSakinAi';
import { LocationPermissionPrompt } from './components/LocationPermissionPrompt';

export function App() {
  const { language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('landing')) {
        return 'landing';
      }
    }
    return 'home';
  });
  const [quranInitialSurah, setQuranInitialSurah] = useState<number | undefined>(undefined);
  const [quranInitialAyah, setQuranInitialAyah] = useState<number | undefined>(undefined);
  const [isFloatingAiOpen, setIsFloatingAiOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState<CityLocation>(() => {
    try {
      const saved = localStorage.getItem('sakinward_saved_city') || localStorage.getItem('sajda_saved_city');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.isVerifiedByUser || parsed.isGpsExact || parsed.street || parsed.mahalla)) {
          return parsed;
        }
      }
      return CITIES_DATA[0];
    } catch {
      return CITIES_DATA[0];
    }
  });

  const [showLocationPrompt, setShowLocationPrompt] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sakinward_saved_city') || localStorage.getItem('sajda_saved_city');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.isVerifiedByUser || parsed.isGpsExact || parsed.street || parsed.mahalla)) {
          return false;
        }
      }
    } catch {}
    return true;
  });

  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(() => {
    return getSynchronousPrayerTimes(currentCity);
  });
  const [hijriOffset, setHijriOffset] = useState<number>(0);
  const [currentBgId, setCurrentBgId] = useState<string>(() => {
    try {
      return localStorage.getItem('sakinward_selected_bg') || localStorage.getItem('sajda_selected_bg') || DEFAULT_BACKGROUND_ID;
    } catch {
      return DEFAULT_BACKGROUND_ID;
    }
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [nurTheme, setNurTheme] = useState<'nur-dark' | 'nur-light'>(() => {
    try {
      const saved = localStorage.getItem('sajda_nur_theme');
      return (saved as 'nur-dark' | 'nur-light') || 'nur-dark';
    } catch {
      return 'nur-dark';
    }
  });

  const mainScrollRef = useRef<HTMLDivElement>(null);

  const handleSelectBackground = (bgId: string) => {
    setCurrentBgId(bgId);
    try {
      localStorage.setItem('sakinward_selected_bg', bgId);
      localStorage.setItem('sajda_selected_bg', bgId);
    } catch {}
  };

  const handleSelectNurTheme = (theme: 'nur-dark' | 'nur-light') => {
    setNurTheme(theme);
    try {
      localStorage.setItem('sajda_nur_theme', theme);
    } catch {}
  };

  // Background Automatic GPS Location detection on initial app startup
  useEffect(() => {
    // Sanitize any legacy calculation method setting so Auto Dynamic Multi-Provider is active
    try {
      const savedMethod = localStorage.getItem('sakinward_calc_method') || localStorage.getItem('sajda_calc_method');
      if (savedMethod === '1') {
        localStorage.setItem('sakinward_calc_method', 'auto');
        localStorage.setItem('sajda_calc_method', 'auto');
      }
    } catch {}

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      acquireHighPrecisionGPS(
        language,
        undefined,
        7000
      )
        .then((result) => {
          if (result && result.city) {
            const verified: CityLocation = {
              ...result.city,
              isGpsExact: true,
              isVerifiedByUser: true,
            };
            setCurrentCity(verified);
            setShowLocationPrompt(false);
            try {
              localStorage.setItem('sakinward_saved_city', JSON.stringify(verified));
              localStorage.setItem('sajda_saved_city', JSON.stringify(verified));
            } catch {}
          }
        })
        .catch((err) => {
          console.info('Initial background location acquisition:', err);
        });
    }
  }, [language]);

  // Fetch real prayer times whenever the selected city or prayer calculation settings change
  useEffect(() => {
    // Synchronously set prayer times for the current city immediately
    setPrayerTimes(getSynchronousPrayerTimes(currentCity));

    let isMounted = true;

    const loadTimes = () => {
      fetchPrayerTimes(
        currentCity.name, 
        currentCity.country, 
        currentCity.lat, 
        currentCity.lng, 
        undefined, 
        undefined, 
        currentCity.timezone
      )
        .then((times) => {
          if (isMounted) {
            setPrayerTimes(times);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch prayer times, using high-precision astronomical fallback:', err);
        });
    };

    loadTimes();

    const handleSettingsChange = () => {
      loadTimes();
    };

    window.addEventListener('prayer_settings_changed', handleSettingsChange);
    return () => {
      isMounted = false;
      window.removeEventListener('prayer_settings_changed', handleSettingsChange);
    };
  }, [currentCity]);

  // Adjust Hijri date display
  const handleAdjustHijri = (delta: number) => {
    setHijriOffset((prev) => prev + delta);
  };

  const calculatedHijriDate = useMemo(() => {
    try {
      const cityNow = getCityLocalNow(currentCity.timezone, currentCity.lat, currentCity.lng, currentCity.country, currentCity.name);
      const res = getHijriDate(cityNow, hijriOffset, language);
      return res.formatted;
    } catch {
      return prayerTimes.hijriDate || '15 Rabi‘ al-Awwal 1448 AH';
    }
  }, [currentCity, prayerTimes, hijriOffset, language]);

  const handleScrollToTimetable = () => {
    const el = document.getElementById('section-monthly-timetable');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handleScrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLanding = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/landingpage');
    }
    setActiveTab('landing');
  };

  const handleEnterApp = () => {
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('landing')) {
      window.history.pushState({}, '', '/');
    }
    setActiveTab('home');
  };

  // Sync browser back/forward buttons with /landingpage routing
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('landing')) {
          setActiveTab('landing');
        } else if (activeTab === 'landing') {
          setActiveTab('home');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);

  // Scroll to top on active tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  // When sakin_ai tab is requested anywhere, cleanly transition to home and open official FloatingSakinAi
  useEffect(() => {
    if (activeTab === 'sakin_ai') {
      setActiveTab('home');
      setIsFloatingAiOpen(true);
    }
  }, [activeTab]);

  return (
    <div 
      className={`relative min-h-screen w-full flex flex-col items-center justify-between overflow-x-hidden select-none ${nurTheme}`}
      style={{ 
        background: 'transparent', 
        color: 'var(--nur-color-on-bg)',
        fontFamily: 'var(--nur-font-family)'
      }}
    >
      {/* 1. Dynamic Video & Canvas Celestial Background */}
      {activeTab !== 'landing' && (
        <CelestialBackground bgId={currentBgId} theme={nurTheme} />
      )}

      {/* 2. Main Active Page View */}
      <main className="relative z-10 w-full min-h-screen flex flex-col items-center justify-start">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <div 
                ref={mainScrollRef}
                className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl min-h-screen flex flex-col justify-between overflow-y-auto no-scrollbar scroll-smooth pb-32 animate-in fade-in duration-200"
              >
                {/* Top Header Bar */}
                <Header
                  currentCity={currentCity}
                  hijriDate={calculatedHijriDate}
                  hijriOffset={hijriOffset}
                  onAdjustHijri={handleAdjustHijri}
                  onOpenLocation={() => setActiveTab('location')}
                  onOpenProfile={() => setShowProfileModal(true)}
                  onOpenSettings={() => setActiveTab('settings')}
                  onOpenLanding={handleOpenLanding}
                  onOpenHijriCalendar={() => setActiveTab('hijri_calendar')}
                />

                {/* Central Majestic Prayer Countdown Clock & 6-Prayer Grid */}
                <div className="flex-1 flex flex-col justify-center my-auto">
                  <PrayerCountdown
                    prayerTimes={prayerTimes}
                    city={currentCity}
                    onOpenMonthlyCalendar={handleScrollToTimetable}
                  />
                </div>

                {/* Inline Parallax Scrollable Monthly Timetable Section */}
                <MonthlyTimetableSection
                  currentCity={currentCity}
                  onScrollToTop={handleScrollToTop}
                />
              </div>
            </motion.div>
          )}

          {/* Dedicated Location Page */}
          {activeTab === 'location' && (
            <motion.div
              key="location"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <LocationModal
                currentCity={currentCity}
                onSelectCity={(city) => {
                  const verified: CityLocation = {
                    ...city,
                    isVerifiedByUser: true,
                  };
                  setCurrentCity(verified);
                  setShowLocationPrompt(false);
                  localStorage.setItem('sakinward_saved_city', JSON.stringify(verified));
                  localStorage.setItem('sajda_saved_city', JSON.stringify(verified));
                }}
                onClose={() => setActiveTab('home')}
              />
            </motion.div>
          )}

          {/* Dedicated Hijri Calendar Page */}
          {activeTab === 'hijri_calendar' && (
            <motion.div
              key="hijri_calendar"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <HijriCalendarPage
                onClose={() => setActiveTab('home')}
                hijriOffset={hijriOffset}
                onAdjustHijri={handleAdjustHijri}
              />
            </motion.div>
          )}

          {/* Dedicated Full Landing Page */}
          {activeTab === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <SakinwardLandingPage
                onEnterApp={handleEnterApp}
                onOpenSakinAi={() => {
                  handleEnterApp();
                  setIsFloatingAiOpen(true);
                }}
                onNavigateTab={(tab, params) => {
                  if (tab === 'sakin_ai') {
                    handleEnterApp();
                    setIsFloatingAiOpen(true);
                    return;
                  }
                  if (tab === 'quran' && params?.surah) {
                    setQuranInitialSurah(params.surah);
                    setQuranInitialAyah(params.ayah);
                  }
                  handleEnterApp();
                  setActiveTab(tab);
                }}
              />
            </motion.div>
          )}

          {/* Dedicated Soundscapes Modal */}
          {activeTab === 'soundscapes' && (
            <motion.div
              key="soundscapes"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <SakinwardLandingModal
                onClose={() => setActiveTab('home')}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            </motion.div>
          )}

          {activeTab === 'quran' && (
            <motion.div
              key="quran"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <QuranReaderModal
                onClose={() => {
                  setQuranInitialSurah(undefined);
                  setQuranInitialAyah(undefined);
                  setActiveTab('home');
                }}
                initialSurahNumber={quranInitialSurah}
                initialAyahNumber={quranInitialAyah}
                nurTheme={nurTheme}
              />
            </motion.div>
          )}

          {activeTab === 'qibla' && (
            <motion.div
              key="qibla"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <QiblaModal
                currentCity={currentCity}
                onClose={() => setActiveTab('home')}
                onOpenMakkahLive={() => setActiveTab('makkah_live')}
                onSelectCity={(city) => {
                  setCurrentCity(city);
                  localStorage.setItem('sakinward_saved_city', JSON.stringify(city));
                  localStorage.setItem('sajda_saved_city', JSON.stringify(city));
                }}
              />
            </motion.div>
          )}

          {activeTab === 'zikr' && (
            <motion.div
              key="zikr"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <ZikrModal onClose={() => setActiveTab('home')} />
            </motion.div>
          )}

          {activeTab === 'names' && (
            <motion.div
              key="names"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <NamesOfAllahModal onClose={() => setActiveTab('home')} />
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <MonthlyTimetableModal
                currentCity={currentCity}
                onClose={() => setActiveTab('home')}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <SettingsModal
                currentBgId={currentBgId}
                onSelectBackground={handleSelectBackground}
                currentLanguage={language}
                onSelectLanguage={setLanguage}
                currentCity={currentCity}
                onOpenLocation={() => setActiveTab('location')}
                onClose={() => setActiveTab('home')}
                nurTheme={nurTheme}
                onSelectNurTheme={handleSelectNurTheme}
              />
            </motion.div>
          )}

          {activeTab === 'makkah_live' && (
            <motion.div
              key="makkah_live"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <MakkahLiveModal onClose={() => setActiveTab('home')} />
            </motion.div>
          )}

          {activeTab === 'story' && (
            <motion.div
              key="story"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <StoryModal onClose={() => setActiveTab('home')} />
            </motion.div>
          )}

          {activeTab === 'qazo' && (
            <motion.div
              key="qazo"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <QazoTrackerModal onClose={() => setActiveTab('home')} />
            </motion.div>
          )}

          {activeTab === 'roza' && (
            <motion.div
              key="roza"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <RozaTrackerModal onClose={() => setActiveTab('home')} />
            </motion.div>
          )}

          {activeTab === 'academy' && (
            <motion.div
              key="academy"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full flex flex-col items-center"
            >
              <AcademyModal
                onClose={() => setActiveTab('home')}
                onOpenSakinAiWithQuery={(query) => {
                  setIsFloatingAiOpen(true);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. Global Floating Liquid Glassmorphic Navigation Bar (Shown on Home View) */}
      {activeTab === 'home' && (
        <BottomNavigation
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'calendar' && activeTab === 'home') {
              handleScrollToTimetable();
            } else {
              setActiveTab(tab);
            }
          }}
        />
      )}

      {/* 4. User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          onClose={() => setShowProfileModal(false)}
          onOpenSettings={() => {
            setShowProfileModal(false);
            setActiveTab('settings');
          }}
          onOpenQazo={() => {
            setShowProfileModal(false);
            setActiveTab('qazo');
          }}
          onOpenRoza={() => {
            setShowProfileModal(false);
            setActiveTab('roza');
          }}
        />
      )}

      {/* 5. Universal Floating Sakin AI */}
      {activeTab !== 'landing' && (
        <FloatingSakinAi
          currentCity={currentCity}
          prayerTimes={prayerTimes}
          isOpenExternal={isFloatingAiOpen}
          onCloseExternal={() => setIsFloatingAiOpen(false)}
          nurTheme={nurTheme}
          onNavigateTab={(tab, params) => {
            if (tab === 'quran' && params?.surah) {
              setQuranInitialSurah(params.surah);
              setQuranInitialAyah(params.ayah);
            }
            setActiveTab(tab);
          }}
        />
      )}

      {/* 6. High-Precision Location Permission Prompt */}
      <LocationPermissionPrompt
        isOpen={showLocationPrompt && activeTab !== 'location' && activeTab !== 'landing'}
        onLocationSelected={(city) => {
          const verified: CityLocation = {
            ...city,
            isGpsExact: true,
            isVerifiedByUser: true,
          };
          setCurrentCity(verified);
          setShowLocationPrompt(false);
          try {
            localStorage.setItem('sakinward_saved_city', JSON.stringify(verified));
            localStorage.setItem('sajda_saved_city', JSON.stringify(verified));
          } catch {}
        }}
        onOpenManualSearch={() => {
          setShowLocationPrompt(false);
          setActiveTab('location');
        }}
      />
    </div>
  );
}
export default App;

