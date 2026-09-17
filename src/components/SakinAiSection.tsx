import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Compass,
} from 'lucide-react';
import { ScrollHighlightText, ScrollHighlightCard } from './ScrollHighlight';

interface SakinAiSectionProps {
  isDarkMode: boolean;
  language: string;
  onOpenAi: () => void;
}

export const SakinAiSection: React.FC<SakinAiSectionProps> = ({
  isDarkMode,
  language,
  onOpenAi,
}) => {
  // Multilingual content for Sakin AI
  const content = React.useMemo(() => {
    if (language === 'ru') {
      return {
        badge: 'Исламский Интеллект & Мудрость',
        title: 'Sakin AI — Ваш надежный духовный собеседник',
        subtitle:
          'Персональный ассистент, основанный на Священном Коране, достоверной сунне и авторитетных трудах исламских ученых. Без сомнительных источников и домыслов.',
        cta: 'Начать беседу с Sakin AI',
        features: [
          {
            icon: BookOpen,
            title: 'Достоверные источники',
            desc: 'Каждый ответ опирается на аяты Корана, сборники Сахих аль-Бухари и Муслима, а также признанные богословские труды без субъективных толкований.',
            accent: 'gold' as const,
            tag: '100% Верифицировано',
          },
          {
            icon: Compass,
            title: 'Фикх и правила поклонения',
            desc: 'Ясные разъяснения правил омовения, намаза, поста, закята и возмещения пропущенных молитв в соответствии с нормами шариата.',
            accent: 'cyan' as const,
            tag: 'Шариатские нормы',
          },
          {
            icon: Sparkles,
            title: 'Молитвы (Дуа) и Зикр',
            desc: 'Маснун-дуа на все случаи жизни, правильное произношение, смысловой перевод и наставления для обретения душевного спокойствия.',
            accent: 'gold' as const,
            tag: 'Суннат & Тазкия',
          },
          {
            icon: ShieldCheck,
            title: 'Полная конфиденциальность',
            desc: 'Ваши вопросы и диалоги остаются строго приватными. Мы не передаем данные третьим лицам и не используем их в коммерческих целях.',
            accent: 'cyan' as const,
            tag: 'Абсолютная тайна',
          },
        ],
        guaranteeText: 'Проверенная база знаний • Беспристрастный подход • Без рекламы',
      };
    }

    if (language === 'en') {
      return {
        badge: 'Islamic Intellect & Divine Wisdom',
        title: 'Sakin AI — Grounded in Authentic Knowledge',
        subtitle:
          'Your thoughtful spiritual companion anchored in the Holy Quran, authentic Sunnah, and verified scholarly consensus. Completely free from unverified opinions.',
        cta: 'Start Conversation with Sakin AI',
        features: [
          {
            icon: BookOpen,
            title: 'Authentic Scholarly Foundations',
            desc: 'Responses are carefully cited from the Holy Quran, Sahih al-Bukhari, Sahih Muslim, and classical accredited jurisprudence without unverified guesswork.',
            accent: 'gold' as const,
            tag: '100% Verified',
          },
          {
            icon: Compass,
            title: 'Fiqh & Daily Worship Guidance',
            desc: 'Clear, step-by-step guidance for purification, prayer timings, fasting rules, zakat calculation, and spiritual obligations.',
            accent: 'cyan' as const,
            tag: 'Jurisprudence',
          },
          {
            icon: Sparkles,
            title: 'Prophetic Duas & Remembrance',
            desc: 'Authentic supplications for morning, evening, and moments of distress, complete with transliteration and spiritual context.',
            accent: 'gold' as const,
            tag: 'Sunnah Duas',
          },
          {
            icon: ShieldCheck,
            title: 'Strict Privacy & Trust',
            desc: 'Your queries are treated with utmost sanctity and privacy. No ad tracking, no data selling, and no commercial exploitation.',
            accent: 'cyan' as const,
            tag: 'Private & Secure',
          },
        ],
        guaranteeText: 'Verified Islamic Corpus • Impartial Adab • Zero Advertisements',
      };
    }

    // Default Uzbek
    return {
      badge: 'Islomiy Intellekt & Hikmat',
      title: 'Sakin AI — Mo‘tabar Manbalarga Asoslangan Intellekt',
      subtitle:
        'Qur’oni Karim oyatlari, sahih sunnat va mo‘tabar ulamolar merosiga tayangan, shubhali fikrlardan xoli shaxsiy islomiy ma’rifat hamrohingiz.',
      cta: 'Sakin AI bilan suhbatni boshlash',
      features: [
        {
          icon: BookOpen,
          title: 'Mo‘tabar va Ishonchli Manbalar',
          desc: 'Har bir ma’lumot Qur’oni Karim, Sahihul Buxoriy, Sahih Muslim va an’anaviy mo‘tabar manbalar asosida shubhali fatvolardan xoli tarzda taqdim etiladi.',
          accent: 'gold' as const,
          tag: '100% Mo‘tabar',
        },
        {
          icon: Compass,
          title: 'Ibodat va Fiqhiy Masalalar',
          desc: 'Tahorat, namoz tartiblari, ro‘za ahkomlari, zakot hisobi va qazolarni o‘tash bo‘yicha odob va shariat mezonlariga muvofiq aniq yo‘riqnomalar.',
          accent: 'cyan' as const,
          tag: 'Shariat Mezonlari',
        },
        {
          icon: Sparkles,
          title: 'Ma’sur Duolar va Ruhiy Taskin',
          desc: 'Har bir holat uchun sunnatda vorid bo‘lgan sahih duolar, ertalabki va kechki zikrlar hamda qalbga xotirjamlik bag‘ishlovchi ma’naviy ko‘mak.',
          accent: 'gold' as const,
          tag: 'Ma’sur Zikrlar',
        },
        {
          icon: ShieldCheck,
          title: 'To‘liq Maxfiylik va Beg‘araz Xizmat',
          desc: 'Siz bergan savollar va suhbatlar mutlaqo maxfiy saqlanadi. Hech qanday tijoriy maqsadlarda foydalanilmaydi yoki uchinchi shaxslarga berilmaydi.',
          accent: 'cyan' as const,
          tag: 'Maxfiy va Xavfsiz',
        },
      ],
      guaranteeText: 'Tasdiqlangan manbalar bazasi • Shariat adabiga rioya • Reklamasiz',
    };
  }, [language]);

  // Theme styles
  const goldStroke = '#DBC66E';
  const cyanStroke = '#38BDF8';
  const cardBg = isDarkMode
    ? 'bg-[#091026]/95 border-[#DBC66E]/20 text-[#F7F4EC]'
    : 'bg-[#FCFAF7]/98 border-[#8A7410]/20 text-[#0A1233]';

  const featureInnerBg = isDarkMode
    ? 'bg-[#0D183B]/90 border-white/10'
    : 'bg-white/95 border-black/10';

  const primaryText = isDarkMode ? 'text-[#F7F4EC]' : 'text-[#0A1233]';
  const secondaryText = isDarkMode ? 'text-[#D5D0C3]' : 'text-[#4A5568]';

  return (
    <div
      id="sakin-ai-section"
      className={`relative overflow-hidden rounded-[36px] p-6 sm:p-10 transition-all duration-300 border shadow-2xl ${cardBg}`}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 600px' }}
    >
      {/* ========================================================================= */}
      {/* 2-TONE ISLAMIC SACRED GEOMETRY BACKGROUND (GPU-ACCELERATED) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Ambient Glowing Radials (Tone 1: Gold, Tone 2: Cyan) */}
        <div
          className={`absolute -top-12 -right-12 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            isDarkMode ? 'bg-[#DBC66E]/10' : 'bg-[#DBC66E]/15'
          }`}
        />
        <div
          className={`absolute -bottom-12 -left-12 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            isDarkMode ? 'bg-[#0284C7]/10' : 'bg-[#0284C7]/10'
          }`}
        />

        {/* 2-Tone SVG Background Geometry */}
        <div className="absolute -right-20 -top-20 sm:-right-8 sm:-top-8 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] opacity-25 dark:opacity-30 transform-gpu pointer-events-none">
          <svg
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* TONE 1: GOLDEN SACRED GEOMETRY */}
            <motion.circle
              cx="250"
              cy="250"
              r="220"
              stroke={goldStroke}
              strokeWidth="1.2"
              strokeDasharray="6 4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.8 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
            />

            <motion.circle
              cx="250"
              cy="250"
              r="170"
              stroke={goldStroke}
              strokeWidth="1"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.9 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1 }}
            />

            <rect
              x="130"
              y="130"
              width="240"
              height="240"
              stroke={goldStroke}
              strokeWidth="1.2"
            />

            <rect
              x="130"
              y="130"
              width="240"
              height="240"
              stroke={goldStroke}
              strokeWidth="1.2"
              transform="rotate(45 250 250)"
            />

            {/* TONE 2: CELESTIAL CYAN / AZURE ACCENT GEOMETRY */}
            <circle
              cx="250"
              cy="250"
              r="120"
              stroke={cyanStroke}
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            <polygon
              points="250,90 390,250 250,410 110,250"
              stroke={cyanStroke}
              strokeWidth="1.2"
            />

            <polygon
              points="250,90 390,250 250,410 110,250"
              stroke={cyanStroke}
              strokeWidth="0.8"
              transform="rotate(30 250 250)"
            />

            {/* Central Rosette */}
            <circle
              cx="250"
              cy="250"
              r="60"
              stroke={goldStroke}
              strokeWidth="1.5"
            />

            {/* Wisdom Core Node */}
            <circle
              cx="250"
              cy="250"
              r="16"
              fill={goldStroke}
              fillOpacity="0.3"
              stroke={cyanStroke}
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FOREGROUND: SHOWCASE & KNOWLEDGE PILLARS */}
      {/* ========================================================================= */}
      <div className="relative z-10 space-y-7">
        {/* Header Block with Scroll Highlight Text */}
        <div className="space-y-3 max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DBC66E]/15 border border-[#DBC66E]/30 text-xs font-bold uppercase tracking-wider text-[#8A7410] dark:text-[#DBC66E]">
            <Sparkles className="w-3.5 h-3.5 text-[#DBC66E]" />
            <span>{content.badge}</span>
          </div>

          {/* Main Title */}
          <ScrollHighlightText
            text={content.title}
            as="h2"
            highlightColor={
              isDarkMode
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#F7F4EC] via-[#DBC66E] to-[#F7F4EC]'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-[#0A1233] via-[#8A7410] to-[#0A1233]'
            }
            className="font-brand-display text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight"
          />

          {/* Subtitle */}
          <ScrollHighlightText
            text={content.subtitle}
            as="p"
            highlightColor={secondaryText}
            className="text-sm sm:text-base leading-relaxed"
          />
        </div>

        {/* 4 Clean, Scroll-Triggered Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.features.map((item, idx) => {
            const Icon = item.icon;
            const isGold = item.accent === 'gold';

            return (
              <ScrollHighlightCard
                key={idx}
                index={idx}
                isDarkMode={isDarkMode}
                accentColor={item.accent}
                className={`p-5 sm:p-6 border flex flex-col justify-between ${featureInnerBg}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm ${
                        isGold
                          ? 'bg-[#DBC66E]/15 border-[#DBC66E]/35 text-[#8A7410] dark:text-[#DBC66E]'
                          : 'bg-[#38BDF8]/15 border-[#38BDF8]/35 text-[#0284C7] dark:text-[#38BDF8]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        isGold
                          ? 'bg-[#DBC66E]/10 border-[#DBC66E]/30 text-[#8A7410] dark:text-[#DBC66E]'
                          : 'bg-[#38BDF8]/10 border-[#38BDF8]/30 text-[#0284C7] dark:text-[#38BDF8]'
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <h3 className={`text-base font-bold tracking-tight ${primaryText}`}>
                    {item.title}
                  </h3>

                  <p className={`text-xs sm:text-sm leading-relaxed ${secondaryText}`}>
                    {item.desc}
                  </p>
                </div>
              </ScrollHighlightCard>
            );
          })}
        </div>

        {/* Bottom CTA Block */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-current/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8A7410] dark:text-[#DBC66E]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{content.guaranteeText}</span>
          </div>

          <button
            id="start-sakin-ai-conversation-btn"
            onClick={onOpenAi}
            className="group relative overflow-hidden px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#DBC66E] to-[#C8B052] text-[#0A1233] font-bold text-sm sm:text-base hover:brightness-105 active:scale-98 transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-[#0A1233]" />
            <span>{content.cta}</span>
            <ArrowRight className="w-4 h-4 text-[#0A1233] transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
