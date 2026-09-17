import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  BookOpen, 
  MoreHorizontal, 
  Heart, 
  Sparkles, 
  Calendar, 
  Radio, 
  Settings, 
  X,
  CheckCircle2,
  Moon,
  Home,
  Music,
  GraduationCap
} from 'lucide-react';
import { ActiveTab } from '../types';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lock body scroll when popup sheet is active
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleTabClick = (tab: ActiveTab) => {
    soundManager.playBeadClick();
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Liquid Glassmorphic Menu Popup Modal / Sheet */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xl select-none"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div 
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl space-y-4 border-t sm:border border-[var(--nur-border-glass)]"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                background: 'var(--nur-card-bg)',
                color: 'var(--nur-color-on-bg)',
              }}
            >
            {/* Mobile Drag Pill */}
            <div className="w-12 h-1.5 rounded-full bg-[var(--nur-border-glass)] mx-auto sm:hidden -mt-1 mb-1" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nur-border-glass)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--nur-color-accent)] text-[var(--nur-color-on-badge)] flex items-center justify-center font-bold shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-brand-display text-base sm:text-lg font-bold tracking-tight" style={{ color: 'var(--nur-color-on-bg)' }}>
                    Sakinward
                  </h2>
                  <p className="text-xs opacity-75" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>
                    {t.allDeeds || 'All Features & Audio'}
                  </p>
                </div>
              </div>
              <button
                id="btn-close-menu"
                onClick={() => setIsMenuOpen(false)}
                className="w-9 h-9 rounded-full nur-pill flex items-center justify-center hover:opacity-80 transition border border-[var(--nur-border-glass)]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" style={{ color: 'var(--nur-color-on-bg)' }} />
              </button>
            </div>

            {/* Menu Grid - Redesigned Clean 2-Column Grid Cards */}
            <div className="space-y-3 max-h-[68vh] overflow-y-auto no-scrollbar py-1">
              {/* 2-Column Clean Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Tasbeh */}
                <button
                  id="menu-item-zikr"
                  onClick={() => handleTabClick('zikr')}
                  className="flex items-center gap-2.5 p-3 rounded-2xl nur-pill hover:opacity-90 text-left border border-[var(--nur-border-glass)] transition active:scale-[0.97]"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--nur-color-on-bg)' }}>
                      {t.tasbih || 'Tasbeh'}
                    </div>
                    <div className="text-[10px] opacity-70 truncate" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>
                      {t.zikr || 'Zikrlar & Salovat'}
                    </div>
                  </div>
                </button>

                {/* 2. 99 Ism */}
                <button
                  id="menu-item-names"
                  onClick={() => handleTabClick('names')}
                  className="flex items-center gap-2.5 p-3 rounded-2xl nur-pill hover:opacity-90 text-left border border-[var(--nur-border-glass)] transition active:scale-[0.97]"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--nur-color-on-bg)' }}>
                      {t.namesOfAllah || '99 Ism'}
                    </div>
                    <div className="text-[10px] opacity-70 truncate" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>
                      {t.asmaAlHusna || 'Asmoul Husna'}
                    </div>
                  </div>
                </button>

                {/* 3. Qazo */}
                <button
                  id="menu-item-qazo"
                  onClick={() => handleTabClick('qazo')}
                  className="flex items-center gap-2.5 p-3 rounded-2xl nur-pill hover:opacity-90 text-left border border-[var(--nur-border-glass)] transition active:scale-[0.97]"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--nur-color-on-bg)' }}>
                      {t.qazo || 'Qazo Namoz'}
                    </div>
                    <div className="text-[10px] opacity-70 truncate" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>
                      {t.tracker || 'Qazo hisoblagich'}
                    </div>
                  </div>
                </button>

                {/* 4. Ro'za / Ramazon */}
                <button
                  id="menu-item-roza"
                  onClick={() => handleTabClick('roza')}
                  className="flex items-center gap-2.5 p-3 rounded-2xl nur-pill hover:opacity-90 text-left border border-[var(--nur-border-glass)] transition active:scale-[0.97]"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--nur-color-on-bg)' }}>
                      {t.fasting || 'Ro‘za'}
                    </div>
                    <div className="text-[10px] opacity-70 truncate" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>
                      {t.ramadan || 'Saharlik / Iftorlik'}
                    </div>
                  </div>
                </button>

                {/* 5. Taqvimi */}
                <button
                  id="menu-item-calendar"
                  onClick={() => handleTabClick('calendar')}
                  className="flex items-center gap-2.5 p-3 rounded-2xl nur-pill hover:opacity-90 text-left border border-[var(--nur-border-glass)] transition active:scale-[0.97]"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--nur-color-on-bg)' }}>
                      {t.calendar || 'Taqvim'}
                    </div>
                    <div className="text-[10px] opacity-70 truncate" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>
                      {t.monthlyTimetable || 'Oylik jadval'}
                    </div>
                  </div>
                </button>

                {/* 6. Jonli Efir */}
                <button
                  id="menu-item-makkah"
                  onClick={() => handleTabClick('makkah_live')}
                  className="flex items-center gap-2.5 p-3 rounded-2xl nur-pill hover:opacity-90 text-left border border-[var(--nur-border-glass)] transition active:scale-[0.97]"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--nur-color-on-bg)' }}>
                      {t.makkahLive || 'Jonli Efir'}
                    </div>
                    <div className="text-[10px] opacity-70 truncate" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>
                      {t.liveStream || 'Makka & Madina'}
                    </div>
                  </div>
                </button>

                {/* 7. Sakin Akademiya */}
                <button
                  id="menu-item-academy"
                  onClick={() => handleTabClick('academy')}
                  className="col-span-2 flex items-center gap-2.5 p-3.5 rounded-2xl nur-pill hover:opacity-95 text-left border border-amber-500/30 transition active:scale-[0.97] bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center shrink-0 shadow-md">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold" style={{ color: 'var(--nur-color-on-bg)' }}>
                      {t.academy || 'Akademiya'}
                    </div>
                  </div>
                </button>

                {/* 8. Sozlamalar */}
                <button
                  id="menu-item-settings"
                  onClick={() => handleTabClick('settings')}
                  className="col-span-2 flex items-center gap-2.5 p-3 rounded-2xl nur-pill hover:opacity-90 text-left border border-[var(--nur-border-glass)] transition active:scale-[0.97]"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-500/15 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold truncate" style={{ color: 'var(--nur-color-on-bg)' }}>
                        {t.settings || 'Sozlamalar'}
                      </div>
                      <div className="text-[10px] opacity-70 truncate" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>
                        {t.language || 'Til & Ovoz'}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dynamic Liquid Dock in Sakinward Theme (5 Balanced Items) */}
      <div 
        className="fixed z-40 select-none shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex items-center justify-around py-2 px-3 max-w-sm sm:max-w-md mx-auto rounded-full border border-[var(--nur-border-glass)] backdrop-blur-2xl transition-all"
        style={{
          bottom: 'var(--nur-tabbar-bottom, 16px)',
          left: '16px',
          right: '16px',
          background: 'var(--nur-color-glass)',
        }}
      >
        {/* 1. Home Button */}
        <button
          id="nav-btn-home"
          onClick={() => handleTabClick('home')}
          className={`nur-btn flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
            activeTab === 'home'
              ? 'bg-[var(--nur-color-accent)] text-[var(--nur-color-on-badge)] font-bold shadow-md scale-105'
              : 'hover:opacity-100 opacity-80 hover:bg-black/10 dark:hover:bg-white/10'
          }`}
          style={{
            color: activeTab === 'home' ? undefined : 'var(--nur-color-on-bg)',
          }}
          title={t.home}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-semibold leading-none mt-0.5">{t.home || 'Home'}</span>
        </button>

        {/* 2. Quran Button */}
        <button
          id="nav-btn-quran"
          onClick={() => handleTabClick('quran')}
          className={`nur-btn flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
            activeTab === 'quran'
              ? 'bg-[var(--nur-color-accent)] text-[var(--nur-color-on-badge)] font-bold shadow-md scale-105'
              : 'hover:opacity-100 opacity-80 hover:bg-black/10 dark:hover:bg-white/10'
          }`}
          style={{
            color: activeTab === 'quran' ? undefined : 'var(--nur-color-on-bg)',
          }}
          title={t.quran}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[9px] font-semibold leading-none mt-0.5">{t.quran || 'Quran'}</span>
        </button>

        {/* 3. Compass / Qibla Button */}
        <button
          id="nav-btn-qibla"
          onClick={() => handleTabClick('qibla')}
          className={`nur-btn flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
            activeTab === 'qibla'
              ? 'bg-[var(--nur-color-accent)] text-[var(--nur-color-on-badge)] font-bold shadow-md scale-105'
              : 'hover:opacity-100 opacity-80 hover:bg-black/10 dark:hover:bg-white/10'
          }`}
          style={{
            color: activeTab === 'qibla' ? undefined : 'var(--nur-color-on-bg)',
          }}
          title={t.qibla}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] font-semibold leading-none mt-0.5">{t.qibla || 'Qibla'}</span>
        </button>

        {/* 4. Calendar Button */}
        <button
          id="nav-btn-calendar"
          onClick={() => handleTabClick('calendar')}
          className={`nur-btn flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
            activeTab === 'calendar'
              ? 'bg-[var(--nur-color-accent)] text-[var(--nur-color-on-badge)] font-bold shadow-md scale-105'
              : 'hover:opacity-100 opacity-80 hover:bg-black/10 dark:hover:bg-white/10'
          }`}
          style={{
            color: activeTab === 'calendar' ? undefined : 'var(--nur-color-on-bg)',
          }}
          title={t.calendar}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] font-semibold leading-none mt-0.5">{t.calendar || 'Timetable'}</span>
        </button>

        {/* 5. Center 3-Dots Menu Button */}
        <button
          id="nav-btn-menu"
          onClick={() => {
            soundManager.playBeadClick();
            setIsMenuOpen(!isMenuOpen);
          }}
          className={`nur-btn flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
            isMenuOpen
              ? 'bg-[var(--nur-color-accent)] text-[var(--nur-color-on-badge)] font-bold shadow-md scale-105'
              : 'hover:opacity-100 opacity-80 hover:bg-black/10 dark:hover:bg-white/10'
          }`}
          style={{
            color: isMenuOpen ? undefined : 'var(--nur-color-on-bg)',
          }}
          title={t.allDeeds}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[9px] font-semibold leading-none mt-0.5">{t.more || 'More'}</span>
        </button>
      </div>
    </>
  );
};
export default BottomNavigation;
