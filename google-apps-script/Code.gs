/**
 * ============================================================================
 *  WUSHU SPORT ACADEMY — Registration backend (Google Apps Script)
 * ============================================================================
 *  What this does, in one request:
 *    1. Saves the signature, the payment receipt and the signed agreement PDF
 *       into a Google Drive folder.
 *    2. Appends one row per registration into a Google Sheet.
 *    3. Emails an attractive confirmation (with the agreement attached) to the
 *       parent, and a copy to the academy admin.
 *
 *  HOW TO INSTALL  →  see SETUP.md in this folder (5 minutes, no coding).
 * ============================================================================
 */

/* ---------------------------------------------------------------------------
   CONFIG — edit these values
   --------------------------------------------------------------------------- */
const CONFIG = {
  // Leave blank if this script is created from the Google Sheet itself
  // (Extensions ▸ Apps Script). Otherwise paste the Sheet ID here.
  SPREADSHEET_ID: '',

  SHEET_NAME: 'Registrations',

  // Folder in YOUR Google Drive where uploads are stored.
  // It is created automatically the first time if it does not exist.
  DRIVE_FOLDER_NAME: 'Wushu Sport Academy — Registrations',

  // Where the admin notification email goes (comma separated is fine).
  ADMIN_EMAILS: 'admin@wushusportacademy.com',

  ACADEMY_NAME: 'Wushu Sport Academy',
  ACADEMY_EMAIL: 'admin@wushusportacademy.com',
  ACADEMY_PHONE: '+65 8123 4567',
  ACADEMY_ADDRESS: '12 Sin Ming Lane, #04-08, Singapore 573968',
  ACADEMY_UEN: '202312345A',

  BANK_BANK_NAME: 'DBS Bank (Singapore)',
  BANK_ACCOUNT_NAME: 'Wushu Sport Academy Pte Ltd',
  BANK_ACCOUNT_NO: '012-345678-9',
  BANK_PAYNOW: 'UEN 202312345A',

  // Optional: set a random word here AND in the website's .env (VITE_FORM_TOKEN)
  // so only your own website can post to this endpoint. Leave '' to disable.
  SHARED_TOKEN: '',

  SEND_PARENT_EMAIL: true,
  SEND_ADMIN_EMAIL: true,

  TIMEZONE: 'Asia/Singapore',
};

const HEADERS = [
  'Timestamp',
  'Reference',
  'Status',
  'Parent Name',
  'Parent NRIC',
  'Mobile',
  'Email',
  'Relationship',
  'Athlete Name',
  'Chinese Name',
  'Athlete NRIC',
  'Age',
  'Gender',
  'School',
  'Class',
  'Terms',
  'Total Due (SGD)',
  'Receipt File',
  'Receipt Link',
  'Agreement File',
  'Agreement Link',
  'Signature Link',
  'Email Sent',
  'Notes',
];

/* ==========================================================================
   WEB APP ENTRY POINTS
   ========================================================================== */

/** POST from the website */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return json_({ ok: false, error: 'The server is busy. Please submit again in a moment.' });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, error: 'No data received.' });
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'submit';

    if (action === 'ping') {
      return json_({ ok: true, message: 'Wushu Sport Academy endpoint is live.', time: nowIso_() });
    }
    if (action !== 'submit') {
      return json_({ ok: false, error: 'Unknown action: ' + action });
    }

    validate_(data);

    if (CONFIG.SHARED_TOKEN && String(data.token || '') !== CONFIG.SHARED_TOKEN) {
      return json_({ ok: false, error: 'Invalid form token. Check VITE_FORM_TOKEN matches Code.gs.' });
    }

    const folder = getFolder_();
    const ref = String(data.ref || '').trim();
    const stamp = nowStamp_();

    // ---- 1. store files -------------------------------------------------
    const signatureFile = saveFile_(
      folder,
      signatureBase64_(data.signature),
      ref + '-Signature.png',
      'image/png'
    );

    let receiptFile = null;
    if (data.receipt && data.receipt.base64) {
      const receiptName = safeName_(data.receipt.fileName || ref + '-Receipt');
      receiptFile = saveFile_(
        folder,
        data.receipt.base64,
        ref + '-' + receiptName,
        data.receipt.mimeType || 'application/octet-stream'
      );
    }

    let agreementFile = null;
    if (data.agreement && data.agreement.base64) {
      agreementFile = saveFile_(
        folder,
        data.agreement.base64,
        safeName_(data.agreement.fileName || ref + '-Agreement.pdf'),
        'application/pdf'
      );
    }

    // ---- 2. append the row ---------------------------------------------
    const sheet = getSheet_();
    const parent = data.parent || {};
    const athlete = data.athlete || {};
    const terms = Array.isArray(data.terms) ? data.terms : [];
    const termsText = terms.map((t) => t.label + ' (' + t.period + ')').join(' | ');

    sheet.appendRow([
      stamp,
      ref,
      'Pending verification',
      parent.name || '',
      parent.ic || '',
      parent.phone || '',
      parent.email || '',
      parent.relationship || '',
      athlete.name || '',
      athlete.chineseName || '',
      athlete.ic || '',
      athlete.age || '',
      athlete.gender || '',
      athlete.school || '',
      athlete.className || '',
      termsText,
      Number(data.total || 0),
      receiptFile ? receiptFile.getName() : 'Not uploaded',
      receiptFile ? receiptFile.getUrl() : '',
      agreementFile ? agreementFile.getName() : '',
      agreementFile ? agreementFile.getUrl() : '',
      signatureFile ? signatureFile.getUrl() : '',
      'Pending',
      data.meta && data.meta.pageUrl ? 'via ' + data.meta.pageUrl : '',
    ]);

    // ---- 3. emails ------------------------------------------------------
    let parentEmailStatus = 'Skipped';
    if (CONFIG.SEND_PARENT_EMAIL && parent.email) {
      try {
        MailApp.sendEmail({
          to: parent.email,
          name: CONFIG.ACADEMY_NAME,
          replyTo: CONFIG.ACADEMY_EMAIL,
          subject: '✅ Registration received — ' + athlete.name + ' (' + ref + ')',
          htmlBody: parentEmailHtml_(data, ref, stamp, receiptFile, agreementFile),
          attachments: agreementFile ? [agreementFile.getBlob()] : [],
        });
        parentEmailStatus = 'Sent to ' + parent.email;
      } catch (mailError) {
        parentEmailStatus = 'FAILED: ' + mailError;
      }
    }

    if (CONFIG.SEND_ADMIN_EMAIL && CONFIG.ADMIN_EMAILS) {
      try {
        MailApp.sendEmail({
          to: CONFIG.ADMIN_EMAILS,
          name: CONFIG.ACADEMY_NAME,
          replyTo: parent.email || CONFIG.ACADEMY_EMAIL,
          subject:
            '🆕 New registration — ' + athlete.name + ' · ' + termsText + ' · $' + Number(data.total || 0),
          htmlBody: adminEmailHtml_(data, ref, stamp, receiptFile, agreementFile, signatureFile, sheet),
          attachments: agreementFile ? [agreementFile.getBlob()] : [],
        });
      } catch (adminMailError) {
        // never fail the submission because of the admin copy
      }
    }

    // write the email status back into the row
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 23).setValue(parentEmailStatus);

    return json_({
      ok: true,
      ref: ref,
      message: 'Registration saved',
      email: parentEmailStatus,
      sheetRow: lastRow,
    });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  } finally {
    try {
      lock.releaseLock();
    } catch (ignored) {}
  }
}

/** GET — open the URL in a browser to check that the deployment works */
function doGet() {
  try {
    const sheet = getSheet_();
    return json_({
      ok: true,
      message: 'Wushu Sport Academy registration endpoint is live.',
      sheet: sheet.getName(),
      rows: Math.max(sheet.getLastRow() - 1, 0),
      time: nowIso_(),
    });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  }
}

/* ==========================================================================
   HELPERS
   ========================================================================== */

function validate_(data) {
  const parent = data.parent || {};
  const athlete = data.athlete || {};
  if (!parent.name) throw new Error('Parent name is missing.');
  if (!parent.email) throw new Error('Parent email is missing.');
  if (!athlete.name) throw new Error('Athlete name is missing.');
  if (!Array.isArray(data.terms) || data.terms.length === 0)
    throw new Error('No payment term was selected.');
  if (!data.signature) throw new Error('Signature is missing.');
  if (!data.receipt || !data.receipt.base64) throw new Error('Payment receipt is missing.');
}

function getSpreadsheet_() {
  if (CONFIG.SPREADSHEET_ID) return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error(
      'No spreadsheet found. Open this script from your Google Sheet (Extensions ▸ Apps Script) or set CONFIG.SPREADSHEET_ID.'
    );
  }
  return active;
}

function getSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const header = sheet.getRange(1, 1, 1, HEADERS.length);
    header.setFontWeight('bold').setBackground('#0e1116').setFontColor('#f3d79a');
    header.setVerticalAlignment('middle');
    sheet.setRowHeight(1, 34);
    sheet.setFrozenRows(1);
    sheet.getRange(2, 17, 500, 1).setNumberFormat('"S$"#,##0.00');
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 150);
    sheet.setColumnWidth(7, 220);
    sheet.setColumnWidth(9, 160);
    sheet.setColumnWidth(16, 260);
    sheet.setColumnWidth(17, 120);
    sheet.setColumnWidth(19, 200);
    sheet.setColumnWidth(21, 200);
    sheet.setColumnWidth(22, 200);
  }
  return sheet;
}

function getFolder_() {
  const name = CONFIG.DRIVE_FOLDER_NAME;
  const found = DriveApp.getFoldersByName(name);
  if (found.hasNext()) return found.next();
  const folder = DriveApp.createFolder(name);
  return folder;
}

function saveFile_(folder, base64, fileName, mimeType) {
  if (!base64) return null;
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const file = folder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (ignored) {
    /* domain may forbid link sharing — the admin still has access */
  }
  return file;
}

function signatureBase64_(dataUrl) {
  if (!dataUrl) return '';
  const comma = String(dataUrl).indexOf(',');
  return comma >= 0 ? String(dataUrl).slice(comma + 1) : String(dataUrl);
}

function safeName_(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, '-').slice(0, 90);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function nowIso_() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function nowStamp_() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd MMM yyyy, HH:mm');
}

function money_(value) {
  const n = Number(value || 0);
  return 'S$' + (Math.round(n * 100) / 100).toLocaleString('en-SG', {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function esc_(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function row_(label, value) {
  return (
    '<tr>' +
    '<td style="padding:10px 14px;border-bottom:1px solid #ece6da;font:600 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#8b8f98;width:42%;">' +
    esc_(label) +
    '</td>' +
    '<td style="padding:10px 14px;border-bottom:1px solid #ece6da;font:400 14px/1.5 Helvetica,Arial,sans-serif;color:#14171c;">' +
    esc_(value) +
    '</td>' +
    '</tr>'
  );
}

/* ==========================================================================
   EMAIL TEMPLATES
   ========================================================================== */

function emailShell_(title, preheader, inner) {
  return (
    '<div style="background:#f7f2e8;padding:28px 12px;">' +
    '<div style="max-width:600px;margin:0 auto;background:#fffdf9;border:1px solid #e3dacb;border-radius:18px;overflow:hidden;box-shadow:0 18px 44px -30px rgba(20,16,8,.5);">' +
    /* dark header */
    '<div style="background:#0b0d10;padding:30px 32px 26px;border-bottom:3px solid #e0b45c;">' +
    '<div style="font:700 10px/1 Helvetica,Arial,sans-serif;letter-spacing:.28em;text-transform:uppercase;color:#e0b45c;">' +
    esc_(CONFIG.ACADEMY_NAME) +
    '</div>' +
    '<div style="margin-top:14px;font:700 26px/1.15 Georgia,serif;color:#f4efe6;">' +
    esc_(title) +
    '</div>' +
    '<div style="margin-top:8px;font:400 12px/1.6 Helvetica,Arial,sans-serif;color:rgba(244,239,230,.62);">' +
    esc_(preheader) +
    '</div>' +
    '</div>' +
    /* body */
    '<div style="padding:28px 32px 32px;">' +
    inner +
    '</div>' +
    /* footer */
    '<div style="background:#0b0d10;padding:20px 32px;font:400 11px/1.7 Helvetica,Arial,sans-serif;color:rgba(244,239,230,.5);">' +
    esc_(CONFIG.ACADEMY_NAME) +
    ' · UEN ' +
    esc_(CONFIG.ACADEMY_UEN) +
    '<br>' +
    esc_(CONFIG.ACADEMY_ADDRESS) +
    '<br>' +
    '<a href="mailto:' +
    esc_(CONFIG.ACADEMY_EMAIL) +
    '" style="color:#e0b45c;text-decoration:none;">' +
    esc_(CONFIG.ACADEMY_EMAIL) +
    '</a> · ' +
    esc_(CONFIG.ACADEMY_PHONE) +
    '</div>' +
    '</div>' +
    '<div style="max-width:600px;margin:14px auto 0;text-align:center;font:400 10px/1.6 Helvetica,Arial,sans-serif;color:#a9a294;">' +
    'This is an automated confirmation of your registration.' +
    '</div>' +
    '</div>'
  );
}

function parentEmailHtml_(data, ref, stamp, receiptFile, agreementFile) {
  const parent = data.parent || {};
  const athlete = data.athlete || {};
  const terms = Array.isArray(data.terms) ? data.terms : [];
  const total = money_(data.total);

  const termRows = terms
    .map(
      (t) =>
        '<tr>' +
        '<td style="padding:9px 0;border-bottom:1px dashed #e3dacb;font:400 13px/1.5 Helvetica,Arial,sans-serif;color:#14171c;">' +
        esc_(t.label) +
        '<span style="display:block;color:#8b8f98;font-size:11px;">' +
        esc_(t.period) +
        ' · ' +
        esc_(t.sessions) +
        ' classes</span></td>' +
        '<td style="padding:9px 0;border-bottom:1px dashed #e3dacb;font:700 13px/1.5 Helvetica,Arial,sans-serif;color:#14171c;text-align:right;white-space:nowrap;">' +
        money_(t.price) +
        '</td></tr>'
    )
    .join('');

  const inner =
    '<p style="margin:0 0 18px;font:400 14px/1.7 Helvetica,Arial,sans-serif;color:#3c4048;">Dear ' +
    esc_(parent.name) +
    ',</p>' +
    '<p style="margin:0 0 22px;font:400 14px/1.7 Helvetica,Arial,sans-serif;color:#3c4048;">' +
    'Thank you for registering <b>' +
    esc_(athlete.name) +
    '</b> with ' +
    esc_(CONFIG.ACADEMY_NAME) +
    '. We have received your signed agreement and payment receipt — our admin team is verifying the payment now ' +
    '(usually within one working day).</p>' +
    /* reference pill */
    '<div style="border:1px dashed #d9c8a4;background:#fdf8ee;border-radius:12px;padding:14px 18px;margin-bottom:22px;">' +
    '<div style="font:600 10px/1 Helvetica,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#a97e2f;">Registration reference</div>' +
    '<div style="margin-top:6px;font:700 18px/1.3 Helvetica,Arial,sans-serif;color:#14171c;letter-spacing:.06em;">' +
    esc_(ref) +
    '</div>' +
    '<div style="margin-top:4px;font:400 11px/1.5 Helvetica,Arial,sans-serif;color:#8b8f98;">Submitted ' +
    esc_(stamp) +
    '</div></div>' +
    /* details */
    '<div style="font:700 10px/1 Helvetica,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#c8102e;margin-bottom:10px;">Your registration</div>' +
    '<table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #ece6da;border-radius:12px;border-collapse:separate;overflow:hidden;margin-bottom:22px;">' +
    row_('Athlete', athlete.name) +
    row_('Chinese name', athlete.chineseName || '—') +
    row_('Age / Gender', (athlete.age || '—') + ' · ' + (athlete.gender || '—')) +
    row_('School / Class', (athlete.school || '—') + ' · ' + (athlete.className || '—')) +
    row_('Parent', parent.name + ' (' + (parent.relationship || 'Guardian') + ')') +
    row_('Mobile', parent.phone) +
    row_('Email', parent.email) +
    '</table>' +
    /* fees */
    '<div style="font:700 10px/1 Helvetica,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#c8102e;margin-bottom:10px;">Term fees selected</div>' +
    '<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:8px;">' +
    termRows +
    '</table>' +
    '<table cellpadding="0" cellspacing="0" width="100%" style="background:#0b0d10;border-radius:12px;margin-bottom:24px;">' +
    '<tr><td style="padding:16px 18px;font:600 10px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:rgba(244,239,230,.6);">Total amount due</td>' +
    '<td style="padding:16px 18px;text-align:right;font:700 22px/1 Helvetica,Arial,sans-serif;color:#f3d79a;">' +
    total +
    '</td></tr></table>' +
    /* payment instructions */
    '<div style="border:1px solid #ece6da;border-radius:12px;padding:16px 18px;margin-bottom:22px;background:#fbf7ef;">' +
    '<div style="font:700 10px/1 Helvetica,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#14171c;margin-bottom:10px;">Payment details</div>' +
    '<div style="font:400 12.5px/1.9 Helvetica,Arial,sans-serif;color:#3c4048;">' +
    'Bank: <b>' +
    esc_(CONFIG.BANK_BANK_NAME) +
    '</b><br>Account name: <b>' +
    esc_(CONFIG.BANK_ACCOUNT_NAME) +
    '</b><br>Account number: <b>' +
    esc_(CONFIG.BANK_ACCOUNT_NO) +
    '</b><br>PayNow: <b>' +
    esc_(CONFIG.BANK_PAYNOW) +
    '</b>' +
    '</div></div>' +
    /* attachments */
    (agreementFile
      ? '<div style="font:400 12.5px/1.7 Helvetica,Arial,sans-serif;color:#3c4048;margin-bottom:16px;">📎 Your signed agreement (<b>' +
        esc_(agreementFile.getName()) +
        '</b>) is attached to this email. Keep it for your records.</div>'
      : '') +
    (receiptFile
      ? '<div style="font:400 12.5px/1.7 Helvetica,Arial,sans-serif;color:#3c4048;margin-bottom:16px;">🧾 Receipt received: <b>' +
        esc_(receiptFile.getName()) +
        '</b> — now pending verification.</div>'
      : '') +
    /* next steps */
    '<div style="border-left:3px solid #c8102e;padding:4px 0 4px 14px;margin-bottom:22px;">' +
    '<div style="font:700 10px/1 Helvetica,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#c8102e;margin-bottom:8px;">What happens next</div>' +
    '<div style="font:400 12.5px/1.8 Helvetica,Arial,sans-serif;color:#3c4048;">1. We verify your payment receipt.<br>2. You receive a WhatsApp message with the venue, timing and first-lesson details.<br>3. Please arrive 10 minutes early on the first day with a water bottle and indoor shoes.</div>' +
    '</div>' +
    '<div style="border-top:1px solid #ece6da;padding-top:18px;font:400 12px/1.7 Helvetica,Arial,sans-serif;color:#6c7079;">' +
    'Questions? Reply to this email or WhatsApp us at ' +
    esc_(CONFIG.ACADEMY_PHONE) +
    '. We are happy to help.<br><br>Warm regards,<br><b style="color:#14171c;">' +
    esc_(CONFIG.ACADEMY_NAME) +
    ' — Admin Team</b></div>';

  return emailShell_(
    'Registration received',
    'We have your signed agreement and receipt — reference ' + ref,
    inner
  );
}

function adminEmailHtml_(data, ref, stamp, receiptFile, agreementFile, signatureFile, sheet) {
  const parent = data.parent || {};
  const athlete = data.athlete || {};
  const terms = Array.isArray(data.terms) ? data.terms : [];

  const link = (file, label) =>
    file
      ? '<a href="' +
        file.getUrl() +
        '" style="color:#c8102e;text-decoration:none;font-weight:600;">' +
        esc_(label) +
        '</a>'
      : '<span style="color:#8b8f98;">none</span>';

  const inner =
    '<p style="margin:0 0 18px;font:400 14px/1.7 Helvetica,Arial,sans-serif;color:#3c4048;">A new registration was submitted on the website.</p>' +
    '<table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #ece6da;border-radius:12px;border-collapse:separate;overflow:hidden;margin-bottom:20px;">' +
    row_('Reference', ref) +
    row_('Submitted', stamp) +
    row_('Athlete', athlete.name + ' (' + (athlete.chineseName || '—') + ')') +
    row_('Age / Gender', (athlete.age || '—') + ' · ' + (athlete.gender || '—')) +
    row_('School / Class', (athlete.school || '—') + ' · ' + (athlete.className || '—')) +
    row_('Parent', parent.name + ' (' + (parent.relationship || 'Guardian') + ')') +
    row_('NRIC / FIN', parent.ic || '—') +
    row_('Mobile', parent.phone) +
    row_('Email', parent.email) +
    row_('Terms', terms.map((t) => t.label).join(', ') || '—') +
    row_('Total due', money_(data.total)) +
    row_('Receipt', link(receiptFile, 'Open receipt')) +
    row_('Agreement', link(agreementFile, 'Open signed agreement')) +
    row_('Signature', link(signatureFile, 'Open signature image')) +
    row_('Sheet', '<a href="' + sheet.getParent().getUrl() + '" style="color:#c8102e;font-weight:600;text-decoration:none;">Open Google Sheet</a>') +
    '</table>' +
    '<div style="background:#fdf8ee;border:1px dashed #d9c8a4;border-radius:12px;padding:14px 18px;font:400 12.5px/1.7 Helvetica,Arial,sans-serif;color:#6c7079;">' +
    'Next step: verify the receipt in the bank account, then change the <b>Status</b> column in the sheet to <b>Confirmed</b>.' +
    '</div>';

  return emailShell_(
    'New registration',
    athlete.name + ' · ' + money_(data.total) + ' · ' + ref,
    inner
  );
}

/* ==========================================================================
   OPTIONAL — run this once from the editor to create the sheet + folder
   ========================================================================== */
function setupOnce() {
  const sheet = getSheet_();
  const folder = getFolder_();
  Logger.log('Sheet ready: ' + sheet.getParent().getUrl());
  Logger.log('Drive folder ready: ' + folder.getUrl());
}
