import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  ChevronLeft,
  X,
  Globe,
  ExternalLink,
  Database,
  Lock,
  Trash2,
  BookOpen,
  Heart,
  Compass,
  Moon,
  Music,
  ArrowRight,
  Plus,
  History,
  Search,
  MessageSquare
} from 'lucide-react';
import { ActiveTab, SakinAiMessage, SakinAiAction, CityLocation, PrayerTimes } from '../types';
import { streamChatMessage, sendChatMessage } from '../services/sakinAiService';
import { useTranslation } from '../i18n/LanguageContext';
import { soundManager } from '../utils/soundEffects';
import {
  loadCipheredUserProfile,
  clearCipheredMemory,
  SakinUserProfile
} from '../utils/sakinMemoryDb';
import {
  SakinChatSession,
  SESSIONS_STORAGE_KEY,
  ACTIVE_SESSION_KEY,
  LEGACY_STORAGE_KEY,
  createNewSession,
  formatSessionTime
} from './FloatingSakinAi';

interface SakinAiModalProps {
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab, params?: { surah?: number; ayah?: number; dhikrId?: string }) => void;
  currentCity?: CityLocation;
  prayerTimes?: PrayerTimes;
  nurTheme?: 'nur-dark' | 'nur-light';
}

export const SakinAiModal: React.FC<SakinAiModalProps> = ({
  onClose,
  onNavigateTab,
  currentCity,
  prayerTimes,
  nurTheme,
}) => {
  const { language } = useTranslation();
  const [localTheme, setLocalTheme] = useState<'nur-dark' | 'nur-light'>(() => {
    if (nurTheme) return nurTheme;
    try {
      const saved = localStorage.getItem('sajda_nur_theme');
      return (saved as 'nur-dark' | 'nur-light') || 'nur-dark';
    } catch {
      return 'nur-dark';
    }
  });

  useEffect(() => {
    if (nurTheme) setLocalTheme(nurTheme);
  }, [nurTheme]);

  const isLight = localTheme === 'nur-light';

  // Multi-session chat history state
  const [sessions, setSessions] = useState<SakinChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacy =
        localStorage.getItem(LEGACY_STORAGE_KEY) ||
        localStorage.getItem('sakinward_ai_chat_history_v1');
      if (legacy) {
        const legacyMsgs = JSON.parse(legacy);
        if (Array.isArray(legacyMsgs) && legacyMsgs.length > 0) {
          const firstUser = legacyMsgs.find((m: SakinAiMessage) => m.sender === 'user');
          const title = firstUser
            ? firstUser.text.trim().slice(0, 36) + (firstUser.text.length > 36 ? '...' : '')
            : (language === 'uz' ? 'Avvalgi suhbat' : 'Previous Chat');
          return [
            {
              id: `session_${Date.now()}`,
              title,
              createdAt: legacyMsgs[0]?.timestamp || Date.now(),
              updatedAt: Date.now(),
              messages: legacyMsgs,
            },
          ];
        }
      }
    } catch {}
    return [createNewSession(language)];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (savedId) return savedId;
    } catch {}
    return '';
  });

  // Ensure an active session ID is always valid
  useEffect(() => {
    if (sessions.length === 0) {
      const fresh = createNewSession(language);
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else if (!sessions.some((s) => s.id === activeSessionId)) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId, language]);

  // Persist sessions and active session
  useEffect(() => {
    try {
      if (sessions.length > 0) {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      }
      if (activeSessionId) {
        localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
      }
    } catch {}
  }, [sessions, activeSessionId]);

  // Active session and its messages
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;
  const messages = activeSession ? activeSession.messages : [];

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [userProfile, setUserProfile] = useState<SakinUserProfile | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isNearBottomRef = useRef<boolean>(true);

  // Load client-side encrypted memory
  const refreshMemory = async () => {
    try {
      const profile = await loadCipheredUserProfile();
      setUserProfile(profile);
    } catch {}
  };

  useEffect(() => {
    refreshMemory();
  }, []);

  const handleMessagesScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 120;
  };

  // Safe internal auto-scroll that NEVER jumps the parent document/page
  useEffect(() => {
    if (!chatContainerRef.current) return;
    if (isNearBottomRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, streamingText, isLoading]);

  // Chat History Management
  const handleCreateNewChat = () => {
    soundManager.playBeadClick();
    const fresh = createNewSession(language);
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    setShowHistoryDrawer(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleSelectSession = (sessionId: string) => {
    soundManager.playBeadClick();
    setActiveSessionId(sessionId);
    setShowHistoryDrawer(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playBeadClick();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh = createNewSession(language);
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (sessionId === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleClearAllHistory = () => {
    soundManager.playBeadClick();
    const confirmText =
      language === 'uz'
        ? 'Barcha suhbatlar tarixini o‘chirishni xohlaysizmi?'
        : 'Are you sure you want to clear all chat history?';
    if (!window.confirm(confirmText)) return;

    const fresh = createNewSession(language);
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    setShowHistoryDrawer(false);
    try {
      localStorage.removeItem(SESSIONS_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.setItem(ACTIVE_SESSION_KEY, fresh.id);
    } catch {}
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    soundManager.playBeadClick();
    setInputPrompt('');

    const userMessage: SakinAiMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];

    // Update active session messages and auto-title
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === (activeSession?.id || activeSessionId)) {
          const isDefaultTitle =
            s.title === 'Yangi suhbat' ||
            s.title === 'New Chat' ||
            s.title === 'Новый диалог' ||
            s.title === 'محادثة جديدة';
          const newTitle = isDefaultTitle
            ? textToSend.trim().slice(0, 36) + (textToSend.trim().length > 36 ? '...' : '')
            : s.title;
          return {
            ...s,
            title: newTitle,
            updatedAt: Date.now(),
            messages: newMessages,
          };
        }
        return s;
      })
    );

    setIsLoading(true);
    setStreamingText('');

    const userContext = {
      city: currentCity?.name || 'Tashkent',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userName: userProfile?.userName,
    };

    try {
      await streamChatMessage(
        textToSend.trim(),
        newMessages,
        language,
        userContext,
        (chunk, accumulated) => {
          setStreamingText(accumulated);
        },
        (finalResponse) => {
          const aiMessage: SakinAiMessage = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: finalResponse.reply,
            actions: finalResponse.actions,
            sources: finalResponse.sources,
            grounded: finalResponse.grounded,
            timestamp: Date.now(),
          };
          const fullHistory = [...newMessages, aiMessage];
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === (activeSession?.id || activeSessionId)) {
                return {
                  ...s,
                  updatedAt: Date.now(),
                  messages: fullHistory,
                };
              }
              return s;
            })
          );
          setIsLoading(false);
          setStreamingText('');
          refreshMemory();
        }
      );
    } catch {
      const fallback = await sendChatMessage(textToSend.trim(), newMessages, language, userContext);
      const aiMessage: SakinAiMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: fallback.reply,
        actions: fallback.actions,
        sources: fallback.sources,
        grounded: fallback.grounded,
        timestamp: Date.now(),
      };
      const fullHistory = [...newMessages, aiMessage];
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === (activeSession?.id || activeSessionId)) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: fullHistory,
            };
          }
          return s;
        })
      );
      setIsLoading(false);
      setStreamingText('');
      refreshMemory();
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundManager.playBeadClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleActionClick = (action: SakinAiAction) => {
    soundManager.playBeadClick();
    switch (action.type) {
      case 'open_quran':
        const surah = action.param ? Number(action.param) : 1;
        const ayah = action.subParam ? Number(action.subParam) : undefined;
        onNavigateTab('quran', { surah, ayah });
        break;
      case 'open_zikr':
        onNavigateTab('zikr', { dhikrId: typeof action.param === 'string' ? action.param : undefined });
        break;
      case 'open_names':
        onNavigateTab('names');
        break;
      case 'open_qibla':
        onNavigateTab('qibla');
        break;
      case 'open_calendar':
        onNavigateTab('calendar');
        break;
      case 'open_roza':
        onNavigateTab('roza');
        break;
      case 'open_soundscapes':
        onNavigateTab('landing');
        break;
      case 'open_makkah':
        onNavigateTab('makkah_live');
        break;
      default:
        break;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'open_quran':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'open_zikr':
        return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'open_qibla':
        return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
      case 'open_roza':
        return <Moon className="w-3.5 h-3.5 text-amber-300" />;
      case 'open_soundscapes':
        return <Music className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#DBC66E]" />;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between select-none font-sans overflow-hidden animate-in fade-in duration-200 ${
        isLight ? 'bg-[#FAF8F5] text-[#1C1A14]' : 'bg-[#0A1233] text-[#F7F4EC]'
      }`}
      style={{
        backgroundImage: isLight
          ? 'radial-gradient(ellipse at 50% 0%, rgba(219, 198, 110, 0.18) 0%, rgba(250, 248, 245, 0.99) 70%)'
          : 'radial-gradient(ellipse at 50% 0%, rgba(219, 198, 110, 0.12) 0%, rgba(10, 18, 51, 0.99) 70%)',
      }}
    >
      {/* Top Header Bar (MD3 style) */}
      <header
        className={`w-full max-w-4xl px-4 sm:px-6 py-3.5 flex items-center justify-between border-b shrink-0 z-10 backdrop-blur-xl ${
          isLight ? 'border-[#E8DFC8] bg-[#FAF8F5]/90' : 'border-[#DBC66E]/20 bg-[#0A1233]/80'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition border ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 border-[#E8DFC8]'
                : 'bg-white/10 hover:bg-white/20 border-white/10'
            }`}
            aria-label="Back to home"
          >
            <ChevronLeft className={`w-5 h-5 ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`} />
          </button>
          <div className="flex items-center gap-2.5">
            <img
              src="https://sakinward.aluvantis.uz/Logo/89t8bVrDJpSbugTCKLHOuA.png"
              alt="Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_2px_8px_rgba(219,198,110,0.4)]"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <span
                className={`font-['Marcellus'] text-lg sm:text-xl font-bold tracking-wide flex items-center gap-1.5 ${
                  isLight ? 'text-[#1C1A14]' : 'text-[#F7F4EC]'
                }`}
              >
                Sakin AI
                <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`} />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* New Chat Button */}
          <button
            onClick={handleCreateNewChat}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition active:scale-95 border ${
              isLight
                ? 'bg-[#8A7410]/10 hover:bg-[#8A7410]/20 text-[#8A7410] border-[#8A7410]/30'
                : 'bg-[#DBC66E]/15 hover:bg-[#DBC66E]/25 text-[#DBC66E] border-[#DBC66E]/40'
            }`}
            title={language === 'uz' ? 'Yangi suhbat boshlash' : 'Start New Chat'}
            aria-label="New Chat"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{language === 'uz' ? 'Yangi' : 'New'}</span>
          </button>

          {/* Chat History Button */}
          <button
            onClick={() => {
              soundManager.playBeadClick();
              setShowHistoryDrawer(!showHistoryDrawer);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition active:scale-95 border ${
              showHistoryDrawer
                ? isLight
                  ? 'bg-[#8A7410] text-white border-[#8A7410]'
                  : 'bg-[#DBC66E] text-[#0A1233] border-[#DBC66E]'
                : isLight
                ? 'bg-black/5 hover:bg-black/10 text-[#1C1A14] border-[#E8DFC8]'
                : 'bg-white/5 hover:bg-white/15 text-[#F7F4EC] border-white/10'
            }`}
            title={language === 'uz' ? 'Suhbatlar tarixi' : 'Chat History'}
            aria-label="Chat History"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden xs:inline text-[11px]">{language === 'uz' ? 'Tarix' : 'History'}</span>
            {sessions.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none ${
                  showHistoryDrawer
                    ? isLight
                      ? 'bg-white/25 text-white'
                      : 'bg-black/25 text-black'
                    : isLight
                    ? 'bg-[#8A7410]/15 text-[#8A7410]'
                    : 'bg-[#DBC66E]/20 text-[#DBC66E]'
                }`}
              >
                {sessions.length}
              </span>
            )}
          </button>

          {/* Encrypted Memory Chip */}
          <button
            onClick={() => setShowMemoryModal(!showMemoryModal)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition border ${
              isLight
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-600/30 hover:bg-emerald-900/40'
            }`}
            title="Client-Side Encrypted Memory"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline text-[11px]">Xotira</span>
          </button>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition border ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 text-[#1C1A14] border-[#E8DFC8]'
                : 'bg-white/10 hover:bg-white/20 text-[#F7F4EC] hover:text-white border-white/10'
            }`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Chat History Slide-Over Drawer */}
      {showHistoryDrawer && (
        <div
          className={`absolute inset-0 z-30 flex flex-col backdrop-blur-2xl transition-all animate-in fade-in slide-in-from-left duration-200 ${
            isLight ? 'bg-[#FAF8F5]/98 text-[#1C1A14]' : 'bg-[#0A1233]/98 text-[#FAF8F5]'
          }`}
        >
          {/* History Drawer Header */}
          <div
            className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
              isLight ? 'border-[#E8DFC8] bg-[#F5EFE0]/70' : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isLight ? 'bg-[#8A7410]/15 text-[#8A7410]' : 'bg-[#DBC66E]/20 text-[#DBC66E]'
                }`}
              >
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base font-['Marcellus']">
                  {language === 'uz' ? 'Suhbatlar tarixi' : 'Chat History'}
                </h3>
                <span className="text-[11px] opacity-70">
                  {sessions.length}{' '}
                  {language === 'uz'
                    ? 'ta suhbat mavjud'
                    : sessions.length === 1
                    ? 'conversation saved'
                    : 'conversations saved'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCreateNewChat}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition active:scale-95 ${
                  isLight
                    ? 'bg-[#8A7410] text-white hover:bg-[#72600B]'
                    : 'bg-gradient-to-r from-[#DBC66E] to-[#8A7410] text-[#0A1233] hover:opacity-95'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'uz' ? 'Yangi suhbat' : 'New Chat'}</span>
              </button>

              <button
                onClick={() => setShowHistoryDrawer(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                  isLight ? 'hover:bg-black/10 text-[#6B5E43]' : 'hover:bg-white/10 text-white/70'
                }`}
                aria-label="Close history"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* History Search Box */}
          <div
            className={`p-3 sm:px-5 border-b shrink-0 ${
              isLight ? 'border-[#E8DFC8] bg-white/40' : 'border-white/10 bg-black/20'
            }`}
          >
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border ${
                isLight
                  ? 'bg-white border-[#E2D8C0] text-[#1C1A14]'
                  : 'bg-white/5 border-white/10 text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5 opacity-60 shrink-0" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder={
                  language === 'uz'
                    ? 'Suhbat mavzulari bo‘yicha izlash...'
                    : 'Search chat topics...'
                }
                className="w-full bg-transparent focus:outline-none placeholder:opacity-50 text-xs"
              />
              {historySearch && (
                <button
                  onClick={() => setHistorySearch('')}
                  className="opacity-60 hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5 no-scrollbar max-w-4xl mx-auto w-full">
            {sessions
              .filter((s) =>
                historySearch.trim()
                  ? s.title.toLowerCase().includes(historySearch.toLowerCase()) ||
                    s.messages.some((m) =>
                      m.text.toLowerCase().includes(historySearch.toLowerCase())
                    )
                  : true
              )
              .map((session) => {
                const isActive = session.id === activeSessionId;
                const userMsgCount = session.messages.filter((m) => m.sender === 'user').length;

                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    className={`group relative p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all border flex items-center justify-between gap-3 ${
                      isActive
                        ? isLight
                          ? 'bg-[#F2EADB] border-[#8A7410]/70 shadow-sm ring-1 ring-[#8A7410]/30'
                          : 'bg-[#142255] border-[#DBC66E]/60 shadow-sm ring-1 ring-[#DBC66E]/30'
                        : isLight
                        ? 'bg-white/80 hover:bg-[#F7F2E7] border-[#E8DFC8]'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive
                            ? isLight
                              ? 'bg-[#8A7410] text-white'
                              : 'bg-[#DBC66E] text-[#0A1233]'
                            : isLight
                            ? 'bg-black/5 text-[#6B5E43] group-hover:text-[#1C1A14]'
                            : 'bg-white/10 text-white/70 group-hover:text-white'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              isActive
                                ? isLight
                                  ? 'text-[#8A7410]'
                                  : 'text-[#DBC66E]'
                                : ''
                            }`}
                          >
                            {session.title}
                          </h4>
                          {isActive && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                isLight
                                  ? 'bg-[#8A7410]/20 text-[#8A7410]'
                                  : 'bg-[#DBC66E]/20 text-[#DBC66E]'
                              }`}
                            >
                              Faol
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] opacity-60 mt-0.5">
                          <span>{formatSessionTime(session.updatedAt || session.createdAt, language)}</span>
                          <span>•</span>
                          <span>
                            {userMsgCount}{' '}
                            {language === 'uz' ? 'ta savol' : 'queries'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Session Button */}
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-opacity ${
                        isActive ? 'opacity-70 hover:opacity-100 hover:bg-rose-500/10 text-rose-500' : 'opacity-40 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-500'
                      }`}
                      title={language === 'uz' ? 'Suhbatni o‘chirish' : 'Delete conversation'}
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

            {sessions.length === 0 && (
              <div className="text-center py-12 opacity-60 text-xs">
                {language === 'uz' ? 'Hozircha suhbatlar mavjud emas' : 'No conversations yet'}
              </div>
            )}
          </div>

          {/* History Drawer Footer */}
          <div
            className={`p-3 sm:px-5 border-t flex items-center justify-between text-xs shrink-0 max-w-4xl mx-auto w-full ${
              isLight ? 'border-[#E8DFC8] bg-[#FAF8F5]' : 'border-white/10 bg-[#0A1233]'
            }`}
          >
            <button
              onClick={handleClearAllHistory}
              className="flex items-center gap-1.5 text-rose-500 hover:text-rose-600 transition px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'uz' ? 'Tarixni tozalash' : 'Clear all history'}</span>
            </button>

            <button
              onClick={() => setShowHistoryDrawer(false)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                isLight ? 'hover:bg-black/5 text-[#6B5E43]' : 'hover:bg-white/10 text-white/70'
              }`}
            >
              {language === 'uz' ? 'Yopish' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Encrypted Memory Popover Drawer */}
      {showMemoryModal && (
        <div
          className={`w-full max-w-4xl px-4 sm:px-6 py-3 border-b text-xs space-y-2 z-20 ${
            isLight
              ? 'bg-[#F5EFE0] border-[#E2D8C0] text-[#2C2408]'
              : 'bg-[#0E1A47] border-[#DBC66E]/20 text-[#FAF8F5]'
          }`}
        >
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5 text-[#8A7410] dark:text-[#DBC66E]">
              <Database className="w-3.5 h-3.5" />
              Mijoz qurilmasida shifrlangan xotira (Client Encrypted DB)
            </span>
            <button onClick={() => setShowMemoryModal(false)} className="p-1 hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] opacity-80 leading-relaxed">
            Sizning ma'lumotlaringiz qurilmangizning LocalStorage va IndexedDB bazasida maxsus shifrlangan holda turadi va faqatgina Sakin AI sizga iliq, moslashuvchan javob berishi uchun foydalaniladi.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
              <span className="opacity-60 block text-[10px]">Foydalanuvchi:</span>
              <span className="font-semibold">{userProfile?.userName || 'Mehmon'}</span>
            </div>
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
              <span className="opacity-60 block text-[10px]">Shahar:</span>
              <span className="font-semibold">{userProfile?.city || currentCity?.name || 'Toshkent'}</span>
            </div>
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
              <span className="opacity-60 block text-[10px]">Namozlar:</span>
              <span className="font-semibold">{userProfile?.dailyPrayersCompleted || 0}/5 ado etildi</span>
            </div>
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
              <span className="opacity-60 block text-[10px]">Tasbeh / Zikr:</span>
              <span className="font-semibold">{userProfile?.tasbihCountToday || 0} marta</span>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={async () => {
                await clearCipheredMemory();
                await refreshMemory();
                soundManager.playBeadClick();
              }}
              className="flex items-center gap-1 text-[11px] text-rose-500 hover:underline px-2 py-1"
            >
              <Trash2 className="w-3 h-3" />
              Xotirani butunlay tozalash
            </button>
          </div>
        </div>
      )}

      {/* Main Conversation Stream (Gemini / ChatGPT Style - NO BUBBLE FOR AI ANSWERS) */}
      <div
        ref={chatContainerRef}
        onScroll={handleMessagesScroll}
        style={{ overscrollBehavior: 'contain', overflowAnchor: 'auto' }}
        className="flex-1 w-full max-w-4xl overflow-y-auto px-4 sm:px-8 py-5 space-y-7 no-scrollbar"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
            >
              {isUser ? (
                /* User Message */
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-[24px] px-5 py-3.5 text-sm sm:text-base leading-relaxed font-normal shadow-sm border ${
                    isLight
                      ? 'bg-[#F2ECE1] text-[#241D05] border-[#E3D9C3]'
                      : 'bg-[#152044] text-[#FAF8F5] border-white/10'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div
                    className={`text-[9px] text-right mt-1.5 ${
                      isLight ? 'text-[#8C8270]' : 'text-[#FAF8F5]/40'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ) : (
                /* Assistant Message (ChatGPT / Gemini Style: Open Layout) */
                <div className="w-full space-y-3 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://sakinward.aluvantis.uz/Logo/89t8bVrDJpSbugTCKLHOuA.png"
                        alt="Sakin AI"
                        className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-full shadow-sm"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span
                        className={`font-['Marcellus'] font-bold text-sm sm:text-base flex items-center gap-1.5 ${
                          isLight ? 'text-[#1C1A14]' : 'text-[#FAF8F5]'
                        }`}
                      >
                        Sakin AI
                        <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'}`} />
                      </span>
                    </div>
                  </div>

                  {/* Open Markdown Stream */}
                  <div
                    className={`prose prose-sm sm:prose-base max-w-none text-sm sm:text-base leading-[1.8] font-normal ${
                      isLight
                        ? 'text-[#2C2408] [&>h1]:text-[#8A7410] [&>h2]:text-[#8A7410] [&>h3]:text-[#8A7410] [&>strong]:text-[#1C1A14] [&>blockquote]:border-[#8A7410] [&>blockquote]:bg-[#F4ECE0]/50'
                        : 'text-[#F0ECE1] [&>h1]:text-[#DBC66E] [&>h2]:text-[#DBC66E] [&>h3]:text-[#DBC66E] [&>strong]:text-white [&>blockquote]:border-[#DBC66E] [&>blockquote]:bg-white/5'
                    } [&>blockquote]:border-l-4 [&>blockquote]:pl-4 [&>blockquote]:py-1.5 [&>blockquote]:my-2 [&>blockquote]:rounded-r-lg [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>p]:mb-3`}
                  >
                    <Markdown
                      components={{
                        p: ({ children }) => {
                          const textStr = React.Children.toArray(children).join('');
                          const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(textStr);
                          if (hasArabic) {
                            return (
                              <p className="font-arabic text-2xl sm:text-3xl leading-loose text-center py-4 my-4 bg-[#DBC66E]/5 rounded-2xl border border-[#DBC66E]/10 text-[#DBC66E] antialiased selection:bg-[#DBC66E]/25">
                                {children}
                              </p>
                            );
                          }
                          return <p className="mb-3 leading-relaxed">{children}</p>;
                        },
                        blockquote: ({ children }) => {
                          return (
                            <blockquote className={`border-l-4 border-[#DBC66E] pl-4 py-3 my-4 rounded-r-2xl font-['Marcellus'] text-base sm:text-lg italic tracking-wide text-[#DBC66E] shadow-sm leading-relaxed ${isLight ? 'bg-black/5' : 'bg-white/5'}`}>
                              {children}
                            </blockquote>
                          );
                        },
                        h1: ({ children }) => <h1 className="font-['Marcellus'] text-xl sm:text-2xl font-bold text-[#DBC66E] mt-5 mb-2.5 tracking-wide">{children}</h1>,
                        h2: ({ children }) => <h2 className="font-['Marcellus'] text-lg sm:text-xl font-bold text-[#DBC66E] mt-4 mb-2 tracking-wide">{children}</h2>,
                        h3: ({ children }) => <h3 className="font-['Marcellus'] text-base sm:text-lg font-semibold text-[#DBC66E] mt-3 mb-1.5 tracking-wide">{children}</h3>,
                      }}
                    >
                      {msg.text}
                    </Markdown>
                  </div>

                  {/* Grounded Web Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span
                        className={`text-xs flex items-center gap-1 font-semibold ${
                          isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {language === 'uz' ? 'Manbalar:' : 'Sources:'}
                      </span>
                      {msg.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.uri}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs hover:underline border transition ${
                            isLight
                              ? 'bg-[#F2ECE1] text-[#10559E] border-[#E0D5BE] hover:bg-[#EAE2D4]'
                              : 'bg-white/5 text-blue-300 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <span className="truncate max-w-[200px]">{s.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Action Chips */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(act)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition active:scale-95 shadow-sm ${
                            isLight
                              ? 'bg-[#EFE6D2] text-[#594B0B] border-[#DBC66E]/70 hover:bg-[#E5DABE]'
                              : 'bg-[#DBC66E]/15 text-[#DBC66E] border-[#DBC66E]/40 hover:bg-[#DBC66E]/25'
                          }`}
                        >
                          {getActionIcon(act.type)}
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 ml-0.5 opacity-70" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* MD3 Action Toolbar */}
                  <div className="flex items-center gap-1.5 pt-1 text-xs">
                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isLight ? 'hover:bg-black/5 text-[#6B5E43]' : 'hover:bg-white/10 text-[#DBC66E]'
                      }`}
                      title="Nusxa olish"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Live Streaming Response */}
        {isLoading && (
          <div className="w-full space-y-3 max-w-3xl animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <img
                src="https://sakinward.aluvantis.uz/Logo/89t8bVrDJpSbugTCKLHOuA.png"
                alt="Sakin AI"
                className="w-7 h-7 object-contain rounded-full shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <span
                className={`font-['Marcellus'] font-bold text-sm flex items-center gap-1.5 ${
                  isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Sakin AI tafakkur qilmoqda...
              </span>
            </div>

            {streamingText ? (
              <div
                className={`prose prose-sm sm:prose-base max-w-none text-sm sm:text-base leading-[1.8] font-normal ${
                  isLight ? 'text-[#2C2408]' : 'text-[#F0ECE1]'
                }`}
              >
                <Markdown
                  components={{
                    p: ({ children }) => {
                      const textStr = React.Children.toArray(children).join('');
                      const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(textStr);
                      if (hasArabic) {
                        return (
                          <p className="font-arabic text-2xl sm:text-3xl leading-loose text-center py-4 my-4 bg-[#DBC66E]/5 rounded-2xl border border-[#DBC66E]/10 text-[#DBC66E] antialiased selection:bg-[#DBC66E]/25">
                            {children}
                          </p>
                        );
                      }
                      return <p className="mb-3 leading-relaxed">{children}</p>;
                    },
                    blockquote: ({ children }) => {
                      return (
                        <blockquote className={`border-l-4 border-[#DBC66E] pl-4 py-3 my-4 rounded-r-2xl font-['Marcellus'] text-base sm:text-lg italic tracking-wide text-[#DBC66E] shadow-sm leading-relaxed ${isLight ? 'bg-black/5' : 'bg-white/5'}`}>
                          {children}
                        </blockquote>
                      );
                    },
                    h1: ({ children }) => <h1 className="font-['Marcellus'] text-xl sm:text-2xl font-bold text-[#DBC66E] mt-5 mb-2.5 tracking-wide">{children}</h1>,
                    h2: ({ children }) => <h2 className="font-['Marcellus'] text-lg sm:text-xl font-bold text-[#DBC66E] mt-4 mb-2 tracking-wide">{children}</h2>,
                    h3: ({ children }) => <h3 className="font-['Marcellus'] text-base sm:text-lg font-semibold text-[#DBC66E] mt-3 mb-1.5 tracking-wide">{children}</h3>,
                  }}
                >
                  {streamingText}
                </Markdown>
                <span
                  className={`inline-block w-1.5 h-4 ml-1 animate-pulse ${
                    isLight ? 'bg-[#8A7410]' : 'bg-[#DBC66E]'
                  }`}
                />
              </div>
            ) : (
              <div
                className={`flex items-center gap-2 py-1 text-xs ${
                  isLight ? 'text-[#8A7410]' : 'text-[#DBC66E]'
                }`}
              >
                <span className="w-2 h-2 rounded-full animate-ping bg-current" />
                <span className="w-2 h-2 rounded-full animate-pulse [animation-delay:150ms] bg-current" />
                <span className="w-2 h-2 rounded-full animate-pulse [animation-delay:300ms] bg-current" />
                <span className="ml-1 text-[12px]">
                  {language === 'uz'
                    ? 'Nurli ma\'lumotlar tahlil qilinmoqda...'
                    : 'Contemplating with serenity...'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Quick Suggestion Chips (when starting or few messages) */}
        {messages.length <= 2 && !isLoading && (
          <div className="pt-2 pb-1">
            <div className="text-[11px] opacity-60 mb-2 font-medium">
              {language === 'uz' ? 'Tavsiya etilgan mavzular:' : 'Suggested topics:'}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: '🌿 Qalbga taskin',
                  prompt: 'Qalbimda bezovtalik bor, menga taskin beruvchi Qur\'on oyati va ma\'naviy tavsiya ayting',
                },
                {
                  label: '🤲 Sahih duolar',
                  prompt: 'G‘am-tashvish va siqilish paytida o‘qiladigan sahih hadisdagi duoni keltiring',
                },
                {
                  label: '💡 Sabr va umid',
                  prompt: 'Hayotiy qiyinchiliklarda sabr qilish haqida Qur\'oni Karim nuri bilan tushuntiring',
                },
                {
                  label: '🌙 Namozda xushu',
                  prompt: 'Namozda qalb huzuri va xushuni oshirish uchun qanday tavsiyalar bor?',
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(item.prompt)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 text-left shrink-0 active:scale-[0.98] ${
                    isLight
                      ? 'bg-white/90 hover:bg-[#F4EDE0] text-[#4A3E20] border-[#E2D8C0] shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-[#FAF8F5]/90 border-white/10 shadow-sm'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-0 w-0 pointer-events-none" />
      </div>

      {/* Floating Bottom Input Dock */}
      <div className="p-3 sm:p-4 pb-4 sm:pb-6 shrink-0 w-full max-w-4xl mx-auto z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className={`relative flex items-center gap-2 p-1.5 sm:p-2 pl-3 sm:pl-4 rounded-[28px] shadow-[0_10px_35px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-all border min-h-[48px] ${
            isLight
              ? 'bg-white/95 border-[#E2D8C0] focus-within:border-[#8A7410] focus-within:shadow-[0_12px_40px_rgba(138,116,16,0.18)]'
              : 'bg-[#0E173D]/95 border-[#DBC66E]/30 focus-within:border-[#DBC66E] focus-within:shadow-[0_12px_40px_rgba(219,198,110,0.15)]'
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              language === 'uz'
                ? 'Qalbingizdagi savol yoki tafakkurni yozing...'
                : language === 'ru'
                ? 'Напишите ваш вопрос или размышление...'
                : 'Ask a question or seek serene reflection...'
            }
            className={`w-full py-1.5 bg-transparent text-sm sm:text-base focus:outline-none ${
              isLight ? 'text-[#1C1A14] placeholder-[#8C8270]' : 'text-[#FAF8F5] placeholder-[#FAF8F5]/40'
            }`}
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 font-bold transition-transform active:scale-95 disabled:opacity-30 disabled:scale-100 ${
              isLight
                ? 'bg-[#8A7410] text-white hover:bg-[#72600B] shadow-md'
                : 'bg-gradient-to-tr from-[#8A7410] to-[#DBC66E] text-[#0A1233] shadow-md'
            }`}
            aria-label="Send"
            title="Yuborish"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p
          className={`text-center text-[10px] sm:text-[11px] mt-2 px-3 tracking-wide font-light ${
            isLight ? 'text-[#8C8270]' : 'text-[#FAF8F5]/45'
          }`}
        >
          {language === 'uz'
            ? 'Sakin AI ruhiy taskin va tafakkur uchun xizmat qiladi. Fatvo va shariat hukmlari uchun rasmiy ulamolarga murojaat qiling.'
            : 'Sakin AI serves spiritual solace and reflection. For binding religious rulings, please consult authorized scholars.'}
        </p>
      </div>
    </div>
  );
};

export default SakinAiModal;
