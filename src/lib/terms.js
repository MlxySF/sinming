import { PAYMENT_TERMS } from '../config';

export const selectedTermsOf = (ids = []) =>
  PAYMENT_TERMS.filter((term) => ids.includes(term.id));

export const totalOf = (ids = []) =>
  selectedTermsOf(ids).reduce((sum, term) => sum + Number(term.price || 0), 0);
