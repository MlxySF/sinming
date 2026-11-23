/* ==========================================================================
   WUSHU SPORT ACADEMY — SITE CONFIGURATION (Malaysia)
   --------------------------------------------------------------------------
   This is the ONLY file you normally need to edit for business details.
   All on-screen wording (English + Chinese) lives in src/i18n/en.js and
   src/i18n/zh.js.
   ========================================================================== */

export const ACADEMY = {
  name: 'Wushu Sport Academy',

  /* ------------------------------------------------------------------------
     ACADEMY LOGO
     ------------------------------------------------------------------------
     Leave '' to keep the built-in gold "武" seal.

     A) Use a link (easiest — the image must be a DIRECT image URL, https):
          logoUrl: 'https://your-site.com/logo.png',

     B) Use a file inside this project (recommended — fastest + no CORS):
          1. save your logo as   src/assets/logo.png
          2. add this at the very top of this file:
               import logo from './assets/logo.png';
          3. set:
               logoUrl: logo,

     C) Use a file in the public folder:
          1. save your logo as   public/logo.png
          2. set:
               logoUrl: import.meta.env.BASE_URL + 'logo.png',

     Tip: a square PNG with a transparent background, at least 200×200 px,
     looks best. Landscape logos also work — they are fitted inside the square.
     ------------------------------------------------------------------------ */
  logoUrl: 'https://wushusportacademy.com/cache/Wushu%20Sport%20Academy%20Circle%20Yellow.png',

  /* Second logo, shown on the RIGHT side of the header (next to the EN/中文
     switch). Paste any direct image link here — e.g. a partner, federation or
     school logo. Leave '' to hide it. */
  logoRightUrl: 'https://wushusportacademy.com/cache/Wushu%20Sport%20Academy%20Circle%20Yellow.png',

  email: 'admin@wushusportacademy.com',
  phone: '019-219 1688',
  whatsapp: '019-219 1688',
  address: 'No. 12, Jalan Ampang, 50450 Kuala Lumpur, Malaysia',
  // SSM / company registration number shown in the footer and the agreement.
  companyNo: '202301234567',
  contactPerson: 'Academy Admin',
};

/** 019-219 1688 → +60192191688 (for tel: links) */
export const telHref = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return `+60${digits.replace(/^0/, '')}`;
};

/* --------------------------------------------------------------------------
   GOOGLE APPS SCRIPT ENDPOINT
   Set VITE_SHEETS_ENDPOINT in your .env file (see .env.example).
   If it is empty the form runs in DEMO mode — nothing is sent or emailed.
   -------------------------------------------------------------------------- */
export const SHEETS_ENDPOINT = (import.meta.env.VITE_SHEETS_ENDPOINT || '').trim();

export const IS_DEMO_MODE = SHEETS_ENDPOINT === '';

/* Optional shared secret. Set VITE_FORM_TOKEN and the same SHARED_TOKEN in
   Code.gs to stop strangers from posting junk into your sheet. Leave both
   empty to disable the check. */
export const FORM_TOKEN = (import.meta.env.VITE_FORM_TOKEN || '').trim();

/* --------------------------------------------------------------------------
   BANK / PAYMENT DETAILS — update these with your real account.
   -------------------------------------------------------------------------- */
export const BANK = {
  bankName: 'Maybank',
  accountName: 'Wushu Sport Academy Sdn Bhd',
  accountNumber: '5123 4567 8901',
  duitnow: '019-219 1688',
  swift: 'MBBEMYKL',
};

/* --------------------------------------------------------------------------
   PAYMENT TERMS — one entry per term.
     id       must be unique
     term     term number shown to parents
     year     year of the term
     start / end  ISO dates (YYYY-MM-DD) — formatted per language automatically
     sessions how many classes are included
     price    fee in MYR (numbers only)
   Parents can tick as many terms as they like — the total is added up.
   -------------------------------------------------------------------------- */
export const PAYMENT_TERMS = [
  {
    id: 'term-1-2027',
    term: 1,
    year: 2027,
    start: '2027-01-04',
    end: '2027-03-28',
    sessions: 12,
    price: 240,
  },
  {
    id: 'term-2-2027',
    term: 2,
    year: 2027,
    start: '2027-04-05',
    end: '2027-06-27',
    sessions: 12,
    price: 240,
  },
  {
    id: 'term-3-2027',
    term: 3,
    year: 2027,
    start: '2027-07-12',
    end: '2027-09-26',
    sessions: 11,
    price: 220,
  },
  {
    id: 'term-4-2027',
    term: 4,
    year: 2027,
    start: '2027-10-04',
    end: '2027-12-19',
    sessions: 11,
    price: 220,
  },
];

export const CURRENCY = 'RM';

export const formatMoney = (amount) => {
  const value = Number(amount) || 0;
  const rounded = Math.round(value * 100) / 100;
  const hasCents = Math.abs(rounded % 1) > 0.0001;
  return `${CURRENCY}${rounded.toLocaleString('en-MY', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};
