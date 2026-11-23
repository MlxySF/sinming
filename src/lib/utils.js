/* Small helpers shared across the form (Malaysian formats). */

export const cx = (...parts) => parts.filter(Boolean).join(' ');

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Reference like WSA-261123-4K7Q */
export function makeReference(date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `WSA-${yy}${mm}${dd}-${code}`;
}

export const isEmail = (value = '') =>
  /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(value).trim());

export const onlyDigits = (value = '') => String(value).replace(/[^\d]/g, '');

/* --------------------------------------------------------------------------
   MALAYSIAN PHONE NUMBERS — 012-345 6789 or 011-2345 6789
   -------------------------------------------------------------------------- */
export function formatMyPhone(raw = '') {
  const digits = onlyDigits(raw).slice(0, 11);
  if (digits.length <= 3) return digits;
  const prefix = digits.slice(0, 3);
  const rest = digits.slice(3);
  if (rest.length <= 3) return `${prefix}-${rest}`;
  if (rest.length <= 7) return `${prefix}-${rest.slice(0, 3)} ${rest.slice(3)}`;
  return `${prefix}-${rest.slice(0, 4)} ${rest.slice(4)}`;
}

export function isValidMyPhone(value = '') {
  const digits = onlyDigits(value);
  return digits.length >= 9 && digits.length <= 11 && digits.startsWith('0');
}

/** 019-219 1688 → +60192191688 */
export function phoneIntl(value = '') {
  const digits = onlyDigits(value).replace(/^0/, '');
  return digits ? `+60${digits}` : '';
}

/* --------------------------------------------------------------------------
   MALAYSIAN NRIC (MyKad) — YYMMDD-PB-###G, 12 digits
   -------------------------------------------------------------------------- */
export function formatMyIc(raw = '') {
  const digits = onlyDigits(raw).slice(0, 12);
  let out = digits.slice(0, 6);
  if (digits.length > 6) out += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) out += `-${digits.slice(8, 12)}`;
  return out;
}

export function isValidMyIc(value = '') {
  const digits = onlyDigits(value);
  if (digits.length !== 12) return false;
  const month = Number(digits.slice(2, 4));
  const day = Number(digits.slice(4, 6));
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

/** Birth year comes from the first two digits of the NRIC. */
export function birthYearFromIc(value = '') {
  const digits = onlyDigits(value);
  if (digits.length !== 12) return null;
  const yy = Number(digits.slice(0, 2));
  const nowYy = new Date().getFullYear() % 100;
  return yy <= nowYy ? 2000 + yy : 1900 + yy;
}

/**
 * Age is derived from the birth YEAR only (as requested) — the month and day
 * in the NRIC are ignored, so a child born in December 2017 is 9 all year 2026.
 */
export function ageFromIc(value = '') {
  if (!isValidMyIc(value)) return '';
  const birthYear = birthYearFromIc(value);
  if (!birthYear) return '';
  const age = new Date().getFullYear() - birthYear;
  return age >= 0 && age <= 120 ? age : '';
}

/* --------------------------------------------------------------------------
   MISC
   -------------------------------------------------------------------------- */
export function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export const todayLong = (date = new Date(), locale = 'en-MY') =>
  date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const nowStamp = (date = new Date()) =>
  date.toLocaleString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/** jsPDF's built-in fonts only support WinAnsi — strip fancy punctuation. */
export function asciiSafe(input = '') {
  return String(input)
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2013\u2014\u2015]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u00B7\u2022]/g, '-')
    .replace(/\u20AC/g, 'EUR')
    .replace(/[^\x00-\xFF]/g, '');
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read that file. Please try again.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Downscale a photo so the upload stays small enough to email / post to
 * Google Apps Script. Returns a JPEG data URL.
 */
export async function compressImage(file, { maxSize = 1700, quality = 0.82 } = {}) {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('That image could not be read.'));
    image.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', quality),
    width,
    height,
  };
}
