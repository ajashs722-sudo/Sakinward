export interface DynamicBackgroundItem {
  id: string;
  name: {
    uz: string;
    en: string;
    ru: string;
  };
  category: 'nature' | 'night' | 'cozy' | 'shader' | 'holy';
  description: {
    uz: string;
    en: string;
  };
  desktop: {
    photo: string;
    video: string;
  };
  mobile: {
    photo: string;
    video: string;
  };
  isShader?: boolean;
}

export const DYNAMIC_BACKGROUNDS: DynamicBackgroundItem[] = [
  {
    id: 'default_shader',
    name: {
      uz: 'Jonli to‘lqinlar',
      en: 'Living Waves',
      ru: 'Живые волны',
    },
    category: 'shader',
    description: {
      uz: 'Interaktiv sokin nur to‘lqinlari',
      en: 'Interactive soothing ambient waves',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Shader/desktop-tablet/542271204_1787938994641880.jpg',
      video: '',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Shader/mobile-phone/899122596_1787938696795141.jpg',
      video: '',
    },
    isShader: true,
  },
  {
    id: 'mecca',
    name: {
      uz: 'Makka (Masjid al-Haram)',
      en: 'Mecca (Al-Haram)',
      ru: 'Мекка (Аль-Харам)',
    },
    category: 'holy',
    description: {
      uz: 'Muqaddas Ka‘ba va Masjid al-Haram sokinligi',
      en: 'Holy Kaaba and peaceful Makkah atmosphere',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Mecca-desktop-tablet/Photo/poster.jpg',
      video: 'https://sakinward.aluvantis.uz/Mecca-desktop-tablet/Video/video.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Mecca-mobile-phone/Photo/poster.jpg',
      video: 'https://sakinward.aluvantis.uz/Mecca-mobile-phone/Video/video.mp4',
    },
  },
  {
    id: 'winter',
    name: {
      uz: 'Qish nafasi',
      en: 'Winter Serenity',
      ru: 'Зимняя безмятежность',
    },
    category: 'nature',
    description: {
      uz: 'Oppoq qor yog‘ishi va sokin qish manzarasi',
      en: 'Soft falling snowflakes and winter tranquility',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Winter-desktop-tablet/Photo/poster.jpg',
      video: 'https://sakinward.aluvantis.uz/Winter-desktop-tablet/Video/video.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Winter-mobile-phone/Photo/poster.jpg',
      video: 'https://sakinward.aluvantis.uz/Winter-mobile-phone/Video/video.mp4',
    },
  },
  {
    id: 'suburb',
    name: {
      uz: 'Shahar chekkasi',
      en: 'Peaceful Suburb',
      ru: 'Пригородная тишина',
    },
    category: 'cozy',
    description: {
      uz: 'Oqshomgi sokin shahar va ko‘cha manzarasi',
      en: 'Quiet twilight street and peaceful neighborhood',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Suburb-desktop-tablet/Photo/poster.jpg',
      video: 'https://sakinward.aluvantis.uz/Suburb-desktop-tablet/Video/video.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Subrub-mobile-phone/Photo/poster.jpg',
      video: 'https://sakinward.aluvantis.uz/Subrub-mobile-phone/Video/video.mp4',
    },
  },
  {
    id: 'night',
    name: {
      uz: 'Tungi osmon',
      en: 'Night Sky',
      ru: 'Ночное небо',
    },
    category: 'night',
    description: {
      uz: 'Yulduzli va sokin tun manzarasi',
      en: 'Serene star-lit evening sky',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Night-desktop-tablet/Photo/454166289_1787853517699642.jpg',
      video: 'https://sakinward.aluvantis.uz/Night-desktop-tablet/Video/55894395_1787856282558706.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Night-mobile/Photo/280235381_1787853515105365.jpg',
      video: 'https://sakinward.aluvantis.uz/Night-mobile/Video/814953554_1787856279705249.mp4',
    },
  },
  {
    id: 'river',
    name: {
      uz: 'Sokin daryo',
      en: 'Peaceful River',
      ru: 'Спокойная река',
    },
    category: 'nature',
    description: {
      uz: 'Oqayotgan musaffo suv va daryo nafasi',
      en: 'Flowing crystal clear water streams',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/River-desktop-tablet/Photo/321670435_1787853508769452.jpg',
      video: 'https://sakinward.aluvantis.uz/River-desktop-tablet/Video/247812110_1787856275002325.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/River-mobile/Photo/293880783_1787853507821814.jpg',
      video: 'https://sakinward.aluvantis.uz/River-mobile/Video/887197495_1787856265138355.mp4',
    },
  },
  {
    id: 'rain',
    name: {
      uz: 'Yomg‘ir nafasi',
      en: 'Gentle Rain',
      ru: 'Тихий дождь',
    },
    category: 'nature',
    description: {
      uz: 'Yomg‘ir tomchilari va sokinlik',
      en: 'Soothing rain droplets falling softly',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Rain-desktop-tablet/Photo/118419858_1787853506827655.jpg',
      video: 'https://sakinward.aluvantis.uz/Rain-desktop-tablet/Video/719470995_1787856248555240.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Rain-mobile-phone/Photo/255543307_1787853505276764.jpg',
      video: 'https://sakinward.aluvantis.uz/Rain-mobile-phone/Video/1003353506_1787856240611017.mp4',
    },
  },
  {
    id: 'bird',
    name: {
      uz: 'Qushlar jilosi',
      en: 'Bird Sanctuary',
      ru: 'Птичий сад',
    },
    category: 'nature',
    description: {
      uz: 'Yashil bog‘dagi erkin qushlar parvozi',
      en: 'Vibrant green trees with flying birds',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Bird-desktop-tablet/Photo/310222688_1787853510517162.jpg',
      video: 'https://sakinward.aluvantis.uz/Bird-desktop-tablet/Video/1010786021_1787856263422318.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Bird-mobile/Photo/717428490_1787853512568693.jpg',
      video: 'https://sakinward.aluvantis.uz/Bird-mobile/Video/122300609_1787856258183799.mp4',
    },
  },
  {
    id: 'wave',
    name: {
      uz: 'Dengiz to‘lqini',
      en: 'Ocean Waves',
      ru: 'Морские волны',
    },
    category: 'nature',
    description: {
      uz: 'Moviy ummon va qirg‘oq to‘lqinlari',
      en: 'Rhythmic oceanic tides and blue waters',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Wawe-desktop-tablet/Photo/1033487806_1787853523715604.jpg',
      video: 'https://sakinward.aluvantis.uz/Wawe-desktop-tablet/Video/1004195069_1787856430903163.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Wawe-mobile/Photo/978988034_1787853520494154.jpg',
      video: 'https://sakinward.aluvantis.uz/Wawe-mobile/Video/760122833_1787856427441580.mp4',
    },
  },
  {
    id: 'wind',
    name: {
      uz: 'Mayin shamol',
      en: 'Whispering Wind',
      ru: 'Шепот ветра',
    },
    category: 'nature',
    description: {
      uz: 'Tabiatdagi yel va yaproqlar harakati',
      en: 'Rustling leaves and soothing breeze',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Wind-desktop-tablet/Photo/380025295_1787853513321086.jpg',
      video: 'https://sakinward.aluvantis.uz/Wind-desktop-tablet/Video/684200775_1787856285645346.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Wind-mobile/Photo/57810578_1787853511448572.jpg',
      video: 'https://sakinward.aluvantis.uz/Wind-mobile/Video/1008771409_1787856268394161.mp4',
    },
  },
  {
    id: 'cat',
    name: {
      uz: 'Sokin mushuk',
      en: 'Cozy Cat',
      ru: 'Уютный кот',
    },
    category: 'cozy',
    description: {
      uz: 'Uy shinamligi va sokin mushukcha',
      en: 'Warm indoor ambiance with a peaceful cat',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Cat-desktop-tablet/Photo/158630081_1787853524502170.jpg',
      video: 'https://sakinward.aluvantis.uz/Cat-desktop-tablet/Video/338678335_1787856420947153.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Cat-mobile/Photo/661411944_1787853522416063.jpg',
      video: 'https://sakinward.aluvantis.uz/Cat-mobile/Video/13269300_1787856417929820.mp4',
    },
  },
  {
    id: 'fire',
    name: {
      uz: 'Olov tafti',
      en: 'Campfire Glow',
      ru: 'Пламя костра',
    },
    category: 'cozy',
    description: {
      uz: 'Iliq olov uchqunlari va o‘choq tafti',
      en: 'Mesmerizing fire embers and warmth',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Fire-desktop-tablet/Photo/653242407_1787853521615644.jpg',
      video: 'https://sakinward.aluvantis.uz/Fire-desktop-tablet/Video/714906603_1787856441817750.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Fire-mobile/Photo/131349748_1787853519862191.jpg',
      video: 'https://sakinward.aluvantis.uz/Fire-mobile/Video/541147018_1787856435669879.mp4',
    },
  },
  {
    id: 'owl',
    name: {
      uz: 'Tungi boyqush',
      en: 'Night Owl',
      ru: 'Ночная сова',
    },
    category: 'night',
    description: {
      uz: 'Tungi sokin o‘rmon va boyqush nigohi',
      en: 'Mystical moonlit forest with an owl',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Owl-desktop-tablet/Photo/878314659_1787853527762568.jpg',
      video: 'https://sakinward.aluvantis.uz/Owl-desktop-tablet/Video/2598195_1787856470969551.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Owl-mobile/Photo/Photo/196775875_1787853525253411.jpg',
      video: 'https://sakinward.aluvantis.uz/Owl-mobile/Video/92137924_1787856446512101.mp4',
    },
  },
  {
    id: 'cricket',
    name: {
      uz: 'Oqshom chigirtkasi',
      en: 'Evening Crickets',
      ru: 'Вечерние сверчки',
    },
    category: 'night',
    description: {
      uz: 'Yozgi oqshom va dalalar siri',
      en: 'Dusk fields with serene cricket sounds',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Cricet-desktop-tablet/Photo/1059453771_1787853532355284.jpg',
      video: 'https://sakinward.aluvantis.uz/Cricet-desktop-tablet/Video/970986835_1787856501261130.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Cricet-mobile/Photo/80361037_1787853529321464.jpg',
      video: 'https://sakinward.aluvantis.uz/Cricet-mobile/Video/601331009_1787856486991393.mp4',
    },
  },
  {
    id: 'thunder',
    name: {
      uz: 'Momaqaldiroq',
      en: 'Thunderstorm',
      ru: 'Гроза',
    },
    category: 'nature',
    description: {
      uz: 'Momaqaldiroq nuri va kuchli yog‘ingarchilik',
      en: 'Distant lightning illuminating the dark sky',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Thunder-desktop-tablet/Photo/369146219_1787853518982236.jpg',
      video: 'https://sakinward.aluvantis.uz/Thunder-desktop-tablet/Video/204248728_1787856292700205.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Thunder-mobile/Photo/840203275_1787853516615703.jpg',
      video: 'https://sakinward.aluvantis.uz/Thunder-mobile/Video/564744590_1787856289545785.mp4',
    },
  },
  {
    id: 'train',
    name: {
      uz: 'Tungi poyezd',
      en: 'Night Train',
      ru: 'Ночной поезд',
    },
    category: 'cozy',
    description: {
      uz: 'Yomg‘irli yo‘lda ketayotgan poyezd',
      en: 'Scenic railway traveling through the rain',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Train-desktop-tablet/Photo/650379620_1787853533103339.jpg',
      video: 'https://sakinward.aluvantis.uz/Train-desktop-tablet/Video/616915150_1787856397458897.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Train-mobile/Photo/794359669_1787853530664421.jpg',
      video: 'https://sakinward.aluvantis.uz/Train-mobile/Video/174962370_1787856389383381.mp4',
    },
  },
  {
    id: 'whale',
    name: {
      uz: 'Chuqur ummon',
      en: 'Deep Ocean Whale',
      ru: 'Глубокий океан',
    },
    category: 'nature',
    description: {
      uz: 'Ulkan kit va sirli dengiz tubi',
      en: 'Majestic whale gliding in deep waters',
    },
    desktop: {
      photo: 'https://sakinward.aluvantis.uz/Whale-desktop-tablet/Photo/349251283_1787853528293243.jpg',
      video: 'https://sakinward.aluvantis.uz/Whale-desktop-tablet/Video/528600197_1787856411889081.mp4',
    },
    mobile: {
      photo: 'https://sakinward.aluvantis.uz/Whale-mobile/Photo/111504870_1787853527148349.jpg',
      video: 'https://sakinward.aluvantis.uz/Whale-mobile/Video/389872264_1787856409092281.mp4',
    },
  },
];

export const DEFAULT_BACKGROUND_ID = 'mecca';

export function getBackgroundById(id: string): DynamicBackgroundItem {
  if (id === 'shader') {
    return DYNAMIC_BACKGROUNDS.find((bg) => bg.id === 'default_shader') || DYNAMIC_BACKGROUNDS[0];
  }
  return DYNAMIC_BACKGROUNDS.find((bg) => bg.id === id) || DYNAMIC_BACKGROUNDS.find((bg) => bg.id === 'mecca') || DYNAMIC_BACKGROUNDS[0];
}
