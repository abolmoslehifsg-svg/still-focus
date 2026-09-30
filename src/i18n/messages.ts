/**
 * Internationalisation.
 *
 * Two locales only: English (default) and Persian. The dictionary is a flat
 * map of keys → strings. Persian strings are written in natural prose; the
 * layout flips to RTL via the `dir` attribute on <html>.
 */

export type Locale = 'en' | 'fa'

export interface LocaleMeta {
  id: Locale
  /** Short label shown on the language toggle. */
  label: string
  /** Full name, in its own script, for the document language. */
  name: string
  dir: 'ltr' | 'rtl'
}

export const LOCALES: Record<Locale, LocaleMeta> = {
  en: { id: 'en', label: 'FA', name: 'English', dir: 'ltr' },
  fa: { id: 'fa', label: 'EN', name: 'فارسی', dir: 'rtl' },
}

/** Keys that resolve to a plain string. */
export type StringKey = keyof typeof en

const en = {
  // Navigation
  'nav.focus': 'Focus',
  'nav.sounds': 'Sounds',
  'nav.about': 'About',
  'nav.progress': 'Progress',
  'nav.brand': 'Still',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',

  // Hero
  'hero.line1': 'ENTER YOUR FOCUS',
  'hero.line2': 'LEAVE THE NOISE',
  'hero.tagline': 'A quiet space to focus, breathe, and let the world fade away.',

  // Timer states
  'timer.ready': 'Ready',
  'timer.inFocus': 'In focus',
  'timer.paused': 'Paused',
  'timer.complete': 'Complete',
  'timer.start': 'Start session',
  'timer.pause': 'Pause',
  'timer.resume': 'Resume',
  'timer.startAgain': 'Start again',
  'timer.reset': 'Reset timer',
  'timer.min': 'min',
  'timer.customAria': 'Custom focus duration in minutes',
  'timer.ariaMinutes': '{minutes} minute focus session',

  // Goal
  'goal.placeholder': 'a goal, optional',
  'goal.aria': 'Optional focus goal',
  'goal.hint': 'a reward awaits at the end',
  'goal.label': 'Your goal',
  'timer.finishEarly': 'Finish early',

  // Completion bands
  'complete.60.title': 'Well done.',
  'complete.60.subtitle': 'Take a breath',
  'complete.30.title': 'That was real focus.',
  'complete.30.subtitle': 'Take a breath',
  'complete.15.title': 'Good session.',
  'complete.15.subtitle': 'Take a moment',
  'complete.5.title': 'Nice work.',
  'complete.5.subtitle': 'Every minute counts',
  'complete.0.title': 'You showed up.',
  'complete.0.subtitle': "That's where it starts",

  // Rewards — general
  'reward.general.0.title': 'You kept your word.',
  'reward.general.0.note': 'That is worth something',
  'reward.general.1.title': 'One promise, kept.',
  'reward.general.1.note': 'Build on it tomorrow',
  'reward.general.2.title': 'The noise lost today.',
  'reward.general.2.note': 'You did not',
  'reward.general.3.title': 'Present for the whole thing.',
  'reward.general.3.note': 'Rare, these days',
  'reward.general.4.title': 'Quietly, you showed up.',
  'reward.general.4.note': 'And finished',
  'reward.general.5.title': 'Time well spent.',
  'reward.general.5.note': 'Take a breath',
  'reward.general.6.title': 'That was real focus.',
  'reward.general.6.note': 'Protect it',
  'reward.general.7.title': 'Small win, real win.',
  'reward.general.7.note': 'Stack them up',

  // Rewards — study
  'reward.study.0.title': 'Knowledge earned.',
  'reward.study.0.note': 'Every page is now yours',
  'reward.study.1.title': 'Sharper than before.',
  'reward.study.1.note': 'That effort compounds',
  'reward.study.2.title': 'Well studied.',
  'reward.study.2.note': 'Rest is part of learning',

  // Rewards — code
  'reward.code.0.title': 'Shipped in silence.',
  'reward.code.0.note': 'The work speaks now',
  'reward.code.1.title': 'One less bug.',
  'reward.code.1.note': 'Momentum is a feature',
  'reward.code.2.title': 'Deep work, done.',
  'reward.code.2.note': 'Compile your thoughts',

  // Rewards — write
  'reward.write.0.title': 'Words well spent.',
  'reward.write.0.note': 'The page remembers',
  'reward.write.1.title': 'A voice, steady.',
  'reward.write.1.note': 'Keep the sentence close',
  'reward.write.2.title': 'Written, not wished.',
  'reward.write.2.note': 'That is the whole secret',

  // Rewards — read
  'reward.read.0.title': 'Quietly further.',
  'reward.read.0.note': 'Stories are now yours',
  'reward.read.1.title': 'One chapter closer.',
  'reward.read.1.note': 'Let it settle',

  // Rewards — meditate
  'reward.meditate.0.title': 'Stillness found.',
  'reward.meditate.0.note': 'Carry it with you',
  'reward.meditate.1.title': 'You arrived.',
  'reward.meditate.1.note': 'That is the practice',
  'reward.meditate.2.title': 'Calm, kept.',
  'reward.meditate.2.note': 'Return whenever you need',

  // Rewards — gym
  'reward.gym.0.title': 'Stronger today.',
  'reward.gym.0.note': 'Your body keeps the score',
  'reward.gym.1.title': 'Earned, not given.',
  'reward.gym.1.note': 'Hydrate and rest',
  'reward.gym.2.title': 'One rep at a time.',
  'reward.gym.2.note': 'Consistency wins',

  // Rewards — art
  'reward.art.0.title': 'Something exists now.',
  'reward.art.0.note': 'That was the point',
  'reward.art.1.title': 'Made, not planned.',
  'reward.art.1.note': 'Let it breathe',
  'reward.art.2.title': 'The blank page lost.',
  'reward.art.2.note': 'Courage, in colour',

  // Rewards — work
  'reward.work.0.title': 'The list just shrank.',
  'reward.work.0.note': 'Close the laptop fully',
  'reward.work.1.title': 'Handled.',
  'reward.work.1.note': 'Tomorrow will wait',
  'reward.work.2.title': 'Professional, quiet, done.',
  'reward.work.2.note': 'Take the win',

  // Sound panel
  'sounds.title': 'Sounds',
  'sounds.ambient': 'Ambient sound',
  'sounds.close': 'Close sound panel',
  'sounds.upload': 'Upload your own sound',
  'sounds.yourFile': 'Your file · local only',
  'sounds.loop': 'Loop',
  'sounds.playUploaded': 'Play uploaded track',
  'sounds.pauseUploaded': 'Pause uploaded track',
  'sounds.remove': 'Remove uploaded track',
  'sounds.mute': 'Mute ambient sound',
  'sounds.unmute': 'Unmute ambient sound',
  'sounds.volume': 'Ambient sound volume',
  'sounds.stop': 'Stop',
  'sounds.play': 'Play',
  'sounds.master': 'Master',
  'sounds.mixHint': 'Layer sounds — each has its own volume',
  'sounds.privacy': 'Your audio stays on your device.',
  'sounds.muteSound': 'Mute {name}',
  'sounds.unmuteSound': 'Unmute {name}',
  'sounds.soundVolume': '{name} volume',

  // Ambient sound names
  'sound.rain': 'Rain',
  'sound.fireplace': 'Fireplace',
  'sound.ocean': 'Ocean',
  'sound.forest': 'Forest',
  'sound.train': 'Train',
  'sound.cafe': 'Café',
  'sound.white-noise': 'White Noise',
  'sound.brown-noise': 'Brown Noise',

  // About
  'about.developedBy': 'developed by aboll',

  // Progress
  'progress.title': 'Progress',
  'progress.thisWeek': 'This week',
  'progress.today': 'Today',
  'progress.allTime': 'All time',
  'progress.sessions': 'sessions',
  'progress.session': 'session',
  'progress.dayStreak': 'day streak',
  'progress.days': 'days',
  'progress.empty': 'No sessions yet — your first one starts the count.',
  'progress.recent': 'Recent',
  'progress.viewAll': 'View all',
  'progress.less': 'Show less',
  'progress.clear': 'Clear history',
  'progress.clearConfirm': 'Clear all focus history? This cannot be undone.',
  'progress.gained': '+{time} focused',
  'progress.streakNow': '{count} day streak',
  'progress.streakNew': 'New streak — {count} day',
  'progress.streakExtended': '{count} day streak',
  'progress.untitled': 'Untitled focus',
  'progress.completedAria': 'Completed session',
  'progress.partialAria': 'Session ended early',
  'progress.incomplete': 'ended early',

  // Screen reader
  'sr.complete': 'Session complete. Take a breath.',
  'sr.running': 'Focus session running. {minutes} minutes remaining.',
  'sr.paused': 'Session paused.',
} as const

const fa: Record<StringKey, string> = {
  // Navigation
  'nav.focus': 'تمرکز',
  'nav.sounds': 'صداها',
  'nav.about': 'درباره',
  'nav.progress': 'پیشرفت',
  'nav.brand': 'استیل',
  'nav.openMenu': 'باز کردن منو',
  'nav.closeMenu': 'بستن منو',

  // Hero
  'hero.line1': 'به تمرکزت بیا',
  'hero.line2': 'همهمه‌ها رو رها کن',
  'hero.tagline': 'یه جای آرام برای تمرکز، نفس کشیدن، و رها کردن دنیا.',

  // Timer states
  'timer.ready': 'آماده',
  'timer.inFocus': 'در حال تمرکز',
  'timer.paused': 'متوقف',
  'timer.complete': 'تمام شد',
  'timer.start': 'شروع جلسه',
  'timer.pause': 'توقف',
  'timer.resume': 'ادامه',
  'timer.startAgain': 'دوباره شروع کن',
  'timer.reset': 'از نو',
  'timer.min': 'دقیقه',
  'timer.customAria': 'مدت زمان دلخواه به دقیقه',
  'timer.ariaMinutes': 'جلسه تمرکز {minutes} دقیقه‌ای',

  // Goal
  'goal.placeholder': 'یه هدف، اختیاری',
  'goal.aria': 'هدف اختیاری تمرکز',
  'goal.hint': 'یه پاداش تهش منتظرته',
  'goal.label': 'هدفت',
  'timer.finishEarly': 'تمامش کن',

  // Completion bands
  'complete.60.title': 'آفرین.',
  'complete.60.subtitle': 'یه نفس عمیق بکش',
  'complete.30.title': 'واقعاً تمرکز کردی.',
  'complete.30.subtitle': 'یه نفس عمیق بکش',
  'complete.15.title': 'جلسه خوبی بود.',
  'complete.15.subtitle': 'یه لحظه مکث کن',
  'complete.5.title': 'خوب بود.',
  'complete.5.subtitle': 'هر دقیقه‌اش مهمه',
  'complete.0.title': 'حاضری.',
  'complete.0.subtitle': 'همین، شروعِ کاره',

  // Rewards — general
  'reward.general.0.title': 'به قولت عمل کردی.',
  'reward.general.0.note': 'این ارزشش رو داره',
  'reward.general.1.title': 'یه قول، عمل شد.',
  'reward.general.1.note': 'فردا روش بساز',
  'reward.general.2.title': 'همهمه امروز باخت.',
  'reward.general.2.note': 'تو نه',
  'reward.general.3.title': 'تا آخرش حضور داشتی.',
  'reward.general.3.note': 'این روزا کم پیش میاد',
  'reward.general.4.title': 'در سکوت حاضر شدی.',
  'reward.general.4.note': 'و تمامش کردی',
  'reward.general.5.title': 'وقتِ خوبی بود.',
  'reward.general.5.note': 'یه نفس عمیق بکش',
  'reward.general.6.title': 'اون تمرکز واقعی بود.',
  'reward.general.6.note': 'حفظش کن',
  'reward.general.7.title': 'یه برد کوچک، اما واقعی.',
  'reward.general.7.note': 'رو هم بچینشون',

  // Rewards — study
  'reward.study.0.title': 'یاد گرفتی.',
  'reward.study.0.note': 'هر صفحه‌اش مال تو شد',
  'reward.study.1.title': 'تیزتر از قبل.',
  'reward.study.1.note': 'این تلاش انباشته میشه',
  'reward.study.2.title': 'خوب درس خوندی.',
  'reward.study.2.note': 'استراحت هم بخشی از یادگیری‌ست',

  // Rewards — code
  'reward.code.0.title': 'در سکوت ساختیش.',
  'reward.code.0.note': 'حالا کار خودش حرف می‌زنه',
  'reward.code.1.title': 'یه باگ کمتر.',
  'reward.code.1.note': 'حرکت، خودش یه ویژگیه',
  'reward.code.2.title': 'کارِ عمیق، تموم شد.',
  'reward.code.2.note': 'افکارت رو کامپایل کن',

  // Rewards — write
  'reward.write.0.title': 'کلمات خوب خرج شدن.',
  'reward.write.0.note': 'صفحه یادش می‌مونه',
  'reward.write.1.title': 'صدایی، استوار.',
  'reward.write.1.note': 'جمله رو نگه دار',
  'reward.write.2.title': 'نوشتیش، نه فقط آرزو.',
  'reward.write.2.note': 'راز کار همینیه',

  // Rewards — read
  'reward.read.0.title': 'آرام‌تر جلو رفتی.',
  'reward.read.0.note': 'قصه‌ها حالا مال توند',
  'reward.read.1.title': 'یه فصل نزدیک‌تر.',
  'reward.read.1.note': 'بذار ته‌نشین بشه',

  // Rewards — meditate
  'reward.meditate.0.title': 'آرامش رو پیدا کردی.',
  'reward.meditate.0.note': 'با خودت ببرش',
  'reward.meditate.1.title': 'رسیدی.',
  'reward.meditate.1.note': 'تمرین همینیه',
  'reward.meditate.2.title': 'آرامش، حفظ شد.',
  'reward.meditate.2.note': 'هر وقت خواستی برگرد',

  // Rewards — gym
  'reward.gym.0.title': 'امروز قوی‌تری.',
  'reward.gym.0.note': 'بدنت امتیازت رو نگه می‌داره',
  'reward.gym.1.title': 'به‌دست آوردی، نه هدیه.',
  'reward.gym.1.note': 'آب بنوش و استراحت کن',
  'reward.gym.2.title': 'یه تکرار در هر لحظه.',
  'reward.gym.2.note': 'استمرار می‌بره',

  // Rewards — art
  'reward.art.0.title': 'حالا چیزی وجود داره.',
  'reward.art.0.note': 'هدف همین بود',
  'reward.art.1.title': 'ساختیش، نه برنامه‌ریزی.',
  'reward.art.1.note': 'بذار نفس بکشه',
  'reward.art.2.title': 'صفحه‌ی خالی باخت.',
  'reward.art.2.note': 'شجاعت، با رنگ',

  // Rewards — work
  'reward.work.0.title': 'لیست کوچک‌تر شد.',
  'reward.work.0.note': 'لپ‌تاپ رو کامل ببند',
  'reward.work.1.title': 'انجام شد.',
  'reward.work.1.note': 'فردا صبر می‌کنه',
  'reward.work.2.title': 'حرفه‌ای، آرام، تموم.',
  'reward.work.2.note': 'این برد رو بگیر',

  // Sound panel
  'sounds.title': 'صداها',
  'sounds.ambient': 'صدای محیطی',
  'sounds.close': 'بستن پنل صدا',
  'sounds.upload': 'صدای خودت رو آپلود کن',
  'sounds.yourFile': 'فایل شما · فقط محلی',
  'sounds.loop': 'تکرار',
  'sounds.playUploaded': 'پخش فایل آپلود شده',
  'sounds.pauseUploaded': 'توقف فایل آپلود شده',
  'sounds.remove': 'حذف فایل آپلود شده',
  'sounds.mute': 'بی‌صدا کردن صدای محیطی',
  'sounds.unmute': 'باصدا کردن صدای محیطی',
  'sounds.volume': 'بلندی صدای محیطی',
  'sounds.stop': 'توقف',
  'sounds.play': 'پخش',
  'sounds.master': 'اصلی',
  'sounds.mixHint': 'صداها رو ترکیب کن — هر کدوم بلندی خودش رو داره',
  'sounds.privacy': 'صدای شما روی همون دستگاهت می‌مونه.',
  'sounds.muteSound': 'بی‌صدا کردن {name}',
  'sounds.unmuteSound': 'باصدا کردن {name}',
  'sounds.soundVolume': 'بلندی صدای {name}',

  // Ambient sound names
  'sound.rain': 'باران',
  'sound.fireplace': 'شومینه',
  'sound.ocean': 'اقیانوس',
  'sound.forest': 'جنگل',
  'sound.train': 'قطار',
  'sound.cafe': 'کافه',
  'sound.white-noise': 'نویز سفید',
  'sound.brown-noise': 'نویز قهوه‌ای',

  // About
  'about.developedBy': 'ساخته‌ی aboll',

  // Progress
  'progress.title': 'پیشرفت',
  'progress.thisWeek': 'این هفته',
  'progress.today': 'امروز',
  'progress.allTime': 'از اول',
  'progress.sessions': 'جلسه',
  'progress.session': 'جلسه',
  'progress.dayStreak': 'روز پشت سر هم',
  'progress.days': 'روز',
  'progress.empty': 'هنوز جلسه‌ای نیست — اولین جلسه‌ت شمارنده رو شروع می‌کنه.',
  'progress.recent': 'اخیر',
  'progress.viewAll': 'همه رو ببین',
  'progress.less': 'کمتر',
  'progress.clear': 'پاک کردن تاریخچه',
  'progress.clearConfirm': 'کل تاریخچه پاک بشه؟ دیگه برنمی‌گرده.',
  'progress.gained': '+{time} تمرکز',
  'progress.streakNow': '{count} روز پشت سر هم',
  'progress.streakNew': 'شروعِ زنجیره — {count} روز',
  'progress.streakExtended': '{count} روز پشت سر هم',
  'progress.untitled': 'تمرکز بدون عنوان',
  'progress.completedAria': 'جلسه کامل شد',
  'progress.partialAria': 'جلسه زودتر تموم شد',
  'progress.incomplete': 'زودتر تموم شد',

  // Screen reader
  'sr.complete': 'جلسه تمام شد. یک نفس عمیق بکش.',
  'sr.running': 'جلسه تمرکز در حال اجراست. {minutes} دقیقه باقی مانده.',
  'sr.paused': 'جلسه متوقف شد.',
}

export const dictionaries: Record<Locale, Record<StringKey, string>> = { en, fa }

/**
 * Translate a key. Supports {placeholder} interpolation.
 * Falls back to English, then to the raw key.
 */
export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const dict = dictionaries[locale] ?? dictionaries.en
  let str = dict[key as StringKey] ?? dictionaries.en[key as StringKey] ?? key

  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value))
    }
  }

  return str
}
