import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  X, 
  CheckCircle2, 
  RotateCw, 
  MapPin, 
  Info, 
  Sparkles, 
  Navigation, 
  Smartphone, 
  ShieldAlert,
  Volume2,
  VolumeX,
  Vibrate,
  Sliders,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CityLocation } from '../types';
import { calculateQibla } from '../services/apiService';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';
import { getQiblaTranslations } from '../i18n/qiblaTranslations';
import { 
  subscribeCompass, 
  isIOSOrientationPermissionRequired, 
  requestOrientationPermission,
  calculateMagneticDeclination,
  SensorAccuracyLevel,
  TiltState,
  getShortestAngleDiff,
  isInsideIframe
} from '../utils/compassEngine';
import { acquireHighPrecisionGPS } from '../utils/gpsEngine';

interface QiblaModalProps {
  currentCity: CityLocation;
  onClose: () => void;
  onOpenMakkahLive: () => void;
  onSelectCity?: (city: CityLocation) => void;
}

export const QiblaModal: React.FC<QiblaModalProps> = ({
  currentCity,
  onClose,
  onOpenMakkahLive,
  onSelectCity,
}) => {
  const { language } = useTranslation();
  // Multi-language full translation for Qibla page
  const qt = getQiblaTranslations(language);
  
  // Real-time calculated Qibla azimuth and distance from user's coordinates
  const { angle: qiblaAngle, distanceKm } = calculateQibla(currentCity.lat, currentCity.lng);
  
  // WMM (World Magnetic Model) Geomagnetic Declination for current location
  const magneticDeclination = calculateMagneticDeclination(currentCity.lat, currentCity.lng);

  // Compass & Sensor state
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [tilt, setTilt] = useState<TiltState>({ pitch: 0, roll: 0, isFlat: true });
  const [accuracyLevel, setAccuracyLevel] = useState<SensorAccuracyLevel>('high');
  const [isSensorActive, setIsSensorActive] = useState<boolean>(false);
  const [needsIOSPermission, setNeedsIOSPermission] = useState<boolean>(false);

  // Preferences (Saved in localStorage)
  const [useTrueNorth, setUseTrueNorth] = useState<boolean>(() => {
    return localStorage.getItem('qibla_true_north') !== 'false';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('qibla_sound') !== 'false';
  });
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(() => {
    return localStorage.getItem('qibla_vibrate') !== 'false';
  });
  
  // UI Panels
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showCalibrationGuide, setShowCalibrationGuide] = useState<boolean>(false);
  const [showGpsProgress, setShowGpsProgress] = useState<boolean>(false);
  const [gpsStatusText, setGpsStatusText] = useState<string>('');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // Aligned state tracking
  const [isAligned, setIsAligned] = useState<boolean>(false);
  const lastAlignedRef = useRef<boolean>(false);

  // Sensor state
  const dialRef = useRef<HTMLDivElement>(null);
  const inIframe = isInsideIframe();

  // Save settings on change
  useEffect(() => {
    localStorage.setItem('qibla_true_north', String(useTrueNorth));
  }, [useTrueNorth]);

  useEffect(() => {
    localStorage.setItem('qibla_sound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('qibla_vibrate', String(vibrateEnabled));
  }, [vibrateEnabled]);

  // Check iOS permission requirements on mount
  useEffect(() => {
    if (isIOSOrientationPermissionRequired()) {
      setNeedsIOSPermission(true);
    }
  }, []);

  // Subscribe to orientation sensors with priority fallback and robust filtering
  useEffect(() => {
    let receivedAny = false;
    const unsubscribe = subscribeCompass(
      (data) => {
        receivedAny = true;
        setIsSensorActive(true);
        setNeedsIOSPermission(false);
        setAccuracyLevel(data.accuracyLevel);

        // If True North is enabled and heading is magnetic, apply WMM declination
        let finalHeading = data.heading;
        if (useTrueNorth && data.source !== 'ios-webkit') {
          finalHeading = (data.heading + magneticDeclination + 360) % 360;
        }
        setDeviceHeading(Math.round(finalHeading * 10) / 10);
        setTilt(data.tilt);
      },
      (err) => {
        console.warn('Compass sensor error:', err);
      }
    );

    const timer = setTimeout(() => {
      if (!receivedAny) {
        setIsSensorActive(false);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [useTrueNorth, magneticDeclination]);

  // Alignment detection within +/- 3.5 degrees
  useEffect(() => {
    const diff = Math.abs(getShortestAngleDiff(qiblaAngle, deviceHeading));
    const aligned = diff <= 3.5;

    if (aligned !== isAligned) {
      setIsAligned(aligned);
      if (aligned && !lastAlignedRef.current) {
        if (soundEnabled) {
          soundManager.playChime();
        }
        if (vibrateEnabled) {
          soundManager.triggerHaptic();
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
              navigator.vibrate([40, 60, 40]);
            } catch (e) {}
          }
        }
      }
      lastAlignedRef.current = aligned;
    }
  }, [deviceHeading, qiblaAngle, isAligned, soundEnabled, vibrateEnabled]);

  // Open standalone browser window to grant direct hardware gyroscope/compass access
  const handleOpenStandalone = () => {
    window.open(window.location.href, '_blank');
  };

  // Request iOS permission on user click
  const handleEnableIOSCompass = async () => {
    try {
      const granted = await requestOrientationPermission();
      if (granted) {
        setNeedsIOSPermission(false);
        setIsSensorActive(true);
      }
    } catch (e) {
      console.warn('iOS orientation permission request failed:', e);
    }
  };

  // High precision GPS auto-refresh
  const handleRefreshGPS = async () => {
    setShowGpsProgress(true);
    setGpsStatusText(qt.searchingSatellites);

    try {
      const result = await acquireHighPrecisionGPS(language, (update) => {
        setGpsStatusText(update.message);
        if (update.accuracyMeters) {
          setGpsAccuracy(update.accuracyMeters);
        }
      }, 9000);

      if (onSelectCity) {
        onSelectCity(result.city);
      }
      setGpsAccuracy(result.accuracyMeters);
      soundManager.playBeadClick();

      setTimeout(() => {
        setShowGpsProgress(false);
      }, 1500);
    } catch (err: any) {
      setGpsStatusText(qt.gpsFailed);
      setTimeout(() => {
        setShowGpsProgress(false);
      }, 2500);
    }
  };

  // Cardinal direction label generator in active language
  const getCardinalName = (deg: number) => {
    const d = (deg + 360) % 360;
    if (d >= 337.5 || d < 22.5) return qt.north;
    if (d >= 22.5 && d < 67.5) return qt.northEast;
    if (d >= 67.5 && d < 112.5) return qt.east;
    if (d >= 112.5 && d < 157.5) return qt.southEast;
    if (d >= 157.5 && d < 202.5) return qt.south;
    if (d >= 202.5 && d < 247.5) return qt.southWest;
    if (d >= 247.5 && d < 292.5) return qt.west;
    return qt.northWest;
  };

  // Remaining angular difference for turn guidance
  const signedDiff = getShortestAngleDiff(qiblaAngle, deviceHeading);
  const absDiff = Math.abs(Math.round(signedDiff));

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-between p-3 sm:p-5 h-[100dvh] max-h-screen overflow-hidden text-[#FAF8F3] select-none font-sans animate-in fade-in duration-200"
      style={{
        // 100% Shaffof, toza orqa fon - Tanlangan video / shader / jonli fon to'liq ko'rinadi
        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.4) 100%)',
      }}
    >
      {/* Subtle Atmospheric Glow Rings (Transparent overlay) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className={`w-[520px] h-[520px] rounded-full blur-[100px] transition-all duration-700 pointer-events-none ${
          isAligned ? 'bg-emerald-500/20 scale-110' : 'bg-[#DBC66E]/10 scale-100'
        }`} />
        <div className="absolute w-[380px] h-[380px] rounded-full border border-white/10 pointer-events-none" />
      </div>

      {/* 1. TOP HEADER BAR (Symmetrical Rounded Glass Pill) */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md mx-auto pt-1 shrink-0 z-20"
      >
        <div className="flex items-center justify-between p-1.5 px-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl">
          {/* City / GPS & WMM Declination Indicator */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefreshGPS}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DBC66E] to-[#997E24] text-[#0D1C17] flex items-center justify-center shadow-lg shadow-[#DBC66E]/20 active:scale-95 transition"
              title={qt.gpsUpdateTitle}
            >
              <Navigation className="w-4 h-4 fill-current rotate-45" />
            </button>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide truncate max-w-[120px] sm:max-w-[160px]">
                  {currentCity.displayName.split(',')[0]}
                </span>
                {/* WMM True North Indicator */}
                <span 
                  onClick={() => setShowSettingsModal(true)}
                  className="cursor-pointer text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-[#DBC66E] font-mono font-medium flex items-center gap-1 transition"
                  title={qt.wmmTrueNorth}
                >
                  <span>{useTrueNorth ? 'WMM' : 'MAG'}</span>
                  <span>{magneticDeclination >= 0 ? `+${magneticDeclination}°` : `${magneticDeclination}°`}</span>
                </span>
              </div>
              <p className="text-[10px] text-white/70 flex items-center gap-1 font-medium">
                <MapPin className="w-2.5 h-2.5 text-[#DBC66E]" />
                {currentCity.lat.toFixed(2)}°N, {currentCity.lng.toFixed(2)}°E
              </p>
            </div>
          </div>

          {/* Top Right Action Pills */}
          <div className="flex items-center gap-1.5">
            {/* Quick Calibration & Settings */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition active:scale-95"
              title={qt.settingsTitle}
            >
              <Sliders className="w-3.5 h-3.5 text-[#DBC66E]" />
            </button>

            <button
              onClick={() => setShowInfoModal(true)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition active:scale-95"
              title={qt.guideButtonTitle}
            >
              <Info className="w-3.5 h-3.5 text-white/80" />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition active:scale-95"
              title={qt.closeButtonTitle}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* 2. MAIN COMPASS WORKSPACE */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-md w-full mx-auto p-2 my-auto">
        
        {/* Dynamic Heading & Deviation Status Pill */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-2 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/45 border border-white/20 backdrop-blur-xl shadow-xl">
            <span className="text-xs font-mono font-black tracking-wider text-white">
              N → <span className="text-[#DBC66E]">{qiblaAngle.toFixed(1)}°</span>
            </span>
            <div className="w-1 h-1 rounded-full bg-white/40" />
            <span className="text-[11px] font-medium text-white/95">
              {isAligned ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span>{qt.qiblaTargetLocked}</span>
                  <span>🕋</span>
                </span>
              ) : signedDiff > 0 ? (
                <span className="text-[#DBC66E]">→ {absDiff}° {qt.turnRight}</span>
              ) : (
                <span className="text-[#DBC66E]">← {absDiff}° {qt.turnLeft}</span>
              )}
            </span>
          </div>
        </motion.div>

        {/* AUTHENTIC COMPASS DIAL (Sajda Sensor-Driven Display) */}
        <div 
          ref={dialRef}
          className="relative w-[285px] h-[285px] sm:w-[330px] sm:h-[330px] flex items-center justify-center select-none pointer-events-none"
        >
          {/* Static Phone Alignment Marker (Top Vertical Pointer) */}
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
            <div className={`w-3.5 h-3.5 rotate-45 border-t-2 border-l-2 transition-colors duration-300 ${
              isAligned ? 'border-emerald-400 shadow-emerald-400/80 shadow-md' : 'border-[#DBC66E]'
            }`} />
          </div>

          {/* Outer Rotating Compass Disc (Rotates with phone orientation: -deviceHeading) */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none transition-transform duration-200 ease-out"
            style={{
              transform: `rotate(${-deviceHeading}deg)`,
            }}
          >
            {/* Outer Fine Glass Perimeter */}
            <div className={`absolute inset-0 rounded-full border-2 transition-all duration-500 shadow-2xl backdrop-blur-md ${
              isAligned 
                ? 'border-emerald-400/80 bg-emerald-950/20 shadow-emerald-500/30' 
                : 'border-[#DBC66E]/40 bg-black/35'
            }`} />

            {/* Degree Graduation Ticks (Every 30 degrees) */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute w-full h-full flex flex-col items-center"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className={`w-[1.5px] mt-1.5 ${deg % 90 === 0 ? 'h-3 bg-[#DBC66E]' : 'h-1.5 bg-white/40'}`} />
              </div>
            ))}

            {/* Dynamic Orbiting Kaaba Target Badge (Positioned at exact Qibla Azimuth) */}
            <div
              className="absolute inset-0 flex flex-col items-center"
              style={{ transform: `rotate(${qiblaAngle}deg)` }}
            >
              <div className="relative -mt-4 sm:-mt-5 flex flex-col items-center">
                {/* Kaaba White Circle Badge */}
                <motion.div 
                  animate={{ scale: isAligned ? [1, 1.15, 1] : 1 }}
                  transition={{ repeat: isAligned ? Infinity : 0, duration: 1.6 }}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all duration-300 ${
                    isAligned
                      ? 'bg-white text-black border-emerald-400 shadow-emerald-400/60 shadow-lg scale-110'
                      : 'bg-white text-black border-[#DBC66E] shadow-black/80'
                  }`}
                >
                  <span className="text-lg sm:text-xl">🕋</span>
                </motion.div>

                {/* Bright Alignment Indicator Dot */}
                <div className={`w-2.5 h-2.5 rounded-full mt-1 transition-all duration-300 ${
                  isAligned 
                    ? 'bg-emerald-400 shadow-emerald-400/80 shadow-md scale-125 animate-ping' 
                    : 'bg-[#DBC66E] shadow-[#DBC66E]/50 shadow-sm'
                }`} />
              </div>
            </div>

            {/* Inner Cardinal Crosshairs (N, E, S, W) */}
            <div className="relative w-[78%] h-[78%] rounded-full border border-dashed border-[#DBC66E]/20 flex items-center justify-center">
              {/* North (N) */}
              <span className="absolute top-2 text-xs font-black text-[#DBC66E] tracking-wider">
                N
              </span>
              {/* East (E) */}
              <span className="absolute right-3 text-xs font-bold text-white/70">
                E
              </span>
              {/* South (S) */}
              <span className="absolute bottom-2 text-xs font-bold text-white/70">
                S
              </span>
              {/* West (W) */}
              <span className="absolute left-3 text-xs font-bold text-white/70">
                W
              </span>

              {/* Axis Hairlines */}
              <div className="absolute w-[80%] h-[1px] bg-white/10" />
              <div className="absolute h-[80%] w-[1px] bg-white/10" />
            </div>
          </div>

          {/* Central Target Axis Needle (Glows vibrant emerald when aligned) */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ transform: `rotate(${-deviceHeading + qiblaAngle}deg)` }}
          >
            <div className={`w-[2.5px] h-[72%] transition-all duration-300 ${
              isAligned 
                ? 'bg-gradient-to-t from-transparent via-emerald-400 to-emerald-300 shadow-emerald-400 shadow-lg' 
                : 'bg-gradient-to-t from-transparent via-[#DBC66E]/30 to-[#DBC66E]/60'
            }`} />
          </div>

          {/* Center Digital Hub & Spirit Bubble Level */}
          <div className={`relative z-20 w-28 h-28 sm:w-30 sm:h-30 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl backdrop-blur-2xl transition-all duration-300 pointer-events-none ${
            isAligned
              ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-emerald-500/40 shadow-xl'
              : 'bg-black/60 border-[#DBC66E]/50 text-[#FAF8F3]'
          }`}>
            {/* Degree Readout */}
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none">
              {Math.round(deviceHeading)}°
            </span>
            
            {/* Direction Subtext */}
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${
              isAligned ? 'text-emerald-300' : 'text-[#DBC66E]'
            }`}>
              {getCardinalName(deviceHeading).split(' ')[0]}
            </span>

            {/* Bubble Level Indicator (Shows if phone is tilted) */}
            {!tilt.isFlat && isSensorActive && (
              <div className="absolute -bottom-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-[8px] font-bold text-black shadow-md">
                <Smartphone className="w-2.5 h-2.5" />
                <span>{qt.holdLevel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sensor & Calibration Status Bar */}
        <div className="mt-2 flex items-center justify-center gap-2">
          {isSensorActive ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-medium text-emerald-300 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{qt.sensorLive}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/15 text-[10px] text-white/80 backdrop-blur-md">
              <Radio className="w-3 h-3 text-[#DBC66E] animate-pulse" />
              <span>{qt.waitingSensor}</span>
            </div>
          )}

          {/* Discreet Calibration hint button (Figure-8 motion) */}
          <button
            onClick={() => setShowCalibrationGuide(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] font-medium text-[#DBC66E] border border-[#DBC66E]/30 transition active:scale-95"
            title={qt.calibrateSensor}
          >
            <span>♾️</span>
            <span>{qt.calibrateSensor}</span>
          </button>
        </div>

        {/* Alignment Status Banner */}
        <motion.div
          animate={{ scale: isAligned ? [1, 1.04, 1] : 1 }}
          transition={{ repeat: isAligned ? Infinity : 0, duration: 1.5 }}
          className={`mt-3 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 shadow-xl backdrop-blur-2xl ${
            isAligned
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-2 border-emerald-300 shadow-emerald-900/60'
              : 'bg-black/45 border border-white/20 text-[#DBC66E]'
          }`}
        >
          {isAligned ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-200 stroke-[3]" />
              <span>{qt.qiblaFound}</span>
            </>
          ) : (
            <>
              <RotateCw className="w-3.5 h-3.5 text-[#DBC66E] animate-spin" style={{ animationDuration: '4s' }} />
              <span>{qt.rotateTowardsKaaba}</span>
            </>
          )}
        </motion.div>

        {/* Iframe Standalone Hint: If embedded in iframe and sensors are waiting */}
        {inIframe && !isSensorActive && (
          <div className="w-full mt-3 p-2.5 px-3 rounded-2xl bg-[#DBC66E]/15 border border-[#DBC66E]/40 text-xs flex items-center justify-between backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2 text-left">
              <Smartphone className="w-4 h-4 text-[#DBC66E] shrink-0" />
              <span className="text-[11px] text-white/90 leading-tight">
                {qt.openInNewTabDesc}
              </span>
            </div>
            <button
              onClick={handleOpenStandalone}
              className="shrink-0 ml-2 px-3 py-1 rounded-full bg-[#DBC66E] text-black font-extrabold text-[11px] shadow hover:bg-[#cbb65b] transition active:scale-95 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{qt.openInNewTab}</span>
            </button>
          </div>
        )}

        {/* iOS Sensor Notice if permission is required */}
        {needsIOSPermission && (
          <div className="w-full mt-3 p-2.5 rounded-2xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{qt.iosPermissionTitle}</span>
            </div>
            <button
              onClick={handleEnableIOSCompass}
              className="px-3 py-1 rounded-full bg-amber-400 text-black font-bold text-[11px] shadow hover:bg-amber-300 transition active:scale-95"
            >
              {qt.grantPermission}
            </button>
          </div>
        )}

      </main>

      {/* 3. BOTTOM ACTION BAR (Clean & Symmetrical) */}
      <footer className="relative w-full max-w-md mx-auto pb-1 shrink-0 z-20">
        <div className="flex items-center justify-between px-2">
          
          {/* Bottom Left: Audio & Vibrate Quick Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-10 h-10 rounded-full border transition active:scale-95 flex items-center justify-center backdrop-blur-xl shadow-xl ${
                soundEnabled 
                  ? 'bg-[#DBC66E]/20 border-[#DBC66E] text-[#DBC66E]' 
                  : 'bg-black/40 border-white/20 text-white/50'
              }`}
              title={soundEnabled ? qt.turnSoundOff : qt.turnSoundOn}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setVibrateEnabled(!vibrateEnabled)}
              className={`w-10 h-10 rounded-full border transition active:scale-95 flex items-center justify-center backdrop-blur-xl shadow-xl ${
                vibrateEnabled 
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' 
                  : 'bg-black/40 border-white/20 text-white/50'
              }`}
              title={vibrateEnabled ? qt.turnVibrationOff : qt.turnVibrationOn}
            >
              <Vibrate className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Center: MAKKAH LIVE Pill Button */}
          <button
            onClick={onOpenMakkahLive}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/50 hover:bg-black/70 border border-white/25 text-xs font-extrabold tracking-wider uppercase text-white shadow-2xl backdrop-blur-2xl transition active:scale-95"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>{qt.makkahLive}</span>
          </button>

          {/* Bottom Right: Sensor Calibration Help */}
          <button
            onClick={() => setShowCalibrationGuide(true)}
            className="w-10 h-10 rounded-full bg-black/40 border border-white/20 text-white flex items-center justify-center hover:bg-black/60 transition active:scale-95 shadow-xl backdrop-blur-xl"
            title={qt.calibrateSensor}
          >
            <Radio className="w-4 h-4 text-[#DBC66E]" />
          </button>

        </div>
      </footer>

      {/* SENSOR & SOUND SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm p-5 rounded-3xl bg-[#0F201A] border border-[#DBC66E]/40 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#DBC66E]" />
                  <h3 className="text-sm font-bold">{qt.compassSettings}</h3>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* WMM True North Mode */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#DBC66E] flex items-center gap-1.5">
                      <span>{qt.wmmTrueNorth}</span>
                    </div>
                    <p className="text-[10px] text-white/70">
                      {magneticDeclination >= 0 ? `+${magneticDeclination}°` : `${magneticDeclination}°`} E ({qt.wmmTrueNorthDesc})
                    </p>
                  </div>
                  <button
                    onClick={() => setUseTrueNorth(!useTrueNorth)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                      useTrueNorth ? 'bg-[#DBC66E]' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
                      useTrueNorth ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Sound Chime Toggle */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{qt.soundChime}</span>
                    </div>
                    <p className="text-[10px] text-white/70">
                      {qt.soundChimeDesc}
                    </p>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                      soundEnabled ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Haptic Vibration Toggle */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{qt.hapticVibration}</span>
                    </div>
                    <p className="text-[10px] text-white/70">
                      {qt.hapticVibrationDesc}
                    </p>
                  </div>
                  <button
                    onClick={() => setVibrateEnabled(!vibrateEnabled)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                      vibrateEnabled ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
                      vibrateEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-2.5 rounded-full bg-[#DBC66E] text-black font-bold text-xs shadow-lg hover:bg-[#c9b257] transition"
              >
                {qt.saveAndClose}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SENSOR CALIBRATION GUIDE OVERLAY */}
      <AnimatePresence>
        {showCalibrationGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm p-5 rounded-3xl bg-[#0E1A16] border border-[#DBC66E]/40 text-center space-y-4 shadow-2xl"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-[#DBC66E]/20 border border-[#DBC66E] flex items-center justify-center text-2xl animate-bounce">
                ♾️
              </div>
              <h3 className="text-sm font-bold text-white">{qt.calibrateSensor}</h3>
              <p className="text-xs text-white/80 leading-relaxed">
                {qt.calibrateSensorDesc}
              </p>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-white/70 text-left space-y-1">
                <div>• {qt.calibrateTip1}</div>
                <div>• {qt.calibrateTip2}</div>
                <div>• {qt.calibrateTip3}</div>
              </div>
              <button
                onClick={() => setShowCalibrationGuide(false)}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#DBC66E] to-[#B89C35] text-black font-bold text-xs shadow-lg"
              >
                {qt.done}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SATELLITE GPS PROGRESS MODAL OVERLAY */}
      <AnimatePresence>
        {showGpsProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm p-5 rounded-3xl bg-[#0F201A] border border-[#DBC66E]/40 text-center space-y-3 shadow-2xl"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[#DBC66E]/20 border border-[#DBC66E] flex items-center justify-center text-[#DBC66E] animate-pulse">
                <Navigation className="w-6 h-6 rotate-45" />
              </div>
              <h3 className="text-sm font-bold text-white">{qt.highPrecisionGps}</h3>
              <p className="text-xs text-white/80 leading-relaxed font-mono">{gpsStatusText}</p>
              {gpsAccuracy && (
                <div className="text-[11px] text-emerald-400 font-semibold">
                  {qt.accuracyMeters}: ±{gpsAccuracy}m
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SENSOR & ACCURACY INFO MODAL OVERLAY */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-md p-5 rounded-3xl bg-[#0E1A16] border border-[#DBC66E]/30 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#DBC66E]/20 text-[#DBC66E] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{qt.guideTitle}</h3>
                    <p className="text-[10px] text-[#DBC66E] font-medium">{qt.guideSubtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-white/80 leading-relaxed">
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="font-bold text-[#DBC66E] flex items-center gap-1.5">
                    <span>{qt.guideTip1Title}</span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    {qt.guideTip1Desc}
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="font-bold text-[#DBC66E] flex items-center gap-1.5">
                    <span>{qt.guideTip2Title}</span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    {qt.guideTip2Desc}
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="font-bold text-[#DBC66E] flex items-center gap-1.5">
                    <span>{qt.guideTip3Title}</span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    {qt.guideTip3Desc}
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-[11px] flex items-center justify-between">
                  <span>{qt.makkahDistance}:</span>
                  <span className="font-bold font-mono">{distanceKm.toLocaleString()} km</span>
                </div>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#DBC66E] to-[#B89C35] text-black font-bold text-xs shadow-lg"
              >
                {qt.understood}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default QiblaModal;
