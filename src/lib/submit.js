import { SHEETS_ENDPOINT } from '../config';
import { delay } from './utils';

/**
 * Sends the whole registration to the Google Apps Script Web App.
 *
 * Apps Script accepts a plain-text body and replies with JSON, which keeps the
 * request "simple" (no CORS pre-flight) so it works from any static host.
 *
 * If VITE_SHEETS_ENDPOINT is empty the app runs in DEMO mode: everything works
 * in the browser (agreement PDF, success page) but nothing is saved or emailed.
 */
export async function submitRegistration(payload, { timeoutMs = 90000 } = {}) {
  if (!SHEETS_ENDPOINT) {
    await delay(1500);
    return { ok: true, demo: true, ref: payload.ref };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(SHEETS_ENDPOINT, {
      method: 'POST',
      // text/plain avoids a CORS pre-flight that Apps Script cannot answer
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal,
    });

    const raw = await response.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.error || `The server replied with status ${response.status}. Please try again.`
      );
    }
    if (!data) {
      throw new Error(
        'We could not read the confirmation from the server. Your form may not have been saved — please try again.'
      );
    }
    if (data.ok === false) {
      throw new Error(data.error || 'The registration could not be saved.');
    }
    return { ...data, ok: true };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'The upload took too long. Please check your connection and try again — a smaller receipt photo usually helps.'
      );
    }
    if (error instanceof TypeError) {
      throw new Error(
        'We could not reach the server. Please check your internet connection and try again, or contact the academy on WhatsApp.'
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
