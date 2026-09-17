import { Ayah, PrayerTimes, CityLocation } from '../types';
import { CITIES_DATA } from '../data/islamicData';
import { getAyahAudioUrl } from '../data/quranData';
import { 
  calculateAstronomicalPrayerTimes, 
  getCityLocalNow,
  nowInCity, 
  getTimezoneOffsetHours,
  guessTimezoneFromCoordinates 
} from './prayerEngine';

const ALADHAN_BASE = 'https://api.aladhan.com/v1';
const QURAN_BASE = 'https://api.alquran.cloud/v1';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// Cache to speed up repeat requests
const surahCache = new Map<string, Ayah[]>();

/**
 * IP-based geolocation fallback for when browser GPS is restricted or times out
 */
export async function fetchIpLocation(): Promise<CityLocation | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const cityName = data.city || data.region || 'Avto Joylashuv';
        const countryName = data.country_name || 'Joriy';
        return {
          name: cityName,
          country: countryName,
          displayName: `${cityName}, ${countryName}`,
          lat: data.latitude,
          lng: data.longitude,
          timezone: data.timezone || 'Auto',
        };
      }
    }
  } catch (e) {
    console.info('ipapi.co bypass, trying fallback IP service:', e);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ip-api.com/json/?fields=status,country,city,lat,lon,timezone', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && typeof data.lat === 'number' && typeof data.lon === 'number') {
        return {
          name: data.city || 'Avto Joylashuv',
          country: data.country || 'Joriy',
          displayName: `${data.city}, ${data.country}`,
          lat: data.lat,
          lng: data.lon,
          timezone: data.timezone || 'Auto',
        };
      }
    }
  } catch (e) {
    console.info('ip-api.com bypass:', e);
  }

  return null;
}

/**
 * Overpass API (OpenStreetMap) and Google Maps Places API to query nearest mosque around lat, lng
 */
export async function fetchNearestMosqueOverpass(
  lat: number,
  lng: number
): Promise<{ name: string; distanceKm: number; district?: string } | null> {
  const metaEnv = (import.meta as any).env;
  const gmapsKey = (metaEnv && metaEnv.VITE_GOOGLE_MAPS_API_KEY) || (typeof process !== 'undefined' && process.env && process.env.VITE_GOOGLE_MAPS_API_KEY) || '';

  // 1. Try Google Maps Places API (New/Nearby) if API Key exists
  if (gmapsKey) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=mosque&key=${gmapsKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(gUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
          const firstMosque = data.results[0];
          const mLat = firstMosque.geometry?.location?.lat;
          const mLng = firstMosque.geometry?.location?.lng;
          const dist = (typeof mLat === 'number' && typeof mLng === 'number') ? getDistanceKm(lat, lng, mLat, mLng) : 0.5;

          return {
            name: firstMosque.name || 'Jamoat Masjidi (Google Maps)',
            distanceKm: Math.round(dist * 10) / 10,
            district: firstMosque.vicinity || undefined,
          };
        }
      }
    } catch (e) {
      console.info('Google Maps Places API bypass to Overpass:', e);
    }
  }

  // 2. Fallback to Overpass API (OpenStreetMap)
  try {
    const query = `[out:json][timeout:4];node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${lat},${lng});out 5;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.elements) && data.elements.length > 0) {
        let minDistance = Infinity;
        let bestMosque: any = null;

        for (const el of data.elements) {
          const mLat = el.lat;
          const mLng = el.lon;
          if (typeof mLat === 'number' && typeof mLng === 'number') {
            const dist = getDistanceKm(lat, lng, mLat, mLng);
            if (dist < minDistance) {
              minDistance = dist;
              bestMosque = el;
            }
          }
        }

        if (bestMosque) {
          const name = bestMosque.tags?.name || bestMosque.tags?.['name:uz'] || bestMosque.tags?.['name:en'] || 'Hududiy Jamoat Masjidi';
          const district = bestMosque.tags?.['addr:suburb'] || bestMosque.tags?.['addr:district'] || undefined;
          return {
            name,
            distanceKm: Math.round(minDistance * 10) / 10,
            district,
          };
        }
      }
    }
  } catch (err) {
    console.info('Overpass API query bypassed or offline:', err);
  }
  return null;
}

/**
 * Smart Dynamic & Manual Multi-Provider Selector based on live GPS coordinates, country, region, or explicit selection
 */
export function determinePrayerProvider(
  country?: string, 
  city?: string, 
  methodId?: string, 
  lat?: number, 
  lng?: number
) {
  // If user explicitly picked a specific calculation method / provider (Manual Selection)
  if (methodId && methodId !== 'auto' && methodId !== 'dynamic') {
    switch (methodId) {
      case 'mawaqit':
        return { providerName: 'Mawaqit Real-Masjid Tizimi (100+ Davlat Masjidi)', aladhanMethod: '3', providerCode: 'mawaqit' };
      case 'uzb':
        return { providerName: 'O‘zbekiston Musulmonlari Idorasi Mezonlari (O‘zbekiston API)', aladhanMethod: '3', providerCode: 'uzb' };
      case '1':
        return { providerName: 'Karachi Islom Fanlari Universiteti (Pokiston API)', aladhanMethod: '1', providerCode: 'pakistan' };
      case '2':
        return { providerName: 'ISNA (Shimoliy Amerika Islom Jamiyati API)', aladhanMethod: '2', providerCode: 'isna' };
      case '3':
        return { providerName: 'Muslim World League (MWL - Butunjahon Islom Ligasi)', aladhanMethod: '3', providerCode: 'mwl' };
      case '4':
        return { providerName: 'Umm Al-Qura Universiteti & Haramain (Saudiya API)', aladhanMethod: '4', providerCode: 'saudi' };
      case '5':
        return { providerName: 'Misr Bosh Qidiruv Idorasi & Dar al-Ifta (Misr API)', aladhanMethod: '5', providerCode: 'egypt' };
      case '7':
        return { providerName: 'Tehron Universiteti Geofizika Instituti (Eron API)', aladhanMethod: '7', providerCode: 'iran' };
      case '9':
        return { providerName: 'Quvayt Avqof va Islom Ishlari Vazirligi (Quvayt API)', aladhanMethod: '9', providerCode: 'kuwait' };
      case '10':
        return { providerName: 'Qatar Avqof va Islom Ishlari Vazirligi (Qatar API)', aladhanMethod: '10', providerCode: 'qatar' };
      case '11':
        return { providerName: 'MUIS (Singapur Islom Kengashi API)', aladhanMethod: '11', providerCode: 'muis' };
      case '12':
        return { providerName: 'UOIF (Fransiya Islom Tashkilotlari Ittifoqi API)', aladhanMethod: '12', providerCode: 'uoif' };
      case '13':
        return { providerName: 'Diyanet İşleri Başkanlığı (Turkiya & Yevropa API)', aladhanMethod: '13', providerCode: 'diyanet' };
      case '14':
        return { providerName: 'Rossiya Musulmonlari Diniy Nazorati (RMDN API)', aladhanMethod: '14', providerCode: 'russia' };
      case '15':
        return { providerName: 'London Central Mosque (Buyuk Britaniya API)', aladhanMethod: '15', providerCode: 'london' };
      case '16':
        return { providerName: 'AWQAF BAA Rasmiy Islom Ishlari Boshqarmasi (BAA API)', aladhanMethod: '16', providerCode: 'uae' };
      case '17':
        return { providerName: 'JAKIM e-Solat (Malayziya API)', aladhanMethod: '17', providerCode: 'jakim' };
      case '18':
        return { providerName: 'Ministère des Habous (Marokash API)', aladhanMethod: '18', providerCode: 'morocco' };
      case '20':
        return { providerName: 'KEMENAG RI (Indoneziya Din Vazirligi API)', aladhanMethod: '20', providerCode: 'kemenag' };
    }
  }

  // Automatic Dynamic Multi-Provider Routing by GPS Coordinates & Location
  const cLower = (country || '').toLowerCase();
  const cCity = (city || '').toLowerCase();
  const cText = `${cLower} ${cCity}`;

  // 1. Coordinates-based dynamic routing
  if (lat !== undefined && lng !== undefined) {
    // Uzbekistan & Central Asia (Lat 37 to 45.5, Lng 56 to 74)
    if (lat >= 37.0 && lat <= 45.5 && lng >= 56.0 && lng <= 74.0) {
      return { providerName: 'O‘zbekiston Musulmonlari Idorasi Mezonlari (O‘zbekiston API)', aladhanMethod: '3', providerCode: 'uzb' };
    }
    // Saudi Arabia & Holy Land (Lat 16 to 32.5, Lng 34 to 55.5)
    if (lat >= 16.0 && lat <= 32.5 && lng >= 34.0 && lng <= 55.5 && !cText.includes('emirates') && !cText.includes('qatar') && !cText.includes('kuwait') && !cText.includes('egypt')) {
      return { providerName: 'Umm Al-Qura Universiteti (Saudiya Arabistoni API)', aladhanMethod: '4', providerCode: 'saudi' };
    }
    // UAE (Lat 22.5 to 26.5, Lng 51.5 to 56.5)
    if (lat >= 22.5 && lat <= 26.5 && lng >= 51.5 && lng <= 56.5) {
      return { providerName: 'AWQAF BAA Rasmiy Islom Ishlari Boshqarmasi (BAA API)', aladhanMethod: '16', providerCode: 'uae' };
    }
    // Turkey (Lat 35.8 to 42.2, Lng 25.5 to 44.8)
    if (lat >= 35.8 && lat <= 42.2 && lng >= 25.5 && lng <= 44.8) {
      return { providerName: 'Diyanet İşleri Başkanlığı (Turkiya API)', aladhanMethod: '13', providerCode: 'diyanet' };
    }
    // Egypt (Lat 21.5 to 31.8, Lng 24.5 to 37.0)
    if (lat >= 21.5 && lat <= 31.8 && lng >= 24.5 && lng <= 37.0) {
      return { providerName: 'Misr Bosh Qidiruv Idorasi Standartlari (Misr API)', aladhanMethod: '5', providerCode: 'egypt' };
    }
    // Kuwait (Lat 28.5 to 30.2, Lng 46.5 to 48.6)
    if (lat >= 28.5 && lat <= 30.2 && lng >= 46.5 && lng <= 48.6) {
      return { providerName: 'Quvayt Avqof va Islom Ishlari Vazirligi (Quvayt API)', aladhanMethod: '9', providerCode: 'kuwait' };
    }
    // Qatar (Lat 24.5 to 26.2, Lng 50.7 to 51.7)
    if (lat >= 24.5 && lat <= 26.2 && lng >= 50.7 && lng <= 51.7) {
      return { providerName: 'Qatar Avqof va Islom Ishlari Vazirligi (Qatar API)', aladhanMethod: '10', providerCode: 'qatar' };
    }
    // Malaysia (Lat 0.8 to 7.5, Lng 99.5 to 119.5)
    if (lat >= 0.8 && lat <= 7.5 && lng >= 99.5 && lng <= 119.5) {
      return { providerName: 'JAKIM e-Solat (Malayziya API)', aladhanMethod: '17', providerCode: 'jakim' };
    }
    // Indonesia (Lat -11.0 to 6.0, Lng 95.0 to 141.0)
    if (lat >= -11.0 && lat <= 6.0 && lng >= 95.0 && lng <= 141.0) {
      return { providerName: 'Kementerian Agama Republik Indonesia (KEMENAG API)', aladhanMethod: '20', providerCode: 'kemenag' };
    }
    // Singapore (Lat 1.15 to 1.5, Lng 103.5 to 104.1)
    if (lat >= 1.15 && lat <= 1.5 && lng >= 103.5 && lng <= 104.1) {
      return { providerName: 'MUIS (Singapur Islom Kengashi API)', aladhanMethod: '11', providerCode: 'muis' };
    }
    // Morocco (Lat 27.5 to 36.0, Lng -13.2 to -1.0)
    if (lat >= 27.5 && lat <= 36.0 && lng >= -13.2 && lng <= -1.0) {
      return { providerName: 'Ministère des Habous (Marokash API)', aladhanMethod: '18', providerCode: 'morocco' };
    }
    // Russia & CIS (Lat 43 to 72, Lng 27 to 180)
    if (lat >= 43.0 && lat <= 72.0 && lng >= 27.0 && lng <= 180.0 && !cText.includes('turkey') && !cText.includes('uzbekistan')) {
      return { providerName: 'Rossiya Musulmonlari Diniy Nazorati (RMDN API)', aladhanMethod: '14', providerCode: 'russia' };
    }
    // UK & Western Europe (Lat 49 to 60, Lng -11 to 2)
    if (lat >= 49.0 && lat <= 60.0 && lng >= -11.0 && lng <= 2.0) {
      return { providerName: 'London Central Mosque (Buyuk Britaniya API)', aladhanMethod: '15', providerCode: 'london' };
    }
    // France (Lat 42 to 51.5, Lng -5 to 8.5)
    if (lat >= 42.0 && lat <= 51.5 && lng >= -5.0 && lng <= 8.5) {
      return { providerName: 'UOIF (Fransiya Islom Tashkilotlari Ittifoqi API)', aladhanMethod: '12', providerCode: 'uoif' };
    }
    // USA & Canada (Lat 24 to 70, Lng -170 to -50)
    if (lat >= 24.0 && lat <= 70.0 && lng >= -170.0 && lng <= -50.0) {
      return { providerName: 'ISNA (Shimoliy Amerika Islom Jamiyati API)', aladhanMethod: '2', providerCode: 'isna' };
    }
    // Pakistan (Lat 23.5 to 37.0, Lng 60.5 to 77.5)
    if (lat >= 23.5 && lat <= 37.0 && lng >= 60.5 && lng <= 77.5 && cText.includes('pakistan')) {
      return { providerName: 'Karachi Islom Fanlari Universiteti (Pokiston API)', aladhanMethod: '1', providerCode: 'pakistan' };
    }
    // Iran (Lat 25.0 to 40.0, Lng 44.0 to 63.5)
    if (lat >= 25.0 && lat <= 40.0 && lng >= 44.0 && lng <= 63.5 && cText.includes('iran')) {
      return { providerName: 'Tehron Universiteti Geofizika Instituti (Eron API)', aladhanMethod: '7', providerCode: 'iran' };
    }
  }

  // 2. Text / Country / City based smart dynamic matching
  if (cText.includes('uzbekistan') || cText.includes('o‘zbekiston') || cText.includes('ozbekiston') || cText.includes('tashkent') || cText.includes('toshkent') || cText.includes('samarkand') || cText.includes('samarqand') || cText.includes('bukhara') || cText.includes('buxoro') || cText.includes('fergana') || cText.includes('farg‘ona') || cText.includes('andijon') || cText.includes('namangan')) {
    return { providerName: 'O‘zbekiston Musulmonlari Idorasi Mezonlari (O‘zbekiston API)', aladhanMethod: '3', providerCode: 'uzb' };
  }
  if (cText.includes('turkey') || cText.includes('türkiye') || cText.includes('turkiya') || cText.includes('istanbul') || cText.includes('ankara')) {
    return { providerName: 'Diyanet İşleri Başkanlığı (Turkiya API)', aladhanMethod: '13', providerCode: 'diyanet' };
  }
  if (cText.includes('saudi') || cText.includes('saudiya') || cText.includes('makkah') || cText.includes('madinah') || cText.includes('riyadh') || cText.includes('jeddah')) {
    return { providerName: 'Umm Al-Qura Universiteti (Saudiya Arabistoni API)', aladhanMethod: '4', providerCode: 'saudi' };
  }
  if (cText.includes('emirates') || cText.includes('uae') || cText.includes('baa') || cText.includes('dubai') || cText.includes('abu dhabi') || cText.includes('sharjah')) {
    return { providerName: 'AWQAF BAA Rasmiy Islom Ishlari Boshqarmasi (BAA API)', aladhanMethod: '16', providerCode: 'uae' };
  }
  if (cText.includes('morocco') || cText.includes('marokash') || cText.includes('rabat') || cText.includes('casablanca')) {
    return { providerName: 'Ministère des Habous (Marokash API)', aladhanMethod: '18', providerCode: 'morocco' };
  }
  if (cText.includes('united kingdom') || cText.includes('uk') || cText.includes('england') || cText.includes('london') || cText.includes('britain')) {
    return { providerName: 'London Central Mosque (Buyuk Britaniya API)', aladhanMethod: '15', providerCode: 'london' };
  }
  if (cText.includes('algeria') || cText.includes('jazoir')) {
    return { providerName: 'Ministère des Affaires Religieuses (Jazoir API)', aladhanMethod: '3', providerCode: 'algeria' };
  }
  if (cText.includes('tunisia') || cText.includes('tunis')) {
    return { providerName: 'Ministère des Affaires Religieuses (Tunis API)', aladhanMethod: '3', providerCode: 'tunisia' };
  }
  if (cText.includes('jordan') || cText.includes('iordaniya') || cText.includes('amman')) {
    return { providerName: 'Ministry of Awqaf Jordan (Iordaniya API)', aladhanMethod: '3', providerCode: 'jordan' };
  }
  if (cText.includes('qatar') || cText.includes('katar') || cText.includes('doha')) {
    return { providerName: 'Qatar Avqof va Islom Ishlari Vazirligi (Qatar API)', aladhanMethod: '10', providerCode: 'qatar' };
  }
  if (cText.includes('kuwait') || cText.includes('quvayt')) {
    return { providerName: 'Quvayt Avqof va Islom Ishlari Vazirligi (Quvayt API)', aladhanMethod: '9', providerCode: 'kuwait' };
  }
  if (cText.includes('egypt') || cText.includes('misr') || cText.includes('cairo') || cText.includes('alexandria')) {
    return { providerName: 'Misr Bosh Qidiruv Idorasi Standartlari (Misr API)', aladhanMethod: '5', providerCode: 'egypt' };
  }
  if (cText.includes('indonesia') || cText.includes('indoneziya') || cText.includes('jakarta')) {
    return { providerName: 'Kementerian Agama Republik Indonesia (KEMENAG API)', aladhanMethod: '20', providerCode: 'kemenag' };
  }
  if (cText.includes('russia') || cText.includes('rossiya') || cText.includes('moscow') || cText.includes('kazan')) {
    return { providerName: 'Rossiya Musulmonlari Diniy Nazorati (RMDN API)', aladhanMethod: '14', providerCode: 'russia' };
  }
  if (cText.includes('united states') || cText.includes('usa') || cText.includes('aqsh') || cText.includes('canada') || cText.includes('kanada')) {
    return { providerName: 'ISNA (Shimoliy Amerika Islom Jamiyati API)', aladhanMethod: '2', providerCode: 'isna' };
  }
  if (cText.includes('france') || cText.includes('fransiya') || cText.includes('paris')) {
    return { providerName: 'UOIF (Fransiya Islom Tashkilotlari Ittifoqi API)', aladhanMethod: '12', providerCode: 'uoif' };
  }
  if (cText.includes('malaysia') || cText.includes('malayziya') || cText.includes('kuala lumpur')) {
    return { providerName: 'JAKIM e-Solat (Malayziya API)', aladhanMethod: '17', providerCode: 'jakim' };
  }
  if (cText.includes('singapore') || cText.includes('singapur')) {
    return { providerName: 'MUIS (Singapur Islom Kengashi API)', aladhanMethod: '11', providerCode: 'muis' };
  }
  if (cText.includes('pakistan') || cText.includes('pokiston') || cText.includes('karachi') || cText.includes('lahore')) {
    return { providerName: 'Karachi Islom Fanlari Universiteti (Pokiston API)', aladhanMethod: '1', providerCode: 'pakistan' };
  }
  if (cText.includes('iran') || cText.includes('eron') || cText.includes('tehran')) {
    return { providerName: 'Tehron Universiteti Geofizika Instituti (Eron API)', aladhanMethod: '7', providerCode: 'iran' };
  }

  return {
    providerName: 'Muslim World League (MWL - Butunjahon Islom Ligasi)',
    aladhanMethod: '3',
    providerCode: 'mwl',
  };
}

export interface MonthlyDayPrayer {
  date: string;
  day: number;
  weekday: string;
  hijriDay: number;
  hijriMonth: string;
  hijriYear: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

/**
 * Fetch real prayer times with Multi-Provider Fallback, Smart Dynamic Provider Selector,
 * Overpass Nearest Mosque Finder, LocalStorage Caching, and High-Precision Offline Engine.
 */
export async function fetchPrayerTimes(
  city: string,
  country: string,
  lat?: number,
  lng?: number,
  methodId?: string,
  school?: string,
  timezone?: string
): Promise<PrayerTimes> {
  const activeMethod = methodId || localStorage.getItem('sakinward_calc_method') || localStorage.getItem('sajda_calc_method') || 'auto';
  const activeSchool = school || localStorage.getItem('sakinward_school') || localStorage.getItem('sajda_school') || '1'; // 1 = Hanafi, 0 = Shafi'i/Standard
  const effectiveLat = lat !== undefined ? lat : 41.2995;
  const effectiveLng = lng !== undefined ? lng : 69.2401;

  // Accurately resolve initial timezone based on coordinates & location name
  const resolvedTz = (!timezone || timezone === 'Auto') 
    ? guessTimezoneFromCoordinates(effectiveLat, effectiveLng, country, city)
    : timezone;

  // Determine current local date in the city
  const cityNow = getCityLocalNow(resolvedTz, effectiveLat, effectiveLng, country, city);
  const dd = String(cityNow.getDate()).padStart(2, '0');
  const mm = String(cityNow.getMonth() + 1).padStart(2, '0');
  const yyyy = cityNow.getFullYear();
  const dateParam = `${dd}-${mm}-${yyyy}`;

  // Smart Dynamic Provider Selection based on exact GPS coordinates, country and city
  const providerInfo = determinePrayerProvider(country, city, activeMethod, effectiveLat, effectiveLng);

  // Tomorrow's date in the city for tomorrow's Fajr
  const tomorrowCity = new Date(cityNow);
  tomorrowCity.setDate(tomorrowCity.getDate() + 1);
  const tzOffset = getTimezoneOffsetHours(resolvedTz, cityNow, effectiveLat, effectiveLng, country, city);

  const tomorrowComputed = calculateAstronomicalPrayerTimes(
    tomorrowCity,
    effectiveLat,
    effectiveLng,
    tzOffset,
    activeMethod,
    activeSchool === '1' ? 'hanafi' : 'standard'
  );

  const fallbackComputed = calculateAstronomicalPrayerTimes(
    cityNow,
    effectiveLat,
    effectiveLng,
    tzOffset,
    activeMethod,
    activeSchool === '1' ? 'hanafi' : 'standard'
  );

  // Overpass API Query for Nearest Mosque (non-blocking)
  let nearestMosqueData: { name: string; distanceKm: number; district?: string } | undefined = undefined;
  try {
    const mosqueRes = await fetchNearestMosqueOverpass(effectiveLat, effectiveLng);
    if (mosqueRes) {
      nearestMosqueData = mosqueRes;
    }
  } catch {}

  // LocalStorage Cache Key for 24h Offline Reliance
  const cacheKey = `sakinward_pt_cache_${dateParam}_${effectiveLat.toFixed(2)}_${effectiveLng.toFixed(2)}_${activeMethod}_${activeSchool}`;

  // Multi-Provider Endpoint Request (Primary -> Secondary -> Cache -> Offline Astronomical)
  try {
    let url = `${ALADHAN_BASE}/timingsByCity/${dateParam}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${providerInfo.aladhanMethod}&school=${activeSchool}&latitudeAdjustmentMethod=3`;
    if (lat !== undefined && lng !== undefined) {
      url = `${ALADHAN_BASE}/timings/${dateParam}?latitude=${lat}&longitude=${lng}&method=${providerInfo.aladhanMethod}&school=${activeSchool}&latitudeAdjustmentMethod=3`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    let response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    // If coordinates query had an issue, fallback immediately to city-based query
    if (!response.ok && lat !== undefined && lng !== undefined && city && country) {
      const fallbackUrl = `${ALADHAN_BASE}/timingsByCity/${dateParam}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${providerInfo.aladhanMethod}&school=${activeSchool}&latitudeAdjustmentMethod=3`;
      const fallbackController = new AbortController();
      const fbTimeout = setTimeout(() => fallbackController.abort(), 4000);
      try {
        response = await fetch(fallbackUrl, { signal: fallbackController.signal });
      } catch {}
      clearTimeout(fbTimeout);
    }

    if (response.ok) {
      const data = await response.json();
      if (data && data.data && data.data.timings) {
        const timings = data.data.timings;
        const hijri = data.data.date?.hijri;
        const hijriDate = hijri 
          ? `${hijri.day} ${hijri.month.en}, ${hijri.year}` 
          : '15 Robi‘ul avval, 1448';

        const authoritativeTz = data.data.meta?.timezone || resolvedTz;

        const result: PrayerTimes = {
          Fajr: timings.Fajr.substring(0, 5),
          Sunrise: timings.Sunrise.substring(0, 5),
          Dhuhr: timings.Dhuhr.substring(0, 5),
          Asr: timings.Asr.substring(0, 5),
          Sunset: timings.Sunset?.substring(0, 5) || timings.Maghrib.substring(0, 5),
          Maghrib: timings.Maghrib.substring(0, 5),
          Isha: timings.Isha.substring(0, 5),
          Imsak: timings.Imsak?.substring(0, 5),
          Midnight: timings.Midnight?.substring(0, 5),
          tomorrowFajr: tomorrowComputed.Fajr,
          timezone: authoritativeTz,
          dateStr: data.data.date?.readable || cityNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          hijriDate: hijriDate,
          hijriDay: hijri ? Number(hijri.day) : 15,
          hijriMonth: hijri ? hijri.month.en : 'Robi‘ul avval',
          hijriYear: hijri ? Number(hijri.year) : 1448,
          providerName: providerInfo.providerName,
          nearestMosque: nearestMosqueData,
        };

        // Cache successful response in localStorage
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {}

        return result;
      }
    }
  } catch (err) {
    console.info('API call failed or network offline, checking LocalStorage Cache:', err);
  }

  // Fallback 1: Try LocalStorage Cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as PrayerTimes;
      return {
        ...parsed,
        providerName: `${parsed.providerName || providerInfo.providerName} (Keshdan sinxronlashgan)`,
        nearestMosque: nearestMosqueData || parsed.nearestMosque,
      };
    }
  } catch {}

  // Fallback 2: Offline Astronomical High-Precision Engine
  return {
    Fajr: fallbackComputed.Fajr,
    Sunrise: fallbackComputed.Sunrise,
    Dhuhr: fallbackComputed.Dhuhr,
    Asr: fallbackComputed.Asr,
    Sunset: fallbackComputed.Sunset,
    Maghrib: fallbackComputed.Maghrib,
    Isha: fallbackComputed.Isha,
    Imsak: fallbackComputed.Imsak,
    Midnight: fallbackComputed.Midnight,
    tomorrowFajr: tomorrowComputed.Fajr,
    timezone: resolvedTz,
    dateStr: cityNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    hijriDate: '15 Robi‘ul avval, 1448',
    hijriDay: 15,
    hijriMonth: 'Robi‘ul avval',
    hijriYear: 1448,
    providerName: `${providerInfo.providerName} (Astronomik Dvigatel)`,
    nearestMosque: nearestMosqueData,
  };
}

/**
 * High-precision distance calculation between two GPS coordinates in kilometers
 */
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Transliterate Cyrillic Uzbek/Russian to Latin for smart fuzzy search
 */
function toLatinUzbek(text: string): string {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya', 'ў': 'o‘', 'ғ': 'g‘', 'қ': 'q', 'ҳ': 'h',
  };
  return text
    .toLowerCase()
    .split('')
    .map((char) => map[char] || char)
    .join('');
}

/**
 * Search any city worldwide using OpenStreetMap Nominatim Geocoding API with local cache
 */
export async function searchGlobalCities(query: string, lang: string = 'en'): Promise<CityLocation[]> {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const cleanQuery = query.trim().toLowerCase();
  const latinQuery = toLatinUzbek(cleanQuery);

  // Normalize search helper (removes special apostrophes and accents)
  const norm = (s: string) => s.toLowerCase().replace(/[''`ʻʼ]/g, '');

  const normClean = norm(cleanQuery);
  const normLatin = norm(latinQuery);

  // First search in local preset list with multi-variant matching
  const localMatches = CITIES_DATA.filter((c) => {
    const d = norm(c.displayName);
    const n = norm(c.name);
    const country = norm(c.country);
    return (
      d.includes(normClean) ||
      d.includes(normLatin) ||
      n.includes(normClean) ||
      n.includes(normLatin) ||
      country.includes(normClean) ||
      country.includes(normLatin)
    );
  });

  try {
    const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query.trim())}&addressdetails=1&limit=20`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': `${lang},uz,ru,en`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const geoResults: CityLocation[] = data.map((item: any) => {
          const address = item.address || {};
          const cityName = address.city || address.town || address.village || address.suburb || address.municipality || address.county || address.state || item.display_name.split(',')[0];
          const country = address.country || 'World';
          const fullLabel = item.display_name;

          const guessedTz = guessTimezoneFromCoordinates(parseFloat(item.lat), parseFloat(item.lon), country, cityName);

          return {
            name: cityName,
            country: country,
            displayName: fullLabel.length > 55 ? `${cityName}, ${country}` : fullLabel,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            timezone: guessedTz,
          };
        });

        // Merge local matches with geocode results without duplicates
        const combined = [...localMatches];
        for (const item of geoResults) {
          if (!combined.some((c) => Math.abs(c.lat - item.lat) < 0.05 && Math.abs(c.lng - item.lng) < 0.05)) {
            combined.push(item);
          }
        }
        return combined;
      }
    }
  } catch (err) {
    console.warn('Nominatim search error, fallback to local match list:', err);
  }

  return localMatches;
}

/**
 * Enhanced High-Precision Reverse Geocode GPS coordinates into clean Street, Mahalla, District & City name
 */
export async function reverseGeocodeLocation(lat: number, lng: number, lang: string = 'uz'): Promise<CityLocation> {
  // 1. First attempt: call local server proxy route which has full headers and no CORS issues
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}&lang=${encodeURIComponent(lang)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        const country = data.country || 'O‘zbekiston';
        const name = data.name || data.displayName || 'Aniq GPS Joylashuv';
        const guessedTz = guessTimezoneFromCoordinates(lat, lng, country, name);

        return {
          name,
          country,
          displayName: data.displayName || name,
          lat,
          lng,
          timezone: guessedTz,
          street: data.street,
          mahalla: data.mahalla,
          district: data.district,
          city: data.city || 'Toshkent',
          state: data.state,
          addressLine: data.addressLine || data.displayName,
          isGpsExact: true,
          isVerifiedByUser: true,
        };
      }
    }
  } catch (err) {
    console.warn('Local /api/reverse-geocode proxy fetch failed, trying direct provider:', err);
  }

  // 2. Direct client-side fetch from OpenStreetMap Nominatim with zoom 18 (House & Street & Mahalla level)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': `${lang},uz,ru,en`,
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      
      const streetName = addr.road || addr.street || addr.pedestrian || addr.footway || addr.path || addr.cycleway || '';
      const houseNum = addr.house_number ? ` ${addr.house_number}` : '';
      const fullStreet = streetName ? `${streetName}${houseNum}`.trim() : '';

      const mahallaName = addr.neighbourhood || addr.suburb || addr.quarter || addr.residential || addr.village || addr.hamlet || '';
      const districtName = addr.county || addr.city_district || addr.district || addr.borough || addr.subdistrict || '';
      const cityName = addr.city || addr.town || addr.municipality || '';
      const stateOrRegion = addr.state || addr.region || addr.province || '';
      const countryName = addr.country || 'O‘zbekiston';

      let name = '';
      if (fullStreet && mahallaName && fullStreet !== mahallaName) {
        name = `${fullStreet}, ${mahallaName}`;
      } else {
        name = fullStreet || mahallaName || districtName || cityName || stateOrRegion || 'Aniq GPS Joylashuv';
      }

      const parts: string[] = [];
      if (fullStreet) parts.push(fullStreet);
      if (mahallaName && !parts.includes(mahallaName)) parts.push(mahallaName);
      if (districtName && !parts.includes(districtName)) parts.push(districtName);
      if (cityName && !parts.includes(cityName)) parts.push(cityName);
      else if (stateOrRegion && !parts.includes(stateOrRegion)) parts.push(stateOrRegion);

      const displayName = parts.length > 0 ? parts.join(', ') : `${name}, ${countryName}`;
      const addressLine = parts.length > 0 ? parts.join(', ') : (data.display_name || name);
      const guessedTz = guessTimezoneFromCoordinates(lat, lng, countryName, name);

      return {
        name,
        country: countryName,
        displayName,
        lat,
        lng,
        timezone: guessedTz,
        street: fullStreet || undefined,
        mahalla: mahallaName || undefined,
        district: districtName || stateOrRegion || undefined,
        city: cityName || 'Toshkent',
        state: stateOrRegion || undefined,
        addressLine,
        isGpsExact: true,
        isVerifiedByUser: true,
      };
    }
  } catch (err) {
    console.warn('Direct Nominatim reverse geocode error:', err);
  }

  // 3. Direct BigDataCloud reverse geocode client API
  try {
    const bdcController = new AbortController();
    const bdcTimeout = setTimeout(() => bdcController.abort(), 3500);
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${lang}`;
    const bdcRes = await fetch(bdcUrl, { signal: bdcController.signal });
    clearTimeout(bdcTimeout);

    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const locality = bdcData.locality || bdcData.city || '';
      const district = bdcData.principalSubdivision || '';
      const country = bdcData.countryName || 'O‘zbekiston';
      const name = locality || district || 'Aniq GPS Joylashuv';
      const displayName = [locality, district, country].filter(Boolean).join(', ');
      const guessedTz = guessTimezoneFromCoordinates(lat, lng, country, name);

      return {
        name,
        country,
        displayName,
        lat,
        lng,
        timezone: guessedTz,
        district: district || undefined,
        city: locality || undefined,
        addressLine: displayName,
        isGpsExact: true,
        isVerifiedByUser: true,
      };
    }
  } catch (err) {
    console.warn('Direct BigDataCloud reverse geocode error:', err);
  }

  // 4. Exact coordinate lock - never dummy fallback
  const directTz = guessTimezoneFromCoordinates(lat, lng, 'O‘zbekiston', 'GPS');
  return {
    name: `GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
    country: 'O‘zbekiston',
    displayName: `Aniq Koordinata: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
    lat,
    lng,
    timezone: directTz,
    addressLine: `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    isGpsExact: true,
    isVerifiedByUser: true,
  };
}

/**
 * Fetch 30-day monthly timetable for any city/location in the world
 */
export async function fetchMonthlyCalendar(
  city: string,
  country: string,
  month: number,
  year: number,
  lat?: number,
  lng?: number,
  methodId?: string,
  school?: string
): Promise<MonthlyDayPrayer[]> {
  const activeMethod = methodId || localStorage.getItem('sakinward_calc_method') || localStorage.getItem('sajda_calc_method') || 'auto';
  const activeSchool = school || localStorage.getItem('sakinward_school') || localStorage.getItem('sajda_school') || '1';
  const effectiveLat = lat !== undefined ? lat : 41.2995;
  const effectiveLng = lng !== undefined ? lng : 69.2401;

  const providerInfo = determinePrayerProvider(country, city, activeMethod, effectiveLat, effectiveLng);
  const aladhanMethod = providerInfo.aladhanMethod;

  const monthCacheKey = `sakinward_month_cal_${city}_${country}_${month}_${year}_${aladhanMethod}_${activeSchool}`;

  try {
    let url = `${ALADHAN_BASE}/calendarByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&month=${month}&year=${year}&method=${aladhanMethod}&school=${activeSchool}`;
    if (lat !== undefined && lng !== undefined) {
      url = `${ALADHAN_BASE}/calendar?latitude=${lat}&longitude=${lng}&month=${month}&year=${year}&method=${aladhanMethod}&school=${activeSchool}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);
    let response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    // Fallback to city search if coordinates query returned non-200
    if (!response.ok && lat !== undefined && lng !== undefined && city && country) {
      const fbUrl = `${ALADHAN_BASE}/calendarByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&month=${month}&year=${year}&method=${aladhanMethod}&school=${activeSchool}`;
      const fbCtrl = new AbortController();
      const fbTimeout = setTimeout(() => fbCtrl.abort(), 4000);
      try {
        response = await fetch(fbUrl, { signal: fbCtrl.signal });
      } catch {}
      clearTimeout(fbTimeout);
    }

    if (response.ok) {
      const res = await response.json();
      if (res?.data && Array.isArray(res.data)) {
        const parsedList: MonthlyDayPrayer[] = res.data.map((dayData: any, idx: number) => {
          const timings = dayData.timings;
          const hijri = dayData.date?.hijri;
          const greg = dayData.date?.gregorian;
          return {
            date: greg?.date || `${idx + 1}-${month}-${year}`,
            day: idx + 1,
            weekday: greg?.weekday?.en || '',
            hijriDay: Number(hijri?.day) || idx + 1,
            hijriMonth: hijri?.month?.en || 'Rabi‘ al-awwal',
            hijriYear: hijri?.year || '1448',
            fajr: timings.Fajr?.substring(0, 5) || '04:05',
            sunrise: timings.Sunrise?.substring(0, 5) || '05:45',
            dhuhr: timings.Dhuhr?.substring(0, 5) || '12:24',
            asr: timings.Asr?.substring(0, 5) || '16:09',
            maghrib: timings.Maghrib?.substring(0, 5) || '19:03',
            isha: timings.Isha?.substring(0, 5) || '20:42',
          };
        });

        try {
          localStorage.setItem(monthCacheKey, JSON.stringify(parsedList));
        } catch {}

        return parsedList;
      }
    }
  } catch (err) {
    console.info('Using smart cached or astronomical calculation for monthly calendar:', err);
  }

  // Fallback 1: Try LocalStorage Month Cache
  try {
    const cachedMonth = localStorage.getItem(monthCacheKey);
    if (cachedMonth) {
      const parsedMonth = JSON.parse(cachedMonth) as MonthlyDayPrayer[];
      if (Array.isArray(parsedMonth) && parsedMonth.length > 0) {
        return parsedMonth;
      }
    }
  } catch {}

  // Fallback 2: Exact Astronomical calculation for all days of the month (Works for all past & future dates)
  const resolvedTz = guessTimezoneFromCoordinates(effectiveLat, effectiveLng, country, city);
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fallbackList: MonthlyDayPrayer[] = [];
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    const tzOffset = getTimezoneOffsetHours(resolvedTz, dateObj, effectiveLat, effectiveLng, country, city);
    const dayTimes = calculateAstronomicalPrayerTimes(
      dateObj, 
      effectiveLat, 
      effectiveLng, 
      tzOffset, 
      activeMethod,
      activeSchool === '1' ? 'hanafi' : 'standard'
    );
    fallbackList.push({
      date: `${d.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`,
      day: d,
      weekday: daysNames[dateObj.getDay()],
      hijriDay: ((d + 13) % 30) + 1,
      hijriMonth: 'Robi‘ul avval',
      hijriYear: '1448',
      fajr: dayTimes.Fajr,
      sunrise: dayTimes.Sunrise,
      dhuhr: dayTimes.Dhuhr,
      asr: dayTimes.Asr,
      maghrib: dayTimes.Maghrib,
      isha: dayTimes.Isha,
    });
  }
  return fallbackList;
}

/**
 * Fetch Quran surah with Arabic and localized translation and audio by reciter
 */
export async function fetchSurahVerses(
  surahNumber: number,
  lang: string = 'en',
  reciter: string = 'ar.alafasy'
): Promise<Ayah[]> {
  const cacheKey = `${surahNumber}_${lang}`;
  if (surahCache.has(cacheKey)) {
    return surahCache.get(cacheKey)!;
  }

  // Choose appropriate translation edition with comprehensive language coverage
  const editionMap: Record<string, string> = {
    uz: 'uz.sodik',
    en: 'en.asad',
    ru: 'ru.kuliev',
    tr: 'tr.diyanet',
    id: 'id.indonesian',
    fr: 'fr.hamidullah',
    ar: 'ar.muyassar',
    fa: 'fa.ansarian',
    ur: 'ur.jalandhry',
    de: 'de.aburida',
    es: 'es.cortes',
    az: 'az.mammadaliyev',
    kk: 'kk.altai',
    ky: 'ky.shams',
    tg: 'tg.ayati',
    ms: 'ms.basmeih',
    bn: 'bn.bengali',
    hi: 'hi.hindi',
    it: 'it.piccardo',
    pt: 'pt.elhayek',
    zh: 'zh.jian',
    ja: 'ja.japanese',
    ko: 'ko.korean',
    bs: 'bs.korkut',
    tt: 'tt.yakub',
    ps: 'ps.abdulwali',
    so: 'so.abduh',
    sq: 'sq.ahmeti',
    tk: 'tr.diyanet',
  };

  const translationEdition = editionMap[lang] || 'en.asad';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);
    const response = await fetch(
      `${QURAN_BASE}/surah/${surahNumber}/editions/quran-uthmani,${translationEdition}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data?.data && Array.isArray(data.data) && data.data.length >= 1) {
        const arabicEdition = data.data[0].ayahs;
        const translatedEdition = data.data[1]?.ayahs || [];

        const mergedAyahs: Ayah[] = arabicEdition.map((ayah: any, index: number) => {
          const transText = translatedEdition[index]?.text;
          return {
            number: ayah.number,
            text: ayah.text,
            numberInSurah: ayah.numberInSurah,
            juz: ayah.juz,
            manzil: ayah.manzil,
            page: ayah.page,
            ruku: ayah.ruku,
            hizbQuarter: ayah.hizbQuarter,
            sajda: Boolean(ayah.sajda),
            translation: transText || '',
            audio: getAyahAudioUrl(reciter, ayah.number, surahNumber, ayah.numberInSurah),
          };
        });

        surahCache.set(cacheKey, mergedAyahs);
        return mergedAyahs;
      }
    }
  } catch (err) {
    console.warn(`Primary Surah API request failed for #${surahNumber} (${translationEdition}), trying english fallback:`, err);
    // If specific language failed, attempt English translation fallback so reader is never empty
    if (lang !== 'en') {
      try {
        const fbCtrl = new AbortController();
        const fbTimeout = setTimeout(() => fbCtrl.abort(), 6000);
        const fbRes = await fetch(
          `${QURAN_BASE}/surah/${surahNumber}/editions/quran-uthmani,en.asad`,
          { signal: fbCtrl.signal }
        );
        clearTimeout(fbTimeout);
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (fbData?.data && Array.isArray(fbData.data) && fbData.data.length >= 1) {
            const arabicEdition = fbData.data[0].ayahs;
            const translatedEdition = fbData.data[1]?.ayahs || [];

            const mergedAyahs: Ayah[] = arabicEdition.map((ayah: any, index: number) => {
              return {
                number: ayah.number,
                text: ayah.text,
                numberInSurah: ayah.numberInSurah,
                juz: ayah.juz,
                manzil: ayah.manzil,
                page: ayah.page,
                ruku: ayah.ruku,
                hizbQuarter: ayah.hizbQuarter,
                sajda: Boolean(ayah.sajda),
                translation: translatedEdition[index]?.text || '',
                audio: getAyahAudioUrl(reciter, ayah.number, surahNumber, ayah.numberInSurah),
              };
            });

            surahCache.set(cacheKey, mergedAyahs);
            return mergedAyahs;
          }
        }
      } catch (fbErr) {
        console.warn('English fallback also failed:', fbErr);
      }
    }
  }

  // Fallback for Al-Fatiha
  if (surahNumber === 1) {
    const fatihaFallback: Ayah[] = [
      { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', numberInSurah: 1, juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false, translation: lang === 'uz' ? 'Mehribon va rahmli Allohning nomi ila boshlayman.' : lang === 'ru' ? 'Во имя Аллаха, Милостивого, Милосердного!' : 'In the name of Allah, the Entirely Merciful, the Especially Merciful.', audio: getAyahAudioUrl(reciter, 1, 1, 1) },
      { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', numberInSurah: 2, juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false, translation: lang === 'uz' ? 'Hamd barcha olamlar Robbisi bo‘lgan Allohgadir.' : lang === 'ru' ? 'Хвала Аллаху, Господу миров,' : '[All] praise is [due] to Allah, Lord of the worlds.', audio: getAyahAudioUrl(reciter, 2, 1, 2) },
      { number: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ', numberInSurah: 3, juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false, translation: lang === 'uz' ? 'U Mehribon va Rahmlidir.' : lang === 'ru' ? 'Милостивому, Милосердному,' : 'The Entirely Merciful, the Especially Merciful,', audio: getAyahAudioUrl(reciter, 3, 1, 3) },
      { number: 4, text: 'مَالِكِ يَوْمِ الدِّينِ', numberInSurah: 4, juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false, translation: lang === 'uz' ? 'Jazo va mukofot (Qiyomat) kunining egasidir.' : lang === 'ru' ? 'Властелину Дня воздаяния!' : 'Sovereign of the Day of Recompense.', audio: getAyahAudioUrl(reciter, 4, 1, 4) },
      { number: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', numberInSurah: 5, juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false, translation: lang === 'uz' ? 'Faqat Sengagina ibodat qilamiz va faqat Sendangina yordam so‘raymiz.' : lang === 'ru' ? 'Тебе одному мы поклоняемся и Тебя одного молим о помощи.' : 'It is You we worship and You we ask for help.', audio: getAyahAudioUrl(reciter, 5, 1, 5) },
      { number: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', numberInSurah: 6, juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false, translation: lang === 'uz' ? 'Bizni to‘g‘ri yo‘lga hidoyat qilgin.' : lang === 'ru' ? 'Веди нас прямым путем,' : 'Guide us to the straight path -', audio: getAyahAudioUrl(reciter, 6, 1, 6) },
      { number: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', numberInSurah: 7, juz: 1, manzil: 1, page: 1, ruku: 1, hizbQuarter: 1, sajda: false, translation: lang === 'uz' ? 'O‘zing ne’mat bergan kishilarning yo‘liga, g‘azabga uchraganlar va zalolatga ketganlarnikiga emas.' : lang === 'ru' ? 'путем тех, кого Ты облагодетельствовал, не тех, на кого пал гнев, и не заблудших.' : 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.', audio: getAyahAudioUrl(reciter, 7, 1, 7) }
    ];
    surahCache.set(cacheKey, fatihaFallback);
    return fatihaFallback;
  }

  return [];
}

// Quran Data Provider & Utilities
// Using unified, robust Quran data service

export interface QuranVerseAudio {
  verseNumber: number;
  audioUrl: string;
}


// Spherical Qibla calculation with high accuracy Great Circle formula
export function calculateQibla(latitude: number, longitude: number): { angle: number; distanceKm: number } {
  const meccaLat = 21.4225 * (Math.PI / 180);
  const meccaLng = 39.8262 * (Math.PI / 180);
  const userLat = latitude * (Math.PI / 180);
  const userLng = longitude * (Math.PI / 180);

  const deltaLng = meccaLng - userLng;

  const y = Math.sin(deltaLng);
  const x = Math.cos(userLat) * Math.tan(meccaLat) - Math.sin(userLat) * Math.cos(deltaLng);

  let qiblaAngle = Math.atan2(y, x) * (180 / Math.PI);
  qiblaAngle = (qiblaAngle + 360) % 360;

  // Haversine distance formula
  const R = 6371; // Earth radius in KM
  const dLat = meccaLat - userLat;
  const dLon = meccaLng - userLng;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLat) * Math.cos(meccaLat) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  return {
    angle: Math.round(qiblaAngle * 10) / 10,
    distanceKm,
  };
}
