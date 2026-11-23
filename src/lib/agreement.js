import { ACADEMY, BANK, formatMoney } from '../config';
import en from '../i18n/en';
import { asciiSafe, todayLong } from './utils';

const PAGE_W = 210;
const PAGE_H = 297;

/* Page geometry — a classic 20 mm side margin, 18 mm top margin on page 1 and a
   footer band that content never runs into. */
const M = 20;
const CONTENT_W = PAGE_W - M * 2;
const TOP = 18;
const FOOTER_RULE_Y = PAGE_H - 20;
const FOOTER_TEXT_Y = PAGE_H - 14.5;
const BOTTOM = PAGE_H - 27;
const PAGE_TWO_TOP = 34; /* clears the running header on pages 2+ */

/* Tallest the letterhead may be drawn, in mm. Edit this one number to resize it. */
const LETTERHEAD_MAX_H = 28;

const INK = [12, 15, 19];
const GOLD = [176, 132, 58];
const CRIMSON = [183, 18, 38];
const GREY = [104, 109, 118];
const LINE = [206, 196, 180];

/* The signed document is always issued in English. */
const L = en.pdf;

/**
 * The letterhead image (ACADEMY.letterheadUrl) is fetched once and kept as a
 * data URL. If it cannot be fetched — offline, moved file, or the server not
 * sending CORS headers — the PDF falls back to the built-in dark header band,
 * so a missing letterhead never blocks a registration.
 */
let letterheadCache = { url: null, value: null };

function imageSize_(dataUrl) {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') return resolve(null);
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

async function loadLetterhead() {
  const url = (ACADEMY.letterheadUrl || '').trim();
  if (!url || typeof document === 'undefined' || typeof fetch === 'undefined') return null;
  if (letterheadCache.url === url) return letterheadCache.value;

  let value = null;
  try {
    const response = await fetch(url, { mode: 'cors', cache: 'force-cache' });
    if (response.ok) {
      const blob = await response.blob();
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('unreadable image'));
        reader.readAsDataURL(blob);
      });
      const size = await imageSize_(dataUrl);
      if (dataUrl && size && size.width && size.height) {
        value = {
          dataUrl,
          width: size.width,
          height: size.height,
          format: /^data:image\/jpe?g/i.test(dataUrl) ? 'JPEG' : 'PNG',
        };
      }
    }
  } catch (error) {
    value = null;
  }

  letterheadCache = { url, value };
  return value;
}

/* jsPDF is loaded on demand (~350 kB) so the landing page stays instant. */
let jsPdfLoader = null;
function loadJsPDF() {
  if (!jsPdfLoader) {
    jsPdfLoader = import('jspdf').then((mod) => mod.jsPDF);
  }
  return jsPdfLoader;
}

/** Make sure the CJK webfont is ready before drawing it to a canvas. */
async function ensureCjkFont() {
  try {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.load) {
      await document.fonts.load('600 72px "Noto Serif SC"', '陳家豪');
    }
  } catch (error) {
    /* fall back to the device's own CJK font */
  }
}

/**
 * jsPDF's built-in fonts cannot render Chinese characters, so any name that
 * contains CJK text is drawn to an invisible canvas by the browser and placed
 * in the PDF as a small image.
 */
function textImage(text, { sizePx = 72, weight = 600, color = '#14171c' } = {}) {
  if (typeof document === 'undefined' || !text) return null;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const font = `${weight} ${sizePx}px "Noto Serif SC", "Songti SC", "STSong", "SimSun", serif`;
    ctx.font = font;
    const width = Math.ceil(ctx.measureText(text).width) + 16;
    const height = Math.ceil(sizePx * 1.5);
    canvas.width = Math.max(width, 8);
    canvas.height = height;
    const draw = canvas.getContext('2d');
    // opaque white background: avoids any alpha-channel quirks in PDF viewers
    draw.fillStyle = '#ffffff';
    draw.fillRect(0, 0, canvas.width, canvas.height);
    draw.font = font;
    draw.fillStyle = color;
    draw.textBaseline = 'middle';
    draw.fillText(text, 8, height / 2);
    return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height };
  } catch (error) {
    return null;
  }
}

/**
 * Builds the signed agreement PDF entirely in the browser.
 * Returns { doc, fileName, base64, dataUrl } so it can be
 *  · downloaded by the parent, and
 *  · sent to Google Apps Script to be stored in Drive / attached to the email.
 */
export async function buildAgreementPdf({
  ref,
  parent,
  athlete,
  selectedTerms = [],
  total = 0,
  signature = '',
  submittedAt = new Date(),
}) {
  const JsPDF = await loadJsPDF();
  const hasChinese = /[^\x00-\xFF]/.test(
    `${athlete?.chineseName || ''}${athlete?.name || ''}${parent?.name || ''}`
  );
  if (hasChinese) await ensureCjkFont();

  const doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true });
  const letterhead = await loadLetterhead();
  let y = 0;

  /* ---------------------------------------------------------------- header */
  if (letterhead) {
    /* The letterhead sits inside the margins — like a printed letterhead, not a
       full-bleed banner. It is never wider than the text column and never taller
       than LETTERHEAD_MAX_H (raise this number for a bigger header, lower it for
       a smaller one), and it stays centred. */
    const maxH = LETTERHEAD_MAX_H;
    const scale = Math.min(CONTENT_W / letterhead.width, maxH / letterhead.height);
    const imgW = letterhead.width * scale;
    const imgH = letterhead.height * scale;
    doc.addImage(
      letterhead.dataUrl,
      letterhead.format,
      M + (CONTENT_W - imgW) / 2,
      TOP,
      imgW,
      imgH,
      undefined,
      'FAST'
    );

    // thin rule under the letterhead, flush with the text column
    const ruleY = TOP + imgH + 6;
    doc.setFillColor(...GOLD);
    doc.rect(M, ruleY, CONTENT_W, 0.35, 'F');

    // document title (left) + reference and date (right)
    const rowY = ruleY + 6.4;
    doc.setFont('helvetica', 'bold');
    doc.setCharSpace(0.55);
    doc.setFontSize(8.4);
    doc.setTextColor(...INK);
    doc.text(asciiSafe(L.subtitle).toUpperCase(), M, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setCharSpace(0.2);
    doc.setFontSize(7.2);
    doc.setTextColor(...GREY);
    doc.text(
      asciiSafe(`${L.reference}: ${ref}   ·   ${L.date}: ${todayLong(submittedAt, 'en-MY')}`),
      PAGE_W - M,
      rowY,
      { align: 'right' }
    );
    doc.setCharSpace(0.1);

    y = rowY + 12;
  } else {
    doc.setFillColor(...INK);
    doc.rect(0, 0, PAGE_W, 44, 'F');

    // thin gold rule at the bottom of the band
    doc.setFillColor(...GOLD);
    doc.rect(0, 44, PAGE_W, 0.7, 'F');

    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setCharSpace(0.9);
    doc.text(asciiSafe(ACADEMY.name).toUpperCase(), M, 21);

    doc.setCharSpace(0.1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(190, 184, 174);
    doc.text(asciiSafe(`${ACADEMY.email}   |   ${ACADEMY.phone}`), M, 27);

    doc.setFontSize(7.4);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(0.5);
    doc.text(asciiSafe(L.subtitle), M, 36);

    // reference block (right side of band)
    doc.setFont('helvetica', 'normal');
    doc.setCharSpace(0.2);
    doc.setFontSize(7.2);
    doc.setTextColor(150, 145, 136);
    doc.text(asciiSafe(L.reference), PAGE_W - M, 17, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text(asciiSafe(ref), PAGE_W - M, 23, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(150, 145, 136);
    doc.text(asciiSafe(L.date), PAGE_W - M, 31, { align: 'right' });
    doc.setFontSize(9);
    doc.setTextColor(235, 230, 222);
    doc.text(asciiSafe(todayLong(submittedAt, 'en-MY')), PAGE_W - M, 37, { align: 'right' });

    y = 56;
  }

  /* ------------------------------------------------------------- helpers */
  const ensure = (needed) => {
    if (y + needed <= BOTTOM) return;
    doc.addPage();
    y = PAGE_TWO_TOP;
  };

  const sectionTitle = (text) => {
    ensure(18);
    doc.setFillColor(...CRIMSON);
    doc.rect(M, y - 3.2, 2.6, 6.4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(...INK);
    doc.setCharSpace(0.55);
    doc.text(asciiSafe(text).toUpperCase(), M + 6, y + 2);
    doc.setCharSpace(0.1);
    y += 8;
  };

  const para = (text, { size = 8.4, color = GREY, indent = 0, leading = 4.35 } = {}) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(asciiSafe(text), CONTENT_W - indent);
    lines.forEach((line) => {
      ensure(leading + 1);
      doc.text(line, M + indent, y);
      y += leading;
    });
    return lines.length;
  };

  const detailRow = (label, value, x, width) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.9);
    doc.setTextColor(...GREY);
    doc.setCharSpace(0.35);
    doc.text(asciiSafe(label).toUpperCase(), x, y);
    doc.setCharSpace(0.1);

    const raw = String(value || '').trim();
    const hasCjk = /[^\x00-\xFF]/.test(raw);

    // Chinese / mixed names: place an image of the text instead
    if (hasCjk) {
      const img = textImage(raw, { sizePx: 72, color: '#14171c' });
      if (img) {
        const h = 4.9;
        const w = Math.min((h * img.width) / img.height, width);
        doc.addImage(img.dataUrl, 'PNG', x, y + 0.9, w, h, undefined, 'FAST');
        return 0;
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.4);
    doc.setTextColor(...INK);
    const text = doc.splitTextToSize(asciiSafe(raw || '-'), width);
    doc.text(text[0] || '-', x, y + 4.6);
    return text.length > 1 ? 4.6 + (text.length - 1) * 4.2 : 0;
  };

  /* ------------------------------------------------- 01 parent particulars */
  sectionTitle(`01  ${L.s1}`);
  const colW = CONTENT_W / 2 - 6;
  let rowY = y;
  detailRow(L.parentName, parent?.name, M, colW);
  detailRow(L.parentIc, parent?.ic, M + CONTENT_W / 2 + 4, colW);
  y = rowY + 13;
  detailRow(L.parentPhone, parent?.phone, M, colW);
  detailRow(L.parentEmail, parent?.email, M + CONTENT_W / 2 + 4, colW);
  y += 13;
  detailRow(L.parentRel, parent?.relationship, M, colW);
  y += 13;

  /* ------------------------------------------------ 02 athlete particulars */
  sectionTitle(`02  ${L.s2}`);
  rowY = y;
  detailRow(L.athleteName, athlete?.name, M, colW);
  detailRow(L.athleteCn, athlete?.chineseName || '-', M + CONTENT_W / 2 + 4, colW);
  y = rowY + 13;
  detailRow(L.athleteIc, athlete?.ic || '-', M, colW);
  detailRow(L.athleteAge, athlete?.age ? L.yearsOld(athlete.age) : '-', M + CONTENT_W / 2 + 4, colW);
  y += 13;
  detailRow(L.athleteGender, athlete?.gender, M, colW);
  detailRow(L.athleteSchool, athlete?.school, M + CONTENT_W / 2 + 4, colW);
  y += 13;
  detailRow(L.athleteClass, athlete?.className || '-', M, colW);
  y += 13;

  /* ------------------------------------------------------------- 03 fees */
  sectionTitle(`03  ${L.s3}`);
  ensure(30);
  doc.setFillColor(246, 242, 234);
  doc.rect(M, y - 4.5, CONTENT_W, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...GREY);
  doc.setCharSpace(0.3);
  doc.text(asciiSafe(L.colTerm), M + 3, y);
  doc.text(asciiSafe(L.colPeriod), M + 52, y);
  doc.text(asciiSafe(L.colSessions), M + 110, y);
  doc.text(asciiSafe(L.colAmount), PAGE_W - M - 3, y, { align: 'right' });
  doc.setCharSpace(0.1);
  y += 9;

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  const termsList = selectedTerms.length ? selectedTerms : [];
  termsList.forEach((term) => {
    ensure(11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.6);
    doc.setTextColor(...INK);
    doc.text(asciiSafe(term.label), M + 3, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GREY);
    /* keep a long free-text date list inside its column */
    const periodText = asciiSafe(term.period);
    const periodMaxW = 56;
    let periodSize = 8.4;
    doc.setFontSize(periodSize);
    while (doc.getTextWidth(periodText) > periodMaxW && periodSize > 6.6) {
      periodSize -= 0.3;
      doc.setFontSize(periodSize);
    }
    doc.text(periodText, M + 52, y);
    doc.setFontSize(8.4);
    if (term.sessions) doc.text(`${term.sessions} ${asciiSafe(L.classes)}`, M + 110, y);
    doc.setTextColor(...INK);
    doc.text(asciiSafe(formatMoney(term.price)), PAGE_W - M - 3, y, { align: 'right' });
    doc.line(M, y + 3, PAGE_W - M, y + 3);
    y += 9;
  });

  ensure(14);
  doc.setFillColor(...INK);
  doc.rect(M, y - 4, CONTENT_W, 11, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.4);
  doc.setTextColor(235, 230, 222);
  doc.setCharSpace(0.3);
  doc.text(asciiSafe(L.totalLabel), M + 4, y + 3);
  doc.setFontSize(12);
  doc.setTextColor(243, 215, 154);
  doc.text(asciiSafe(formatMoney(total)), PAGE_W - M - 4, y + 3.2, { align: 'right' });
  doc.setCharSpace(0.1);
  y += 15;

  para(
    `${L.paymentTo}: ${BANK.bankName} - ${BANK.accountName} - ${BANK.accountNumber}. ` +
      'Fees are payable per month / per term as invoiced, and a payment receipt is to be uploaded with this registration.'
  );
  y += 3;

  /* -------------------------------------------------------------- 04 terms */
  sectionTitle(`04  ${L.s4}`);
  en.terms.list.forEach((clause, index) => {
    const lines = doc.splitTextToSize(asciiSafe(clause), CONTENT_W - 10);
    ensure(lines.length * 4.4 + 3);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.4);
    doc.setTextColor(...INK);
    doc.text(`${index + 1}.`, M, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GREY);
    lines.forEach((line) => {
      doc.text(line, M + 9, y);
      y += 4.4;
    });
    y += 2;
  });

  /* -------------------------------------------------------- 05 declaration */
  ensure(46);
  sectionTitle(`05  ${L.s5}`);
  para(L.declaration);
  y += 3;

  ensure(44);
  const sigBoxTop = y;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.25);
  doc.rect(M, sigBoxTop, CONTENT_W, 30);

  if (signature) {
    try {
      const props = doc.getImageProperties(signature);
      const maxW = CONTENT_W - 8;
      const maxH = 24;
      const ratio = Math.min(maxW / props.width, maxH / props.height);
      const w = props.width * ratio;
      const h = props.height * ratio;
      doc.addImage(signature, 'PNG', M + 4, sigBoxTop + (30 - h) / 2, w, h, undefined, 'FAST');
    } catch (error) {
      /* signature unreadable — leave the box empty */
    }
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.9);
  doc.setTextColor(...GREY);
  doc.setCharSpace(0.3);
  doc.text(asciiSafe(L.authorisedSignature), M, sigBoxTop + 34.5);

  doc.setCharSpace(0.1);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  const parentNameLines = doc.splitTextToSize(asciiSafe(parent?.name || ''), CONTENT_W - 8);
  doc.text(parentNameLines[0] || '', M, sigBoxTop + 39.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...GREY);
  doc.text(
    asciiSafe(
      `${parent?.relationship || 'Parent / Guardian'} · ${todayLong(submittedAt, 'en-MY')}`
    ),
    M,
    sigBoxTop + 43.5
  );

  /* ------------------------------------------------------------- footers */
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);

    /* running header on pages 2+ so printed sheets stay identifiable */
    if (page > 1) {
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.2);
      doc.line(M, 20, PAGE_W - M, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setCharSpace(0.5);
      doc.setTextColor(...INK);
      doc.text(asciiSafe(`${ACADEMY.name.toUpperCase()} · ${L.subtitle}`), M, 16.5);
      doc.setFont('helvetica', 'normal');
      doc.setCharSpace(0.2);
      doc.setTextColor(150, 145, 136);
      doc.text(asciiSafe(`${L.reference}: ${ref}`), PAGE_W - M, 16.5, { align: 'right' });
      doc.setCharSpace(0.1);
    }

    /* footer */
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(M, FOOTER_RULE_Y, PAGE_W - M, FOOTER_RULE_Y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(150, 145, 136);
    doc.text(asciiSafe(L.footerRef(ACADEMY.name, ACADEMY.companyNo, ref)), M, FOOTER_TEXT_Y);
    doc.text(asciiSafe(L.page(page, pages)), PAGE_W - M, FOOTER_TEXT_Y, { align: 'right' });
  }

  const base64 = doc.output('datauristring').split(',')[1];
  return {
    doc,
    base64,
    fileName: `${ref}-Registration-Agreement.pdf`,
    dataUrl: `data:application/pdf;base64,${base64}`,
  };
}

/** Trigger a browser download for a Blob URL. */
export function downloadBlobUrl(url, fileName) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function pdfBlobUrl(doc) {
  return URL.createObjectURL(doc.output('blob'));
}
