import { SupportedLanguage } from './translations';

export interface LandingTranslationStrings {
  appName: string;
  heroHeadline: string;
  heroSubheadline: string;
  openApp: string;
  menu: string;
  theme: string;
  languageSelect: string;
  languages70Plus: string;
  
  // Geolocation & Live Status
  gpsLocating: string;
  gpsActive: string;
  autonomousLocation: string;
  refreshLocation: string;
  nowPrayer: string;
  nextPrayerLabel: string;
  prayerTimesTitle: string;
  listenAdhan: string;
  stopAdhan: string;
  adhanTitle: string;
  
  // Quran Card
  quranTitle: string;
  quranPlayerTitle: string;
  savedVersesTitle: string;
  savedVersesDesc: string;
  verseTafsirToast: string;
  mushafMode: string;
  mushafDesc: string;
  verseCopySuccess: string;
  verseBookmarkAdded: string;
  verseBookmarkRemoved: string;
  verseLiked: string;
  verseUnliked: string;
  audioPlaying: string;
  audioPaused: string;
  
  // 70+ Languages Matrix Card
  languagesCardTitle: string;
  languagesCardSubtitle: string;
  languagesCardDesc: string;
  
  // Qibla Compass Card
  qiblaTitle: string;
  qiblaExactDirection: string;
  qiblaDistanceToMakkah: string;
  qiblaAzimuthLabel: string;
  qiblaCalibrateTip: string;
  qiblaAligned: string;
  rotateTowardsKaaba: string;
  sensorLive: string;
  waitingSensor: string;
  calibrateSensor: string;
  calibrateSensorModalTitle: string;
  calibrateSensorModalDesc: string;
  calibrateTip1: string;
  calibrateTip2: string;
  calibrateTip3: string;
  done: string;
  compassNorth: string;
  compassEast: string;
  compassSouth: string;
  compassWest: string;
  
  // Sakin AI Card (Suhbat)
  sakinAiTitle: string;
  sakinAiSubtitle: string;
  sakinAiDesc: string;
  sakinAiPromptSamples: string;
  sakinAiChatButton: string;
  sakinAiSampleQ1: string;
  sakinAiSampleA1: string;
  sakinAiSampleQ2: string;
  sakinAiSampleA2: string;
  sakinAiSampleQ3: string;
  sakinAiSampleA3: string;
  
  // Hijri Calendar Card
  hijriTitle: string;
  hijriSubtitle: string;
  hijriEventsCount: string;
  hijriYearSuffix: string;
  eventsLabel: string;
  viewFullCalendar: string;
  
  // 99 Names Card
  namesTitle: string;
  namesSubtitle: string;
  namesCardDesc: string;
  
  // Footer & Legal
  footerAbout1: string;
  footerAbout2: string;
  footerAbout3: string;
  footerAbout4: string;
  termsOfUse: string;
  privacyPolicy: string;
  contactUs: string;
  telegramChannel: string;
  telegramBot: string;
  instagram: string;
  officialWebsite: string;
  allRightsReserved: string;

  // Navigation / Drawer
  navPrayerTimes: string;
  navQuran: string;
  navQibla: string;
  navHijri: string;
  navNames: string;
  navAi: string;
  brandSlogan: string;
  
  // Qibla dynamic hints
  turnRightHint: string;
  turnLeftHint: string;
  turnPhoneToKaaba: string;
  qiblaDetected: string;
  holdFlat: string;
  openFullQibla: string;
  
  // Hijri Calendar & Sacred Days
  hijriToday: string;
  lunarObservationNote: string;
  moonPhaseLabel: string;
  sacredMilestones: string;
  
  // Sakin AI Marketing & Branding
  aiBadge: string;
  aiHeroHeadline: string;
  aiPillar1Title: string;
  aiPillar1Desc: string;
  aiPillar2Title: string;
  aiPillar2Desc: string;
  aiPillar3Title: string;
  aiPillar3Desc: string;
  aiVerifiedResponse: string;
  aiStartChatFree: string;
  aiSampleQ4: string;
  aiSampleA4: string;
  aiSourceCitation: string;
  
  // Quran & General UI
  prevVerse: string;
  nextVerse: string;
  savedVersesNotes: string;
  savedVersesDesc2: string;
  pauseRecitation: string;
  listenRecitation: string;
  digitalIslamicService: string;
  termsTitle: string;
  privacyTitle: string;
  scrollHint: string;
}

const UZ: LandingTranslationStrings = {
  appName: 'Sakinward',
  heroHeadline: 'Kundalik ibodat uchun kerakli hamma narsa',
  heroSubheadline: 'Astronomik namoz vaqtlari, Qur\'oni Karim, Qibla kompasi va aqlli islomiy yordamchi',
  openApp: 'Ilovani ochish',
  menu: 'Menyu',
  theme: 'Mavzu',
  languageSelect: 'Tilni tanlash',
  languages70Plus: '70+ til',
  
  gpsLocating: 'Aniqlanmoqda...',
  gpsActive: 'GPS Faol',
  autonomousLocation: 'Avtonom geomanzil',
  refreshLocation: 'Geomanzilni yangilash',
  nowPrayer: 'Hozirgi vaqt',
  nextPrayerLabel: 'QOLGAN VAQT',
  prayerTimesTitle: 'Namoz vaqtlari',
  listenAdhan: 'Azon eshitish',
  stopAdhan: 'Azonni to‘xtatish',
  adhanTitle: 'Azon qiroati',
  
  quranTitle: 'Qur\'oni Karim',
  quranPlayerTitle: 'Qur\'on',
  savedVersesTitle: 'Saqlangan oyatlar va eslatmalar',
  savedVersesDesc: 'Ibodat uchun zarur suralar va audio tilovatlar doim yoningizda.',
  verseTafsirToast: 'Oyat tafsiri va sharhlari',
  mushafMode: 'Mushaf rejimi',
  mushafDesc: 'Asl arabcha xat va 70+ xalqaro tillarda ishonchli ma\'nolar tarjimasi.',
  verseCopySuccess: 'Oyat matni nusxalandi',
  verseBookmarkAdded: 'Xatcho‘plarga qo‘shildi',
  verseBookmarkRemoved: 'Xatcho‘plardan olindi',
  verseLiked: 'Sevimlilarga qo‘shildi',
  verseUnliked: 'Sevimlilardan olindi',
  audioPlaying: 'Qiroat yangramoqda',
  audioPaused: 'Qiroat to‘xtatildi',
  
  languagesCardTitle: '70+ Tillar va Tarjimalar',
  languagesCardSubtitle: 'Global Ko‘p Tillik Islomiy Platforma',
  languagesCardDesc: 'Dunyodagi yetmishdan ortiq xalqlar tillarida ishonchli Qur\'on ma\'nolar tarjimasi va islomiy manbalar.',
  
  qiblaTitle: 'Qibla Kompasi',
  qiblaExactDirection: 'Qiblaning aniq yo‘nalishi',
  qiblaDistanceToMakkah: 'Makka-i Mukarramagacha masofa',
  qiblaAzimuthLabel: 'Azimut',
  qiblaCalibrateTip: 'Kompas sensorini qayta sozlash uchun bosing',
  qiblaAligned: 'Qibla yo‘nalishi topildi!',
  rotateTowardsKaaba: 'Telefoningizni Ka\'baga qarab buriling',
  sensorLive: 'Jonli sensor faol',
  waitingSensor: 'Sensor kutilmoqda...',
  calibrateSensor: 'Kalibrlash',
  calibrateSensorModalTitle: 'Kompasni kalibrlash',
  calibrateSensorModalDesc: 'Sensor xatoliklarini tozalash uchun telefoningizni havoda sakkiz (cheksizlik ∞) shaklida ohista aylantiring.',
  calibrateTip1: 'Metall buyumlar va magnitli g‘iloflardan uzoqroq tuting.',
  calibrateTip2: 'Telefonni yer yuzasiga parallel tekis ushlang.',
  calibrateTip3: 'Tebranish natijasida aniqlik darhol tiklanadi.',
  done: 'Tushundim',
  compassNorth: 'Sh',
  compassEast: 'Shq',
  compassSouth: 'J',
  compassWest: 'G‘',
  
  sakinAiTitle: 'Sakin AI',
  sakinAiSubtitle: 'Aqlli Islomiy Suhbatdosh',
  sakinAiDesc: 'Qur\'on oyatlari, hadislar va ibodat odoblari bo‘yicha tezkor, asosli va sokin javoblarni oling.',
  sakinAiPromptSamples: 'Namunaviy savollar',
  sakinAiChatButton: 'Sakin AI bilan to‘liq suhbat',
  sakinAiSampleQ1: 'Namoz vaqtlari qanday hisoblanadi?',
  sakinAiSampleA1: 'Sakinward aniq GPS koordinatalaringiz va quyoshning astronomik burchaklariga tayanib daqiqasigacha hisoblaydi.',
  sakinAiSampleQ2: 'Qazo namozlarini o‘qish tartibi',
  sakinAiSampleA2: 'Qazo hisoblagichida aniq qayd etib, har bir farz namozidan keyin muntazam ado etib borish tavsiya etiladi.',
  sakinAiSampleQ3: 'Zikr va qalb xotirjamligi',
  sakinAiSampleA3: '«Ogoh bo‘lingizkim, Allohning zikri ila qalblar orom topur» (Ra\'d surasi, 28-oyat).',
  
  hijriTitle: 'Hijriy Taqvim',
  hijriSubtitle: 'Islomiy sana va qutlug‘ kunlar',
  hijriEventsCount: 'ta muhim sana',
  hijriYearSuffix: 'h.y.',
  eventsLabel: 'voqea',
  viewFullCalendar: 'To‘liq Hijriy taqvimni ko‘rish',
  
  namesTitle: 'Allohning 99 Go‘zal Ismi',
  namesSubtitle: 'Asmoi Husnani interaktiv o‘rganing',
  namesCardDesc: 'Alloh taoloning go‘zal ismlari va ularning chuqur ma\'nolarini kashf eting.',
  
  footerAbout1: 'Sakinward musulmonlarni kundalik ibodat va ruhiy kamolotda qo‘llab-quvvatlash uchun yaratilgan xalqaro islomiy platformadir. Unda Qur\'on tilovati, astronomik namoz vaqtlari, yuqori aniqlikdagi Qibla kompasi, zikrlar va asmoi husna qulay jamlangan.',
  footerAbout2: 'Sakinward\'dagi barcha ma\'lumotlar mo‘tabar islomiy mezonlarga asoslangan. Ilova ta\'limiy va amaliy qo‘llanma hisoblanadi.',
  footerAbout3: 'Sakinward asl materiallari, dizayni va dasturiy ta\'minoti intellektual mulk huquqlari bilan himoyalangan.',
  footerAbout4: 'Sakinward butun dunyo musulmonlari uchun bepul xizmat ko‘rsatadi.',
  termsOfUse: 'Foydalanish shartlari',
  privacyPolicy: 'Maxfiylik siyosati',
  contactUs: 'Bog‘lanish',
  telegramChannel: 'Telegram',
  telegramBot: 'Telegram Bot',
  instagram: 'Instagram',
  officialWebsite: 'Rasmiy veb-sayt',
  allRightsReserved: 'Barcha huquqlar himoyalangan.',

  // Navigation / Drawer
  navPrayerTimes: 'Namoz vaqtlari',
  navQuran: 'Qur\'oni Karim',
  navQibla: 'Qibla kompasi',
  navHijri: 'Hijriy taqvim',
  navNames: 'Allohning 99 ismi',
  navAi: 'Sakin AI',
  brandSlogan: 'Sokinlik va ma\'naviyat',

  // Qibla dynamic hints
  turnRightHint: 'o‘ngga buring',
  turnLeftHint: 'chapga buring',
  turnPhoneToKaaba: 'Telefonni Ka\'baga qarab buring',
  qiblaDetected: 'Aniqlandi',
  holdFlat: 'Tekis ushlang',
  openFullQibla: 'To‘liq Qibla Kompasini ochish (Interaktiv)',

  // Hijri Calendar & Sacred Days
  hijriToday: 'Bugungi qamariy sana',
  lunarObservationNote: 'Islomiy sanalar yangi Hilol (oy)ning ko‘rinishiga qarab 1 kunga farqlanishi mumkin.',
  moonPhaseLabel: 'Oy fazasi',
  sacredMilestones: 'Muborak islomiy kunlar',

  // Sakin AI Marketing & Branding
  aiBadge: 'Sun\'iy Intellekt',
  aiHeroHeadline: 'Sizning shaxsiy islomiy yo‘lko‘rsatuvchingiz',
  aiPillar1Title: 'Sahih Manbalar',
  aiPillar1Desc: 'Qur\'oni Karim oyatlari va mo‘tabar sahih hadislar asosida.',
  aiPillar2Title: 'Sokin va Odobli Ohang',
  aiPillar2Desc: 'Bahslarsiz, qalblarga taskin beruvchi sof islomiy axloqda.',
  aiPillar3Title: 'Kundalik Ibodat Maslahatchisi',
  aiPillar3Desc: 'Namoz, qazo, tahorat, ro‘za, zakot va zikrlar bo‘yicha ko‘rsatmalar.',
  aiVerifiedResponse: 'Tasdiqlangan islomiy javob',
  aiStartChatFree: 'Sakin AI bilan suhbatlashish (Bepul)',
  aiSampleQ4: 'Ro‘za niyati va iftorlik duosi qanday?',
  aiSampleA4: 'Saharlik: «Navaytu an asuma sovma shahri ramazona minal fajri ilal mag‘ribi, xolisan lillahi ta\'ala». Iftorlik: «Allohumma laka sumtu va bika amantu...»',
  aiSourceCitation: 'Manba: Islom mezonlari va Qur\'on oyatlari',

  // Quran & General UI
  prevVerse: 'Oldingi oyat',
  nextVerse: 'Keyingi oyat',
  savedVersesNotes: 'Saqlangan oyatlar va qaydlar',
  savedVersesDesc2: 'Muhim oyatlar va audio tilovatlar doimo qo‘l ostida.',
  pauseRecitation: 'To‘xtatish',
  listenRecitation: 'Tinglash',
  digitalIslamicService: 'Raqamli Islomiy Xizmat',
  termsTitle: 'Foydalanish shartlari',
  privacyTitle: 'Maxfiylik siyosati',
  scrollHint: 'Pastga aylantiring',
};

const RU: LandingTranslationStrings = {
  appName: 'Sakinward',
  heroHeadline: 'Всё необходимое для ежедневного поклонения',
  heroSubheadline: 'Астрономическое время намаза, Священный Коран, компас Киблы и умный исламский ассистент',
  openApp: 'Открыть приложение',
  menu: 'Меню',
  theme: 'Тема',
  languageSelect: 'Выбор языка',
  languages70Plus: '70+ языков',
  
  gpsLocating: 'Определение...',
  gpsActive: 'GPS Активен',
  autonomousLocation: 'Автономная локация',
  refreshLocation: 'Обновить геопозицию',
  nowPrayer: 'Текущее время',
  nextPrayerLabel: 'ДО СЛЕДУЮЩЕГО',
  prayerTimesTitle: 'Время намаза',
  listenAdhan: 'Слушать азан',
  stopAdhan: 'Остановить азан',
  adhanTitle: 'Чтение азана',
  
  quranTitle: 'Священный Коран',
  quranPlayerTitle: 'Коран',
  savedVersesTitle: 'Сохранённые аяты и заметки',
  savedVersesDesc: 'Важные аяты и аудиозаписи всегда под рукой.',
  verseTafsirToast: 'Тафсир и толкование аята',
  mushafMode: 'Режим Мусхафа',
  mushafDesc: 'Оригинальная арабская каллиграфия и авторитетные переводы смыслов на 70+ языков.',
  verseCopySuccess: 'Аят скопирован',
  verseBookmarkAdded: 'Добавлено в закладки',
  verseBookmarkRemoved: 'Удалено из закладок',
  verseLiked: 'Добавлено в избранное',
  verseUnliked: 'Удалено из избранного',
  audioPlaying: 'Чтение аята',
  audioPaused: 'Пауза',
  
  languagesCardTitle: '70+ Языков и Переводов',
  languagesCardSubtitle: 'Глобальная Многоязычная Платформа',
  languagesCardDesc: 'Авторитетные переводы смыслов Корана на более чем 70 языков народов мира.',
  
  qiblaTitle: 'Компас Киблы',
  qiblaExactDirection: 'Точное направление Киблы',
  qiblaDistanceToMakkah: 'Расстояние до Мекки',
  qiblaAzimuthLabel: 'Азимут',
  qiblaCalibrateTip: 'Нажмите для калибровки компаса',
  qiblaAligned: 'Направление Киблы найдено!',
  rotateTowardsKaaba: 'Поверните устройство в сторону Каабы',
  sensorLive: 'Датчик активен',
  waitingSensor: 'Ожидание датчика...',
  calibrateSensor: 'Калибровка',
  calibrateSensorModalTitle: 'Калибровка компаса',
  calibrateSensorModalDesc: 'Для устранения магнитных помех плавно опишите устройством в воздухе знак бесконечности (восьмёрку ∞).',
  calibrateTip1: 'Держите вдали от металлических предметов и магнитов.',
  calibrateTip2: 'Держите телефон горизонтально.',
  calibrateTip3: 'Точность восстановится автоматически.',
  done: 'Понятно',
  compassNorth: 'С',
  compassEast: 'В',
  compassSouth: 'Ю',
  compassWest: 'З',
  
  sakinAiTitle: 'Sakin AI',
  sakinAiSubtitle: 'Умный Исламский Собеседник',
  sakinAiDesc: 'Получайте мгновенные, аргументированные и умиротворяющие ответы по аятам, хадисам и правилам поклонения.',
  sakinAiPromptSamples: 'Примеры вопросов',
  sakinAiChatButton: 'Полный диалог с Sakin AI',
  sakinAiSampleQ1: 'Как рассчитывается время намаза?',
  sakinAiSampleA1: 'Sakinward рассчитывает время на основе точных координат GPS и астрономического положения солнца.',
  sakinAiSampleQ2: 'Правило возмещения каза-намазов',
  sakinAiSampleA2: 'Рекомендуется вести точный учет в календаре и последовательно совершать пропущенные молитвы.',
  sakinAiSampleQ3: 'Достоинство поминания Аллаха',
  sakinAiSampleA3: '«Знайте, только поминанием Аллаха успокаиваются сердца» (Сура ар-Раад, аят 28).',
  
  hijriTitle: 'Хиджри календарь',
  hijriSubtitle: 'Исламский календарь и священные даты',
  hijriEventsCount: 'событий',
  hijriYearSuffix: 'г.х.',
  eventsLabel: 'события',
  viewFullCalendar: 'Открыть полный календарь Хиджры',
  
  namesTitle: '99 Имён Аллаха',
  namesSubtitle: 'Интерактивное изучение прекрасных имён Аллаха',
  namesCardDesc: 'Изучайте прекрасные имена Всевышнего Аллаха и их глубокие значения.',
  
  footerAbout1: 'Sakinward — международная цифровая платформа для духовного развития мусульман. Сервис объединяет точное время намаза, Коран, компас Киблы, зикры и 99 имён Аллаха.',
  footerAbout2: 'Все материалы основаны на достоверных исламских источниках. Приложение является образовательным и практическим руководством.',
  footerAbout3: 'Все оригинальные материалы защищены законодательством об интеллектуальной собственности.',
  footerAbout4: 'Sakinward бесплатен для пользователей по всему миру.',
  termsOfUse: 'Условия использования',
  privacyPolicy: 'Политика конфиденциальности',
  contactUs: 'Связаться с нами',
  telegramChannel: 'Telegram',
  telegramBot: 'Telegram Bot',
  instagram: 'Instagram',
  officialWebsite: 'Официальный сайт',
  allRightsReserved: 'Все права защищены.',

  // Navigation / Drawer
  navPrayerTimes: 'Время намаза',
  navQuran: 'Священный Коран',
  navQibla: 'Компас Киблы',
  navHijri: 'Хиджри календарь',
  navNames: '99 Имён Аллаха',
  navAi: 'Sakin AI',
  brandSlogan: 'Умиротворение и духовность',

  // Qibla dynamic hints
  turnRightHint: 'поверните направо',
  turnLeftHint: 'поверните налево',
  turnPhoneToKaaba: 'Поверните телефон в сторону Каабы',
  qiblaDetected: 'Найдено',
  holdFlat: 'Держите ровно',
  openFullQibla: 'Открыть интерактивный компас Киблы',

  // Hijri Calendar & Sacred Days
  hijriToday: 'Сегодня по Хиджре',
  lunarObservationNote: 'Исламские даты определяются по наблюдению серпа новой Луны и могут отличаться на 1 день.',
  moonPhaseLabel: 'Фаза Луны',
  sacredMilestones: 'Священные исламские даты',

  // Sakin AI Marketing & Branding
  aiBadge: 'Исламский ИИ',
  aiHeroHeadline: 'Ваш персональный исламский наставник',
  aiPillar1Title: 'Достоверные Источники',
  aiPillar1Desc: 'На основе аятов Священного Корана и достоверных хадисов.',
  aiPillar2Title: 'Мягкий и Уважительный Тон',
  aiPillar2Desc: 'Без споров, с мудростью и искренним исламским адабом.',
  aiPillar3Title: 'Ежедневный Помощник',
  aiPillar3Desc: 'Советы по намазу, каза-намазам, посту, омовению и зикрам.',
  aiVerifiedResponse: 'Проверенный исламский ответ',
  aiStartChatFree: 'Начать диалог с Sakin AI (Бесплатно)',
  aiSampleQ4: 'Намерение на пост и дуа на ифтар?',
  aiSampleA4: 'Сухур: «Навайту ан асума савма шахри рамадана миналь-фаджри иляль-магриби халисан лилляхи тааля». Ифтар: «Аллахумма ляка сумту ва бика аманту...»',
  aiSourceCitation: 'Источник: Исламские нормы и аяты Корана',

  // Quran & General UI
  prevVerse: 'Предыдущий аят',
  nextVerse: 'Следующий аят',
  savedVersesNotes: 'Сохранённые аяты и заметки',
  savedVersesDesc2: 'Важные аяты и аудио-чтения всегда под рукой.',
  pauseRecitation: 'Пауза',
  listenRecitation: 'Слушать',
  digitalIslamicService: 'Цифровой исламский сервис',
  termsTitle: 'Условия использования',
  privacyTitle: 'Политика конфиденциальности',
  scrollHint: 'Прокрутите вниз',
};

const EN: LandingTranslationStrings = {
  appName: 'Sakinward',
  heroHeadline: 'Everything you need for daily worship',
  heroSubheadline: 'Astronomical prayer times, Holy Quran, Qibla compass & intelligent Islamic assistant',
  openApp: 'Open Application',
  menu: 'Menu',
  theme: 'Theme',
  languageSelect: 'Choose Language',
  languages70Plus: '70+ Languages',
  
  gpsLocating: 'Locating...',
  gpsActive: 'GPS Active',
  autonomousLocation: 'Autonomous Location',
  refreshLocation: 'Refresh Location',
  nowPrayer: 'Live Time',
  nextPrayerLabel: 'COUNTDOWN',
  prayerTimesTitle: 'Prayer Times',
  listenAdhan: 'Listen Adhan',
  stopAdhan: 'Stop Adhan',
  adhanTitle: 'Adhan Recitation',
  
  quranTitle: 'The Noble Quran',
  quranPlayerTitle: 'The Quran',
  savedVersesTitle: 'Saved Verses & Notes',
  savedVersesDesc: 'Essential verses and recitations always within reach.',
  verseTafsirToast: 'Verse commentary and tafsir',
  mushafMode: 'Mushaf Mode',
  mushafDesc: 'Original Arabic calligraphy format and reputable translations in 70+ global languages.',
  verseCopySuccess: 'Verse text copied',
  verseBookmarkAdded: 'Saved to bookmarks',
  verseBookmarkRemoved: 'Removed from bookmarks',
  verseLiked: 'Added to favorites',
  verseUnliked: 'Removed from favorites',
  audioPlaying: 'Recitation playing',
  audioPaused: 'Recitation paused',
  
  languagesCardTitle: '70+ Languages & Translations',
  languagesCardSubtitle: 'Global Multilingual Islamic Platform',
  languagesCardDesc: 'Authoritative translations and commentaries in over 70 languages for deeper Quranic comprehension.',
  
  qiblaTitle: 'Qibla Compass',
  qiblaExactDirection: 'Exact Qibla Direction',
  qiblaDistanceToMakkah: 'Distance to Makkah',
  qiblaAzimuthLabel: 'Azimuth',
  qiblaCalibrateTip: 'Tap to recalibrate compass sensor',
  qiblaAligned: 'Qibla Found!',
  rotateTowardsKaaba: 'Rotate towards the Kaaba',
  sensorLive: 'Live sensor active',
  waitingSensor: 'Waiting for sensor...',
  calibrateSensor: 'Calibrate',
  calibrateSensorModalTitle: 'Calibrate Compass',
  calibrateSensorModalDesc: 'To clear sensor magnetic interference, gently wave your device in a figure-8 (infinity ∞) motion in the air.',
  calibrateTip1: 'Keep away from metallic objects and magnetic cases.',
  calibrateTip2: 'Hold the phone flat horizontally.',
  calibrateTip3: 'Accuracy will be restored immediately.',
  done: 'Understood',
  compassNorth: 'N',
  compassEast: 'E',
  compassSouth: 'S',
  compassWest: 'W',
  
  sakinAiTitle: 'Sakin AI',
  sakinAiSubtitle: 'Intelligent Islamic Dialogue',
  sakinAiDesc: 'Receive instant, well-founded, and serene answers regarding Quranic verses, Hadith, and worship guidance.',
  sakinAiPromptSamples: 'Sample inquiries',
  sakinAiChatButton: 'Full Conversation with Sakin AI',
  sakinAiSampleQ1: 'How are prayer times calculated?',
  sakinAiSampleA1: 'Sakinward computes times using your high-precision GPS coordinates and true solar astronomical angles.',
  sakinAiSampleQ2: 'Guidelines for Qaza prayers',
  sakinAiSampleA2: 'It is recommended to systematically log missed prayers using the tracker and perform them consistently.',
  sakinAiSampleQ3: 'Virtues of Zikr and inner peace',
  sakinAiSampleA3: '«Unquestionably, by the remembrance of Allah hearts are assured» (Surah Ar-Ra\'d, 28).',
  
  hijriTitle: 'Hijri Calendar',
  hijriSubtitle: 'Islamic Calendar & Blessed Dates',
  hijriEventsCount: 'events',
  hijriYearSuffix: 'AH',
  eventsLabel: 'events',
  viewFullCalendar: 'Open Full Hijri Calendar',
  
  namesTitle: '99 Names of Allah',
  namesSubtitle: 'Learn the beautiful Divine Names interactively',
  namesCardDesc: 'Discover the profound meanings of the 99 Beautiful Names of Allah.',
  
  footerAbout1: 'Sakinward is a global Islamic digital platform designed to support daily worship, Quranic study, accurate astronomical prayer times, and spiritual mindfulness.',
  footerAbout2: 'All content is grounded in reputable Islamic sources. The app provides educational and practical worship guidance.',
  footerAbout3: 'All original application assets and designs are protected under intellectual property laws.',
  footerAbout4: 'Sakinward is freely available for users worldwide.',
  termsOfUse: 'Terms of Use',
  privacyPolicy: 'Privacy Policy',
  contactUs: 'Contact Us',
  telegramChannel: 'Telegram',
  telegramBot: 'Telegram Bot',
  instagram: 'Instagram',
  officialWebsite: 'Official Website',
  allRightsReserved: 'All rights reserved.',

  // Navigation / Drawer
  navPrayerTimes: 'Prayer Times',
  navQuran: 'Holy Quran',
  navQibla: 'Qibla Compass',
  navHijri: 'Hijri Calendar',
  navNames: '99 Names of Allah',
  navAi: 'Sakin AI',
  brandSlogan: 'Peace & Spirituality',

  // Qibla dynamic hints
  turnRightHint: 'turn right',
  turnLeftHint: 'turn left',
  turnPhoneToKaaba: 'Point phone towards Kaaba',
  qiblaDetected: 'Aligned',
  holdFlat: 'Hold flat',
  openFullQibla: 'Open Interactive Qibla Compass',

  // Hijri Calendar & Sacred Days
  hijriToday: 'Today in Hijri',
  lunarObservationNote: 'Islamic lunar dates depend on the observation of the new crescent moon and may vary by 1 day.',
  moonPhaseLabel: 'Moon Phase',
  sacredMilestones: 'Sacred Islamic Milestones',

  // Sakin AI Marketing & Branding
  aiBadge: 'Islamic AI',
  aiHeroHeadline: 'Your Personal Islamic Spiritual Companion',
  aiPillar1Title: 'Authentic Sources',
  aiPillar1Desc: 'Faithfully derived from Quranic verses and canonical Sahih Hadith.',
  aiPillar2Title: 'Serene & Gentle Tone',
  aiPillar2Desc: 'Free from polemics, delivered with compassion and traditional adab.',
  aiPillar3Title: 'Daily Worship Guide',
  aiPillar3Desc: 'Practical advice on prayers, missed qaza, fasting, purification and zikr.',
  aiVerifiedResponse: 'Verified Islamic Guidance',
  aiStartChatFree: 'Start Conversation with Sakin AI (Free)',
  aiSampleQ4: 'Fasting intention and Iftar dua?',
  aiSampleA4: 'Suhoor: «I intend to fast the month of Ramadan for the sake of Allah...» Iftar: «O Allah, for You I fasted and in You I have believed...»',
  aiSourceCitation: 'Sources: Authentic Islamic literature and Quranic ayahs',

  // Quran & General UI
  prevVerse: 'Previous Verse',
  nextVerse: 'Next Verse',
  savedVersesNotes: 'Saved Verses & Notes',
  savedVersesDesc2: 'Essential verses and audio recitations always at hand.',
  pauseRecitation: 'Pause',
  listenRecitation: 'Listen',
  digitalIslamicService: 'Digital Islamic Service',
  termsTitle: 'Terms of Use',
  privacyTitle: 'Privacy Policy',
  scrollHint: 'Scroll to explore',
};

const TR: LandingTranslationStrings = {
  ...EN,
  appName: 'Sakinward',
  heroHeadline: 'Günlük ibadet için gereken her şey',
  heroSubheadline: 'Astronomik namaz vakitleri, Kur\'an-ı Kerim, Kıble pusulası ve akıllı İslami asistan',
  openApp: 'Uygulamayı Aç',
  menu: 'Menü',
  theme: 'Tema',
  languageSelect: 'Dil Seçimi',
  languages70Plus: '70+ Dil',
  quranTitle: 'Kur\'an-ı Kerim',
  quranPlayerTitle: 'Kur\'an',
  savedVersesTitle: 'Kaydedilen Ayetler ve Notlar',
  savedVersesDesc: 'Önemli ayetler ve tilavetler her an elinizin altında.',
  verseTafsirToast: 'Ayet tefsiri ve açıklaması',
  mushafMode: 'Mushaf Modu',
  mushafDesc: 'Orijinal Arapça hat ve 70\'ten fazla dünya dilinde güvenilir meal.',
  qiblaTitle: 'Kıble Pusulası',
  qiblaExactDirection: 'Kıblenin Doğru Yönü',
  qiblaDistanceToMakkah: 'Mekke-i Mükerreme\'ye mesafe',
  qiblaAligned: 'Kıble Bulundu!',
  rotateTowardsKaaba: 'Cihazı Kıbleye doğru çevirin',
  sensorLive: 'Canlı sensör aktif',
  waitingSensor: 'Sensör bekleniyor...',
  calibrateSensor: 'Kalibrasyon',
  calibrateSensorModalTitle: 'Pusulayı Kalibre Et',
  calibrateSensorModalDesc: 'Sensör hassasiyetini yenilemek için telefonunuzla havada 8 (sonsuzluk ∞) hareketi yapın.',
  done: 'Anladım',
  sakinAiTitle: 'Sakin AI',
  sakinAiSubtitle: 'Akıllı İslami Sohbet ve Rehber',
  sakinAiDesc: 'Kur\'an ayetleri, hadisler ve ibadet fıkhı hakkında anında, güvenilir ve huzur verici cevaplar alın.',
  sakinAiPromptSamples: 'Örnek sorular',
  sakinAiChatButton: 'Sakin AI ile Tam Sohbet',
  sakinAiSampleQ1: 'Namaz vakitleri nasıl hesaplanır?',
  sakinAiSampleA1: 'Sakinward hassas GPS konumunuz ve güneşin astronomik açılarına göre hesaplar.',
  sakinAiSampleQ2: 'Kaza namazları nasıl kılınır?',
  sakinAiSampleA2: 'Kaza sayacında düzenli kayıt tutulup her vakit sonrası sırayla kılınması tavsiye edilir.',
  sakinAiSampleQ3: 'Zikir ve kalp huzuru',
  sakinAiSampleA3: '«Bilesiniz ki, kalpler ancak Allah\'ı anmakla huzur bulur» (Ra\'d Suresi, 28).',
  hijriTitle: 'Hicri Takvim',
  hijriSubtitle: 'İslami Takvim ve Mübarek Günler',
  hijriEventsCount: 'önemli gün',
  hijriYearSuffix: 'H.',
  eventsLabel: 'olay',
  viewFullCalendar: 'Tam Hicri Takvimi Aç',
  namesTitle: 'Esmaü\'l-Hüsna (99 İsim)',
  namesSubtitle: 'Allah\'ın güzel isimlerini interaktif olarak öğrenin',
  namesCardDesc: 'Yüce Allah\'ın 99 güzel ismini ve derin manalarını keşfedin.',
  footerAbout1: 'Sakinward, Müslümanların günlük ibadetlerini ve manevi gelişimini desteklemek için tasarlanmış küresel bir İslami platformdur.',
  footerAbout2: 'Tüm bilgiler güvenilir İslami kaynaklara dayanmaktadır.',
  footerAbout3: 'Orijinal içerikler fikri mülkiyet kanunları ile korunmaktadır.',
  footerAbout4: 'Sakinward tüm dünyadaki kullanıcılar için ücretsizdir.',
  termsOfUse: 'Kullanım Koşulları',
  privacyPolicy: 'Gizlilik Politikası',
  contactUs: 'Bize Ulaşın',
  telegramChannel: 'Telegram',
  telegramBot: 'Telegram Bot',
  instagram: 'Instagram',
  officialWebsite: 'Resmi Web Sitesi',
  allRightsReserved: 'Tüm hakları saklıdır.',
};

const AR: LandingTranslationStrings = {
  ...EN,
  appName: 'ساكن وورد',
  heroHeadline: 'كل ما تحتاجه للعبادة اليومية المباركة',
  heroSubheadline: 'مواقيت الصلاة الفلكية، القرآن الكريم، بوصلة القبلة والمساعد الإسلامي الذكي',
  openApp: 'فتح التطبيق',
  menu: 'القائمة',
  theme: 'المظهر',
  languageSelect: 'اختر اللغة',
  languages70Plus: '70+ لغة',
  gpsLocating: 'جارٍ التحديد...',
  gpsActive: 'نظام GPS نشط',
  autonomousLocation: 'الموقع التلقائي',
  refreshLocation: 'تحديث الموقع الجغرافي',
  nowPrayer: 'الوقت الحالي',
  nextPrayerLabel: 'الوقت المتبقي',
  listenAdhan: 'سماع الأذان',
  stopAdhan: 'إيقاف الأذان',
  adhanTitle: 'نداء الأذان',
  quranTitle: 'القرآن الكريم',
  quranPlayerTitle: 'القرآن',
  savedVersesTitle: 'الآيات المحفوظة والملاحظات',
  savedVersesDesc: 'الآيات الهامة والتلاوات الصوتية دائماً في متناول يدك.',
  verseTafsirToast: 'تفسير وبيان الآية الكريمة',
  mushafMode: 'وضع المصحف الشريف',
  mushafDesc: 'الخط العربي العثماني وترجمات معتمدة للمعاني بأكثر من 70 لغة عالمية.',
  verseCopySuccess: 'تم نسخ نص الآية الكريمة',
  verseBookmarkAdded: 'تمت الإضافة إلى الفواصل',
  verseBookmarkRemoved: 'تمت الإزالة من الفواصل',
  verseLiked: 'تمت الإضافة للمفضلة',
  verseUnliked: 'تمت الإزالة من المفضلة',
  audioPlaying: 'التلاوة تعمل',
  audioPaused: 'تم إيقاف التلاوة مؤقتاً',
  languagesCardTitle: '70+ لغة وترجمة معتمدة',
  languagesCardSubtitle: 'منصة إسلامية عالمية متعددة اللغات',
  languagesCardDesc: 'ترجمات معتمدة لمعاني القرآن الكريم لمختلف شعوب العالم.',
  qiblaTitle: 'بوصلة القبلة',
  qiblaExactDirection: 'الاتجاه الدقيق للقبلة المشرفة',
  qiblaDistanceToMakkah: 'المسافة إلى مكة المكرمة',
  qiblaAzimuthLabel: 'السمت',
  qiblaCalibrateTip: 'انقر لمعايرة مستشعر البوصلة',
  qiblaAligned: 'تم تحديد اتجاه القبلة!',
  rotateTowardsKaaba: 'وجّه هاتفك نحو الكعبة المشرفة',
  sensorLive: 'المستشعر المباشر نشط',
  waitingSensor: 'بانتظار المستشعر...',
  calibrateSensor: 'معايرة',
  calibrateSensorModalTitle: 'معايرة البوصلة',
  calibrateSensorModalDesc: 'لضبط المستشعر، حرك جهازك في الهواء برسم الرقم 8 (علامة اللانهاية ∞).',
  done: 'تم الفهم',
  compassNorth: 'ش',
  compassEast: 'ق',
  compassSouth: 'ج',
  compassWest: 'غ',
  sakinAiTitle: 'ساكن الذكي (Sakin AI)',
  sakinAiSubtitle: 'محادثة إسلامية ذكية وموثوقة',
  sakinAiDesc: 'إجابات فورية وهادئة مستندة إلى القرآن الكريم والسنة النبوية الشريفة.',
  sakinAiPromptSamples: 'نماذج الأسئلة',
  sakinAiChatButton: 'محادثة كاملة مع ساكن للذكاء الاصطناعي',
  sakinAiSampleQ1: 'كيف تُحسب مواقيت الصلاة؟',
  sakinAiSampleA1: 'يحسب تطبيق ساكن وورد المواقيت بدقة بناءً على إحداثيات موقعك وزوايا الشمس الفلكية.',
  sakinAiSampleQ2: 'كيفية قضاء الصلوات الفائتة',
  sakinAiSampleA2: 'يُستحب تدوين الفوائت بانتظام وقضاؤها تباعاً مع كل صلاة حاضرة.',
  sakinAiSampleQ3: 'فضل الذكر وطمأنينة القلب',
  sakinAiSampleA3: '«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ» (سورة الرعد، الآية 28).',
  hijriTitle: 'التقويم الهجري',
  hijriSubtitle: 'التقويم الإسلامي والمناسبات المباركة',
  hijriEventsCount: 'مناسبة مباركة',
  hijriYearSuffix: 'هـ',
  eventsLabel: 'مناسبة',
  viewFullCalendar: 'فتح التقويم الهجري كاملاً',
  namesTitle: 'أسماء الله الحسنى',
  namesSubtitle: 'تعلم أسماء الله الحسنى ومعانيها الجليلة',
  namesCardDesc: 'تعرف على الأسماء الحسنى ومعانيها العظيمة التي تزيد الإيمان.',
  footerAbout1: 'ساكن وورد منصة رقمية إسلامية عالمية لدعم العبادة والسكينة الروحية.',
  footerAbout2: 'جميع البيانات مستندة إلى مصادر ومراجع إسلامية موثوقة.',
  footerAbout3: 'جميع المواد والتصاميم محمية بموجب قوانين الملكية الفكرية.',
  footerAbout4: 'تطبيق ساكن وورد مجاني ومتاح لجميع المسلمين حول العالم.',
  termsOfUse: 'شروط الاستخدام',
  privacyPolicy: 'سياسة الخصوصية',
  contactUs: 'اتصل بنا',
  telegramChannel: 'تيليجرام',
  telegramBot: 'بوت تيليجرام',
  instagram: 'إنستغرام',
  officialWebsite: 'الموقع الرسمي',
  allRightsReserved: 'جميع الحقوق محفوظة.',
};

const ID: LandingTranslationStrings = {
  ...EN,
  appName: 'Sakinward',
  heroHeadline: 'Semua yang Anda butuhkan untuk ibadah harian',
  heroSubheadline: 'Jadwal sholat astronomis, Al-Qur\'an, kompas Kiblat, dan asisten Islam cerdas',
  openApp: 'Buka Aplikasi',
  menu: 'Menu',
  theme: 'Tema',
  languageSelect: 'Pilih Bahasa',
  languages70Plus: '70+ Bahasa',
  quranTitle: 'Al-Qur\'an Al-Karim',
  quranPlayerTitle: 'Al-Qur\'an',
  mushafMode: 'Mode Mushaf',
  qiblaTitle: 'Kompas Kiblat',
  qiblaExactDirection: 'Arah Kiblat Tepat',
  qiblaDistanceToMakkah: 'Jarak ke Makkah Al-Mukarramah',
  qiblaAligned: 'Arah Kiblat Ditemukan!',
  rotateTowardsKaaba: 'Arahkan perangkat ke Ka\'bah',
  sakinAiTitle: 'Sakin AI',
  sakinAiSubtitle: 'Percakapan Islami Pintar & Menenangkan',
  sakinAiDesc: 'Dapatkan jawaban terpercaya dan tenang seputar ayat Al-Qur\'an, Hadits, dan fiqih ibadah.',
  sakinAiPromptSamples: 'Contoh pertanyaan',
  sakinAiChatButton: 'Percakapan Lengkap dengan Sakin AI',
  sakinAiSampleQ1: 'Bagaimana jadwal sholat dihitung?',
  sakinAiSampleA1: 'Sakinward menghitung waktu sholat secara astronomis berdasarkan koordinat GPS presisi Anda.',
  sakinAiSampleQ2: 'Tata cara qadha sholat',
  sakinAiSampleA2: 'Disarankan mencatat sholat yang terlewat dan menggantinya secara konsisten.',
  sakinAiSampleQ3: 'Keutamaan dzikir dan ketenangan hati',
  sakinAiSampleA3: '«Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram» (QS Ar-Ra\'d: 28).',
  hijriTitle: 'Kalender Hijriah',
  hijriSubtitle: 'Penanggalan Islam & Hari-Hari Berkah',
  namesTitle: '99 Asmaul Husna',
  termsOfUse: 'Syarat Penggunaan',
  privacyPolicy: 'Kebijakan Privasi',
  contactUs: 'Hubungi Kami',
  telegramChannel: 'Telegram',
  telegramBot: 'Telegram Bot',
  instagram: 'Instagram',
  officialWebsite: 'Situs Resmi',
  allRightsReserved: 'Hak cipta dilindungi undang-undang.',
};

const FA: LandingTranslationStrings = {
  ...EN,
  appName: 'ساکن‌ورد',
  heroHeadline: 'تمام ملزومات عبادت و آرامش روزانه',
  heroSubheadline: 'اوقات شرعی دقیق، قرآن کریم، قبله‌نمای هوشمند و دستیار اسلامی',
  openApp: 'ورود به برنامه',
  menu: 'منو',
  theme: 'حالت نمایش',
  languageSelect: 'انتخاب زبان',
  languages70Plus: '۷۰+ زبان',
  quranTitle: 'قرآن کریم',
  quranPlayerTitle: 'قرآن',
  mushafMode: 'حالت مصحف',
  qiblaTitle: 'قبله‌نما',
  qiblaExactDirection: 'جهت دقیق قبله',
  qiblaDistanceToMakkah: 'فاصله تا مکه مکرمه',
  qiblaAligned: 'جهت قبله مشخص شد!',
  sakinAiTitle: 'ساکن هوشمند (Sakin AI)',
  sakinAiSubtitle: 'گفتگوی آرامش‌بخش و معتبر اسلامی',
  sakinAiDesc: 'پاسخ‌های آرام و مستند به آیات قرآن، احادیث و احکام عبادات.',
  sakinAiPromptSamples: 'نمونه پرسش‌ها',
  sakinAiChatButton: 'گفتگوی کامل با Sakin AI',
  sakinAiSampleQ1: 'اوقات شرعی چگونه محاسبه می‌شود؟',
  sakinAiSampleA1: 'ساکن‌ورد با اتکا به موقعیت مکانی GPS و زاویه خورشید، اوقات را دقیقه به دقیقه محاسبه می‌کند.',
  sakinAiSampleQ2: 'احکام قضای نماز',
  sakinAiSampleA2: 'پیشنهاد می‌شود نمازهای قضا را در ثبت‌کننده برنامه ثبت و به تدریج ادا فرمایید.',
  sakinAiSampleQ3: 'فضیلت ذکر و آرامش قلب',
  sakinAiSampleA3: '«آگاه باشید که با یاد خدا دل‌ها آرام می‌گیرد» (سوره رعد، آیه ۲۸).',
  hijriTitle: 'تقویم هجری قمری',
  namesTitle: 'اسماء الحسنی (۹۹ نام خدا)',
  termsOfUse: 'شرایط استفاده',
  privacyPolicy: 'حریم خصوصی',
  contactUs: 'تماس با ما',
  telegramChannel: 'تلگرام',
  telegramBot: 'ربات تلگرام',
  instagram: 'اینستاگرام',
  officialWebsite: 'وب‌سایت رسمی',
  allRightsReserved: 'تمامی حقوق محفوظ است.',
};

const UR: LandingTranslationStrings = {
  ...EN,
  appName: 'ساکن ورڈ',
  heroHeadline: 'روزمرہ عبادت کے لیے تمام ضروری رہنمائی',
  heroSubheadline: 'فلکیاتی اوقاتِ نماز، قرآنِ کریم، قبلہ نما اور بااعتماد اسلامی معاون',
  openApp: 'ایپ کھولیں',
  menu: 'مینو',
  theme: 'تھیم',
  languageSelect: 'زبان کا انتخاب',
  languages70Plus: '70+ زبانیں',
  quranTitle: 'قرآنِ مجید',
  quranPlayerTitle: 'قرآن',
  mushafMode: 'مصحف موڈ',
  qiblaTitle: 'قبلہ رخ کمپاس',
  qiblaExactDirection: 'قبلہ کا درست رخ',
  qiblaDistanceToMakkah: 'مکہ مکرمہ کا فاصلہ',
  qiblaAligned: 'قبلہ کا رخ مل گیا!',
  sakinAiTitle: 'ساکن اے آئی (Sakin AI)',
  sakinAiSubtitle: 'ذہین اسلامی مکالمہ و رہنمائی',
  sakinAiDesc: 'قرآنی آیات، احادیث اور فقہی مسائل پر مستند اور پرسکون رہنمائی حاصل کریں۔',
  sakinAiPromptSamples: 'نمونہ سوالات',
  sakinAiChatButton: 'Sakin AI سے مکمل گفتگو',
  sakinAiSampleQ1: 'نماز کے اوقات کیسے شمار ہوتے ہیں؟',
  sakinAiSampleA1: 'ساکن ورڈ آپ کی درست جی پی ایس لوکیشن اور سورج کے فلکیاتی زاویوں سے حساب کرتا ہے۔',
  sakinAiSampleQ2: 'قضا نمازوں کی ادائیگی کا طریقہ',
  sakinAiSampleA2: 'قضا نمازوں کا باقاعدہ حساب رکھ کر ہر نماز کے بعد ادا کرنے کی ترغیب دی جاتی ہے۔',
  sakinAiSampleQ3: 'ذکر اور دل کا سکون',
  sakinAiSampleA3: '«خبردار! اللہ کے ذکر سے ہی دلوں کو اطمینان نصیب ہوتا ہے» (سورۃ الرعد: 28)۔',
  hijriTitle: 'ہجری کیلنڈر',
  namesTitle: 'اللہ تعالیٰ کے 99 بابرکت نام',
  termsOfUse: 'استعمال کی شرائط',
  privacyPolicy: 'رازداری کی پالیسی',
  contactUs: 'ہم سے رابطہ کریں',
  telegramChannel: 'ٹیلی گرام',
  telegramBot: 'ٹیلی گرام بوٹ',
  instagram: 'انسٹاگرام',
  officialWebsite: 'سرکاری ویب سائٹ',
  allRightsReserved: 'جملہ حقوق محفوظ ہیں۔',
};

const KK: LandingTranslationStrings = {
  ...UZ,
  appName: 'Sakinward',
  heroHeadline: 'Күнделікті құлшылық үшін барлық қажеттіліктер',
  heroSubheadline: 'Астрономиялық намаз уақыттары, Қасиетті Құран, Құбыла компасы және ақылды ислами көмекші',
  openApp: 'Қосымшаны ашу',
  menu: 'Мәзір',
  theme: 'Тақырып',
  languageSelect: 'Тіл таңдау',
  languages70Plus: '70+ тіл',
  quranTitle: 'Қасиетті Құран',
  quranPlayerTitle: 'Құран',
  savedVersesTitle: 'Сақталған аяттар мен жазбалар',
  mushafMode: 'Мұсхаф режимі',
  qiblaTitle: 'Құбыла компасы',
  qiblaExactDirection: 'Құбыланың дәл бағыты',
  qiblaDistanceToMakkah: 'Меккеге дейінгі қашықтық',
  qiblaAligned: 'Құбыла бағыты табылды!',
  rotateTowardsKaaba: 'Құрылғыны Қағбаға қарай бағыттаңыз',
  sakinAiTitle: 'Sakin AI',
  sakinAiSubtitle: 'Ақылды Ислами Сұхбаттас',
  sakinAiDesc: 'Құран аяттары, хадистер мен құлшылық ережелері бойынша жедел және сенімді жауаптар.',
  sakinAiPromptSamples: 'Үлгі сұрақтар',
  sakinAiChatButton: 'Sakin AI-мен толық сұхбат',
  sakinAiSampleQ1: 'Намаз уақыттары қалай есептеледі?',
  sakinAiSampleA1: 'Sakinward нақты GPS координаталарыңыз бен күннің астрономиялық бұрыштарына сүйенеді.',
  sakinAiSampleQ2: 'Қаза намаздарын өтеу тәртібі',
  sakinAiSampleA2: 'Қаза есептегішінде жүйелі белгілеп, парыз намаздарынан соң өтеп отыру ұсынылады.',
  sakinAiSampleQ3: 'Зікір және жүрек тыныштығы',
  sakinAiSampleA3: '«Естеріңде болсын, Алланы еске алумен жүректер орнығады» (Рағыд сүресі, 28-аят).',
  hijriTitle: 'Хижри күнтізбесі',
  namesTitle: 'Алланың 99 көркем есімі',
  termsOfUse: 'Пайдалану шарттары',
  privacyPolicy: 'Құпиялылық саясаты',
  contactUs: 'Байланыс',
  telegramChannel: 'Telegram',
  telegramBot: 'Telegram Bot',
  instagram: 'Instagram',
  officialWebsite: 'Ресми веб-сайт',
  allRightsReserved: 'Барлық құқықтар қорғалған.',
};

const KY: LandingTranslationStrings = {
  ...KK,
  heroHeadline: 'Күнүмдүк ибадат үчүн керектүү бардык нерсе',
  heroSubheadline: 'Астрономиялык намаз убактылары, Ыйык Куран, Кыбыла компасы жана акылдуу ислам жардамчысы',
  openApp: 'Тиркемени ачуу',
  quranTitle: 'Ыйык Куран',
  qiblaTitle: 'Кыбыла компасы',
  sakinAiSubtitle: 'Акылдуу Исламий Маектеш',
  sakinAiChatButton: 'Sakin AI менен толук маектешүү',
  hijriTitle: 'Хижрий календарь',
  namesTitle: 'Аллахтын 99 Көркөм Ысымы',
  officialWebsite: 'Расмий веб-сайт',
};

const TG: LandingTranslationStrings = {
  ...UZ,
  heroHeadline: 'Ҳама чизи зарурӣ барои ибодати ҳаррӯза',
  heroSubheadline: 'Вақтҳои намоз, Қуръони Карим, қутбнамои Қибла ва ёвари ҳушманди исломӣ',
  openApp: 'Кушодани барнома',
  quranTitle: 'Қуръони Карим',
  qiblaTitle: 'Қутбнамои Қибла',
  sakinAiSubtitle: 'Ҳамсӯҳбати ҳушманди исломӣ',
  sakinAiChatButton: 'Сӯҳбати пурра бо Sakin AI',
  hijriTitle: 'Тақвими Ҳиҷрӣ',
  namesTitle: '99 Номи зебои Аллоҳ',
  officialWebsite: 'Вебсайти расмӣ',
};

const AZ: LandingTranslationStrings = {
  ...TR,
  appName: 'Sakinward',
  heroHeadline: 'Gündəlik ibadət üçün lazım olan hər şey',
  heroSubheadline: 'Astronomik namaz vaxtları, Qurani-Kərim, Qiblə kompassı və ağıllı İslami köməkçi',
  openApp: 'Tətbiqi açın',
  quranTitle: 'Qurani-Kərim',
  qiblaTitle: 'Qiblə Kompassı',
  sakinAiSubtitle: 'Ağıllı İslami Həmsöhbət',
  sakinAiChatButton: 'Sakin AI ilə Tam Söhbət',
  hijriTitle: 'Hicri Təqvimi',
  namesTitle: 'Allahın 99 Gözəl Adı',
  officialWebsite: 'Rəsmi Veb-sayt',
};

const FR: LandingTranslationStrings = {
  ...EN,
  appName: 'Sakinward',
  heroHeadline: 'Tout le nécessaire pour votre adoration quotidienne',
  heroSubheadline: 'Horaires de prière astronomiques, Saint Coran, boussole Qibla et assistant islamique intelligent',
  openApp: 'Ouvrir l\'application',
  menu: 'Menu',
  theme: 'Thème',
  languageSelect: 'Sélectionner la langue',
  languages70Plus: '70+ Langues',
  quranTitle: 'Le Noble Coran',
  quranPlayerTitle: 'Le Coran',
  mushafMode: 'Mode Moushaf',
  qiblaTitle: 'Boussole de la Qibla',
  qiblaExactDirection: 'Direction exacte de la Qibla',
  qiblaDistanceToMakkah: 'Distance vers La Mecque',
  qiblaAligned: 'Direction de la Qibla trouvée !',
  sakinAiTitle: 'Sakin AI',
  sakinAiSubtitle: 'Dialogue Islamique Intelligent',
  sakinAiDesc: 'Obtenez des réponses instantanées, sereines et fondées sur le Coran, les Hadiths et la jurisprudence.',
  sakinAiPromptSamples: 'Exemples de questions',
  sakinAiChatButton: 'Discussion complète avec Sakin AI',
  sakinAiSampleQ1: 'Comment les heures de prière sont-elles calculées ?',
  sakinAiSampleA1: 'Sakinward calcule les heures avec précision selon vos coordonnées GPS et les angles astronomiques solaires.',
  sakinAiSampleQ2: 'Règles pour rattraper les prières manquées',
  sakinAiSampleA2: 'Il est conseillé de tenir un registre régulier et d\'accomplir les prières manquées avec assiduité.',
  sakinAiSampleQ3: 'Les vertus du rappel d\'Allah et la paix intérieure',
  sakinAiSampleA3: '«N\'est-ce point par l\'évocation d\'Allah que les cœurs se tranquillisent ?» (Sourate Ar-Ra\'d, 28).',
  hijriTitle: 'Calendrier Hégirien',
  namesTitle: 'Les 99 Beaux Noms d\'Allah',
  termsOfUse: 'Conditions d\'utilisation',
  privacyPolicy: 'Politique de confidentialité',
  contactUs: 'Contactez-nous',
  telegramChannel: 'Telegram',
  telegramBot: 'Telegram Bot',
  instagram: 'Instagram',
  officialWebsite: 'Site Officiel',
  allRightsReserved: 'Tous droits réservés.',
};

const DE: LandingTranslationStrings = {
  ...EN,
  appName: 'Sakinward',
  heroHeadline: 'Alles, was Sie für den täglichen Gottesdienst benötigen',
  heroSubheadline: 'Astronomische Gebetszeiten, Heiliger Koran, Qibla-Kompass & intelligenter islamischer Assistent',
  openApp: 'App öffnen',
  menu: 'Menü',
  theme: 'Design',
  languageSelect: 'Sprache wählen',
  languages70Plus: '70+ Sprachen',
  quranTitle: 'Der Edle Koran',
  qiblaTitle: 'Qibla-Kompass',
  sakinAiTitle: 'Sakin AI',
  sakinAiSubtitle: 'Intelligenter Islamischer Dialog',
  sakinAiDesc: 'Erhalten Sie fundierte, ruhige und präzise Antworten zu Koranversen, Hadithen und gottesdienstlicher Praxis.',
  sakinAiPromptSamples: 'Beispielfragen',
  sakinAiChatButton: 'Vollständiges Gespräch mit Sakin AI',
  sakinAiSampleQ1: 'Wie werden die Gebetszeiten berechnet?',
  sakinAiSampleA1: 'Sakinward berechnet die Zeiten anhand Ihrer genauen GPS-Koordinaten und wahrer Sonnenwinkel.',
  sakinAiSampleQ2: 'Regeln für verpasste Gebete',
  sakinAiSampleA2: 'Es wird empfohlen, verpasste Gebete zu protokollieren und systematisch nachzuholen.',
  sakinAiSampleQ3: 'Vorzüge des Gedenkens Allahs',
  sakinAiSampleA3: '«Wahrlich, im Gedenken Allahs finden die Herzen Ruhe» (Sure Ar-Ra\'d, 28).',
  hijriTitle: 'Hidschri-Kalender',
  namesTitle: 'Die 99 Schönen Namen Allahs',
  termsOfUse: 'Nutzungsbedingungen',
  privacyPolicy: 'Datenschutzrichtlinie',
  contactUs: 'Kontakt',
  telegramChannel: 'Telegram',
  telegramBot: 'Telegram Bot',
  instagram: 'Instagram',
  officialWebsite: 'Offizielle Webseite',
  allRightsReserved: 'Alle Rechte vorbehalten.',
};

const ES: LandingTranslationStrings = {
  ...EN,
  appName: 'Sakinward',
  heroHeadline: 'Todo lo necesario para la adoración diaria',
  heroSubheadline: 'Horarios astronómicos de oración, Sagrado Corán, brújula de Qibla y asistente islámico inteligente',
  openApp: 'Abrir la aplicación',
  quranTitle: 'El Noble Corán',
  qiblaTitle: 'Brújula de Qibla',
  sakinAiTitle: 'Sakin AI',
  sakinAiSubtitle: 'Diálogo Islámico Inteligente',
  sakinAiDesc: 'Respuestas serenas, inmediatas y fundamentadas sobre versículos coránicos, hadices y práctica de adoración.',
  sakinAiPromptSamples: 'Preguntas de ejemplo',
  sakinAiChatButton: 'Conversación completa con Sakin AI',
  sakinAiSampleQ1: '¿Cómo se calculan los horarios de oración?',
  sakinAiSampleA1: 'Sakinward calcula los tiempos con precisión utilizando sus coordenadas GPS y ángulos solares.',
  sakinAiSampleQ2: 'Guía para oraciones omitidas (Qaza)',
  sakinAiSampleA2: 'Se recomienda llevar un registro continuo y realizar las oraciones pendientes de manera regular.',
  sakinAiSampleQ3: 'Virtudes del recuerdo de Dios y la paz interior',
  sakinAiSampleA3: '«¿Acaso no es con el recuerdo de Dios como se sosiegan los corazones?» (Sura Ar-Ra\'d, 28).',
  hijriTitle: 'Calendario Hijri',
  namesTitle: 'Los 99 Nombres de Alá',
  termsOfUse: 'Términos de uso',
  privacyPolicy: 'Política de privacidad',
  contactUs: 'Contáctenos',
  telegramChannel: 'Telegram',
  telegramBot: 'Telegram Bot',
  instagram: 'Instagram',
  officialWebsite: 'Sitio Oficial',
  allRightsReserved: 'Todos los derechos reservados.',
};

export const LANDING_TRANSLATIONS: Record<string, LandingTranslationStrings> = {
  uz: UZ,
  ru: RU,
  en: EN,
  tr: TR,
  ar: AR,
  id: ID,
  fa: FA,
  ur: UR,
  kk: KK,
  ky: KY,
  tg: TG,
  az: AZ,
  fr: FR,
  de: DE,
  es: ES,
  ms: ID,
};

export function getLandingTranslation(lang: SupportedLanguage): LandingTranslationStrings {
  if (lang in LANDING_TRANSLATIONS) {
    return LANDING_TRANSLATIONS[lang];
  }
  // Central Asian fallbacks
  if (lang === 'tk') {
    return UZ;
  }
  if (lang === 'ps') {
    return FA;
  }
  if (lang === 'bn' || lang === 'hi') {
    return UR;
  }
  return EN;
}
