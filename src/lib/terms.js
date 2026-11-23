import { PAYMENT_TERMS } from '../config';

export const selectedTermsOf = (ids = []) =>
  PAYMENT_TERMS.filter((term) => ids.includes(term.id));

export const totalOf = (ids = []) =>
  selectedTermsOf(ids).reduce((sum, term) => sum + Number(term.price || 0), 0);

/**
 * Free-text class dates, e.g. 'Jan 4, 11, 18, 25' → 4.
 * Splits on commas / semicolons / new lines, so both
 * 'Jan 4, 11, 18, 25' and 'March 29, April 5, 12, 19' give the right count.
 */
export function countDates(dates) {
  const text = String(dates || '').trim();
  if (!text) return 0;
  const parts = text
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
  // 'Jan 4, 11, 18, 25' → 4 · 'March 29, April 5, 12, 19' → 4
  return parts.length;
}

/** 'YYYY-MM-DD' → local Date (no timezone drift) */
const parseIso = (iso) => {
  const [year, month, day] = String(iso).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

/**
 * The schedule text shown to parents.
 * When the academy typed their own dates in config (`dates`), that text is used
 * verbatim — on the form, the PDF, the confirmation email and the Sheet.
 */
export function formatTermPeriod(term, lang = 'en') {
  if (term.dates) {
    if (lang === 'zh' && term.datesZh) return term.datesZh;
    return String(term.dates);
  }
  return formatDateRange(term, lang);
}

/** 4 Jan – 28 Mar 2027  /  2027年1月4日 – 3月28日 */
export function formatDateRange(term, lang = 'en') {
  const start = parseIso(term.start);
  const end = parseIso(term.end);

  if (lang === 'zh') {
    const format = (date) => `${date.getMonth() + 1}月${date.getDate()}日`;
    return `${start.getFullYear()}年${format(start)} – ${format(end)}`;
  }

  const format = (date) =>
    date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
  return `${format(start)} – ${format(end)} ${end.getFullYear()}`;
}

/** Adds the translated label + formatted period to every term. */
export function withCopy(terms, m, lang) {
  return terms.map((term) => ({
    id: term.id,
    label: m.fees.termLabel(term.term, term.year),
    period: formatTermPeriod(term, lang),
    // Typed dates are the class list, so count them; otherwise use `sessions`.
    sessions: term.dates ? countDates(term.dates) || term.sessions : term.sessions,
    price: term.price,
  }));
}

export const allTermOptions = (m, lang) => withCopy(PAYMENT_TERMS, m, lang);

export const termOptionsOf = (ids, m, lang) =>
  withCopy(selectedTermsOf(ids), m, lang);
