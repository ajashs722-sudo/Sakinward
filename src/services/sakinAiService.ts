import { SakinAiMessage, SakinAiAction } from '../types';
import {
  loadCipheredUserProfile,
  formatDynamicMemoryContext,
  addReflectionTopic,
  autoUpdateGraphFromConversation,
  loadUserKnowledgeGraph,
  upsertGraphNode,
  saveUserKnowledgeGraph
} from '../utils/sakinMemoryDb';

export interface ChatResponse {
  reply: string;
  actions?: SakinAiAction[];
  sources?: { title: string; uri: string }[];
  provider?: string;
  grounded?: boolean;
  graph_update?: {
    type: any;
    label: string;
    value: string;
  };
}

export interface SakinUserContext {
  userName?: string;
  city?: string;
  time?: string;
  prayerName?: string;
  memorySummary?: string;
}

export async function sendChatMessage(
  userPrompt: string,
  history: SakinAiMessage[] = [],
  language: string = 'uz',
  userContext?: SakinUserContext
): Promise<ChatResponse> {
  try {
    // Record topic and dynamically evolve knowledge graph from conversation
    addReflectionTopic(userPrompt).catch(() => {});
    autoUpdateGraphFromConversation(userPrompt).catch(() => {});

    // Ensure memory context is populated with Dynamic Graph-RAG
    let effectiveContext = userContext ? { ...userContext } : {};
    if (!effectiveContext.memorySummary) {
      try {
        const profile = await loadCipheredUserProfile();
        effectiveContext.memorySummary = await formatDynamicMemoryContext(profile, userPrompt);
        if (!effectiveContext.userName && profile.userName) {
          effectiveContext.userName = profile.userName;
        }
        if (!effectiveContext.city && profile.city) {
          effectiveContext.city = profile.city;
        }
      } catch {}
    }

    const response = await fetch('/api/sakin-ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userPrompt,
        messages: history.map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
        language,
        userContext: effectiveContext,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();

    // If agent autonomously invoked graph update tool, commit to client storage
    if (data.graph_update) {
      loadUserKnowledgeGraph().then((graph) => {
        upsertGraphNode(graph, data.graph_update);
        saveUserKnowledgeGraph(graph);
      }).catch(() => {});
    }

    return {
      reply: data.reply || '',
      actions: data.actions || [],
      sources: data.sources || [],
      provider: data.provider || 'deepseek-chat',
      grounded: data.grounded || false,
      graph_update: data.graph_update,
    };
  } catch (error) {
    console.warn('Network call to Sakin AI backend failed, generating offline response:', error);
    return getClientOfflineResponse(userPrompt, language);
  }
}

export async function streamChatMessage(
  userPrompt: string,
  history: SakinAiMessage[] = [],
  language: string = 'uz',
  userContext?: SakinUserContext,
  onChunk?: (chunkText: string, accumulatedText: string) => void,
  onDone?: (finalResponse: ChatResponse) => void
): Promise<ChatResponse> {
  try {
    // Record topic and dynamically evolve knowledge graph from conversation
    addReflectionTopic(userPrompt).catch(() => {});
    autoUpdateGraphFromConversation(userPrompt).catch(() => {});

    // Ensure memory context is populated with Dynamic Graph-RAG
    let effectiveContext = userContext ? { ...userContext } : {};
    if (!effectiveContext.memorySummary) {
      try {
        const profile = await loadCipheredUserProfile();
        effectiveContext.memorySummary = await formatDynamicMemoryContext(profile, userPrompt);
        if (!effectiveContext.userName && profile.userName) {
          effectiveContext.userName = profile.userName;
        }
        if (!effectiveContext.city && profile.city) {
          effectiveContext.city = profile.city;
        }
      } catch {}
    }

    const response = await fetch('/api/sakin-ai/chat-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userPrompt,
        messages: history.map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
        language,
        userContext: effectiveContext,
      }),
    });

    if (!response.ok || !response.body) {
      // Fallback to standard request
      const fallback = await sendChatMessage(userPrompt, history, language, effectiveContext);
      if (onDone) onDone(fallback);
      return fallback;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulated = '';
    let actions: SakinAiAction[] = [];
    let sources: Array<{ title: string; uri: string }> = [];
    let provider = 'deepseek-chat';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.chunk) {
              accumulated += parsed.chunk;
              if (onChunk) {
                // Strip raw actions during active streaming
                const display = accumulated.replace(/\[ACTION:[^\]]+\]/g, '');
                onChunk(parsed.chunk, display);
              }
            }
            if (parsed.done) {
              if (parsed.actions && Array.isArray(parsed.actions)) {
                actions = parsed.actions;
              }
              if (parsed.sources && Array.isArray(parsed.sources)) {
                sources = parsed.sources;
              }
              if (parsed.provider) {
                provider = parsed.provider;
              }
              if (parsed.graph_update) {
                loadUserKnowledgeGraph().then((graph) => {
                  upsertGraphNode(graph, parsed.graph_update);
                  saveUserKnowledgeGraph(graph);
                }).catch(() => {});
              }
              if (parsed.fullText) {
                accumulated = parsed.fullText;
              } else if (parsed.text && !accumulated) {
                accumulated = parsed.text;
              }
            }
          } catch {}
        }
      }
    }

    let cleanReply = accumulated.replace(/\[ACTION:[^\]]+\]/g, '').trim();

    if (!cleanReply) {
      const fallback = getClientOfflineResponse(userPrompt, language);
      cleanReply = fallback.reply;
      if (!actions.length && fallback.actions) {
        actions = fallback.actions;
      }
    }

    const finalRes: ChatResponse = {
      reply: cleanReply,
      actions,
      sources,
      provider,
      grounded: sources.length > 0,
    };

    if (onDone) onDone(finalRes);
    return finalRes;
  } catch (error) {
    console.warn('Stream notice, falling back:', error);
    const offline = getClientOfflineResponse(userPrompt, language);
    if (onDone) onDone(offline);
    return offline;
  }
}

export const SAKIN_PRESET_PROMPTS = [
  {
    id: 'anxiety',
    icon: '🕊️',
    title: {
      uz: 'Qalbimda xavotir bor',
      en: 'My heart feels anxious',
      ru: 'Тревога на сердце',
      ar: 'أشعر بضيق في قلبي',
    },
    prompt: {
      uz: 'Qalbimda xavotir va g‘am bor. Qalbimga taskin va sokinlik beruvchi Qur‘on oyatlari va zikrlarni ulashing.',
      en: 'My heart feels anxious and heavy. Please share Quranic verses and dhikr that bring solace and serenity.',
      ru: 'На сердце тревога и тяжесть. Поделитесь аятами Корана и зикрами для успокоения души.',
      ar: 'أشعر بالقلق والضيق. شاركني آيات من القرآن وأذكاراً تجلب الطمأنينة لقلبي.',
    },
  },
  {
    id: 'patience',
    icon: '🌿',
    title: {
      uz: 'Sabr va umid oyatlari',
      en: 'Verses of patience & hope',
      ru: 'Аяты терпения и надежды',
      ar: 'آيات الصبر والرجاء',
    },
    prompt: {
      uz: 'Hayot sinovlarida sabr qilish va Allohning rahmatidan umid uzmaslik haqida Qur‘oni Karimdagi oyatlarni eslatib bering.',
      en: 'Remind me of Quranic verses about having patience through life trials and never losing hope in Allah’s mercy.',
      ru: 'Напомните аяты Священного Корана о терпении в испытаниях и надежде на милость Аллаха.',
      ar: 'ذكرني بآيات القرآن الكريم حول الصبر عند الابتلاء والرجاء في رحمة الله.',
    },
  },
  {
    id: 'dhikr',
    icon: '📿',
    title: {
      uz: 'Kechki zikr va salovat',
      en: 'Evening dhikr & salawat',
      ru: 'Вечерний зикр и салават',
      ar: 'أذكار المساء والصلاة على النبي',
    },
    prompt: {
      uz: 'Bugun aytishim mumkin bo‘lgan eng fazilatli zikrlar va payg‘ambarimizga salovatlar haqida eslating.',
      en: 'Please guide me through the most virtuous dhikr and blessings upon the Prophet to recite today.',
      ru: 'Подскажите наилучшие зикры и салаваты Пророку (мир ему), которые я могу прочитать сегодня.',
      ar: 'علمني أفضل الأذكار والصلاة على النبي صلى الله عليه وسلم لترديدها اليوم.',
    },
  },
  {
    id: 'names',
    icon: '✨',
    title: {
      uz: 'Allohning "Ar-Rohman" ismi',
      en: 'The Name "Ar-Rahman"',
      ru: 'Имя Аллаха «Ар-Рахман»',
      ar: 'اسم الله «الرحمن»',
    },
    prompt: {
      uz: 'Alloh taoloning "Ar-Rohman" va "Al-Vadud" go‘zal ismlari ma‘nosi va qalbimizga ta‘siri haqida go‘zal tafakkur qilib beraylik.',
      en: 'Let us reflect upon the profound meaning of Allah’s Beautiful Names "Ar-Rahman" (The Most Merciful) and "Al-Wadud" (The Loving).',
      ru: 'Давайте поразмышляем над прекрасными Именами Аллаха «Ар-Рахман» (Милостивый) и «Аль-Вадуд» (Любящий).',
      ar: 'دعنا نتفكر في معاني اسمي الله الحسنى «الرحمن» و«الودود» وأثرهما في قلوبنا.',
    },
  },
];

function getClientOfflineResponse(prompt: string, lang: string): ChatResponse {
  const lower = prompt.toLowerCase();

  if (
    lower.includes('fatvo') ||
    lower.includes('hukm') ||
    lower.includes('halol') ||
    lower.includes('harom') ||
    lower.includes('taloq') ||
    lower.includes('fatwa')
  ) {
    return {
      reply:
        lang === 'uz'
          ? `Assalomu alaykum va rahmatulloh.

Bu masala aniq shaxsiy va fiqhiy o‘rganishni talab etadi. Sakinward ilovasida biz fatvo yoki shariat hukmlarini bermaymiz. To‘g‘ri va ishonchli javob olish uchun O‘zbekiston Musulmonlari Idorasi Fatvo markazi yoki o‘zingiz ishonadigan ahli ilmlarga murojaat qilishingizni tavsiya qilamiz.

Qalbingizga xotirjamlik tilab, sizga ushbu oyati karimani eslataman:
*"Albatta, Allohning zikri ila qalblar orom olur."* (Ra'd surasi, 28-oyat)`
          : `Peace and blessings upon you.

This inquiry requires dedicated scholarly jurisprudence (Fiqh). Sakinward does not issue religious rulings (fatwas). Please consult your local trusted scholars or official religious council.

May your heart find serenity in Allah's remembrance:
*"Verily, in the remembrance of Allah do hearts find rest."* (Surah Ar-Ra'd 13:28)`,
      actions: [
        { type: 'open_quran', param: '13', subParam: '28', label: '📖 Ra‘d surasi (13:28)' },
        { type: 'open_zikr', param: 'istighfar', label: '📿 Istig‘for aytish' },
      ],
      provider: 'sakin-client-guardrail',
    };
  }

  return {
    reply:
      lang === 'uz'
        ? `Sakinlik va nur sizga hamroh bo‘lsin. 

*"Albatta, har bir qiyinchilik bilan birga yengillik bordir."* (Sharh surasi, 94:5-6)

Qalbingizni yengillashtirish uchun quyidagi imkoniyatlarni tavsiya qilaman:`
        : `May serenity and peace surround you.

*"For indeed, with hardship comes ease."* (Surah Ash-Sharh 94:5-6)

I invite you to explore:`,
    actions: [
      { type: 'open_quran', param: '94', label: '📖 Inshirah surasini tinglash' },
      { type: 'open_zikr', param: 'salawat', label: '📿 Salovat aytish' },
      { type: 'open_soundscapes', label: '🌿 Sokinlik ovozlari' },
    ],
    provider: 'sakin-client-offline',
  };
}
