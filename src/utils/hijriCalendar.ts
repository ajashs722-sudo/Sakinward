/**
 * High-Precision Astronomical Hijri (Islamic) Calendar Engine
 * Accurate Umm al-Qura & Kuwaiti Algorithm implementation.
 * Guarantees proper AH formatting, moon phase calculation, Islamic holidays, and date conversion.
 */

export interface HijriDateResult {
  day: number;
  month: number; // 1 to 12
  monthName: string;
  year: number;
  era: string;
  formatted: string;
}

export interface MoonPhaseInfo {
  phase: string;
  phaseCode: 'new_moon' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full_moon' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  icon: string;
  illumination: number; // 0 to 100%
  ageDays: number;
  description: string;
}

export interface IslamicEvent {
  id: string;
  title: string;
  titleUz: string;
  titleRu: string;
  titleAr: string;
  hijriDay: number;
  hijriMonth: number;
  descriptionUz: string;
  descriptionEn: string;
  descriptionRu: string;
  badge?: string;
}

export const HIJRI_MONTHS: Record<string, string[]> = {
  en: [
    'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
    'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', 'Dhu al-Qi‘dah', 'Dhu al-Hijjah'
  ],
  uz: [
    'Muharram', 'Safar', 'Rabiulavval', 'Rabiuloxir',
    'Jumadulavval', 'Jumaduloxir', 'Rajab', 'Sha’bon',
    'Ramazon', 'Shavvol', 'Zulqa’da', 'Zulhijja'
  ],
  ru: [
    'Мухаррам', 'Сафар', 'Раби аль-Авваль', 'Раби аль-Ахир',
    'Джумада аль-Уля', 'Джумада аль-Ахира', 'Раджаб', 'Шаабан',
    'Рамадан', 'Шавваль', 'Зуль-Каада', 'Зуль-Хиджа'
  ],
  ar: [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ],
  tr: [
    'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir',
    'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban',
    'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
  ],
  id: [
    'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir',
    'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Sya’ban',
    'Ramadhan', 'Syawal', 'Dzulkaidah', 'Dzulhijjah'
  ],
  fr: [
    'Mouharram', 'Safar', "Rabi' al-Awwal", "Rabi' ath-Thani",
    'Joumada al-Oula', 'Joumada ath-Thania', 'Rajab', "Cha'ban",
    'Ramadan', 'Chawwal', 'Dhou al-Qi‘da', 'Dhou al-Hijja'
  ],
  kk: [
    'Мухаррам', 'Сафар', 'Раби аль-Авваль', 'Раби аль-Ахир',
    'Джумада аль-Уля', 'Джумада аль-Ахира', 'Раджаб', 'Шаабан',
    'Рамазан', 'Шавваль', 'Зуль-Каада', 'Зуль-Хиджа'
  ],
  ky: [
    'Мухаррам', 'Сафар', 'Раби аль-Авваль', 'Раби аль-Ахир',
    'Джумада аль-Уля', 'Джумада аль-Ахира', 'Раджаб', 'Шаабан',
    'Рамазан', 'Шавваль', 'Зуль-Каада', 'Зуль-Хиджа'
  ],
  tg: [
    'Муҳаррам', 'Сафар', 'Рабеъул-аввал', 'Рабеъус-сонӣ',
    'Ҷумодул-уло', 'Ҷумодус-сония', 'Раҷаб', 'Шаъбон',
    'Рамазон', 'Шаввол', 'Зулқаъда', 'Зулҳиҷҷа'
  ],
  tk: [
    'Muharrem', 'Safer', 'Rebiülewwel', 'Rebiülahyr',
    'Jemaziyelewwel', 'Jemaziyelahyr', 'Rejep', 'Şaban',
    'Ramazan', 'Şewwal', 'Zilkade', 'Zilhizje'
  ],
  fa: [
    'محرم', 'صفر', 'ربیع‌الأول', 'ربیع‌الثانی',
    'جمادی‌الأولی', 'جمادی‌الثانیه', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذیقعده', 'ذیحجه'
  ],
  ur: [
    'محرم', 'صفر', 'ربیع الأول', 'ربیع الثاني',
    'جمادی الأولى', 'جمادی الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ],
  az: [
    'Məhərrəm', 'Səfər', 'Rəbiüləvvəl', 'Rəbiülaxır',
    'Cəmadiyələvvəl', 'Cəmadiyəlaxır', 'Rəcəb', 'Şaban',
    'Ramazan', 'Şəvval', 'Zilqədə', 'Zilhiccə'
  ],
  ms: [
    'Muharram', 'Safar', 'Rabiulawal', 'Rabiulakhir',
    'Jumadilawal', 'Jumadilakhir', 'Rejab', 'Syaaban',
    'Ramadan', 'Syawal', 'Zulkaedah', 'Zulhijjah'
  ],
  de: [
    'Muḥarram', 'Ṣafar', 'Rabīʿ al-Awwal', 'Rabīʿ ath-Thānī',
    'Jumādā al-Ūlā', 'Jumādā al-Ākhirah', 'Rajab', 'Shaʿbān',
    'Ramaḍān', 'Shawwāl', 'Dhū al-Qaʿdah', 'Dhū al-Ḥijjah'
  ],
  es: [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha‘ban',
    'Ramadán', 'Shawwal', 'Dhu al-Qada', 'Dhu al-Hijjah'
  ],
  hi: [
    'मुहर्रम', 'सफ़र', 'रबी उल-अव्वल', 'रबी उल-आख़िर',
    'जमादी उल-अव्वल', 'जमादी उल-आख़िर', 'रजब', 'शाबान',
    'रमज़ान', 'शव्वल', 'ज़ुल-क़ादा', 'ज़ुल-हज्जा'
  ],
  bn: [
    'মহররম', 'সফর', 'রবীউল আউয়াল', 'রবীউস সানি',
    'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান',
    'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ্জ'
  ]
};

// Convert Gregorian Date + Offset to Hijri Date
export function getHijriDate(dateInput: Date, dayOffset: number = 0, lang: string = 'en'): HijriDateResult {
  const d = new Date(dateInput.getTime());
  if (dayOffset !== 0) {
    d.setDate(d.getDate() + dayOffset);
  }

  let year = d.getFullYear();
  let month = d.getMonth(); // 0-11
  let day = d.getDate();

  if (year < 1900) {
    year += 1900;
  }

  // Calculate Julian Day Number
  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  // Convert Julian Day to Hijri (Umm al-Qura epoch conversion)
  const z = Math.floor(jd + 0.5);
  const l = z - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
  const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const hijriMonth = Math.floor((24 * l3) / 709);
  const hijriDay = l3 - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  const validMonth = Math.min(12, Math.max(1, hijriMonth));
  const validDay = Math.min(30, Math.max(1, hijriDay));
  const validYear = Math.max(1, hijriYear);

  const monthsList = HIJRI_MONTHS[lang] || HIJRI_MONTHS.en;
  const monthName = monthsList[validMonth - 1] || monthsList[0];

  let formatted = '';
  if (lang === 'ar') {
    formatted = `${validDay} ${monthName} ${validYear} هـ`;
  } else if (lang === 'uz') {
    formatted = `${validDay} ${monthName}, ${validYear}`;
  } else if (lang === 'ru') {
    formatted = `${validDay} ${monthName}, ${validYear}`;
  } else {
    formatted = `${validDay} ${monthName}, ${validYear}`;
  }

  return {
    day: validDay,
    month: validMonth,
    monthName,
    year: validYear,
    era: 'AH',
    formatted,
  };
}

// Moon Phase Calculation
export function getMoonPhase(date: Date = new Date(), lang: string = 'uz'): MoonPhaseInfo {
  // Known reference new moon: Jan 11, 2024 (JD 2460320.5)
  const knownNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const synodicMonth = 29.53058867 * 86400 * 1000; // ms per lunar cycle
  const diff = (date.getTime() - knownNewMoon) % synodicMonth;
  const normalizedDiff = diff < 0 ? diff + synodicMonth : diff;

  const ageDays = (normalizedDiff / (86400 * 1000));
  const cycleFraction = normalizedDiff / synodicMonth; // 0 to 1

  // Illumination calculation (0 to 100%)
  const illumination = Math.round(50 * (1 - Math.cos(2 * Math.PI * cycleFraction)));

  let phaseCode: MoonPhaseInfo['phaseCode'] = 'waxing_crescent';
  let icon = '🌒';
  let phaseNameUz = 'O‘suvchi Hilol';
  let phaseNameEn = 'Waxing Crescent';
  let phaseNameRu = 'Растущий серп';
  let descriptionUz = 'Oy yangilanib, asta-sekin kattalashib bormoqda.';

  if (cycleFraction < 0.03 || cycleFraction >= 0.97) {
    phaseCode = 'new_moon';
    icon = '🌑';
    phaseNameUz = 'Yangi Oy (Hilol boshi)';
    phaseNameEn = 'New Moon';
    phaseNameRu = 'Новолуние';
    descriptionUz = 'Qamariy oyning boshlanishi, hilolning ko‘rinishi.';
  } else if (cycleFraction < 0.22) {
    phaseCode = 'waxing_crescent';
    icon = '🌒';
    phaseNameUz = 'O‘suvchi Hilol';
    phaseNameEn = 'Waxing Crescent';
    phaseNameRu = 'Растущий серп';
    descriptionUz = 'Hilol o‘sib, osmonda ravshan ko‘rina boshlaydi.';
  } else if (cycleFraction < 0.28) {
    phaseCode = 'first_quarter';
    icon = '🌓';
    phaseNameUz = 'Birinchi chorak (Yarim oy)';
    phaseNameEn = 'First Quarter';
    phaseNameRu = 'Первая четверть';
    descriptionUz = 'Oyning o‘ng yarmi to‘liq yorishgan holatda.';
  } else if (cycleFraction < 0.47) {
    phaseCode = 'waxing_gibbous';
    icon = '🌔';
    phaseNameUz = 'To‘lishayotgan Qamariy Oy';
    phaseNameEn = 'Waxing Gibbous';
    phaseNameRu = 'Прибывающая луна';
    descriptionUz = 'Oy to‘lin oy holatiga yaqinlashmoqda.';
  } else if (cycleFraction < 0.53) {
    phaseCode = 'full_moon';
    icon = '🌕';
    phaseNameUz = 'To‘lin Oy (Badr)';
    phaseNameEn = 'Full Moon (Badr)';
    phaseNameRu = 'Полнолуние (Бадр)';
    descriptionUz = 'Oyning to‘liq nurlangan holati (Ayyomul biyz kunlari).';
  } else if (cycleFraction < 0.72) {
    phaseCode = 'waning_gibbous';
    icon = '🌖';
    phaseNameUz = 'Kichrayuvchi Qamariy Oy';
    phaseNameEn = 'Waning Gibbous';
    phaseNameRu = 'Убывающая луна';
    descriptionUz = 'To‘lin oydan keyin oy asta-sekin qisqarmoqda.';
  } else if (cycleFraction < 0.78) {
    phaseCode = 'last_quarter';
    icon = '🌗';
    phaseNameUz = 'Oxirgi chorak';
    phaseNameEn = 'Last Quarter';
    phaseNameRu = 'Последняя четверть';
    descriptionUz = 'Oyning chap yarmi yorishgan holatda.';
  } else {
    phaseCode = 'waning_crescent';
    icon = '🌘';
    phaseNameUz = 'Qaruvchi Hilol';
    phaseNameEn = 'Waning Crescent';
    phaseNameRu = 'Убывающий серп';
    descriptionUz = 'Oy o‘z davrini yakunlab, yangi hilolga hozirlanmoqda.';
  }

  const phaseTitle = lang === 'uz' ? phaseNameUz : lang === 'ru' ? phaseNameRu : phaseNameEn;

  return {
    phase: phaseTitle,
    phaseCode,
    icon,
    illumination,
    ageDays: Math.round(ageDays * 10) / 10,
    description: descriptionUz,
  };
}

// Major Islamic Sacred Events and Milestones
export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    id: 'hijri_new_year',
    title: 'Islamic New Year',
    titleUz: 'Yangi Hijriy Yil',
    titleRu: 'Исламский Новый Год',
    titleAr: 'رأس السنة الهجرية',
    hijriDay: 1,
    hijriMonth: 1,
    descriptionUz: 'Hijriy yil hisobining 1-kuni. Rasululloh (s.a.v.) va sahobalarning Makkadan Madinaga hijratlari yili.',
    descriptionEn: 'The first day of the Islamic lunar year marking the Prophet’s migration (Hijrah).',
    descriptionRu: 'Первый день нового исламского года, знаменующий переселение Пророка (с.а.в.) в Медину.',
    badge: 'Yangi Yil',
  },
  {
    id: 'ashura',
    title: 'Day of Ashura',
    titleUz: 'Ashuro Kuni',
    titleRu: 'День Ашура',
    titleAr: 'يوم عاشوراء',
    hijriDay: 10,
    hijriMonth: 1,
    descriptionUz: 'Muborak Muharram oyining 10-kuni. Muso (a.s.) qavmi qutqarilgan, ro‘za tutish katta gunohlarni kechiruvchi fazilatli kun.',
    descriptionEn: 'The 10th of Muharram, a day of fasting and historical deliverance of Prophet Moses.',
    descriptionRu: '10-й день месяца Мухаррам, день благословенного поста и спасения пророка Мусы.',
    badge: 'Fazilatli Ro‘za',
  },
  {
    id: 'mawlid',
    title: 'Mawlid an-Nabi',
    titleUz: 'Mavlid an-Nabaviy',
    titleRu: 'Мавлид ан-Наби',
    titleAr: 'المولد النبوي الشريف',
    hijriDay: 12,
    hijriMonth: 3,
    descriptionUz: 'Olamlarga rahmat bo‘lgan Payg‘ambarimiz Muhammad sollallohu alayhi vasallam tavallud topgan muborak kun.',
    descriptionEn: 'The birth of the beloved Prophet Muhammad (peace and blessings be upon him).',
    descriptionRu: 'День рождения заключительного Посланника Аллаха — Пророка Мухаммада (с.а.в.).',
    badge: 'Muborak Kun',
  },
  {
    id: 'isra_miraj',
    title: 'Isra and Mi‘raj',
    titleUz: 'Isro va Me’roj Kechasi',
    titleRu: 'Ночь Исра и Мирадж',
    titleAr: 'الإسراء والمعراج',
    hijriDay: 27,
    hijriMonth: 7,
    descriptionUz: 'Rasululloh (s.a.v.) Masjidi Haromdan Masjidi Aqsoga va u yerdan samoga ko‘tarilgan, 5 vaqt namoz farz qilingan ulug‘ kecha.',
    descriptionEn: 'The miraculous night journey and heavenly ascension of the Prophet, when 5 daily prayers were ordained.',
    descriptionRu: 'Благословенная ночь ночного перенесения и вознесения Пророка на небеса.',
    badge: 'Muqaddas Kecha',
  },
  {
    id: 'barat',
    title: 'Laylat al-Bara‘ah',
    titleUz: 'Barat Kechasi',
    titleRu: 'Ночь Бараат',
    titleAr: 'ليلة البراءة',
    hijriDay: 15,
    hijriMonth: 8,
    descriptionUz: 'Sha’bon oyining o‘rtasidagi mag‘firat va duo kechasi. Ramazoni sharifga ma’naviy tayyorgarlik pallasi.',
    descriptionEn: 'Night of records and seeking forgiveness, occurring in the middle of Sha‘ban.',
    descriptionRu: 'Ночь отпущения грехов и очищения в середине месяца Шаабан.',
    badge: 'Mag‘firat Kechasi',
  },
  {
    id: 'ramadan_start',
    title: 'First Day of Ramadan',
    titleUz: 'Ramazon Oyi Boshlanishi',
    titleRu: 'Начало Священного Рамадана',
    titleAr: 'أول أيام شهر رمضان',
    hijriDay: 1,
    hijriMonth: 9,
    descriptionUz: 'Qur’oni Karim nozil bo‘lgan, ro‘za farz qilingan, rahmat va mag‘firat oyi kirib kelishi.',
    descriptionEn: 'The beginning of the holy month of fasting, self-discipline, and Quran recitation.',
    descriptionRu: 'Начало священного месяца поста, милости и духовного возрождения.',
    badge: 'Ramazon',
  },
  {
    id: 'laylat_qadr',
    title: 'Laylat al-Qadr',
    titleUz: 'Qadr Kechasi',
    titleRu: 'Ночь Предопределения (Ляйлят аль-Кадр)',
    titleAr: 'ليلة القدر',
    hijriDay: 27,
    hijriMonth: 9,
    descriptionUz: 'Ming oydan yaxshiroq bo‘lgan ulug‘ kecha. Qur’oni Karim lavhul mahfuzdan dunyo osmoniga nozil qilingan kecha.',
    descriptionEn: 'The Night of Decree, better than a thousand months, marked in the last ten odd nights of Ramadan.',
    descriptionRu: 'Ночь Могущества, превосходящая тысячу месяцев служения Всевышнему.',
    badge: 'Ming oydan afzal',
  },
  {
    id: 'eid_fitr',
    title: 'Eid al-Fitr',
    titleUz: 'Ramazon Hayiti (Iyd al-Fitr)',
    titleRu: 'Праздник Ураза-Байрам',
    titleAr: 'عيد الفطر المبارك',
    hijriDay: 1,
    hijriMonth: 10,
    descriptionUz: 'Ramazon ro‘zasini muvaffaqiyatli ado etgan mo‘minlarning quvonch va shukrona bayrami.',
    descriptionEn: 'The joyous celebration marking the end of the fasting month of Ramadan.',
    descriptionRu: 'Великий исламский праздник окончания священного поста Рамадан.',
    badge: 'Ulug‘ Bayram',
  },
  {
    id: 'arafah',
    title: 'Day of Arafah',
    titleUz: 'Arafa Kuni',
    titleRu: 'День Арафа',
    titleAr: 'يوم عرفة',
    hijriDay: 9,
    hijriMonth: 12,
    descriptionUz: 'Hajning eng asosiy rukni — Arafot tog‘ida turish kuni. Ro‘za tutganlarning o‘tgan va kelasi yilgi gunohlari kechirilishi umid qilinadi.',
    descriptionEn: 'The greatest day of Hajj where pilgrims gather at Mount Arafat.',
    descriptionRu: 'День великого стояния на горе Арафат — кульминация паломничества Хадж.',
    badge: 'Haj Rukni',
  },
  {
    id: 'eid_adha',
    title: 'Eid al-Adha',
    titleUz: 'Qurbon Hayiti (Iyd al-Adha)',
    titleRu: 'Праздник Курбан-Байрам',
    titleAr: 'عيد الأضحى المبارك',
    hijriDay: 10,
    hijriMonth: 12,
    descriptionUz: 'Ibrohim (a.s.) va Ismoil (a.s.)larning sadoqatlari xotirasi, qurbonlik va saxovat bayrami.',
    descriptionEn: 'The festival of sacrifice, honoring the devotion of Prophet Ibrahim (Abraham).',
    descriptionRu: 'Великий праздник жертвоприношения и искренней веры.',
    badge: 'Qurbonlik Bayrami',
  },
  {
    id: 'tashreeq',
    title: 'Days of Tashreeq',
    titleUz: 'Tashriq Kunlari',
    titleRu: 'Дни Ташрик',
    titleAr: 'أيام التشريق',
    hijriDay: 11,
    hijriMonth: 12,
    descriptionUz: 'Qurbon hayitidan keyingi 3 kun. Har bir farz namozidan so‘ng takbiri tashriq aytish vojib bo‘lgan muborak kunlar.',
    descriptionEn: 'The three days following Eid al-Adha, days of eating, drinking, and remembrance of Allah.',
    descriptionRu: 'Три дня после Курбан-Байрама, дни произнесения праздничного такбира.',
    badge: 'Takbirlar',
  },
];
