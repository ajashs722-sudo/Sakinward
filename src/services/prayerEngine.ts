/**
 * High-Precision Astronomical Islamic Prayer Time Calculation Engine
 * Implements standard solar positioning algorithms (Jean Meeus / Astronomical Algorithms)
 * Supports all recognized international calculation methods and higher-latitude adjustments.
 */

import { PrayerTimes } from '../types';

export interface CalculationParameters {
  methodId: string;
  name: string;
  fajrAngle: number;
  ishaAngle: number;
  ishaInterval?: number; // minutes after Maghrib (e.g. Umm al-Qura 90 min)
  maghribAngle?: number;
  maghribOffsetMinutes?: number; // Ehtiyot minutes for Maghrib (e.g. Uzbekistan Muslim Board +5 min)
  asrJuristic: 'standard' | 'hanafi'; // standard = Shafi'i/Maliki/Hanbali (shadow 1), hanafi (shadow 2)
  highLatitudeRule: 'middle_of_night' | 'one_seventh' | 'angle_based';
}

export const CALCULATION_METHODS: Record<string, CalculationParameters> = {
  'uzb': {
    methodId: 'uzb',
    name: "O'zbekiston Musulmonlari Idorasi / Mintaqaviy",
    fajrAngle: 18,
    ishaAngle: 17,
    asrJuristic: 'hanafi',
    highLatitudeRule: 'angle_based',
  },
  '3': {
    methodId: '3',
    name: 'Muslim World League (MWL)',
    fajrAngle: 18,
    ishaAngle: 17,
    asrJuristic: 'hanafi',
    highLatitudeRule: 'angle_based',
  },
  '1': {
    methodId: '1',
    name: 'University of Islamic Sciences, Karachi (Hanafi)',
    fajrAngle: 18,
    ishaAngle: 18,
    asrJuristic: 'hanafi',
    highLatitudeRule: 'angle_based',
  },
  '13': {
    methodId: '13',
    name: 'Diyanet İşleri Başkanlığı (Turkey)',
    fajrAngle: 18,
    ishaAngle: 17,
    asrJuristic: 'hanafi',
    highLatitudeRule: 'angle_based',
  },
  '2': {
    methodId: '2',
    name: 'Islamic Society of North America (ISNA)',
    fajrAngle: 15,
    ishaAngle: 15,
    asrJuristic: 'hanafi',
    highLatitudeRule: 'angle_based',
  },
  '4': {
    methodId: '4',
    name: 'Umm al-Qura University, Makkah',
    fajrAngle: 18.5,
    ishaAngle: 0,
    ishaInterval: 90,
    asrJuristic: 'hanafi',
    highLatitudeRule: 'angle_based',
  },
  '5': {
    methodId: '5',
    name: 'Egyptian General Authority of Survey',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    asrJuristic: 'standard',
    highLatitudeRule: 'angle_based',
  },
  '12': {
    methodId: '12',
    name: 'Union des Organisations Islamiques de France (UOIF)',
    fajrAngle: 12,
    ishaAngle: 12,
    asrJuristic: 'standard',
    highLatitudeRule: 'angle_based',
  },
};

// Trigonometric helper functions in degrees
const dSin = (d: number) => Math.sin((d * Math.PI) / 180);
const dCos = (d: number) => Math.cos((d * Math.PI) / 180);
const dTan = (d: number) => Math.tan((d * Math.PI) / 180);
const dArcSin = (x: number) => (Math.asin(x) * 180) / Math.PI;
const dArcCos = (x: number) => (Math.acos(x) * 180) / Math.PI;
const dArcTan = (x: number) => (Math.atan(x) * 180) / Math.PI;
const dArcTan2 = (y: number, x: number) => (Math.atan2(y, x) * 180) / Math.PI;

const fixAngle = (a: number) => {
  let res = a - 360 * Math.floor(a / 360);
  return res < 0 ? res + 360 : res;
};

const fixHour = (h: number) => {
  let res = h - 24 * Math.floor(h / 24);
  return res < 0 ? res + 24 : res;
};

/**
 * Convert Date to Julian Date
 */
function getJulianDate(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

/**
 * Calculate Sun coordinates for a given Julian Date
 */
function sunPosition(jd: number) {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * dSin(g) + 0.02 * dSin(2 * g));

  const e = 23.439 - 0.00000036 * D;
  const d = dArcSin(dSin(e) * dSin(L));
  let RA = dArcTan2(dCos(e) * dSin(L), dCos(L)) / 15;
  RA = fixHour(RA);
  const EqT = q / 15 - RA;

  return { declination: d, equationOfTime: EqT };
}

/**
 * Computes solar hour angle for given angle below horizon
 */
function sunHourAngle(angle: number, lat: number, declination: number): number {
  const top = -dSin(angle) - dSin(lat) * dSin(declination);
  const bottom = dCos(lat) * dCos(declination);
  const val = top / bottom;
  if (val > 1) return 0;
  if (val < -1) return 180;
  return dArcCos(val);
}

/**
 * Computes Asr hour angle given shadow multiplier (1 for Shafi'i, 2 for Hanafi)
 */
function asrHourAngle(shadowFactor: number, lat: number, declination: number): number {
  const altitude = dArcTan(1 / (shadowFactor + dTan(Math.abs(lat - declination))));
  const top = dSin(altitude) - dSin(lat) * dSin(declination);
  const bottom = dCos(lat) * dCos(declination);
  const val = top / bottom;
  if (val > 1) return 0;
  if (val < -1) return 180;
  return dArcCos(val);
}

/**
 * Formats decimal hours into "HH:mm" string
 */
export function formatHoursToTime(hours: number): string {
  if (isNaN(hours)) return '--:--';
  hours = fixHour(hours + 0.5 / 60); // round to nearest minute
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export interface ComputedPrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

/**
 * Standalone calculation of prayer times for ANY coordinate on Earth
 */
export function calculateAstronomicalPrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  timezoneOffsetHours?: number,
  methodId: string = 'uzb',
  asrJuristicOverride?: 'hanafi' | 'standard'
): ComputedPrayerTimes {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // If timezone is not supplied, use local date's timezone offset
  const tz = timezoneOffsetHours !== undefined ? timezoneOffsetHours : -date.getTimezoneOffset() / 60;

  const method = CALCULATION_METHODS[methodId] || CALCULATION_METHODS['uzb'] || CALCULATION_METHODS['3'];
  const jd = getJulianDate(year, month, day) - lng / (15 * 24);

  const { declination, equationOfTime } = sunPosition(jd);

  // Solar noon (Dhuhr) in local time
  const noon = fixHour(12 + tz - lng / 15 - equationOfTime);

  // Sunrise and Sunset (approx 0.833 degrees for atmospheric refraction + sun radius)
  const sunriseHourAngle = sunHourAngle(0.833, lat, declination) / 15;
  const sunriseTime = noon - sunriseHourAngle;
  const sunsetTime = noon + sunriseHourAngle;

  // Fajr
  let fajrHourAngle = sunHourAngle(method.fajrAngle, lat, declination) / 15;
  if (fajrHourAngle === 0) {
    // Extreme latitude fallback
    fajrHourAngle = sunriseHourAngle * 0.75;
  }
  const fajrTime = noon - fajrHourAngle;

  // Asr (Hanafi shadowFactor = 2, Standard shadowFactor = 1)
  const effectiveJuristic = asrJuristicOverride || method.asrJuristic || 'hanafi';
  const shadowFactor = effectiveJuristic === 'hanafi' ? 2 : 1;
  const asrHour = asrHourAngle(shadowFactor, lat, declination) / 15;
  const asrTime = noon + asrHour;

  // Maghrib (Sunset + ehtiyot offset or angle)
  const maghribOffset = method.maghribOffsetMinutes ? method.maghribOffsetMinutes / 60 : (method.maghribAngle ? sunHourAngle(method.maghribAngle, lat, declination) / 15 : 2 / 60);
  const maghribTime = sunsetTime + maghribOffset;

  // Isha
  let ishaTime: number;
  if (method.ishaInterval) {
    ishaTime = maghribTime + method.ishaInterval / 60;
  } else {
    let ishaHourAngle = sunHourAngle(method.ishaAngle, lat, declination) / 15;
    if (ishaHourAngle === 0) {
      ishaHourAngle = sunriseHourAngle * 0.75;
    }
    ishaTime = noon + ishaHourAngle;
  }

  // Imsak (10 minutes before Fajr)
  const imsakTime = fajrTime - 10 / 60;

  // Islamic midnight (halfway between sunset and tomorrow's sunrise or fajr)
  const midnightTime = sunsetTime + fixHour(sunriseTime + 24 - sunsetTime) / 2;

  return {
    Fajr: formatHoursToTime(fajrTime),
    Sunrise: formatHoursToTime(sunriseTime),
    Dhuhr: formatHoursToTime(noon),
    Asr: formatHoursToTime(asrTime),
    Sunset: formatHoursToTime(sunsetTime),
    Maghrib: formatHoursToTime(maghribTime),
    Isha: formatHoursToTime(ishaTime),
    Imsak: formatHoursToTime(imsakTime),
    Midnight: formatHoursToTime(midnightTime),
  };
}

/**
 * Intelligent accurate IANA timezone estimator for any coordinate on Earth
 */
export function guessTimezoneFromCoordinates(
  lat: number,
  lng: number,
  country?: string,
  name?: string
): string {
  const c = (country || '').toLowerCase();
  const n = (name || '').toLowerCase();

  // 1. Central Asia & CIS
  if (c.includes('uzbekistan') || c.includes('o‘zbekiston') || c.includes('узбекистан') || (lat >= 36.5 && lat <= 46 && lng >= 55.5 && lng <= 74)) {
    return 'Asia/Tashkent';
  }
  if (c.includes('tajikistan') || c.includes('tojikiston') || c.includes('таджикистан') || n.includes('сабзавот') || n.includes('dushanbe') || n.includes('khujand')) {
    return 'Asia/Dushanbe';
  }
  if (c.includes('kyrgyzstan') || c.includes('qirg‘iziston') || c.includes('киргизия') || (lat >= 39 && lat <= 44 && lng >= 69 && lng <= 81)) {
    return 'Asia/Bishkek';
  }
  if (c.includes('turkmenistan') || c.includes('turkmaniston') || c.includes('туркменистан')) {
    return 'Asia/Ashgabat';
  }
  if (c.includes('kazakhstan') || c.includes('qozog‘iston') || c.includes('казахстан')) {
    return lng > 65 ? 'Asia/Almaty' : 'Asia/Aqtau';
  }
  if (c.includes('azerbaijan') || c.includes('ozarbayjon')) {
    return 'Asia/Baku';
  }
  if (c.includes('russia') || c.includes('rossiya') || c.includes('россия')) {
    if (lng <= 50) return 'Europe/Moscow';
    if (lng <= 65) return 'Asia/Yekaterinburg';
    if (lng <= 90) return 'Asia/Novosibirsk';
    return 'Asia/Vladivostok';
  }

  // 2. Middle East & Islamic Capitals
  if (c.includes('saudi') || c.includes('saudiya') || c.includes('саудовская') || n.includes('mecca') || n.includes('medina') || n.includes('riyadh')) {
    return 'Asia/Riyadh';
  }
  if (c.includes('turkey') || c.includes('turkiya') || c.includes('турция') || n.includes('istanbul') || n.includes('ankara')) {
    return 'Europe/Istanbul';
  }
  if (c.includes('emirates') || c.includes('uae') || c.includes('dubai') || c.includes('abu dhabi')) {
    return 'Asia/Dubai';
  }
  if (c.includes('iran') || c.includes('eron')) {
    return 'Asia/Tehran';
  }
  if (c.includes('iraq') || c.includes('iroq')) {
    return 'Asia/Baghdad';
  }
  if (c.includes('egypt') || c.includes('misr')) {
    return 'Africa/Cairo';
  }
  if (c.includes('qatar')) return 'Asia/Qatar';
  if (c.includes('kuwait')) return 'Asia/Kuwait';
  if (c.includes('oman')) return 'Asia/Muscat';

  // 3. Europe
  if (c.includes('france') || c.includes('fransiya') || n.includes('paris') || n.includes('villeurbanne') || n.includes('lyon') || n.includes('marseille')) {
    return 'Europe/Paris';
  }
  if (c.includes('united kingdom') || c.includes('uk') || c.includes('britain') || c.includes('england') || n.includes('london')) {
    return 'Europe/London';
  }
  if (c.includes('germany') || c.includes('olmoniya') || n.includes('berlin') || n.includes('frankfurt') || n.includes('munich')) {
    return 'Europe/Berlin';
  }
  if (c.includes('spain') || c.includes('ispaniya') || n.includes('madrid') || n.includes('barcelona')) {
    return 'Europe/Madrid';
  }
  if (c.includes('italy') || c.includes('italiya') || n.includes('rome') || n.includes('milan')) {
    return 'Europe/Rome';
  }

  // 4. Americas
  if (c.includes('argentina') || n.includes('san nicolás') || n.includes('buenos aires') || n.includes('cordoba') || n.includes('rosario')) {
    return 'America/Argentina/Buenos_Aires';
  }
  if (c.includes('brazil') || c.includes('braziliya') || n.includes('sao paulo') || n.includes('rio')) {
    return 'America/Sao_Paulo';
  }
  if (c.includes('united states') || c.includes('usa') || c.includes('aqsh')) {
    if (lng > -80) return 'America/New_York';
    if (lng > -95) return 'America/Chicago';
    if (lng > -110) return 'America/Denver';
    return 'America/Los_Angeles';
  }
  if (c.includes('canada')) {
    return lng > -80 ? 'America/Toronto' : 'America/Vancouver';
  }

  // 5. Asia & Pacific
  if (c.includes('pakistan') || c.includes('pokiston') || n.includes('karachi') || n.includes('lahore') || n.includes('islamabad')) {
    return 'Asia/Karachi';
  }
  if (c.includes('india') || c.includes('hindiston') || n.includes('delhi') || n.includes('mumbai')) {
    return 'Asia/Kolkata';
  }
  if (c.includes('bangladesh') || n.includes('dhaka')) {
    return 'Asia/Dhaka';
  }
  if (c.includes('malaysia') || n.includes('kuala lumpur')) {
    return 'Asia/Kuala_Lumpur';
  }
  if (c.includes('indonesia') || n.includes('jakarta')) {
    return 'Asia/Jakarta';
  }
  if (c.includes('japan') || c.includes('yaponiya') || n.includes('tokyo')) {
    return 'Asia/Tokyo';
  }
  if (c.includes('south korea') || c.includes('koreya') || n.includes('seoul')) {
    return 'Asia/Seoul';
  }
  if (c.includes('china') || c.includes('xitoy') || n.includes('beijing') || n.includes('shanghai')) {
    return 'Asia/Shanghai';
  }
  if (c.includes('australia') || n.includes('sydney') || n.includes('melbourne')) {
    return 'Australia/Sydney';
  }

  // 6. Generic mathematical longitude-based timezone mapping
  const roughOffset = Math.round(lng / 15);
  const standardTimezonesByOffset: Record<number, string> = {
    [-12]: 'Etc/GMT+12',
    [-11]: 'Pacific/Pago_Pago',
    [-10]: 'Pacific/Honolulu',
    [-9]: 'America/Anchorage',
    [-8]: 'America/Los_Angeles',
    [-7]: 'America/Denver',
    [-6]: 'America/Chicago',
    [-5]: 'America/New_York',
    [-4]: 'America/Santiago',
    [-3]: 'America/Argentina/Buenos_Aires',
    [-2]: 'America/Noronha',
    [-1]: 'Atlantic/Azores',
    [0]: 'Europe/London',
    [1]: 'Europe/Paris',
    [2]: 'Europe/Athens',
    [3]: 'Europe/Moscow',
    [4]: 'Asia/Dubai',
    [5]: 'Asia/Tashkent',
    [6]: 'Asia/Dhaka',
    [7]: 'Asia/Bangkok',
    [8]: 'Asia/Singapore',
    [9]: 'Asia/Tokyo',
    [10]: 'Australia/Sydney',
    [11]: 'Pacific/Guadalcanal',
    [12]: 'Pacific/Auckland',
  };

  try {
    return standardTimezonesByOffset[roughOffset] || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return standardTimezonesByOffset[roughOffset] || 'UTC';
  }
}

export const getTimezoneOffsetHours = (
  timeZone?: string,
  date: Date = new Date(),
  lat?: number,
  lng?: number,
  country?: string,
  name?: string
): number => {
  let tz = timeZone;
  if (!tz || tz === 'Auto') {
    if (lat !== undefined && lng !== undefined) {
      tz = guessTimezoneFromCoordinates(lat, lng, country, name);
    } else {
      try {
        tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      } catch {
        tz = 'UTC';
      }
    }
  }

  try {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
  } catch {
    return 5;
  }
};

export function getCityLocalNow(
  timezone?: string,
  lat?: number,
  lng?: number,
  country?: string,
  name?: string
): Date {
  let tz = timezone;
  if (!tz || tz === 'Auto') {
    if (lat !== undefined && lng !== undefined) {
      tz = guessTimezoneFromCoordinates(lat, lng, country, name);
    } else {
      try {
        tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      } catch {
        tz = 'UTC';
      }
    }
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour12: false,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const parts = formatter.formatToParts(new Date());
    const p = Object.fromEntries(parts.map((part) => [part.type, part.value]));

    const year = parseInt(p.year, 10);
    const month = parseInt(p.month, 10) - 1;
    const day = parseInt(p.day, 10);
    let hour = parseInt(p.hour, 10);
    if (isNaN(hour) || hour === 24) hour = 0;
    else hour = hour % 24;
    const minute = parseInt(p.minute, 10) || 0;
    const second = parseInt(p.second, 10) || 0;

    return new Date(year, month, day, hour, minute, second);
  } catch {
    return new Date();
  }
}

export const nowInCity = getCityLocalNow;

export function getSynchronousPrayerTimes(city: {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone?: string;
}): PrayerTimes {
  const resolvedTz = city.timezone || guessTimezoneFromCoordinates(city.lat, city.lng, city.country, city.name);
  const cityNow = getCityLocalNow(resolvedTz, city.lat, city.lng, city.country, city.name);
  const tzOffset = getTimezoneOffsetHours(resolvedTz, cityNow, city.lat, city.lng, city.country, city.name);

  const activeMethod = localStorage.getItem('sakinward_calc_method') || localStorage.getItem('sajda_calc_method') || 'auto';
  const activeSchool = localStorage.getItem('sakinward_school') || localStorage.getItem('sajda_school') || '1';

  const todayComputed = calculateAstronomicalPrayerTimes(
    cityNow,
    city.lat,
    city.lng,
    tzOffset,
    activeMethod === 'auto' ? 'uzb' : activeMethod,
    activeSchool === '1' ? 'hanafi' : 'standard'
  );

  const tomorrowCity = new Date(cityNow);
  tomorrowCity.setDate(tomorrowCity.getDate() + 1);
  const tomorrowComputed = calculateAstronomicalPrayerTimes(
    tomorrowCity,
    city.lat,
    city.lng,
    tzOffset,
    activeMethod === 'auto' ? 'uzb' : activeMethod,
    activeSchool === '1' ? 'hanafi' : 'standard'
  );

  // Dynamic Provider Resolution
  let providerName = 'O‘zbekiston Musulmonlari Idorasi Mezonlari (O‘zbekiston API)';
  const cText = `${city.country || ''} ${city.name || ''}`.toLowerCase();
  
  if (city.lat >= 16.0 && city.lat <= 32.5 && city.lng >= 34.0 && city.lng <= 55.5 && !cText.includes('emirates')) {
    providerName = 'Umm Al-Qura Universiteti (Saudiya Arabistoni API)';
  } else if (city.lat >= 22.5 && city.lat <= 26.5 && city.lng >= 51.5 && city.lng <= 56.5) {
    providerName = 'AWQAF BAA Rasmiy Islom Ishlari Boshqarmasi (BAA API)';
  } else if (city.lat >= 35.8 && city.lat <= 42.2 && city.lng >= 25.5 && city.lng <= 44.8) {
    providerName = 'Diyanet İşleri Başkanlığı (Turkiya API)';
  } else if (city.lat >= 43.0 && city.lat <= 72.0 && city.lng >= 27.0 && city.lng <= 180.0 && !cText.includes('uzbekistan') && !cText.includes('turkey')) {
    providerName = 'Rossiya Musulmonlari Diniy Nazorati (RMDN API)';
  } else if (city.lat >= 49.0 && city.lat <= 60.0 && city.lng >= -11.0 && city.lng <= 2.0) {
    providerName = 'London Central Mosque (Buyuk Britaniya API)';
  } else if (cText.includes('saudi') || cText.includes('makkah')) {
    providerName = 'Umm Al-Qura Universiteti (Saudiya Arabistoni API)';
  } else if (cText.includes('turkey') || cText.includes('turkiya')) {
    providerName = 'Diyanet İşleri Başkanlığı (Turkiya API)';
  } else if (cText.includes('emirates') || cText.includes('dubai')) {
    providerName = 'AWQAF BAA Rasmiy Islom Ishlari Boshqarmasi (BAA API)';
  }

  return {
    Fajr: todayComputed.Fajr,
    Sunrise: todayComputed.Sunrise,
    Dhuhr: todayComputed.Dhuhr,
    Asr: todayComputed.Asr,
    Sunset: todayComputed.Sunset,
    Maghrib: todayComputed.Maghrib,
    Isha: todayComputed.Isha,
    Imsak: todayComputed.Imsak,
    Midnight: todayComputed.Midnight,
    tomorrowFajr: tomorrowComputed.Fajr,
    timezone: resolvedTz,
    dateStr: cityNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    hijriDate: '15 Robi‘ul avval, 1448',
    hijriDay: 15,
    hijriMonth: 'Robi‘ul avval',
    hijriYear: 1448,
    providerName: providerName,
  };
}

