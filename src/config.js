/* ==========================================================================
   WUSHU SPORT ACADEMY — SITE CONFIGURATION
   --------------------------------------------------------------------------
   This is the ONLY file you normally need to edit.
   Change the academy details, the bank account and the term fees below.
   ========================================================================== */

export const ACADEMY = {
  name: 'Wushu Sport Academy',
  tagline: 'Train the body. Forge the spirit.',
  email: 'admin@wushusportacademy.com',
  phone: '+65 8123 4567',
  whatsapp: '+6581234567',
  address: '12 Sin Ming Lane, #04-08, Singapore 573968',
  uen: '202312345A',
  // Shown in the "need help?" boxes and in the agreement PDF.
  contactPerson: 'Academy Admin',
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
  bankName: 'DBS Bank (Singapore)',
  accountName: 'Wushu Sport Academy Pte Ltd',
  accountNumber: '012-345678-9',
  paynow: 'UEN 202312345A',
  swift: 'DBSSSGSG',
  // Free-text instruction shown above the receipt upload.
  instructions:
    'Please transfer the total amount due, then upload a clear screenshot or photo of the transaction receipt below. Registration is only confirmed once our admin has verified the payment.',
};

/* --------------------------------------------------------------------------
   PAYMENT TERMS — one entry per term.
     id      must be unique
     label   short name shown on the card
     period  the dates covered by the term
     sessions how many classes are included
     price   fee in SGD (numbers only)
   Parents can tick as many terms as they like — the total is added up.
   -------------------------------------------------------------------------- */
export const PAYMENT_TERMS = [
  {
    id: 'term-1-2027',
    label: 'Term 1 · 2027',
    period: '4 Jan – 28 Mar 2027',
    sessions: 12,
    price: 240,
  },
  {
    id: 'term-2-2027',
    label: 'Term 2 · 2027',
    period: '5 Apr – 27 Jun 2027',
    sessions: 12,
    price: 240,
  },
  {
    id: 'term-3-2027',
    label: 'Term 3 · 2027',
    period: '12 Jul – 26 Sep 2027',
    sessions: 11,
    price: 220,
  },
  {
    id: 'term-4-2027',
    label: 'Term 4 · 2027',
    period: '4 Oct – 19 Dec 2027',
    sessions: 11,
    price: 220,
  },
];

export const CURRENCY = 'S$';

export const formatMoney = (amount) => {
  const value = Number(amount) || 0;
  const rounded = Math.round(value * 100) / 100;
  const hasCents = Math.abs(rounded % 1) > 0.0001;
  return `${CURRENCY}${rounded.toLocaleString('en-SG', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

/* --------------------------------------------------------------------------
   TERMS & CONDITIONS
   Each item is shown in a numbered list on step 1 and reproduced word-for-word
   inside the signed agreement PDF.
   -------------------------------------------------------------------------- */
export const AGREEMENT_TERMS = [
  {
    title: 'Enrolment & monthly fees',
    body:
      'By registering, the parent / guardian agrees to enrol their child in Wushu Sport Academy classes and accepts responsibility for paying the class fees for every month of the selected term(s), on or before the first lesson of each month. Fees are non-transferable and are only refundable at the Academy’s discretion.',
  },
  {
    title: 'Schedule adjustments',
    body:
      'Wushu Sport Academy reserves the right to make adjustments to the class schedule, venue, coach or timing at short notice whenever there are competitions, performances, examinations, public holidays or other events falling on the same day. Parents will be informed as early as possible through the registered contact details.',
  },
  {
    title: 'Replacement classes',
    body:
      'Replacement classes are provided only when the Academy cancels a session. Parents may not cancel classes on their own. If the student cannot attend due to sickness or another valid reason, leave must be applied for with the admin and the coach in advance; unapproved absences will be recorded.',
  },
  {
    title: 'Accepted reasons for leave',
    body:
      'Only medical leave (sickness, supported by an MC where applicable), competitions or official school examinations are accepted for replacement classes. Personal holidays, family trips and other personal reasons are not accepted for replacements and no make-up class or refund will be provided.',
  },
  {
    title: 'Signature & consent',
    body:
      'The electronic signature provided in this form carries the same legal weight as a handwritten signature. The parent / guardian confirms that all information given is true and accurate, and consents to the Academy storing and using this information for enrolment, payment, safety and communication purposes.',
  },
];

/* --------------------------------------------------------------------------
   Landing page content (safe to edit)
   -------------------------------------------------------------------------- */
export const LANDING = {
  intake: '2027 Intake · Registration Open',
  headlineTop: 'Train the body.',
  headlineAccent: 'Forge the spirit.',
  subhead:
    'A modern Wushu programme for young athletes — discipline, precision and confidence, taught by national-level coaches. Secure your child’s place for the 2027 season in under four minutes.',
  stats: [
    { value: '12+', label: 'Coaches & assistants' },
    { value: '480+', label: 'Students trained' },
    { value: '38', label: 'Medals won in 2026' },
    { value: '4', label: 'Training halls' },
  ],
  highlights: [
    'National-level coaching team',
    'Small class ratios',
    'Competition & performance pathway',
  ],
};
