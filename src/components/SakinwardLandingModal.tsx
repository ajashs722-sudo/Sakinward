import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Send, 
  Instagram, 
  Bot, 
  Heart, 
  Compass, 
  BookOpen, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Palette,
  Type,
  Music,
  Wind,
  CloudRain,
  Waves,
  Sun
} from 'lucide-react';
import { natureSoundscape } from '../utils/natureAmbience';
import { useTranslation } from '../i18n/LanguageContext';

interface SakinwardLandingModalProps {
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const SakinwardLandingModal: React.FC<SakinwardLandingModalProps> = ({
  onClose,
  onNavigateTab,
}) => {
  const { t } = useTranslation();
  const [activeSound, setActiveSound] = useState<string | null>(natureSoundscape.getActiveMode());
  const [soundVolume, setSoundVolume] = useState<number>(0.35);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleToggleSound = (mode: 'rain' | 'ocean' | 'breeze' | 'stream' | 'cosmos') => {
    if (activeSound === mode) {
      natureSoundscape.stop();
      setActiveSound(null);
    } else {
      natureSoundscape.play(mode);
      natureSoundscape.setVolume(soundVolume);
      setActiveSound(mode);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSoundVolume(val);
    natureSoundscape.setVolume(val);
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const colors = [
    {
      name: 'Obsidian Black',
      role: 'Core Canvas & Deep Navy',
      hex: '#0A1233',
      rgb: '10, 18, 51',
      hsl: '228, 67%, 12%',
      bgClass: 'bg-[#0A1233]',
      textDark: false,
    },
    {
      name: 'Classic Linen',
      role: 'Primary Surface & Text',
      hex: '#F7F4EC',
      rgb: '247, 244, 236',
      hsl: '44, 41%, 95%',
      bgClass: 'bg-[#F7F4EC]',
      textDark: true,
    },
    {
      name: 'Oat Brown',
      role: 'Serene Gold Accent',
      hex: '#DBC66E',
      rgb: '219, 198, 110',
      hsl: '48, 60%, 65%',
      bgClass: 'bg-[#DBC66E]',
      textDark: true,
    },
    {
      name: 'Raw Sienna',
      role: 'Deep Antique Tone',
      hex: '#8A7410',
      rgb: '138, 116, 16',
      hsl: '49, 79%, 30%',
      bgClass: 'bg-[#8A7410]',
      textDark: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#0A1233]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#0A1233] text-[#F7F4EC] rounded-[32px] border border-[#DBC66E]/30 shadow-2xl overflow-hidden">
        
        {/* Top Header Sticky Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0A1233]/95 backdrop-blur-md border-b border-[#DBC66E]/20">
          <div className="flex items-center gap-3.5">
            <img
              src="https://sakinward.aluvantis.uz/Logo/89t8bVrDJpSbugTCKLHOuA.png"
              alt="Sakinward Logo"
              referrerPolicy="no-referrer"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_2px_10px_rgba(219,198,110,0.35)]"
            />
            <div>
              <h1 className="font-brand-display text-xl font-bold tracking-tight text-[#F7F4EC]">
                Sakinward
              </h1>
              <p className="text-xs text-[#DBC66E] font-semibold tracking-wider uppercase">
                Sakina
              </p>
            </div>
          </div>

          <button
            id="btn-close-landing"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F7F4EC]/10 hover:bg-[#F7F4EC]/20 flex items-center justify-center transition border border-[#DBC66E]/20"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[#F7F4EC]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-10">
          
          {/* Hero Section */}
          <section className="text-center space-y-4 py-4 relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DBC66E]/10 border border-[#DBC66E]/30 text-xs font-semibold text-[#DBC66E]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open-Source Spiritual Wellbeing</span>
            </div>

            <div className="flex justify-center my-4 py-6 px-8 rounded-3xl bg-[#060B20] border border-[#DBC66E]/20">
              {/* Brand Logo with Clear Space honor */}
              <div className="p-6 rounded-2xl flex flex-col items-center">
                <img
                  src="https://sakinward.aluvantis.uz/Logo/89t8bVrDJpSbugTCKLHOuA.png"
                  alt="Sakinward Logo"
                  referrerPolicy="no-referrer"
                  className="w-48 sm:w-56 object-contain"
                  style={{ minWidth: '152px' }}
                />
                <span className="text-[10px] text-[#A3A096] mt-3 tracking-widest uppercase">
                  Clear space 100px • Min width 152px
                </span>
              </div>
            </div>

            <h2 className="font-brand-display text-2xl sm:text-3xl font-bold text-[#F7F4EC] leading-snug">
              “Toward serenity. Toward Sakina.”
            </h2>
            <p className="text-sm text-[#DCD8CD] leading-relaxed max-w-lg mx-auto font-brand-body font-normal">
              Sakinward is an open-source spiritual wellbeing sanctuary: Quran with nature ambience, dhikr and tafakkur modes, prayer times with Hanafi juristic precision, sleep and focus soundscapes. Ad-free, multilingual — serving one global community, not competing with anyone.
            </p>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('home');
                }}
                className="px-6 py-3 rounded-full bg-[#DBC66E] text-[#0A1233] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg flex items-center gap-2"
              >
                <Sun className="w-4 h-4" />
                <span>Open Prayer Dashboard</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('quran');
                }}
                className="px-6 py-3 rounded-full bg-[#F7F4EC]/10 hover:bg-[#F7F4EC]/20 text-[#F7F4EC] font-bold text-xs uppercase tracking-wider transition border border-[#DBC66E]/30 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#DBC66E]" />
                <span>Read Qur’an</span>
              </button>
            </div>
          </section>

          {/* Social Channels & Official Links */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DBC66E]/20">
              <Send className="w-4 h-4 text-[#DBC66E]" />
              <h3 className="font-brand-display text-base font-bold text-[#F7F4EC]">
                Official Community & Channels
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Telegram Channel */}
              <a
                href="https://t.me/sakinward"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl bg-[#111B45]/70 hover:bg-[#111B45] border border-[#DBC66E]/20 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0088cc]/20 text-[#0088cc] flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F7F4EC]">Telegram Channel</div>
                    <div className="text-[11px] text-[#A3A096]">@sakinward</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#DBC66E] opacity-70 group-hover:opacity-100 transition" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/sakinward?igsi=MXI3dWtva3NmcnFtaQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl bg-[#111B45]/70 hover:bg-[#111B45] border border-[#DBC66E]/20 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F7F4EC]">Instagram</div>
                    <div className="text-[11px] text-[#A3A096]">@sakinward</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#DBC66E] opacity-70 group-hover:opacity-100 transition" />
              </a>

              {/* Telegram Bot */}
              <a
                href="https://t.me/Sakinward_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl bg-[#111B45]/70 hover:bg-[#111B45] border border-[#DBC66E]/20 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DBC66E]/20 text-[#DBC66E] flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F7F4EC]">Telegram Bot</div>
                    <div className="text-[11px] text-[#A3A096]">@Sakinward_bot</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#DBC66E] opacity-70 group-hover:opacity-100 transition" />
              </a>
            </div>
          </section>

          {/* Interactive Nature Ambience & Tafakkur Soundscapes */}
          <section className="space-y-4 p-5 rounded-3xl bg-[#060B20] border border-[#DBC66E]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-[#DBC66E]" />
                <h3 className="font-brand-display text-base font-bold text-[#F7F4EC]">
                  Spiritual Nature Soundscapes
                </h3>
              </div>
              {activeSound && (
                <span className="text-[11px] text-[#DBC66E] font-bold animate-pulse flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" /> Playing {activeSound}
                </span>
              )}
            </div>
            <p className="text-xs text-[#A3A096]">
              Real-time meditative nature audio synthesizing peaceful rain, serene sea breeze, river streams, and cosmic resonance. Perfect companion for Quran recitation or quiet tafakkur.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
              <button
                onClick={() => handleToggleSound('rain')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                  activeSound === 'rain'
                    ? 'bg-[#DBC66E] text-[#0A1233] border-[#DBC66E] font-bold'
                    : 'bg-[#111B45] text-[#F7F4EC] border-[#DBC66E]/20 hover:border-[#DBC66E]/50'
                }`}
              >
                <CloudRain className="w-5 h-5 mb-1" />
                <span className="text-xs">{t.gentleRain || 'Gentle Rain'}</span>
              </button>

              <button
                onClick={() => handleToggleSound('ocean')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                  activeSound === 'ocean'
                    ? 'bg-[#DBC66E] text-[#0A1233] border-[#DBC66E] font-bold'
                    : 'bg-[#111B45] text-[#F7F4EC] border-[#DBC66E]/20 hover:border-[#DBC66E]/50'
                }`}
              >
                <Waves className="w-5 h-5 mb-1" />
                <span className="text-xs">{t.nightOcean || 'Night Ocean'}</span>
              </button>

              <button
                onClick={() => handleToggleSound('breeze')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                  activeSound === 'breeze'
                    ? 'bg-[#DBC66E] text-[#0A1233] border-[#DBC66E] font-bold'
                    : 'bg-[#111B45] text-[#F7F4EC] border-[#DBC66E]/20 hover:border-[#DBC66E]/50'
                }`}
              >
                <Wind className="w-5 h-5 mb-1" />
                <span className="text-xs">{t.softBreeze || 'Soft Breeze'}</span>
              </button>

              <button
                onClick={() => handleToggleSound('stream')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                  activeSound === 'stream'
                    ? 'bg-[#DBC66E] text-[#0A1233] border-[#DBC66E] font-bold'
                    : 'bg-[#111B45] text-[#F7F4EC] border-[#DBC66E]/20 hover:border-[#DBC66E]/50'
                }`}
              >
                <Sparkles className="w-5 h-5 mb-1" />
                <span className="text-xs">{t.forestStream || 'Forest Stream'}</span>
              </button>

              <button
                onClick={() => handleToggleSound('cosmos')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                  activeSound === 'cosmos'
                    ? 'bg-[#DBC66E] text-[#0A1233] border-[#DBC66E] font-bold'
                    : 'bg-[#111B45] text-[#F7F4EC] border-[#DBC66E]/20 hover:border-[#DBC66E]/50'
                }`}
              >
                <Heart className="w-5 h-5 mb-1" />
                <span className="text-xs">{t.cosmicCalm || 'Cosmic Calm'}</span>
              </button>
            </div>

            {activeSound && (
              <div className="flex items-center gap-3 pt-2">
                <VolumeX className="w-4 h-4 text-[#A3A096]" />
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={handleVolumeChange}
                  className="flex-1 accent-[#DBC66E]"
                />
                <Volume2 className="w-4 h-4 text-[#DBC66E]" />
              </div>
            )}
          </section>

          {/* Brand Book Philosophy & Values (05) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DBC66E]/20">
              <Heart className="w-4 h-4 text-[#DBC66E]" />
              <h3 className="font-brand-display text-base font-bold text-[#F7F4EC]">
                05. Brand Voice & Values
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#111B45]/60 border border-[#DBC66E]/20 space-y-1.5">
                <span className="text-[#DBC66E] font-bold uppercase tracking-wider text-[10px]">Values</span>
                <p className="text-[#F7F4EC] font-semibold text-sm leading-relaxed">
                  “Serenity, sincerity, beauty, universality, privacy, balance.”
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#111B45]/60 border border-[#DBC66E]/20 space-y-1.5">
                <span className="text-[#DBC66E] font-bold uppercase tracking-wider text-[10px]">Aesthetic</span>
                <p className="text-[#DCD8CD] leading-relaxed">
                  Cinematic night-sky minimalism: deep navy, thin gold line art, frosted glass, golden-ratio spacing, nature film.
                </p>
              </div>

              <div className="sm:col-span-2 p-4 rounded-2xl bg-[#111B45]/60 border border-[#DBC66E]/20 space-y-1.5">
                <span className="text-[#DBC66E] font-bold uppercase tracking-wider text-[10px]">Tone of Voice</span>
                <p className="text-[#DCD8CD] leading-relaxed">
                  Calm, gentle, hopeful. A quiet companion: invites, never commands; comforts, never frightens; respects every reader.
                </p>
              </div>
            </div>
          </section>

          {/* Typography (03) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DBC66E]/20">
              <Type className="w-4 h-4 text-[#DBC66E]" />
              <h3 className="font-brand-display text-base font-bold text-[#F7F4EC]">
                03. Brand Typography
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#060B20] border border-[#DBC66E]/20 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#DBC66E] tracking-wider">Primary Typeface</span>
                <div className="font-brand-display text-2xl text-[#F7F4EC]">Marcellus</div>
                <div className="font-brand-display text-xs text-[#A3A096]">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                  abcdefghijklmnopqrstuvwxyz<br />
                  0123456789!@#$%
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#060B20] border border-[#DBC66E]/20 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#DBC66E] tracking-wider">Secondary Typeface</span>
                <div className="font-brand-body text-xl font-semibold text-[#F7F4EC]">Inter</div>
                <div className="font-brand-body text-xs text-[#A3A096]">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                  abcdefghijklmnopqrstuvwxyz<br />
                  0123456789!@#$%
                </div>
              </div>
            </div>
          </section>

          {/* Color Palette (04) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DBC66E]/20">
              <Palette className="w-4 h-4 text-[#DBC66E]" />
              <h3 className="font-brand-display text-base font-bold text-[#F7F4EC]">
                04. Color Palette
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {colors.map((c) => (
                <div
                  key={c.hex}
                  onClick={() => copyHex(c.hex)}
                  className="cursor-pointer group p-3 rounded-2xl bg-[#060B20] border border-[#DBC66E]/20 hover:border-[#DBC66E] transition space-y-2"
                >
                  <div
                    className={`h-16 w-full rounded-xl ${c.bgClass} flex items-end justify-end p-1.5 border border-white/10 shadow-inner`}
                  >
                    {copiedColor === c.hex && (
                      <span className="text-[9px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                        Copied!
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#F7F4EC]">{c.name}</div>
                    <div className="text-[10px] text-[#DBC66E] font-mono">{c.hex}</div>
                    <div className="text-[9px] text-[#A3A096]">{c.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Open-Source & Privacy Pledge */}
          <section className="p-4 rounded-2xl bg-[#111B45]/40 border border-[#DBC66E]/20 flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-[#DBC66E] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-[#F7F4EC]">100% Ad-free & Privacy Centric</div>
              <p className="text-[#A3A096] leading-relaxed">
                Sakinward does not collect personal data, does not serve advertising, and runs with full offline capability. Made with sincere devotion for the Ummah.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#060B20] border-t border-[#DBC66E]/20 flex items-center justify-between text-xs text-[#A3A096]">
          <span>© Sakinward • Spiritual Wellbeing</span>
          <button
            onClick={() => {
              onClose();
              onNavigateTab('home');
            }}
            className="text-[#DBC66E] font-bold hover:underline"
          >
            Enter Sanctuary →
          </button>
        </div>

      </div>
    </div>
  );
};
