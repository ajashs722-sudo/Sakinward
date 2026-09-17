import React from 'react';
import { BookOpen, Sparkles, X, Share2 } from 'lucide-react';
import { DAILY_STORY } from '../data/islamicData';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';

interface StoryModalProps {
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ onClose }) => {
  const { t } = useTranslation();

  const handleShare = () => {
    soundManager.playChime();
    if (navigator.share) {
      navigator.share({
        title: DAILY_STORY.title,
        text: `${DAILY_STORY.title}\n\n${DAILY_STORY.moral}\n(Sajda App)`,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col backdrop-blur-2xl p-4 overflow-y-auto animate-in fade-in duration-300 select-none"
      style={{
        background: 'var(--nur-gradient-page)',
        color: 'var(--nur-color-on-bg)',
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 max-w-lg w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ color: 'var(--nur-color-on-bg)' }}>{t.dailyStory}</h1>
            <p className="text-[11px]" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>{DAILY_STORY.date}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full nur-pill hover:opacity-80 transition"
          >
            <Share2 className="w-4 h-4" style={{ color: 'var(--nur-color-on-bg)' }} />
          </button>
          <button
            id="btn-close-story"
            onClick={onClose}
            className="p-2 rounded-full nur-pill hover:opacity-80 transition active:scale-95"
          >
            <X className="w-5 h-5" style={{ color: 'var(--nur-color-on-bg)' }} />
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-lg w-full mx-auto space-y-4 my-3 pb-16">
        {/* Title Card */}
        <div className="nur-card rounded-3xl p-5 border border-neutral-300/30 dark:border-white/15 shadow-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full nur-pill text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.wisdomAndLessons || 'Islamic Wisdom'}</span>
          </div>
          <h2 className="text-xl font-bold leading-snug" style={{ color: 'var(--nur-color-on-bg)' }}>
            {DAILY_STORY.title}
          </h2>
          <p className="text-xs" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>
            {DAILY_STORY.subtitle}
          </p>
        </div>

        {/* Story Body Paragraphs */}
        <div className="nur-card rounded-3xl p-5 border border-neutral-300/30 dark:border-white/15 space-y-3.5 text-sm leading-relaxed font-light">
          {DAILY_STORY.body.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Moral of the story card */}
        <div className="nur-pill rounded-3xl p-4 border border-black/20 dark:border-white/20 space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--nur-color-on-bg)' }}>
            ✦ {t.lessonAndWisdom || 'Lesson & Wisdom'}:
          </div>
          <p className="text-xs italic leading-relaxed" style={{ color: 'var(--nur-color-on-bg)' }}>
            "{DAILY_STORY.moral}"
          </p>
          <div className="text-[10px] text-right pt-1" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>
            {t.source || 'Source'}: {DAILY_STORY.source}
          </div>
        </div>
      </div>
    </div>
  );
};
export default StoryModal;
