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

  /* Second logo, shown in the header right beside the academy name — e.g. a
     partner, federation or school logo. Paste any direct image link here.
     Leave '' to hide it, or delete this line if you only need one logo. */
  logoRightUrl: 'https://wushusportacademy.com/cache/Subang%20Logo.png',

  /* Letterhead used at the top of the signed agreement PDF. Paste a direct link
     to a PNG/JPG (ideally ~1240 px wide, white background, with your logo and
     contact details). Leave '' to fall back to the built-in dark header band. */
  letterheadUrl: 'https://wushusportacademy.com/cache/WSP%20Letter.png',

  email: 'admin@wushusportacademy.com',
  phone: '019-219 1688',
  whatsapp: '019-219 1688',
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
   CLASS DETAILS — shown on step 1 (terms & conditions).
   Keep both languages side by side so nothing drifts out of sync.
   -------------------------------------------------------------------------- */
export const CLASS_DETAILS = {
  day: {
    en: 'Every Monday',
    zh: '每逢星期一',
  },
  time: {
    en: '7:00 pm – 9:00 pm',
    zh: '晚上 7:00 – 9:00',
  },
  venue: {
    en: 'SJK(C) Sin Ming',
    zh: 'SJK(C) 新明华小',
  },
};

/* --------------------------------------------------------------------------
   BANK / PAYMENT DETAILS — update these with your real account.
   -------------------------------------------------------------------------- */
export const BANK = {
  bankName: 'Maybank',
  accountName: 'Wushu Sport Academy Sdn Bhd',
  accountNumber: '5123 4567 8901',
  swift: 'MBBEMYKL',
};

/* --------------------------------------------------------------------------
   PAYMENT TERMS — one entry per term.
     id       must be unique
     term     term number shown to parents
     year     year of the term
     dates    YOUR OWN WORDS for the class dates, e.g. 'Jan 4, 11, 18, 25'
              — shown exactly as typed on the form, the PDF, the email and the
              Google Sheet. If you fill this in, start/end are ignored.
     datesZh  optional Chinese version of the same text (e.g. '1月4、11、18、25日')
     start / end  ISO dates (YYYY-MM-DD) — only used when dates is empty
     sessions how many classes are included (ignored when `dates` is filled in —
              the number of classes is then counted from your date list)
     price    fee in MYR (numbers only)
   Parents can tick as many terms as they like — the total is added up.
   -------------------------------------------------------------------------- */
export const PAYMENT_TERMS = [
  {
    id: 'term-1-2027',
    // Your own words for the class dates — type them however you like, e.g.
    //   dates: 'Jan 4, 11, 18, 25',
    //   datesZh: '1月4、11、18、25日',   // optional Chinese version
    dates: '',
    term: 1,
    year: 2027,
    start: '2027-01-04',
    end: '2027-03-28',
    sessions: 12,
    price: 240,
  },
  {
    id: 'term-2-2027',
    dates: '',
    term: 2,
    year: 2027,
    start: '2027-04-05',
    end: '2027-06-27',
    sessions: 12,
    price: 240,
  },
  {
    id: 'term-3-2027',
    dates: '',
    term: 3,
    year: 2027,
    start: '2027-07-12',
    end: '2027-09-26',
    sessions: 11,
    price: 220,
  },
  {
    id: 'term-4-2027',
    dates: '',
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
