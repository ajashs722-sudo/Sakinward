/**
 * Video & Media Caching Service with CacheStorage & IndexedDB
 * Ensures zero-lag playback, offline persistence, and instant streaming.
 */

const CACHE_NAME = 'sakinward_media_cache_v2';
const DB_NAME = 'sakinward_db_media_v2';
const DB_VERSION = 1;
const STORE_NAME = 'video_blobs';

let dbInstance: IDBDatabase | null = null;
const memoryBlobUrlMap = new Map<string, string>();

async function getDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return null;
  if (dbInstance) return dbInstance;

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (e: any) => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Retrieves a cached media URL from memory, CacheStorage, or IndexedDB.
 */
export async function getCachedVideoUrl(videoUrl: string): Promise<string | null> {
  if (!videoUrl) return null;
  if (memoryBlobUrlMap.has(videoUrl)) {
    return memoryBlobUrlMap.get(videoUrl)!;
  }

  // 1. Try Cache API (fastest native browser cache for media streams)
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(videoUrl);
      if (match) {
        const blob = await match.blob();
        const objectUrl = URL.createObjectURL(blob);
        memoryBlobUrlMap.set(videoUrl, objectUrl);
        return objectUrl;
      }
    } catch {
      // fallback to IndexedDB
    }
  }

  // 2. Try IndexedDB
  try {
    const db = await getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(videoUrl);

        req.onsuccess = () => {
          const blob = req.result;
          if (blob instanceof Blob) {
            const objectUrl = URL.createObjectURL(blob);
            memoryBlobUrlMap.set(videoUrl, objectUrl);
            resolve(objectUrl);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Downloads media in the background and saves to Cache API and IndexedDB for permanent zero-delay playback.
 */
export async function cacheVideoInBackground(videoUrl: string): Promise<string> {
  if (!videoUrl) return '';
  const cached = await getCachedVideoUrl(videoUrl);
  if (cached) return cached;

  try {
    const response = await fetch(videoUrl, { mode: 'cors' });
    if (!response.ok) return videoUrl;

    // Clone response for Cache Storage
    const responseClone = response.clone();
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(videoUrl, responseClone).catch(() => {});
      }).catch(() => {});
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    memoryBlobUrlMap.set(videoUrl, objectUrl);

    // Save into IndexedDB as well
    const db = await getDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(blob, videoUrl);
    }

    return objectUrl;
  } catch (err) {
    return videoUrl;
  }
}

/**
 * Clears all cached video and media blobs from Cache API and IndexedDB
 */
export async function clearMediaCache(): Promise<boolean> {
  try {
    memoryBlobUrlMap.clear();

    if (typeof window !== 'undefined' && 'caches' in window) {
      await caches.delete(CACHE_NAME);
    }

    const db = await getDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
    }

    return true;
  } catch (e) {
    console.error('Failed to clear media cache:', e);
    return false;
  }
}
