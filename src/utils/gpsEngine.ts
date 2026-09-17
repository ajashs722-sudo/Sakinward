import { CityLocation } from '../types';
import { reverseGeocodeLocation } from '../services/apiService';

export interface GPSProgressUpdate {
  status: 'requesting_permission' | 'searching_satellites' | 'refining_accuracy' | 'success' | 'error';
  accuracyMeters?: number;
  message: string;
  lat?: number;
  lng?: number;
}

export interface GPSResult {
  city: CityLocation;
  accuracyMeters: number;
  lat: number;
  lng: number;
}

/**
 * Industrial-grade High-Precision GPS Engine.
 * Uses continuous multi-sample satellite lock (`watchPosition`) to eliminate 100km+ cell-tower/IP inaccuracies.
 */
export function acquireHighPrecisionGPS(
  language: string,
  onProgress?: (update: GPSProgressUpdate) => void,
  maxWaitMs: number = 10000
): Promise<GPSResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
      const msg = language === 'uz'
        ? 'Qurilmangizda geolokatsiya (GPS) qo‘llab-quvvatlanmaydi.'
        : language === 'ru'
        ? 'Геолокация не поддерживается вашим устройством.'
        : 'Geolocation is not supported by your device.';
      onProgress?.({ status: 'error', message: msg });
      return reject(new Error(msg));
    }

    onProgress?.({
      status: 'requesting_permission',
      message: language === 'uz'
        ? 'GPS ruxsati tekshirilmoqda...'
        : language === 'ru'
        ? 'Запрос разрешения GPS...'
        : 'Requesting GPS permission...',
    });

    let watchId: number | null = null;
    let bestPosition: GeolocationPosition | null = null;
    let timerId: any = null;
    let isSettled = false;

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    };

    const finishWithPosition = async (pos: GeolocationPosition) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = Math.round(pos.coords.accuracy || 0);

      onProgress?.({
        status: 'success',
        accuracyMeters: accuracy,
        lat,
        lng,
        message: language === 'uz'
          ? `Aniq GPS koordinatasi qulflangan: ±${accuracy} metr`
          : `GPS locked: ±${accuracy}m`,
      });

      try {
        const detectedCity = await reverseGeocodeLocation(lat, lng, language);
        resolve({
          city: detectedCity,
          accuracyMeters: accuracy,
          lat,
          lng,
        });
      } catch (err) {
        // Fallback with exact float coordinates (no approximation)
        const directLocation: CityLocation = {
          name: `GPS Joylashuv (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
          country: 'Joriy',
          displayName: `GPS: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
          lat,
          lng,
          timezone: 'Auto',
        };
        resolve({
          city: directLocation,
          accuracyMeters: accuracy,
          lat,
          lng,
        });
      }
    };

    // Watch incoming satellite frames continuously
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const currentAccuracy = position.coords.accuracy || 99999;

        // Keep the best accuracy sample
        if (!bestPosition || currentAccuracy < (bestPosition.coords.accuracy || 99999)) {
          bestPosition = position;
        }

        onProgress?.({
          status: 'refining_accuracy',
          accuracyMeters: Math.round(currentAccuracy),
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          message: language === 'uz'
            ? `🛰️ Sun’iy yo‘ldosh signali qabul qilindi (Aniqlik: ±${Math.round(currentAccuracy)}m)...`
            : language === 'ru'
            ? `🛰️ Сигнал спутника (Точность: ±${Math.round(currentAccuracy)}м)...`
            : `🛰️ Satellite fix (Accuracy: ±${Math.round(currentAccuracy)}m)...`,
        });

        // If satellite lock is high quality (within 35 meters), accept immediately
        if (currentAccuracy <= 35) {
          finishWithPosition(position);
        }
      },
      (error) => {
        console.warn('GPS hardware watcher error:', error);
        if (isSettled) return;

        // If error occurs and we haven't acquired any position yet
        if (!bestPosition) {
          isSettled = true;
          cleanup();

          let userMsg = '';
          if (error.code === 1) { // PERMISSION_DENIED
            userMsg = language === 'uz'
              ? 'GPS ruxsati rad etilgan. Brauzeringiz (Chrome) parametrlarida ushbu sayt uchun Joylashuv (Location) ga "Ruxsat berish" (Allow) tugmasini bosing.'
              : language === 'ru'
              ? 'Доступ к GPS отклонен. Разрешите доступ к местоположению в настройках браузера.'
              : 'GPS permission denied. Please allow location access in your browser settings.';
          } else if (error.code === 2) { // POSITION_UNAVAILABLE
            userMsg = language === 'uz'
              ? 'GPS sun’iy yo‘ldosh signali topilmadi. Telefoningizda Geolokatsiyani (GPS) yoqing va ochiq joyda qayta urinib ko‘ring.'
              : language === 'ru'
              ? 'GPS сигнал недоступен. Включите геолокацию на телефоне.'
              : 'GPS signal unavailable. Please ensure device location is enabled.';
          } else if (error.code === 3) { // TIMEOUT
            userMsg = language === 'uz'
              ? 'GPS sun’iy yo‘ldoshidan javob kutish vaqti tugadi. Qurilmada GPS yoqilganligini tekshirib qayta bosing.'
              : language === 'ru'
              ? 'Время ожидания GPS истекло. Проверьте включен ли GPS.'
              : 'GPS satellite timeout. Please check your GPS connection.';
          } else {
            userMsg = language === 'uz'
              ? 'GPS orqali joylashuvni aniqlab bo‘lmadi.'
              : 'Unable to acquire GPS location.';
          }

          onProgress?.({ status: 'error', message: userMsg });
          reject(new Error(userMsg));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: maxWaitMs + 4000,
        maximumAge: 0,
      }
    );

    // Timeout countdown to select the best sample if under 35m was not reached
    timerId = setTimeout(() => {
      if (isSettled) return;

      if (bestPosition) {
        const acc = bestPosition.coords.accuracy;
        // If accuracy is worse than 30,000m (30km), warn the user that satellite lock was weak
        if (acc > 30000) {
          const warningMsg = language === 'uz'
            ? `⚠️ GPS signali juda zaif (±${Math.round(acc / 1000)} km). Ochiq havoga chiqing yoki shahringizni qidiruvdan tanlang.`
            : `⚠️ Weak GPS signal (±${Math.round(acc / 1000)} km). Search your city or try outdoors.`;
          onProgress?.({ status: 'error', message: warningMsg });
          cleanup();
          reject(new Error(warningMsg));
          return;
        }

        finishWithPosition(bestPosition);
      } else {
        cleanup();
        const timeoutMsg = language === 'uz'
          ? 'Sun’iy yo‘ldosh signali qabul qilinmadi. Qurilmangizda Geolokatsiya (GPS) yoqilganligini tekshiring.'
          : 'Could not acquire GPS satellite signal. Check device GPS.';
        onProgress?.({ status: 'error', message: timeoutMsg });
        reject(new Error(timeoutMsg));
      }
    }, maxWaitMs);
  });
}
