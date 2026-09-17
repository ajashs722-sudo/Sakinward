import React, { useState } from 'react';
import { Search, Sparkles, X, Volume2, Bookmark, Shuffle, ArrowRight, ChevronLeft, Heart, Check } from 'lucide-react';
import { ALLAH_NAMES } from '../data/islamicData';
import { AllahName } from '../types';
import { soundManager } from '../utils/soundEffects';
import { useTranslation } from '../i18n/LanguageContext';

interface NamesOfAllahModalProps {
  onClose: () => void;
}

export const NamesOfAllahModal: React.FC<NamesOfAllahModalProps> = ({ onClose }) => {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'grid' | 'flashcard'>('grid');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('sakinward_names_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (num: number, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playBeadClick();
    setFavorites((prev) => {
      const next = prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num];
      try {
        localStorage.setItem('sakinward_names_favs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filteredNames = ALLAH_NAMES.filter((n) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      n.transliteration.toLowerCase().includes(q) ||
      n.uzbekMeaning.toLowerCase().includes(q) ||
      n.arabic.includes(q) ||
      n.number.toString() === q
    );
  });

  const currentFlashcard = ALLAH_NAMES[flashcardIndex];

  const handleNextFlashcard = () => {
    soundManager.playBeadClick();
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev + 1) % ALLAH_NAMES.length);
  };

  const handleRandomFlashcard = () => {
    soundManager.playBeadClick();
    setIsFlipped(false);
    setFlashcardIndex(Math.floor(Math.random() * ALLAH_NAMES.length));
  };

  const speakName = (name: AllahName, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playChime();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(name.arabic);
      utterance.lang = 'ar-SA';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col p-3 sm:p-4 overflow-y-auto no-scrollbar text-[#FAF8F3] select-none animate-in fade-in duration-200"
      style={{
        // Shaffof oyna foni: Foydalanuvchi tanlagan video yoki shader foni to'liq ko'rinadi
        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.4) 100%)',
      }}
    >
      {/* Top Header Navbar (Symmetrical Rounded-Full Pill) */}
      <div className="sticky top-0 z-30 pt-1 pb-2 max-w-lg w-full mx-auto">
        <div className="flex items-center justify-between p-1.5 px-3 rounded-full bg-black/35 backdrop-blur-xl border border-white/20 shadow-xl">
          <button
            id="btn-close-names-back"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-md transition active:scale-95 text-[#FAF8F3]"
          >
            <ChevronLeft className="w-4 h-4 text-[#DBC66E]" />
            <span>{t.back || 'Back'}</span>
          </button>

          <div className="text-center px-1">
            <h1 className="font-brand-display text-sm sm:text-base font-bold tracking-tight text-[#FAF8F3] flex items-center justify-center gap-1.5">
              <span>{t.namesOfAllah || '99 Names of Allah'}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#DBC66E]" />
            </h1>
            <p className="text-[10px] text-[#DBC66E]/90 font-medium">
              {t.asmaUlHusna || 'Asma ul-Husna'}
            </p>
          </div>

          <button
            id="btn-close-names"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition active:scale-95 text-white/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-lg w-full mx-auto space-y-3 pb-20 pt-1">
        
        {/* Tab switcher: 99 Ism Ro'yxati vs Fleshkarta Yodlash */}
        <div className="flex items-center p-1 rounded-2xl bg-black/35 backdrop-blur-xl border border-white/15">
          <button
            id="tab-names-grid"
            onClick={() => setActiveTab('grid')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'grid' 
                ? 'bg-[#DBC66E] text-[#0A1233] shadow-md scale-[1.01]' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            {t.all99Names || 'All 99 Names'}
          </button>
          <button
            id="tab-names-flashcard"
            onClick={() => setActiveTab('flashcard')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'flashcard' 
                ? 'bg-[#DBC66E] text-[#0A1233] shadow-md scale-[1.01]' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            {t.flashcardsAndLearn || 'Flashcards & Learn'}
          </button>
        </div>

        {activeTab === 'grid' ? (
          <>
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                id="input-search-names"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchNamesPlaceholder || 'Search by name, meaning...'}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/30 backdrop-blur-xl text-xs text-white placeholder-white/40 outline-none border border-white/20 focus:border-[#DBC66E] transition"
              />
            </div>

            {/* Names 2-column Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {filteredNames.map((item) => {
                const isFav = favorites.includes(item.number);
                return (
                  <div
                    key={item.number}
                    onClick={() => speakName(item)}
                    className="p-3 rounded-2xl bg-black/30 hover:bg-black/45 backdrop-blur-xl border border-white/15 transition-all duration-150 cursor-pointer relative flex flex-col justify-between shadow-lg group active:scale-[0.98]"
                  >
                    {/* Top Row: Number & Fav / Audio */}
                    <div className="flex items-center justify-between text-xs text-[#DBC66E]">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 border border-white/10 text-[#FAF8F3]">
                        #{item.number}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => speakName(item, e)}
                          className="p-1 rounded-full text-white/60 hover:text-[#DBC66E] transition"
                          title={t.listenPronunciation || 'Listen'}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => toggleFavorite(item.number, e)}
                          className="p-1 rounded-full transition"
                          title={t.bookmarks || 'Bookmark'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-[#DBC66E] text-[#DBC66E]' : 'text-white/50'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Middle: Arabic Calligraphy */}
                    <div className="my-1.5 text-center">
                      <div dir="rtl" className="font-quran text-2xl font-bold leading-normal text-[#FAF8F3] drop-shadow">
                        {item.arabic}
                      </div>
                      <div className="text-xs font-bold text-[#DBC66E] mt-0.5">
                        {item.transliteration}
                      </div>
                    </div>

                    {/* Bottom: Uzbek Meaning */}
                    <div className="text-[11px] text-center text-white/80 border-t border-white/10 pt-1.5 line-clamp-2 leading-relaxed">
                      {language === 'uz' ? item.uzbekMeaning : item.englishMeaning || item.uzbekMeaning}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Flashcard Learning Mode */
          <div className="space-y-4 flex flex-col items-center pt-2">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-72 rounded-3xl bg-black/40 hover:bg-black/50 backdrop-blur-2xl border-2 border-white/20 p-6 flex flex-col items-center justify-between cursor-pointer transition-all shadow-2xl active:scale-[0.99]"
            >
              <div className="w-full flex items-center justify-between text-xs text-[#DBC66E]">
                <span className="font-mono font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                  {currentFlashcard.number} / 99
                </span>
                <span className="text-[11px] text-white/60">
                  {isFlipped ? (t.flipBack || 'Orqaga o‘girish 🔄') : (t.seeMeaning || 'Ma’nosini ko‘rish 🔄')}
                </span>
              </div>

              {!isFlipped ? (
                <div className="text-center my-auto space-y-2">
                  <div dir="rtl" className="font-quran text-5xl sm:text-6xl font-bold text-[#FAF8F3] drop-shadow-lg">
                    {currentFlashcard.arabic}
                  </div>
                  <div className="text-xl font-extrabold text-[#DBC66E]">
                    {currentFlashcard.transliteration}
                  </div>
                </div>
              ) : (
                <div className="text-center my-auto space-y-2 px-2">
                  <div className="text-xs uppercase tracking-widest font-bold text-[#DBC66E]">
                    {t.meaning || 'Meaning'}:
                  </div>
                  <div className="text-base font-bold text-[#FAF8F3] leading-relaxed">
                    {language === 'uz' ? currentFlashcard.uzbekMeaning : currentFlashcard.englishMeaning || currentFlashcard.uzbekMeaning}
                  </div>
                  {language === 'uz' && (
                    <div className="text-xs italic text-white/70">
                      {currentFlashcard.englishMeaning}
                    </div>
                  )}
                </div>
              )}

              <div className="w-full flex items-center justify-center">
                <button
                  onClick={(e) => speakName(currentFlashcard, e)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-[#FAF8F3] transition"
                >
                  <Volume2 className="w-4 h-4 text-[#DBC66E]" />
                  <span>{t.listenRecitation || 'Listen'}</span>
                </button>
              </div>
            </div>

            {/* Flashcard Action Buttons */}
            <div className="flex items-center gap-2.5 w-full">
              <button
                onClick={handleRandomFlashcard}
                className="flex-1 py-3 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/20 text-xs font-bold text-[#FAF8F3] flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Shuffle className="w-4 h-4 text-[#DBC66E]" />
                <span>{t.randomName || 'Tasodifiy Ism'}</span>
              </button>

              <button
                onClick={handleNextFlashcard}
                className="flex-1 py-3 rounded-2xl bg-[#DBC66E] hover:bg-[#c9b45e] text-[#0A1233] text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg transition active:scale-95"
              >
                <span>{t.nextName || 'Keyingi Ism'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default NamesOfAllahModal;
