import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  RotateCcw, 
  X, 
  Sparkles, 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Plus, 
  Search, 
  Check, 
  Trash2,
  Infinity as InfinityIcon,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ZikrItem } from '../types';
import { INITIAL_ZIKR_DATA } from '../data/islamicData';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';

interface ZikrModalProps {
  onClose: () => void;
}

type ZikrCategory = 'barcha' | 'namozdan_keyin' | 'tongi' | 'kechki' | 'salovat' | 'istighfar' | 'duo';

export const ZikrModal: React.FC<ZikrModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  
  // Custom or persistent zikr list
  const [zikrs, setZikrs] = useState<ZikrItem[]>(() => {
    try {
      const saved = localStorage.getItem('sakinward_zikr_custom_v4') || localStorage.getItem('sakinward_zikr_custom_v3');
      if (saved) {
        const parsed: ZikrItem[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((z) => z.id));
        const missing = INITIAL_ZIKR_DATA.filter((init) => !existingIds.has(init.id));
        return [...parsed, ...missing];
      }
    } catch {}
    return INITIAL_ZIKR_DATA;
  });

  const [selectedZikrId, setSelectedZikrId] = useState<string>(() => INITIAL_ZIKR_DATA[0]?.id || 'subhanalloh');
  const [selectedCategory, setSelectedCategory] = useState<ZikrCategory>('barcha');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [targetPreset, setTargetPreset] = useState<number | 'infinity'>(33);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticEnabled] = useState<boolean>(true);
  const [showZikrPicker, setShowZikrPicker] = useState<boolean>(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);

  // Form for custom zikr
  const [newTitle, setNewTitle] = useState('');
  const [newArabic, setNewArabic] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newTarget, setNewTarget] = useState(33);

  // Tap animation state
  const [isBeadPressed, setIsBeadPressed] = useState<boolean>(false);
  const [rippleKey, setRippleKey] = useState<number>(0);

  // Total count today
  const [totalCount, setTotalCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('sakinward_tasbih_total_today') || '0', 10);
    } catch {
      return 0;
    }
  });

  const currentZikr = zikrs.find((z) => z.id === selectedZikrId) || zikrs[0];

  // Save changes locally
  useEffect(() => {
    try {
      localStorage.setItem('sakinward_zikr_custom_v4', JSON.stringify(zikrs));
      localStorage.setItem('sakinward_tasbih_total_today', totalCount.toString());
    } catch {}
  }, [zikrs, totalCount]);

  const effectiveTarget = targetPreset === 'infinity' 
    ? 999999 
    : (typeof targetPreset === 'number' ? targetPreset : currentZikr.targetCount);

  // Tap action with bead sound and haptics
  const handleTap = () => {
    if (soundEnabled) {
      soundManager.playBeadClick();
    }
    if (hapticEnabled) {
      soundManager.triggerHaptic();
    }

    setIsBeadPressed(true);
    setRippleKey((k) => k + 1);
    setTimeout(() => setIsBeadPressed(false), 110);

    setTotalCount((t) => t + 1);

    setZikrs((prev) =>
      prev.map((item) => {
        if (item.id === currentZikr.id) {
          const nextCount = item.currentCount + 1;
          if (targetPreset !== 'infinity' && nextCount === effectiveTarget) {
            if (soundEnabled) soundManager.playChime();
            confetti({
              particleCount: 45,
              spread: 60,
              origin: { y: 0.55 },
              colors: ['#DBC66E', '#10B981', '#FAF8F3', '#8A7410'],
            });
          }
          return { ...item, currentCount: nextCount };
        }
        return item;
      })
    );
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (soundEnabled) soundManager.playBeadClick();
    setZikrs((prev) =>
      prev.map((item) =>
        item.id === currentZikr.id ? { ...item, currentCount: 0 } : item
      )
    );
  };

  const handleSetTarget = (target: number | 'infinity', e: React.MouseEvent) => {
    e.stopPropagation();
    if (soundEnabled) soundManager.playBeadClick();
    setTargetPreset(target);
    setZikrs((prev) =>
      prev.map((item) =>
        item.id === currentZikr.id
          ? { ...item, targetCount: target === 'infinity' ? 999999 : target }
          : item
      )
    );
  };

  const handleAddCustomZikr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newZikrItem: ZikrItem = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      arabic: newArabic.trim() || 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      transliteration: newTitle.trim(),
      translation: newMeaning.trim() || 'Maxsus kiritilgan qalb zikri',
      targetCount: newTarget,
      currentCount: 0,
      category: 'barcha',
    };

    setZikrs((prev) => [newZikrItem, ...prev]);
    setSelectedZikrId(newZikrItem.id);
    setTargetPreset(newTarget);
    setNewTitle('');
    setNewArabic('');
    setNewMeaning('');
    setShowAddCustomModal(false);
  };

  const handleDeleteCustomZikr = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (zikrs.length <= 1) return;
    setZikrs((prev) => prev.filter((z) => z.id !== id));
    if (selectedZikrId === id) {
      setSelectedZikrId(zikrs[0].id);
    }
  };

  const filteredZikrs = zikrs.filter((z) => {
    const matchCategory = selectedCategory === 'barcha' ? true : z.category === selectedCategory;
    const matchSearch = searchQuery.trim() === '' || 
      z.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.translation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const progress = targetPreset === 'infinity'
    ? 100
    : Math.min(100, (currentZikr.currentCount / effectiveTarget) * 100);

  return (
    <div 
      id="tasbeh-fullscreen-page"
      className="fixed inset-0 z-50 flex flex-col justify-between px-3 py-2 sm:px-5 sm:py-3 h-[100dvh] max-h-[100dvh] overflow-y-auto no-scrollbar text-[#FAF8F3] select-none animate-in fade-in duration-200 cursor-pointer"
      style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.48) 100%)',
      }}
      onClick={handleTap}
    >
      {/* 1. Top Navbar Header */}
      <div 
        className="w-full max-w-md mx-auto shrink-0 pt-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-1.5 px-3 rounded-full bg-black/40 backdrop-blur-2xl border border-white/20 shadow-lg">
          <button
            id="btn-back-zikr"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold backdrop-blur-md transition active:scale-95 text-[#FAF8F3]"
          >
            <ChevronLeft className="w-4 h-4 text-[#DBC66E]" />
            <span>{t.back || 'Orqaga'}</span>
          </button>

          <div className="text-center px-1">
            <h1 className="font-serif text-sm sm:text-base font-bold tracking-tight text-[#FAF8F3] flex items-center justify-center gap-1.5 leading-tight">
              <span>{t.tasbihDhikr || t.tasbih || 'Tasbeh'}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#DBC66E]" />
            </h1>
            <p className="text-[10px] text-[#DBC66E]/90 font-medium leading-none">
              {t.rememberAllah || 'Allohni zikr qiling'}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-sound-toggle-zikr"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition border ${
                soundEnabled 
                  ? 'bg-[#DBC66E] text-[#0A1233] border-white/60 shadow-sm' 
                  : 'bg-white/10 text-white/50 border-white/20'
              }`}
              title={soundEnabled ? (t.muteSound || 'Ovozni o‘chirish') : (t.enableSound || 'Ovozni yoqish')}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            <button
              id="btn-close-zikr-top"
              onClick={onClose}
              className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition active:scale-95 text-white/80"
              aria-label={t.close || 'Yopish'}
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Zikr Glass Display Card (Sleek, Compact & Responsive) */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          setShowZikrPicker(true);
        }}
        className="w-full max-w-md mx-auto rounded-2xl sm:rounded-3xl bg-black/40 hover:bg-black/50 border border-white/20 p-2.5 sm:p-3.5 backdrop-blur-2xl shadow-xl transition active:scale-[0.99] shrink-0 my-1 cursor-pointer group"
      >
        <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-white/10">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#DBC66E] truncate">
            <Heart className="w-3 h-3 fill-[#DBC66E] shrink-0" />
            <span className="truncate">{currentZikr.title}</span>
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DBC66E]/20 hover:bg-[#DBC66E]/30 border border-[#DBC66E]/40 text-[10px] sm:text-[11px] font-bold text-[#FAF8F3] shrink-0 transition">
            <span>{t.dhikr || 'Zikrlar'} ({zikrs.length})</span>
            <ChevronDown className="w-3 h-3 text-[#DBC66E]" />
          </span>
        </div>

        {/* Arabic Calligraphy */}
        <div 
          dir="rtl" 
          className="font-quran text-lg sm:text-2xl text-[#FAF8F3] leading-snug py-0.5 text-center drop-shadow-md tracking-wide max-h-16 overflow-hidden line-clamp-2"
        >
          {currentZikr.arabic}
        </div>

        {/* Pronunciation & Translation */}
        <div className="text-center space-y-0.5 pt-1 border-t border-white/10">
          <p className="text-[11px] sm:text-xs italic font-medium text-[#DBC66E] truncate">
            "{currentZikr.transliteration}"
          </p>
          <p className="text-[10px] sm:text-[11px] text-[#FAF8F3]/90 line-clamp-1 leading-tight">
            {currentZikr.translation}
          </p>
        </div>
      </div>

      {/* 3. Central Apple iOS Liquid Glass Counter Orb (Responsive Auto-Scaling) */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 py-1 sm:py-2 my-auto shrink-0">
        <div className="relative w-36 h-36 xs:w-44 xs:h-44 sm:w-52 sm:h-52 max-h-[35vh] max-w-[35vh] aspect-square flex items-center justify-center">
          {/* Progress Gauge SVG */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke="url(#zikrGradModern)"
              strokeWidth="6"
              className="transition-all duration-150 ease-out"
              fill="transparent"
              strokeDasharray="276"
              strokeDashoffset={276 * (1 - progress / 100)}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="zikrGradModern" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DBC66E" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Tactile Center Counting Bead */}
          <div
            className={`absolute w-[70%] h-[70%] rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-150 backdrop-blur-2xl border-2 pointer-events-none ${
              isBeadPressed
                ? 'scale-90 bg-gradient-to-br from-[#DBC66E] to-[#B39314] text-[#0A1233] border-white shadow-[#DBC66E]/70'
                : 'bg-black/40 text-[#FAF8F3] border-white/30'
            }`}
            style={{
              boxShadow: isBeadPressed 
                ? '0 0 35px rgba(219, 198, 110, 0.8), inset 0 0 15px rgba(255,255,255,0.7)' 
                : '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255,255,255,0.3)'
            }}
          >
            {/* Subtle ripple */}
            <span 
              key={rippleKey}
              className="absolute inset-0 rounded-full bg-white/30 animate-ping opacity-60 pointer-events-none" 
            />

            <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight tabular-nums drop-shadow-md leading-none">
              {currentZikr.currentCount}
            </span>

            <span className={`text-[9px] sm:text-[10px] mt-1 font-bold uppercase tracking-widest leading-none ${
              isBeadPressed ? 'text-[#0A1233]' : 'text-[#DBC66E]'
            }`}>
              {targetPreset !== 'infinity' && currentZikr.currentCount >= effectiveTarget 
                ? `✓ ${t.accepted || 'Qabul Bo‘lsin!'}` 
                : (t.tap || 'Bosing')}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Controls: Target Presets (33, 99, 100, ∞) & Reset / Summary (Fully Adaptive to Viewport) */}
      <div 
        className="w-full max-w-md mx-auto space-y-1.5 shrink-0 pb-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Row A: Target Presets & Reset */}
        <div className="flex items-center justify-between gap-1.5 p-1 sm:p-1.5 px-2 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/15 shadow-lg">
          <div className="flex items-center gap-1">
            {[33, 99, 100].map((num) => (
              <button
                key={num}
                onClick={(e) => handleSetTarget(num, e)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  targetPreset === num
                    ? 'bg-[#DBC66E] text-[#0A1233] shadow-md scale-105'
                    : 'text-[#FAF8F3]/80 hover:text-[#FAF8F3] hover:bg-white/10'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={(e) => handleSetTarget('infinity', e)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-0.5 ${
                targetPreset === 'infinity'
                  ? 'bg-[#DBC66E] text-[#0A1233] shadow-md scale-105'
                  : 'text-[#FAF8F3]/80 hover:text-[#FAF8F3] hover:bg-white/10'
              }`}
              title={t.infiniteCount || 'Cheksiz sanash'}
            >
              <InfinityIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset Button */}
          <button
            id="btn-reset-tasbih"
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-[#FAF8F3] transition active:scale-95"
            title={t.reset || 'Qayta sanash'}
          >
            <RotateCcw className="w-3 h-3 text-[#DBC66E]" />
            <span>{t.reset || 'Reset'}</span>
          </button>
        </div>

        {/* Row B: Bottom Summary & Quick Actions (Always Visible on all mobile screens) */}
        <div className="flex items-center justify-between p-1.5 sm:p-2 px-2.5 sm:px-3 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/15 shadow-lg">
          <div className="text-left">
            <span className="text-[8.5px] sm:text-[9px] text-[#DBC66E] uppercase font-bold tracking-wider block leading-tight">
              {t.totalDhikrToday || 'Bugungi Jami Zikr'}
            </span>
            <span className="text-xs sm:text-sm font-extrabold font-mono text-[#FAF8F3] leading-none">
              {totalCount} <span className="text-[9.5px] font-normal text-white/60">{t.times || 'marta'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowAddCustomModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] sm:text-xs font-medium text-[#FAF8F3] transition active:scale-95"
            >
              <Plus className="w-3 h-3 text-[#DBC66E]" />
              <span>{t.addCustomDhikr || t.add || 'Qo‘shish'}</span>
            </button>

            <button
              onClick={() => setShowZikrPicker(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#DBC66E] hover:bg-[#c9b45e] text-[#0A1233] font-bold text-[11px] sm:text-xs shadow-md transition active:scale-95"
            >
              <BookOpen className="w-3 h-3" />
              <span>{t.allDhikrs || 'Barcha Zikrlar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Zikr Library Drawer Modal */}
      {showZikrPicker && (
        <div 
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowZikrPicker(false);
          }}
        >
          <div 
            className="w-full max-w-md mx-auto bg-[#0A1233]/98 backdrop-blur-3xl border-t border-white/20 rounded-t-3xl p-4 max-h-[82vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#FAF8F3] flex items-center gap-1.5">
                  <span>{t.blessedDhikrCollection || 'Muborak Zikrlar To‘plami'}</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#DBC66E]" />
                </h3>
                <p className="text-[11px] text-[#DBC66E]/90">
                  {t.sunnahDhikrsDesc || 'Sunnatda vorid bo‘lgan va tasdiqlangan zikrlar'}
                </p>
              </div>
              <button
                onClick={() => setShowZikrPicker(false)}
                className="w-7.5 h-7.5 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative my-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder={t.searchDhikr || 'Zikr izlash...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/15 rounded-xl pl-8.5 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#DBC66E]"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1.5 mb-1.5">
              {[
                { id: 'barcha', label: t.all || 'Barchasi' },
                { id: 'namozdan_keyin', label: t.afterPrayerDhikr || 'Namozdan keyin' },
                { id: 'tongi', label: t.morningDhikr || 'Tonggi' },
                { id: 'kechki', label: t.eveningDhikr || 'Kechki' },
                { id: 'salovat', label: t.salawat || 'Salovot' },
                { id: 'istighfar', label: t.istighfar || 'Istig‘for' },
                { id: 'duo', label: t.duas || 'Duo' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as ZikrCategory)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-[#DBC66E] text-[#0A1233] font-bold shadow-md'
                      : 'bg-white/10 text-white/70 hover:bg-white/15'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Zikrs list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar max-h-72">
              {filteredZikrs.map((item) => {
                const isSelected = selectedZikrId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (soundEnabled) soundManager.playBeadClick();
                      setSelectedZikrId(item.id);
                      setTargetPreset(item.targetCount);
                      setShowZikrPicker(false);
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl border transition cursor-pointer flex flex-col gap-1 backdrop-blur-xl ${
                      isSelected
                        ? 'bg-[#DBC66E]/20 border-[#DBC66E] text-[#FAF8F3] ring-1 ring-[#DBC66E]/50'
                        : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-[#FAF8F3]/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#FAF8F3] flex items-center gap-1.5">
                        {item.title}
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#DBC66E]" />}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-white/10 text-[#DBC66E] rounded-md border border-white/10">
                          {item.targetCount}x
                        </span>
                        {item.id.startsWith('custom_') && (
                          <button
                            onClick={(e) => handleDeleteCustomZikr(item.id, e)}
                            className="p-1 rounded-md text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div dir="rtl" className="font-quran text-base sm:text-lg text-[#DBC66E] leading-relaxed">
                      {item.arabic}
                    </div>

                    <div className="text-[11px] text-white/70 line-clamp-2">
                      {item.translation}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add Custom Button */}
            <div className="pt-2.5 mt-1.5 border-t border-white/10">
              <button
                onClick={() => {
                  setShowZikrPicker(false);
                  setShowAddCustomModal(true);
                }}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-[#DBC66E] flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addPersonalDhikr || 'O‘z shaxsiy zikringizni qo‘shish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Add Custom Zikr Modal */}
      {showAddCustomModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowAddCustomModal(false);
          }}
        >
          <div 
            className="w-full max-w-sm bg-[#0A1233] border border-white/20 rounded-3xl p-4 sm:p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
              <h3 className="font-bold text-sm text-[#FAF8F3] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#DBC66E]" />
                <span>{t.addNewDhikr || 'Yangi Zikr Qo‘shish'}</span>
              </h3>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomZikr} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  {t.dhikrNameRequired || 'Zikr Nomi (Majburiy)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Robbij’alniy..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#DBC66E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  {t.arabicTextOptional || 'Arabcha Matni (Ixtiyoriy)'}
                </label>
                <input
                  type="text"
                  placeholder="رَبِّ اغْفِرْ لِي"
                  dir="rtl"
                  value={newArabic}
                  onChange={(e) => setNewArabic(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#DBC66E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  {t.meaningTranslation || 'Ma’nosi / Tarjimasi'}
                </label>
                <input
                  type="text"
                  placeholder="Ey Robbim, meni mag‘firat qil..."
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#DBC66E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  {t.targetCount || 'Nishon Soni'}
                </label>
                <div className="flex items-center gap-1.5">
                  {[33, 99, 100, 500, 1000].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setNewTarget(num)}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold transition ${
                        newTarget === num
                          ? 'bg-[#DBC66E] text-[#0A1233]'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white/80 hover:bg-white/20"
                >
                  {t.cancel || 'Bekor qilish'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#DBC66E] text-[#0A1233] text-xs font-bold shadow-md hover:bg-[#c9b45e]"
                >
                  {t.save || 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZikrModal;
