import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Sparkles, 
  RotateCcw, 
  Edit3, 
  Check, 
  ChevronLeft,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { QazoRecord } from '../types';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';

interface QazoTrackerModalProps {
  onClose: () => void;
}

const DEFAULT_QAZO: QazoRecord = {
  bomdod: 0,
  peshin: 0,
  asr: 0,
  shom: 0,
  xufton: 0,
  vitr: 0,
};

export const QazoTrackerModal: React.FC<QazoTrackerModalProps> = ({ onClose }) => {
  const { language, t } = useTranslation();
  
  const [qazo, setQazo] = useState<QazoRecord>(() => {
    try {
      const saved = localStorage.getItem('sajda_qazo_records');
      return saved ? JSON.parse(saved) : DEFAULT_QAZO;
    } catch {
      return DEFAULT_QAZO;
    }
  });

  const [completedToday, setCompletedToday] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sajda_qazo_today');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [editingPrayer, setEditingPrayer] = useState<keyof QazoRecord | null>(null);
  const [editInputValue, setEditInputValue] = useState<string>('');
  const [justCompletedPrayer, setJustCompletedPrayer] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('sajda_qazo_records', JSON.stringify(qazo));
    } catch {}
  }, [qazo]);

  useEffect(() => {
    try {
      localStorage.setItem('sajda_qazo_today', completedToday.toString());
    } catch {}
  }, [completedToday]);

  const updateCount = (prayer: keyof QazoRecord, delta: number) => {
    soundManager.playBeadClick();
    soundManager.triggerHaptic();

    setQazo((prev) => {
      const current = prev[prayer] || 0;
      const next = Math.max(0, current + delta);
      
      if (delta < 0 && current > 0) {
        setCompletedToday((c) => c + 1);
        setJustCompletedPrayer(prayer);
        setTimeout(() => setJustCompletedPrayer(null), 800);

        if (next === 0 && current > 0) {
          try {
            confetti({
              particleCount: 25,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#DBC66E', '#10B981', '#FFFFFF']
            });
          } catch {}
        }
      }
      return { ...prev, [prayer]: next };
    });
  };

  const handleSetExact = (prayer: keyof QazoRecord) => {
    const parsed = parseInt(editInputValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      soundManager.playBeadClick();
      soundManager.triggerHaptic();
      setQazo((prev) => ({ ...prev, [prayer]: parsed }));
    }
    setEditingPrayer(null);
    setEditInputValue('');
  };

  const executeReset = () => {
    soundManager.playBeadClick();
    soundManager.triggerHaptic();
    setQazo(DEFAULT_QAZO);
    setCompletedToday(0);
    try {
      localStorage.setItem('sajda_qazo_records', JSON.stringify(DEFAULT_QAZO));
      localStorage.setItem('sajda_qazo_today', '0');
    } catch {}
    setShowResetConfirm(false);
  };

  const totalRemaining = (Object.values(qazo) as number[]).reduce((a, b) => a + (b || 0), 0);

  const prayerList: { key: keyof QazoRecord; name: string; rakat: string }[] = [
    { key: 'bomdod', name: t.fajr || 'Bomdod', rakat: `2 ${t.rakatsFarz || 'rakat farz'}` },
    { key: 'peshin', name: t.dhuhr || 'Peshin', rakat: `4 ${t.rakatsFarz || 'rakat farz'}` },
    { key: 'asr', name: t.asr || 'Asr', rakat: `4 ${t.rakatsFarz || 'rakat farz'}` },
    { key: 'shom', name: t.maghrib || 'Shom', rakat: `3 ${t.rakatsFarz || 'rakat farz'}` },
    { key: 'xufton', name: t.isha || 'Xufton', rakat: `4 ${t.rakatsFarz || 'rakat farz'}` },
    { key: 'vitr', name: 'Vitr', rakat: `3 ${t.rakatsVitr || 'rakat vojib'}` },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-between p-3 sm:p-4 h-[100dvh] max-h-screen overflow-hidden text-[#FAF8F3] select-none animate-in fade-in duration-200"
      style={{
        // Shaffof video orqa fon
        background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.45) 100%)',
      }}
    >
      {/* 1. Floating Glass Top Navbar */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg mx-auto pt-1 shrink-0 z-20"
      >
        <div className="flex items-center justify-between p-1.5 px-3 rounded-full bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl">
          <button
            id="btn-back-qazo"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-md transition active:scale-95 text-[#FAF8F3]"
          >
            <ChevronLeft className="w-4 h-4 text-[#DBC66E]" />
            <span>{t.back || 'Back'}</span>
          </button>

          <div className="text-center px-1">
            <h1 className="font-brand-display text-sm sm:text-base font-bold tracking-tight text-[#FAF8F3] flex items-center justify-center gap-1.5">
              <span>{t.qazoTracker || 'Qazo Namozlari'}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#DBC66E]" />
            </h1>
            <p className="text-[10px] text-[#DBC66E]/90 font-medium">
              {t.qazoSubtitle || 'Farz va vojib namozlar hisobi'}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-close-qazo-top"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition active:scale-95 text-white/80"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* 2. Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain max-w-lg w-full mx-auto space-y-3 my-2 px-0.5 pb-20 scrollbar-none">
        
        {/* Total Summary Hero Glass Card */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-3xl p-5 bg-black/35 backdrop-blur-2xl border border-white/20 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Light */}
          <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-[#DBC66E]/10 blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="text-[11px] font-semibold text-[#DBC66E] uppercase tracking-wider">
                {t.totalQazoRemaining || 'Jami qolgan qazolar'}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white mt-1 flex items-baseline gap-2">
                <span>{totalRemaining}</span>
                <span className="text-xs font-normal text-white/50">{t.itemsUnit || ''}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-sm backdrop-blur-md">
                <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[3]" />
                <span>+{completedToday}</span>
              </div>
              <p className="text-[10px] text-white/50 mt-1">
                {t.completedTodayCount || 'Bugun o‘qildi'}
              </p>
            </div>
          </div>

          {/* Card Footer Tools with working Reset button */}
          <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
            <span className="text-[11px] text-white/60">
              {totalRemaining === 0 
                ? (t.qazoNoMissed || 'Qazo namozlaringiz yo‘q') 
                : (t.qazoAdviceDaily || 'Har namoz ortidan 1 ta qazo o‘qing')}
            </span>

            {(totalRemaining > 0 || completedToday > 0) && (
              <button
                id="btn-reset-qazo"
                onClick={() => setShowResetConfirm(true)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-[11px] flex items-center gap-1.5 transition active:scale-95"
                title="Reset"
              >
                <RotateCcw className="w-3 h-3 text-rose-400" />
                <span>{t.resetCount || 'Nollash'}</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* 3. The 6 Prayer List Items */}
        <div className="space-y-2">
          {prayerList.map((p, idx) => {
            const count = qazo[p.key] || 0;
            const isJustDone = justCompletedPrayer === p.key;

            return (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.08 + idx * 0.03 }}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between backdrop-blur-xl shadow-lg ${
                  isJustDone 
                    ? 'bg-emerald-500/20 border-emerald-400/60 ring-2 ring-emerald-400/40' 
                    : 'bg-black/35 hover:bg-black/45 border-white/15'
                }`}
              >
                {/* Left Prayer Info */}
                <div className="min-w-0 pr-2">
                  <div className="text-sm font-bold text-white tracking-wide">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-white/50 font-medium">
                    {p.rakat}
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Number Badge (Tap to type exact number) */}
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setEditingPrayer(p.key);
                      setEditInputValue(count.toString());
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-1.5 transition group"
                    title={t.qazoSetExact || 'Edit number'}
                  >
                    <span className="text-base font-extrabold font-mono text-[#DBC66E]">
                      {count}
                    </span>
                    <Edit3 className="w-3 h-3 text-white/40 group-hover:text-white transition" />
                  </motion.button>

                  {/* Complete / Minus Button */}
                  <motion.button
                    id={`btn-qazo-minus-${p.key}`}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => updateCount(p.key, -1)}
                    disabled={count === 0}
                    className={`h-9 px-3.5 rounded-xl flex items-center gap-1.5 font-bold text-xs transition shadow-md ${
                      count > 0
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-[#04130d] cursor-pointer'
                        : 'bg-white/5 text-white/25 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{t.qazoCompleted || 'O‘qidim'}</span>
                  </motion.button>

                  {/* Plus Button */}
                  <motion.button
                    id={`btn-qazo-plus-${p.key}`}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => updateCount(p.key, 1)}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition"
                    title="+1"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* 4. Reset Confirmation In-App Dialog (100% works in iframes and all browsers) */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xs rounded-3xl p-5 bg-black/85 backdrop-blur-2xl border border-white/20 text-white shadow-2xl space-y-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  {t.qazoResetConfirm || 'Barchasini nollash'}
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  {t.qazoResetDesc || 'Barcha qazo namozlari soni 0 ga tushiriladi.'}
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  id="btn-cancel-reset"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition active:scale-95"
                >
                  {t.cancel || 'Bekor qilish'}
                </button>
                <button
                  id="btn-confirm-reset"
                  onClick={executeReset}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg active:scale-95"
                >
                  {t.yesReset || 'Ha, nollash'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Direct Edit Count Modal */}
      <AnimatePresence>
        {editingPrayer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setEditingPrayer(null)}
          >
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xs rounded-3xl p-5 bg-black/85 backdrop-blur-2xl border border-white/20 text-white shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white capitalize">
                  {editingPrayer} {t.qazoCount || 'qazo soni'}
                </h3>
                <button 
                  onClick={() => setEditingPrayer(null)}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <input
                  type="number"
                  min="0"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  placeholder="0"
                  className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-2xl font-black font-mono text-[#DBC66E] text-center outline-none focus:border-[#DBC66E]"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPrayer(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition active:scale-95"
                >
                  {t.cancel || 'Bekor qilish'}
                </button>
                <button
                  onClick={() => handleSetExact(editingPrayer)}
                  className="flex-1 py-2.5 rounded-xl bg-[#DBC66E] text-[#050A18] text-xs font-bold hover:bg-[#e4d17b] transition shadow-md active:scale-95"
                >
                  {t.save || 'Saqlash'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QazoTrackerModal;
