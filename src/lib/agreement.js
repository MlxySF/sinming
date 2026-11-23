import { ACADEMY, BANK, formatMoney } from '../config';
import en from '../i18n/en';
import { asciiSafe, todayLong } from './utils';

const PAGE_W = 210;
const PAGE_H = 297;
const M = 16;
const CONTENT_W = PAGE_W - M * 2;
const BOTTOM = PAGE_H - 22;

const INK = [12, 15, 19];
const GOLD = [176, 132, 58];
const CRIMSON = [183, 18, 38];
const GREY = [104, 109, 118];
const LINE = [206, 196, 180];

/* The signed document is always issued in English. */
const L = en.pdf;

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
  let y = 0;

  /* ---------------------------------------------------------------- header */
  doc.setFillColor(...INK);
  doc.rect(0, 0, PAGE_W, 44, 'F');

  // thin gold rule at the bottom of the band
  doc.setFillColor(...GOLD);
  doc.rect(0, 44, PAGE_W, 0.7, 'F');

  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setCharSpace(0.9);
  doc.text(asciiSafe(ACADEMY.name).toUpperCase(), M, 20);

  doc.setCharSpace(0.1);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(190, 184, 174);
  doc.text(
    asciiSafe(`${ACADEMY.address}   |   ${ACADEMY.email}   |   ${ACADEMY.phone}`),
    M,
    27
  );

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

  /* ------------------------------------------------------------- helpers */
  const ensure = (needed) => {
    if (y + needed <= BOTTOM) return;
    doc.addPage();
    y = 22;
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
    doc.text(asciiSafe(term.period), M + 52, y);
    doc.text(`${term.sessions} ${asciiSafe(L.classes)}`, M + 110, y);
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
  en.terms.list.forEach((item, index) => {
    ensure(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.7);
    doc.setTextColor(...INK);
    doc.text(`${index + 1}.  ${asciiSafe(item.title)}`, M, y);
    y += 4.6;
    para(item.body, { indent: 5.2 });
    y += 1.6;
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
  doc.rect(M, sigBoxTop, 84, 30);

  if (signature) {
    try {
      const props = doc.getImageProperties(signature);
      const maxW = 76;
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
  const parentNameLines = doc.splitTextToSize(asciiSafe(parent?.name || ''), 76);
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

  // Academy acknowledgement block
  const ax = M + 96;
  doc.setDrawColor(...LINE);
  doc.rect(ax, sigBoxTop, PAGE_W - M - ax, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...GREY);
  doc.text(asciiSafe(L.forAndOnBehalf), ax + 5, sigBoxTop + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.6);
  doc.setTextColor(...INK);
  doc.text(asciiSafe(ACADEMY.name), ax + 5, sigBoxTop + 13.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...GREY);
  doc.text(asciiSafe(L.registrar), ax + 5, sigBoxTop + 19);

  // red academy seal
  doc.setFillColor(...CRIMSON);
  doc.roundedRect(PAGE_W - M - 24, sigBoxTop + 15, 18, 12, 1.6, 1.6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setCharSpace(0.4);
  doc.text('WSA', PAGE_W - M - 15, sigBoxTop + 22.4, { align: 'center' });
  doc.setCharSpace(0.1);

  /* ------------------------------------------------------------- footers */
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(M, PAGE_H - 16, PAGE_W - M, PAGE_H - 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(150, 145, 136);
    doc.text(asciiSafe(L.footerRef(ACADEMY.name, ACADEMY.companyNo, ref)), M, PAGE_H - 11);
    doc.text(asciiSafe(L.page(page, pages)), PAGE_W - M, PAGE_H - 11, { align: 'right' });
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
