import { GoogleGenAI } from '@google/genai';

interface Env {
  GEMINI_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  TELEGRAM_BOT_TOKEN?: string;
  APP_URL?: string;
  SAKIN_SESSIONS?: any;
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API Routes Router
    if (url.pathname.startsWith('/api/')) {
      try {
        // 1. Health check
        if (url.pathname === '/api/health') {
          return new Response(JSON.stringify({ status: 'ok', environment: 'cloudflare-worker' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // 1.1 Secure Environment Debug Check (No credentials leaked, only checks existence and masks)
        if (url.pathname === '/api/debug-env') {
          const keysStatus: Record<string, any> = {};
          for (const key of Object.keys(env)) {
            const val = (env as any)[key];
            if (typeof val === 'string') {
              keysStatus[key] = {
                exists: true,
                length: val.length,
                prefix: val.slice(0, 4) + '...',
                suffix: '...' + val.slice(-4),
                type: 'string'
              };
            } else {
              keysStatus[key] = {
                exists: true,
                type: typeof val
              };
            }
          }
          return new Response(JSON.stringify({
            status: 'ok',
            detectedKeys: {
              DEEPSEEK_API_KEY: !!env.DEEPSEEK_API_KEY,
              DEEPSEEK_API: !!(env as any).DEEPSEEK_API,
              GEMINI_API_KEY: !!env.GEMINI_API_KEY,
              GEMINI_API: !!(env as any).GEMINI_API,
              TELEGRAM_BOT_TOKEN: !!env.TELEGRAM_BOT_TOKEN,
            },
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // Telegram Webhook Setup Endpoint
        if (url.pathname === '/api/telegram/setup-webhook') {
          const botToken = env.TELEGRAM_BOT_TOKEN;
          if (!botToken) {
            return new Response(JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN secret is missing' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
          const webhookUrl = `${url.origin}/api/telegram/webhook`;
          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
          const tgData = await tgRes.json();
          return new Response(JSON.stringify({ webhookUrl, tgResult: tgData }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // Telegram Webhook Message Receiver
        if (url.pathname === '/api/telegram/webhook') {
          if (request.method === 'POST') {
            try {
              const update = await request.json();
              ctx.waitUntil(handleTelegramWebhookUpdate(update, env));
            } catch (err: any) {
              console.warn('Webhook parse error:', err?.message || err);
            }
          }
          return new Response(JSON.stringify({ status: 'ok' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // 2. High-Precision Reverse Geocoding API (OSM Nominatim Proxy)
        if (url.pathname === '/api/reverse-geocode') {
          const lat = parseFloat(url.searchParams.get('lat') || '');
          const lng = parseFloat(url.searchParams.get('lng') || '');
          const lang = url.searchParams.get('lang') || 'uz';

          if (isNaN(lat) || isNaN(lng)) {
            return new Response(JSON.stringify({ error: 'Valid lat and lng parameters are required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
          const osmRes = await fetch(nominatimUrl, {
            headers: {
              'User-Agent': 'SajdaApp/1.0 (contact@sakinward.app)',
              'Accept-Language': `${lang},uz,ru,en`,
              'Accept': 'application/json',
            },
          });

          if (osmRes.ok) {
            const data = await osmRes.json() as any;
            const addr = data.address || {};

            const streetName = addr.road || addr.street || addr.pedestrian || addr.footway || addr.path || addr.cycleway || '';
            const houseNum = addr.house_number ? ` ${addr.house_number}` : '';
            const fullStreet = streetName ? `${streetName}${houseNum}`.trim() : '';
            
            const mahallaName = addr.neighbourhood || addr.suburb || addr.quarter || addr.residential || addr.village || addr.hamlet || '';
            const districtName = addr.county || addr.city_district || addr.district || addr.borough || addr.subdistrict || '';
            const cityName = addr.city || addr.town || addr.municipality || '';
            const stateName = addr.state || addr.region || addr.province || '';
            const countryName = addr.country || 'O‘zbekiston';

            let name = '';
            if (fullStreet && mahallaName && fullStreet !== mahallaName) {
              name = `${fullStreet}, ${mahallaName}`;
            } else {
              name = fullStreet || mahallaName || districtName || cityName || 'Joylashuv aniqlandi';
            }

            return new Response(JSON.stringify({
              name,
              details: {
                street: fullStreet,
                mahalla: mahallaName,
                district: districtName,
                city: cityName,
                region: stateName,
                country: countryName
              },
              coordinates: { lat, lng }
            }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          return new Response(JSON.stringify({ error: 'Failed to geocode location' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // 3. Live Nearby Islamic Mosques Endpoint (OSM Overpass Proxy)
        if (url.pathname === '/api/nearby-mosques') {
          const lat = parseFloat(url.searchParams.get('lat') || '');
          const lng = parseFloat(url.searchParams.get('lng') || '');
          const radius = Math.min(Math.max(parseInt(url.searchParams.get('radius') || '') || 20000, 3000), 50000);

          if (isNaN(lat) || isNaN(lng)) {
            return new Response(JSON.stringify({ error: 'Valid lat and lng query parameters required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const overpassQuery = `[out:json][timeout:4];(
            node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
            way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
          );out center 35;`;

          const osmRes = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`, {
            headers: {
              'User-Agent': 'SakinwardApp/1.0',
              'Accept': 'application/json',
            }
          });

          if (osmRes.ok) {
            const data = await osmRes.json() as any;
            const foundMosques: any[] = [];
            if (Array.isArray(data.elements)) {
              for (const el of data.elements) {
                const mLat = el.lat || el.center?.lat;
                const mLng = el.lon || el.center?.lon;
                if (!mLat || !mLng) continue;

                // Haversine formula
                const dLat = (mLat - lat) * Math.PI / 180;
                const dLon = (mLng - lng) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                          Math.cos(lat * Math.PI / 180) * Math.cos(mLat * Math.PI / 180) *
                          Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = Math.round(6371000 * c);

                const nameUz = el.tags?.name || el.tags?.['name:uz'] || el.tags?.['name:ru'] || el.tags?.['name:en'] || 'Masjid';
                foundMosques.push({
                  id: String(el.id),
                  name: nameUz,
                  lat: mLat,
                  lng: mLng,
                  distance,
                  address: el.tags?.['addr:street'] || el.tags?.['addr:full'] || '',
                  city: el.tags?.['addr:city'] || ''
                });
              }
            }

            foundMosques.sort((a, b) => a.distance - b.distance);
            return new Response(JSON.stringify({ mosques: foundMosques }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          return new Response(JSON.stringify({ mosques: [] }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // 4. DuckDuckGo Search endpoint
        if (url.pathname === '/api/search/duckduckgo') {
          let query = '';
          if (request.method === 'POST') {
            const body = await request.json() as any;
            query = body.query || '';
          } else {
            query = url.searchParams.get('query') || '';
          }

          if (!query) {
            return new Response(JSON.stringify({ results: [] }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
          });

          if (ddgRes.ok) {
            const html = await ddgRes.text();
            // Basic, high-efficiency parsing on worker without heavy libraries
            const results: any[] = [];
            const parts = html.split('class="result__snippet"');
            for (let i = 1; i < Math.min(parts.length, 5); i++) {
              const snippetPart = parts[i];
              const titlePart = parts[i - 1];
              
              // Extract snippet
              const snipMatch = snippetPart.match(/href="([^"]+)"[^>]*>([^<]+)/);
              const linkMatch = titlePart.match(/href="([^"]+)"/);
              const titleTextMatch = titlePart.match(/class="result__a"[^>]*>([^<]+)/);

              if (snipMatch || titleTextMatch) {
                results.push({
                  title: titleTextMatch ? titleTextMatch[1].trim() : 'Search Link',
                  snippet: snippetPart.split('</a>')[0].replace(/<[^>]+>/g, '').trim(),
                  uri: linkMatch ? linkMatch[1] : ''
                });
              }
            }
            return new Response(JSON.stringify({ results }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          return new Response(JSON.stringify({ results: [] }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // 5. AI Chat Routing & Endpoint
        if (url.pathname === '/api/sakin-ai/chat' || url.pathname === '/api/sakin-ai/chat-stream') {
          if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
              status: 405,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const { messages, userPrompt, language, userContext } = await request.json() as any;
          if (!userPrompt) {
            return new Response(JSON.stringify({ error: 'User prompt is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          // Sharia Fatva strict guardrail check
          const lowerPrompt = userPrompt.toLowerCase();
          if (
            lowerPrompt.includes('fatvo') ||
            lowerPrompt.includes('hukm') ||
            lowerPrompt.includes('taloq') ||
            lowerPrompt.includes('ajrash') ||
            lowerPrompt.includes('meros') ||
            lowerPrompt.includes('halolmi') ||
            lowerPrompt.includes('harommi') ||
            lowerPrompt.includes('shariat sudi') ||
            lowerPrompt.includes('qasam ichdim') ||
            lowerPrompt.includes('kafforat')
          ) {
            const fatvaReply = language === 'en' 
              ? "As Sakin AI, I do not possess the divine authority to issue legal rulings or binding fatwas on personal issues. Please consult authorized living scholars."
              : "Sakin AI sifatida, men shaxsiy fiqhiy va huquqiy masalalarda majburiy fatvo yoki hukm berish vakolatiga ega emasman. Iltimos, rasmiy va malakali ulamolarga murojaat qiling.";

            return new Response(JSON.stringify({
              reply: fatvaReply,
              actions: ['[fatva_redirect]'],
              sources: [],
              tool_used: 'scholar_fatwa',
              provider: 'deepseek-chat',
              grounded: false
            }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          // Format System Instruction
          const systemInstruction = `You are Sakin AI — the serene, spiritually elevated, wise, and deeply respectful Islamic companion inside Sakinward ("Toward Sakina"). Speak in ${language || 'Uzbek'}. Warm, polite, and compassionate tone.`;

          // Format history for DeepSeek (OpenAI format)
          const deepSeekMessages = (messages || []).slice(-4).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content || m.text || ''
          }));
          deepSeekMessages.push({
            role: 'system',
            content: systemInstruction
          });
          deepSeekMessages.push({
            role: 'user',
            content: userPrompt
          });

          // 1. Primary Provider: DeepSeek Chat (if configured)
          const deepseekKey = env.DEEPSEEK_API_KEY || (env as any).DEEPSEEK_API;
          if (deepseekKey) {
            try {
              const isStream = url.pathname === '/api/sakin-ai/chat-stream';
              const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${deepseekKey}`
                },
                body: JSON.stringify({
                  model: 'deepseek-chat',
                  messages: deepSeekMessages,
                  temperature: 0.7,
                  stream: isStream
                })
              });

              if (!dsRes.ok) {
                throw new Error(`DeepSeek error HTTP ${dsRes.status}`);
              }

              if (isStream) {
                const { readable, writable } = new TransformStream();
                const writer = writable.getWriter();
                const encoder = new TextEncoder();
                const reader = dsRes.body?.getReader();

                ctx.waitUntil((async () => {
                  try {
                    const decoder = new TextDecoder('utf-8');
                    let buffer = '';
                    let accumulated = '';

                    if (reader) {
                      while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                          const trimmed = line.trim();
                          if (!trimmed || trimmed === 'data: [DONE]') continue;
                          if (trimmed.startsWith('data: ')) {
                            try {
                              const parsed = JSON.parse(trimmed.slice(6));
                              const delta = parsed.choices?.[0]?.delta?.content;
                              if (delta) {
                                accumulated += delta;
                                await writer.write(encoder.encode(`data: ${JSON.stringify({ chunk: delta, done: false })}\n\n`));
                              }
                            } catch {}
                          }
                        }
                      }
                    }
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ fullText: accumulated, text: accumulated, done: true })}\n\n`));
                  } catch (err: any) {
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ error: err.message, done: true })}\n\n`));
                  } finally {
                    await writer.close();
                  }
                })());

                return new Response(readable, {
                  headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    ...corsHeaders
                  }
                });
              } else {
                const dsData = await dsRes.json() as any;
                const reply = dsData.choices?.[0]?.message?.content || '';
                return new Response(JSON.stringify({
                  reply,
                  actions: [],
                  sources: [],
                  tool_used: 'deepseek_agent',
                  provider: 'deepseek-chat',
                  grounded: false
                }), {
                  headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
              }
            } catch (dsErr: any) {
              console.warn('DeepSeek error, falling back to Gemini:', dsErr.message || dsErr);
            }
          }

          // 2. Secondary Provider Fallback: Gemini API (if configured)
          const geminiApiKey = env.GEMINI_API_KEY || (env as any).GEMINI_API;
          if (geminiApiKey) {
            try {
              // Prepare Chat Context for Gemini
              const chatHistory = (messages || []).slice(-4).map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content || m.text || '' }]
              }));

              chatHistory.push({
                role: 'user',
                parts: [{ text: userPrompt }]
              });

              const ai = new GoogleGenAI({ apiKey: geminiApiKey });

              if (url.pathname === '/api/sakin-ai/chat-stream') {
                const streamResponse = await ai.models.generateContentStream({
                  model: 'gemini-3.7-flash',
                  contents: chatHistory,
                  config: {
                    systemInstruction,
                    temperature: 0.7,
                  }
                });

                const { readable, writable } = new TransformStream();
                const writer = writable.getWriter();
                const encoder = new TextEncoder();

                ctx.waitUntil((async () => {
                  try {
                    let fullText = '';
                    for await (const chunk of streamResponse) {
                      const chunkText = chunk.text || '';
                      fullText += chunkText;
                      await writer.write(encoder.encode(`data: ${JSON.stringify({ chunk: chunkText, done: false })}\n\n`));
                    }
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ fullText, text: fullText, done: true })}\n\n`));
                  } catch (err: any) {
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ error: err.message, done: true })}\n\n`));
                  } finally {
                    await writer.close();
                  }
                })());

                return new Response(readable, {
                  headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    ...corsHeaders
                  }
                });
              } else {
                const geminiRes = await ai.models.generateContent({
                  model: 'gemini-3.7-flash',
                  contents: chatHistory,
                  config: {
                    systemInstruction,
                    temperature: 0.7,
                  }
                });

                return new Response(JSON.stringify({
                  reply: geminiRes.text || '',
                  actions: [],
                  sources: [],
                  tool_used: 'gemini_agent',
                  provider: 'gemini',
                  grounded: false
                }), {
                  headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
              }
            } catch (geminiErr: any) {
              console.warn('Gemini fallback failed:', geminiErr.message || geminiErr);
            }
          }

          // 3. Offline / Keys-free backup fallback
          const localReply = language === 'en'
            ? "May peace and serenity be upon you. I am Sakin AI, your spiritual companion. Please configure your API credentials in the Cloudflare Dashboard to enable dynamic reflections."
            : "Assalomu alaykum va rahmatullohi va barakotuh. Men sizning ma'naviy hamrohingiz Sakin AI'man. Sun'iy intellekt xizmati faol bo'lishi uchun, iltimos, Cloudflare boshqaruv panelida API kalitlarini (DEEPSEEK_API_KEY yoki GEMINI_API_KEY) sozlashingizni so'raymiz.";

          if (url.pathname === '/api/sakin-ai/chat-stream') {
            const { readable, writable } = new TransformStream();
            const writer = writable.getWriter();
            const encoder = new TextEncoder();
            ctx.waitUntil((async () => {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ chunk: localReply, done: false })}\n\n`));
              await writer.write(encoder.encode(`data: ${JSON.stringify({ fullText: localReply, text: localReply, done: true })}\n\n`));
              await writer.close();
            })());
            return new Response(readable, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                ...corsHeaders
              }
            });
          }

          return new Response(JSON.stringify({
            reply: localReply,
            actions: [],
            sources: [],
            tool_used: 'offline_fallback',
            provider: 'offline',
            grounded: false
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }


        // 6. Live Videos Catalog Endpoint
        if (url.pathname === '/api/youtube/live-catalog') {
          return new Response(JSON.stringify({ videos: [] }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Default: Serve static SPA frontend assets from Pages / Worker Dist Directory
    // SPA Fallback: If the path does not have a file extension (e.g., /landingpage), rewrite to index.html
    // so that the single page app is returned instead of a 404, allowing Google and AI bots to index any route correctly!
    const hasExtension = url.pathname.split('/').pop()?.includes('.') || false;
    if (request.method === 'GET' && !url.pathname.startsWith('/api/') && !hasExtension) {
      const newUrl = new URL(request.url);
      newUrl.pathname = '/index.html';
      return env.ASSETS.fetch(new Request(newUrl.toString(), request));
    }

    return env.ASSETS.fetch(request);
  }
};

interface TgSession {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  summary?: string;
}

async function getTgSession(env: Env, chatId: number): Promise<TgSession> {
  if (!env.SAKIN_SESSIONS) return { messages: [] };
  try {
    const raw = await env.SAKIN_SESSIONS.get(`tg_sess_${chatId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { messages: [] };
}

async function saveTgSession(env: Env, chatId: number, session: TgSession) {
  if (!env.SAKIN_SESSIONS) return;
  try {
    // Sliding Window Optimization: Keep max 6 recent turns (3 Q&A pairs)
    if (session.messages.length > 6) {
      const removed = session.messages.splice(0, session.messages.length - 6);
      const oldTopics = removed.filter(m => m.role === 'user').map(m => m.content.slice(0, 50)).join('; ');
      session.summary = session.summary 
        ? `${session.summary}; ${oldTopics}`.slice(-300) 
        : `Avvalgi mavzular: ${oldTopics}`.slice(-300);
    }
    // Store in Cloudflare KV with 2-hour TTL expiration
    await env.SAKIN_SESSIONS.put(`tg_sess_${chatId}`, JSON.stringify(session), { expirationTtl: 7200 });
  } catch (e) {}
}

async function clearTgSession(env: Env, chatId: number) {
  if (!env.SAKIN_SESSIONS) return;
  try {
    await env.SAKIN_SESSIONS.delete(`tg_sess_${chatId}`);
  } catch (e) {}
}

async function handleTelegramWebhookUpdate(update: any, env: Env) {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !update?.message) return;

  const msg = update.message;
  const chatId = msg.chat?.id;
  const text = (msg.text || '').trim();
  const userName = msg.from?.first_name || 'Dono do‘stimiz';

  if (!chatId || !text) return;

  // Send typing status
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, action: 'typing' })
    });
  } catch {}

  if (text.startsWith('/start')) {
    await clearTgSession(env, chatId);
    const welcome = `Assalomu alaykum va rahmatullohi va barakotuh, ${userName}! 🌿\n\nMen **Sakin AI** — sizning ruhiy xotirjamligingiz, Qur'oni Karim oyatlari tafakkuri va ma'naviy yo'lingizdagi hamrohingizman.\n\nUshbu bot orqali siz:\n• 📖 Qur'on oyatlari ma'nolari va tafakkurini o'rganishingiz\n• 📿 Zikrlar, duolar va tasbehlarni so'rashingiz\n• 🕌 Sakin Akademiyasidagi eng yangi ma'rifiy darslarni tavsiya sifatida olishingiz\n• 🌿 Ruhiy siqilishlar yoki xavotirlarda taskin topishingiz mumkin.\n\nMenga istalgan savol yoki holatingizni yozing. Men sizga kamolot va adab bilan, go'zal islomiy muomalada javob beraman. ✨`;
    await sendTelegramReply(botToken, chatId, welcome);
    return;
  }

  if (text.startsWith('/help')) {
    const helpText = `🌿 **Sakin AI Botidan foydalanish ko‘rsatmalari:**\n\n• Menga istalgan ruhiy yoki islomiy mavzuda savol bering (masalan: *"Menga sabr haqida oyat aytib ber"*, *"G'amgin bo'lganimda nima qilay?"*).\n• Siz so'ragan masalalarni mukammal va sahih manbalarga tayanib, bevosita Qur'oni Karim va Sahih Hadislar bilan yoritib beraman.\n\n⚠️ *Eslatma: Bu bot shaxsiy fatvolar berish, nikoh/taloq, meros kabi qat'iy diniy-huquqiy hukmlar chiqarish vakolatiga ega emas. Bunday masalalarda rasmiy O'zbekiston Musulmonlari Idorasi Fatvo Markaziga (+998 78 150-33-44) murojaat qilishni maslahat beraman.*`;
    await sendTelegramReply(botToken, chatId, helpText);
    return;
  }

  // Retrieve active conversation session from Cloudflare KV
  const session = await getTgSession(env, chatId);

  const deepseekKey = env.DEEPSEEK_API_KEY || (env as any).DEEPSEEK_API;
  const isRussian = /[а-яА-Я]/.test(text) && !/[o‘o'g‘g'‘ʻ’]/.test(text);
  const language = isRussian ? 'Russian' : 'Uzbek';

  const systemInstruction = `You are Sakin AI — the serene, spiritually elevated, wise, and deeply respectful Islamic companion inside Sakinward ("Toward Sakina"). Speak in ${language}. Warm, polite, and compassionate tone. Remember the user's name (${userName}) and refer to previous context naturally. Keep answers concise and clear for Telegram.`;

  let replyText = '';

  // Build optimized message prompt stack with rolling memory summary
  const messageStack: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemInstruction }
  ];

  if (session.summary) {
    messageStack.push({ role: 'system', content: `[Suhbat konteksti xulosasi: ${session.summary}]` });
  }

  for (const m of session.messages) {
    messageStack.push({ role: m.role, content: m.content });
  }

  messageStack.push({ role: 'user', content: `[Telegram Foydalanuvchisi: ${userName}]\n\n${text}` });

  if (deepseekKey) {
    try {
      const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messageStack,
          temperature: 0.7
        })
      });

      if (dsRes.ok) {
        const dsData = await dsRes.json() as any;
        replyText = dsData.choices?.[0]?.message?.content || '';
      }
    } catch (err) {
      console.warn('Telegram DeepSeek fetch failed:', err);
    }
  }

  if (!replyText && env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      const geminiContents = [
        ...session.messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: `[Telegram Foydalanuvchisi: ${userName}]\n\n${text}` }] }
      ];
      const geminiRes = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: geminiContents,
        config: { systemInstruction, temperature: 0.7 }
      });
      replyText = geminiRes.text || '';
    } catch (err) {
      console.warn('Telegram Gemini fetch failed:', err);
    }
  }

  if (!replyText) {
    replyText = language === 'Russian'
      ? `Мир вам, ${userName}! Я Sakin AI. Напишите ваш вопрос ещё раз.`
      : `Assalomu alaykum va rahmatullohi va barakotuh, ${userName}! Men Sakin AI. Savolingizni qayta yuborib ko'ring.`;
  }

  // Update conversation memory and store in Cloudflare KV
  session.messages.push({ role: 'user', content: text });
  session.messages.push({ role: 'assistant', content: replyText });
  await saveTgSession(env, chatId, session);

  await sendTelegramReply(botToken, chatId, replyText);
}

async function sendTelegramReply(botToken: string, chatId: number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
  } catch (e) {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text
        })
      });
    } catch {}
  }
}
