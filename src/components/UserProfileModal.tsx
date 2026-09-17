import React, { useState } from 'react';
import { 
  User, 
  CheckCircle, 
  X, 
  Moon,
  Edit2,
  Check,
  Settings
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';

interface UserProfileModalProps {
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenQazo?: () => void;
  onOpenRoza?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  onClose, 
  onOpenSettings,
  onOpenQazo,
  onOpenRoza,
}) => {
  const { t } = useTranslation();
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('sajda_user_name') || 'Believer';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const [prayersCompleted, setPrayersCompleted] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sajda_daily_prayers');
      return saved ? JSON.parse(saved) : {
        bomdod: true,
        peshin: true,
        asr: false,
        shom: false,
        xufton: false,
      };
    } catch {
      return {
        bomdod: true,
        peshin: true,
        asr: false,
        shom: false,
        xufton: false,
      };
    }
  });

  const [qazoCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sajda_qazo_records');
      if (saved) {
        const obj = JSON.parse(saved);
        return (Object.values(obj) as any[]).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
      }
      return 0;
    } catch {
      return 0;
    }
  });

  const togglePrayerCheck = (key: string) => {
    soundManager.playBeadClick();
    const updated = { ...prayersCompleted, [key]: !prayersCompleted[key] };
    setPrayersCompleted(updated);
    localStorage.setItem('sajda_daily_prayers', JSON.stringify(updated));
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('sajda_user_name', tempName.trim());
    }
    setIsEditingName(false);
  };

  const completedCount = Object.values(prayersCompleted).filter(Boolean).length;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col p-4 overflow-y-auto animate-in fade-in duration-300 select-none"
      style={{
        background: 'var(--nur-gradient-page)',
        color: 'var(--nur-color-on-bg)',
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 max-w-lg w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight" style={{ color: 'var(--nur-color-on-bg)' }}>{t.profile || t.personalProfile}</h1>
            <p className="text-[11px]" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>{t.spiritualTracker || 'Prayers & Spiritual Tracker'}</p>
          </div>
        </div>

        <button
          id="btn-close-profile"
          onClick={onClose}
          className="w-8 h-8 rounded-full nur-pill flex items-center justify-center hover:opacity-80 transition active:scale-95"
        >
          <X className="w-4 h-4" style={{ color: 'var(--nur-color-on-bg)' }} />
        </button>
      </div>

      <div className="flex-1 max-w-lg w-full mx-auto space-y-4 my-3 pb-20">
        {/* User Identity Card */}
        <div className="rounded-3xl p-5 nur-card border shadow-2xl flex items-center justify-between" style={{ borderColor: 'var(--nur-border-glass)' }}>
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black p-0.5 shadow-lg flex items-center justify-center">
              <User className="w-7 h-7" />
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="px-2 py-1 rounded-lg bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 text-xs outline-none"
                    style={{ color: 'var(--nur-color-on-bg)' }}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 rounded-lg bg-black text-white dark:bg-white dark:text-black"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--nur-color-on-bg)' }}>{userName}</h2>
                  <button
                    onClick={() => {
                      setTempName(userName);
                      setIsEditingName(true);
                    }}
                    className="opacity-60 hover:opacity-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" style={{ color: 'var(--nur-color-on-bg)' }} />
                  </button>
                </div>
              )}
              <span className="text-[11px] font-medium" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>{t.personalProfile || 'Personal Profile'}</span>
            </div>
          </div>
        </div>

        {/* Today's 5 Prayers Tracker */}
        <div className="rounded-3xl p-4 nur-card border space-y-3 shadow-lg" style={{ borderColor: 'var(--nur-border-glass)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--nur-color-on-bg)' }}>
                {t.dailyStreak}
              </h3>
            </div>
            <span className="text-xs font-bold" style={{ color: 'var(--nur-color-on-bg)' }}>
              {completedCount} / 5
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[
              { key: 'bomdod', name: t.fajr },
              { key: 'peshin', name: t.dhuhr },
              { key: 'asr', name: t.asr },
              { key: 'shom', name: t.maghrib },
              { key: 'xufton', name: t.isha },
            ].map((p) => {
              const isDone = prayersCompleted[p.key];
              return (
                <button
                  key={p.key}
                  onClick={() => togglePrayerCheck(p.key)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 border transition active:scale-95 ${
                    isDone
                      ? 'bg-black text-white dark:bg-white dark:text-black font-bold border-black dark:border-white shadow-md'
                      : 'nur-pill hover:opacity-90'
                  }`}
                  style={{ borderColor: isDone ? undefined : 'var(--nur-border-glass)' }}
                >
                  <CheckCircle className={`w-5 h-5 ${isDone ? '' : 'opacity-30'}`} />
                  <span className="text-[11px] font-semibold">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Shortcuts to Qazo & Ro'za */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onClose();
              if (onOpenQazo) onOpenQazo();
            }}
            className="p-4 rounded-3xl nur-card border text-left transition hover:opacity-90 active:scale-[0.98] shadow-md"
            style={{ borderColor: 'var(--nur-border-glass)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--nur-color-on-bg)' }}>{t.qazoTracker}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/15" style={{ color: 'var(--nur-color-on-bg)' }}>
                {qazoCount}
              </span>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>{t.qazoSubtitle}</p>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onOpenRoza) onOpenRoza();
            }}
            className="p-4 rounded-3xl nur-card border text-left transition hover:opacity-90 active:scale-[0.98] shadow-md"
            style={{ borderColor: 'var(--nur-border-glass)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--nur-color-on-bg)' }}>{t.ramadanAndRoza || t.ramadanRoza}</span>
              <Moon className="w-4 h-4" style={{ color: 'var(--nur-color-on-bg)' }} />
            </div>
            <p className="text-[11px]" style={{ color: 'var(--nur-color-on-bg-secondary)' }}>{t.rozaSubtitle}</p>
          </button>
        </div>

        {/* Settings button */}
        <button
          onClick={() => {
            onClose();
            onOpenSettings();
          }}
          className="w-full p-3.5 rounded-2xl nur-pill border flex items-center justify-center gap-2 text-xs font-semibold hover:opacity-80 transition"
          style={{ borderColor: 'var(--nur-border-glass)', color: 'var(--nur-color-on-bg)' }}
        >
          <Settings className="w-4 h-4" />
          <span>{t.appSettings || t.settings}</span>
        </button>
      </div>
    </div>
  );
};
export default UserProfileModal;
