import { useEffect, useState } from 'react';

// Urdu localisation — foundation pass (chairman-approved). Covers the
// first-touch surfaces (navigation, auth story, home hero, trust banner,
// Rafa starters/tour titles); deep pages roll out next. The dictionary is
// deliberately tiny and typed so adding strings stays trivial.

export type Lang = 'en' | 'ur';
const LANG_KEY = 'halqa_lang';

const STRINGS: Record<string, { en: string; ur: string }> = {
  nav_home: { en: 'Dashboard', ur: 'ڈیش بورڈ' },
  nav_circles: { en: 'Circles', ur: 'کمیٹیاں' },
  nav_market: { en: 'Market', ur: 'بازار' },
  nav_terminal: { en: 'Terminal', ur: 'سرمایہ کاری' },
  nav_profile: { en: 'Profile', ur: 'پروفائل' },
  nav_vault: { en: 'Vault', ur: 'والٹ' },
  hero_greeting: { en: 'Assalam-o-Alaikum', ur: 'السلام علیکم' },
  hero_sub: { en: 'Your committees, obligations and growth—at a glance.', ur: 'آپ کی کمیٹیاں، واجبات اور منافع — ایک نظر میں۔' },
  hero_host: { en: 'Host a committee', ur: 'کمیٹی شروع کریں' },
  hero_savings: { en: 'Your recorded savings', ur: 'آپ کی درج شدہ بچت' },
  trust_title: { en: 'Record-only prototype', ur: 'صرف ریکارڈ رکھنے والا پروٹوٹائپ' },
  trust_body: { en: 'Halqa tracks external transfers and simulations. It does not currently hold or invest real money.', ur: 'حلقہ صرف ادائیگیوں کا ریکارڈ رکھتا ہے۔ فی الحال یہ اصل رقم نہ رکھتا ہے نہ لگاتا ہے۔' },
  streak: { en: 'Streak', ur: 'تسلسل' },
  everything_current: { en: 'Everything is current', ur: 'سب کچھ تازہ ہے' },
  updates_waiting: { en: 'updates waiting', ur: 'اطلاعات موجود ہیں' },
  rafa_hint: { en: "Hi! I'm Rafa — tap me if you need help 👋", ur: 'السلام علیکم! میں رافع ہوں — مدد کے لیے مجھے دبائیں 👋' },
};

export const t = (key: string, lang: Lang): string => STRINGS[key]?.[lang] ?? STRINGS[key]?.en ?? key;

// One shared language value: every mounted useLang() re-renders on switch.
// A per-component useState would leave sibling pages stuck in the old
// language until remount.
let current: Lang = (localStorage.getItem(LANG_KEY) as Lang) || 'en';
const listeners = new Set<(l: Lang) => void>();

const applyDocument = (l: Lang) => {
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ur' ? 'rtl' : 'ltr';
};
applyDocument(current);

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLocal] = useState<Lang>(current);
  useEffect(() => {
    listeners.add(setLocal);
    return () => { listeners.delete(setLocal); };
  }, []);
  const set = (l: Lang) => {
    current = l;
    localStorage.setItem(LANG_KEY, l);
    applyDocument(l);
    listeners.forEach((fn) => fn(l));
  };
  return [lang, set];
}
