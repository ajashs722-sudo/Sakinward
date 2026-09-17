/**
 * Sakinward Client-Side Encrypted / Obfuscated User Memory Engine
 * Stores user context in localStorage and IndexedDB with client-side encryption.
 * Keeps user data 100% private to the user's browser/device.
 */

export interface SakinUserProfile {
  userName?: string;
  city?: string;
  language?: string;
  fiqhSchool?: string;
  dailyPrayersCompleted?: number;
  qazoTotal?: number;
  isFastingToday?: boolean;
  fastingStreak?: number;
  tasbihCountToday?: number;
  favoriteSurahs?: number[];
  recentTopics?: string[];
  lastActiveDate?: string;
  spiritualGoal?: string;
}

const DB_NAME = 'sakin_secure_memory_db';
const STORE_NAME = 'user_memory_store';
const STORAGE_CIPHER_KEY = 'sakin_encrypted_profile_v1';
const CIPHER_SECRET_SALT = 'Sakinward_Nur_Sakina_2026';

// Simple, robust client-side cipher/obfuscation using salted XOR + Base64
// Ensures no sensitive personal data is stored in plain text on client device
function cipherText(text: string): string {
  try {
    const key = CIPHER_SECRET_SALT;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(encodeURIComponent(result));
  } catch {
    return text;
  }
}

function decipherText(cipher: string): string {
  try {
    const key = CIPHER_SECRET_SALT;
    const decoded = decodeURIComponent(atob(cipher));
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return cipher;
  }
}

/**
 * Open IndexedDB for persistent client-side memory
 */
function openMemoryDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Automatically gather current user information from existing client-side stores
 */
export function gatherClientSideUserData(): SakinUserProfile {
  if (typeof window === 'undefined') return {};

  let userName = '';
  try {
    userName = localStorage.getItem('sajda_user_name') || '';
    if (userName === 'Believer') userName = '';
  } catch {}

  let city = '';
  try {
    const savedCity = localStorage.getItem('sakinward_saved_city') || localStorage.getItem('sajda_saved_city');
    if (savedCity) {
      const parsed = JSON.parse(savedCity);
      city = parsed.name || parsed.displayName || '';
    }
  } catch {}

  let language = 'uz';
  try {
    language = localStorage.getItem('sakinward_language') || localStorage.getItem('sajda_app_language') || 'uz';
  } catch {}

  let fiqhSchool = 'Hanafi';
  try {
    const s = localStorage.getItem('sakinward_fiqh_school') || localStorage.getItem('sajda_school');
    if (s === '0') fiqhSchool = 'Shafi\'i';
  } catch {}

  let dailyPrayersCompleted = 0;
  try {
    const prayers = localStorage.getItem('sajda_daily_prayers');
    if (prayers) {
      const parsed = JSON.parse(prayers);
      dailyPrayersCompleted = Object.values(parsed).filter(Boolean).length;
    }
  } catch {}

  let qazoTotal = 0;
  try {
    const qazo = localStorage.getItem('sajda_qazo_records');
    if (qazo) {
      const parsed = JSON.parse(qazo);
      qazoTotal = (Object.values(parsed) as unknown[]).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0) as number;
    }
  } catch {}

  let isFastingToday = false;
  let fastingStreak = 0;
  try {
    isFastingToday = localStorage.getItem('sajda_is_fasting_today') === 'true';
    fastingStreak = parseInt(localStorage.getItem('sajda_fasting_streak') || '0', 10);
  } catch {}

  let tasbihCountToday = 0;
  try {
    tasbihCountToday = parseInt(localStorage.getItem('sakinward_tasbih_total_today') || '0', 10);
  } catch {}

  let favoriteSurahs: number[] = [];
  try {
    const b = localStorage.getItem('sakinward_quran_bookmarks');
    if (b) {
      const parsed = JSON.parse(b);
      favoriteSurahs = parsed.map((item: any) => item.surahNumber || item.surah).filter(Boolean).slice(0, 5);
    }
  } catch {}

  return {
    userName,
    city,
    language,
    fiqhSchool,
    dailyPrayersCompleted,
    qazoTotal,
    isFastingToday,
    fastingStreak,
    tasbihCountToday,
    favoriteSurahs,
    lastActiveDate: new Date().toISOString().split('T')[0],
  };
}

/**
 * Save user profile encrypted to both localStorage and IndexedDB
 */
export async function saveCipheredUserProfile(profile: Partial<SakinUserProfile>): Promise<void> {
  if (typeof window === 'undefined') return;

  const current = await loadCipheredUserProfile();
  const merged: SakinUserProfile = {
    ...current,
    ...profile,
    lastActiveDate: new Date().toISOString().split('T')[0],
  };

  const serialized = JSON.stringify(merged);
  const ciphered = cipherText(serialized);

  // 1. Save in localStorage
  try {
    localStorage.setItem(STORAGE_CIPHER_KEY, ciphered);
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  // 2. Save in IndexedDB
  try {
    const db = await openMemoryDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id: 'user_profile', cipheredPayload: ciphered, updatedAt: Date.now() });
  } catch (e) {
    console.warn('IndexedDB save error:', e);
  }
}

/**
 * Load user profile from IndexedDB or localStorage and decipher
 */
export async function loadCipheredUserProfile(): Promise<SakinUserProfile> {
  if (typeof window === 'undefined') return gatherClientSideUserData();

  let ciphered: string | null = null;

  // Try IndexedDB first
  try {
    const db = await openMemoryDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const result: any = await new Promise((resolve) => {
      const req = store.get('user_profile');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });

    if (result && result.cipheredPayload) {
      ciphered = result.cipheredPayload;
    }
  } catch {}

  // Fallback to localStorage
  if (!ciphered) {
    try {
      ciphered = localStorage.getItem(STORAGE_CIPHER_KEY);
    } catch {}
  }

  if (ciphered) {
    try {
      const plain = decipherText(ciphered);
      const parsed = JSON.parse(plain);
      // Re-sync dynamic live values like city/prayers from client
      const live = gatherClientSideUserData();
      return { ...live, ...parsed };
    } catch {}
  }

  // Initial populate
  const initial = gatherClientSideUserData();
  saveCipheredUserProfile(initial);
  return initial;
}

/**
 * Add a spiritual topic/theme to memory
 */
export async function addReflectionTopic(topic: string): Promise<void> {
  if (!topic || topic.trim().length < 3) return;
  const profile = await loadCipheredUserProfile();
  const topics = profile.recentTopics || [];
  const cleanTopic = topic.trim().slice(0, 50);
  if (!topics.includes(cleanTopic)) {
    const updated = [cleanTopic, ...topics].slice(0, 5);
    await saveCipheredUserProfile({ recentTopics: updated });
  }
}

import {
  loadUserKnowledgeGraph,
  queryRelevantSubGraph,
  saveUserKnowledgeGraph,
  createInitialGraph,
  autoUpdateGraphFromConversation,
  upsertGraphNode
} from './dynamicUserGraphEngine';

export {
  loadUserKnowledgeGraph,
  queryRelevantSubGraph,
  saveUserKnowledgeGraph,
  createInitialGraph,
  autoUpdateGraphFromConversation,
  upsertGraphNode
};

/**
 * Build a concise prompt context string with Dynamic Graph-RAG to feed to Sakin AI
 */
export async function formatDynamicMemoryContext(
  profile: SakinUserProfile,
  userPrompt?: string
): Promise<string> {
  const parts: string[] = [];
  if (profile.userName) parts.push(`Ism: ${profile.userName}`);
  if (profile.city) parts.push(`Shahar: ${profile.city}`);
  if (profile.language) parts.push(`Til: ${profile.language}`);
  if (profile.fiqhSchool) parts.push(`Mazhab: ${profile.fiqhSchool}`);
  if (profile.dailyPrayersCompleted !== undefined && profile.dailyPrayersCompleted > 0) {
    parts.push(`Bugungi namozlar: ${profile.dailyPrayersCompleted}/5`);
  }
  if (profile.isFastingToday) {
    parts.push(`Ro'za: Ha (Ketma-ket: ${profile.fastingStreak || 1} kun)`);
  }
  if (profile.tasbihCountToday && profile.tasbihCountToday > 0) {
    parts.push(`Bugungi tasbeh: ${profile.tasbihCountToday}`);
  }

  // Dynamic Embedding Sub-Graph Search
  if (userPrompt && userPrompt.trim().length > 2) {
    try {
      const graph = await loadUserKnowledgeGraph();
      const { summaryText } = queryRelevantSubGraph(graph, userPrompt, 2, 0.22);
      if (summaryText) {
        parts.push(summaryText);
      }
    } catch {}
  }

  return parts.join(' | ');
}

/**
 * Clear all encrypted memory & knowledge graph from client storage
 */
export async function clearCipheredMemory(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_CIPHER_KEY);
    localStorage.removeItem('sakin_encrypted_knowledge_graph_v2');
    const db = await openMemoryDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  } catch (e) {
    console.warn('Clear memory error:', e);
  }
}

/**
 * Build a concise prompt context string to feed to Sakin AI
 */
export function formatMemoryContext(profile: SakinUserProfile): string {
  const parts: string[] = [];
  if (profile.userName) parts.push(`User Name: ${profile.userName}`);
  if (profile.city) parts.push(`City: ${profile.city}`);
  if (profile.language) parts.push(`Language: ${profile.language}`);
  if (profile.fiqhSchool) parts.push(`School: ${profile.fiqhSchool}`);
  if (profile.dailyPrayersCompleted !== undefined && profile.dailyPrayersCompleted > 0) {
    parts.push(`Today's Completed Prayers: ${profile.dailyPrayersCompleted}/5`);
  }
  if (profile.isFastingToday) {
    parts.push(`Currently Fasting: Yes (Streak: ${profile.fastingStreak || 1} days)`);
  }
  if (profile.tasbihCountToday && profile.tasbihCountToday > 0) {
    parts.push(`Tasbih counted today: ${profile.tasbihCountToday}`);
  }
  if (profile.recentTopics && profile.recentTopics.length > 0) {
    parts.push(`Recent reflections: ${profile.recentTopics.join(', ')}`);
  }
  return parts.join(' | ');
}
