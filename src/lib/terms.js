import { PAYMENT_TERMS } from '../config';

export const selectedTermsOf = (ids = []) =>
  PAYMENT_TERMS.filter((term) => ids.includes(term.id));

export const totalOf = (ids = []) =>
  selectedTermsOf(ids).reduce((sum, term) => sum + Number(term.price || 0), 0);

/** 'YYYY-MM-DD' → local Date (no timezone drift) */
const parseIso = (iso) => {
  const [year, month, day] = String(iso).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

/** 4 Jan – 28 Mar 2027  /  2027年1月4日 – 3月28日 */
export function formatTermPeriod(term, lang = 'en') {
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
    sessions: term.sessions,
    price: term.price,
  }));
}

export const allTermOptions = (m, lang) => withCopy(PAYMENT_TERMS, m, lang);

export const termOptionsOf = (ids, m, lang) =>
  withCopy(selectedTermsOf(ids), m, lang);
