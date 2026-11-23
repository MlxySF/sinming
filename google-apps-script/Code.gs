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
  ACADEMY_PHONE: '019-219 1688',
  ACADEMY_ADDRESS: 'No. 12, Jalan Ampang, 50450 Kuala Lumpur, Malaysia',
  ACADEMY_COMPANY_NO: '202301234567',

  // Optional: a public https link to your logo — shown at the top of emails.
  LOGO_URL: '',

  BANK_BANK_NAME: 'Maybank',
  BANK_ACCOUNT_NAME: 'Wushu Sport Academy Sdn Bhd',
  BANK_ACCOUNT_NO: '5123 4567 8901',
  BANK_DUITNOW: '019-219 1688',

  SEND_PARENT_EMAIL: true,
  SEND_ADMIN_EMAIL: true,

  TIMEZONE: 'Asia/Kuala_Lumpur',
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
  'Total Due (RM)',
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
      parent.relationshipLabel || parent.relationship || '',
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
          subject: emailCopy_(data).subject(athlete.name, ref),
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
    sheet.getRange(2, 17, 500, 1).setNumberFormat('"RM"#,##0.00');
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
  const body = (Math.round(n * 100) / 100).toLocaleString('en-MY', {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return 'RM' + body;
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

const EMAIL_COPY = {
  en: {
    subject: (name, ref) => '✅ Registration received — ' + name + ' (' + ref + ')',
    title: 'Registration received',
    preheader: (ref) => 'We have your signed agreement and receipt — reference ' + ref,
    dear: (name) => 'Dear ' + name + ',',
    intro: (athlete) =>
      'Thank you for registering ' + athlete + ' with Wushu Sport Academy. We have received your signed agreement and payment receipt — our admin team is verifying the payment now (usually within one working day).',
    refLabel: 'Registration reference',
    submitted: (stamp) => 'Submitted ' + stamp,
    yourRegistration: 'Your registration',
    labels: {
      athlete: 'Athlete',
      chineseName: 'Chinese name',
      ageGender: 'Age / Gender',
      schoolClass: 'School / Class',
      parent: 'Parent',
      mobile: 'Mobile',
      email: 'Email',
    },
    termFees: 'Term fees selected',
    classes: 'classes',
    totalDue: 'Total amount due',
    payment: 'Payment details',
    paymentLabels: {
      bank: 'Bank',
      accountName: 'Account name',
      accountNumber: 'Account number',
      duitnow: 'DuitNow',
    },
    attached: (name) => '📎 Your signed agreement (<b>' + name + '</b>) is attached to this email. Keep it for your records.',
    receiptReceived: (name) => '🧾 Receipt received: <b>' + name + '</b> — now pending verification.',
    nextTitle: 'What happens next',
    next: [
      'We verify your payment receipt.',
      'You receive a WhatsApp message with the venue, timing and first-lesson details.',
      'Please arrive 10 minutes early on the first day with a water bottle and indoor shoes.',
    ],
    questions: 'Questions? Reply to this email or WhatsApp us at ',
    regards: 'Warm regards,',
    team: 'Admin Team',
    footerNote: 'This is an automated confirmation of your registration.',
  },
  zh: {
    subject: (name, ref) => '✅ 已收到报名 — ' + name + '（' + ref + '）',
    title: '报名已收到',
    preheader: (ref) => '已收到您签署的同意书与收据 —— 报名编号 ' + ref,
    dear: (name) => '尊敬的 ' + name + '：',
    intro: (athlete) =>
      '感谢您为 ' + athlete + ' 报名参加 Wushu Sport Academy 的课程。我们已收到您签署的同意书及付款收据，行政团队正在核对付款（通常在一个工作日内完成）。',
    refLabel: '报名编号',
    submitted: (stamp) => '提交时间：' + stamp,
    yourRegistration: '您的报名资料',
    labels: {
      athlete: '学员',
      chineseName: '中文姓名',
      ageGender: '年龄 / 性别',
      schoolClass: '学校 / 班级',
      parent: '家长',
      mobile: '手机',
      email: '电邮',
    },
    termFees: '已选学期',
    classes: '堂课',
    totalDue: '应付总额',
    payment: '付款方式',
    paymentLabels: {
      bank: '银行',
      accountName: '户名',
      accountNumber: '账号',
      duitnow: 'DuitNow',
    },
    attached: (name) => '📎 您签署的同意书（<b>' + name + '</b>）已附在本电邮中，请妥善保存。',
    receiptReceived: (name) => '🧾 已收到收据：<b>' + name + '</b> —— 正在核对中。',
    nextTitle: '接下来',
    next: [
      '我们会核对您的付款收据。',
      '您会收到 WhatsApp 讯息，通知上课地点、时间及第一堂课详情。',
      '第一堂课请提前 10 分钟抵达，并自备水瓶与室内鞋。',
    ],
    questions: '如有疑问，请回覆此电邮，或 WhatsApp 联络 ',
    regards: '此致，',
    team: '行政团队',
    footerNote: '此电邮由系统自动发送，作为报名确认。',
  },
};

function emailCopy_(data) {
  return EMAIL_COPY[data && data.lang === 'zh' ? 'zh' : 'en'];
}

function emailShell_(copy, title, preheader, inner) {
  return (
    '<div style="background:#f7f2e8;padding:28px 12px;">' +
    '<div style="max-width:600px;margin:0 auto;background:#fffdf9;border:1px solid #e3dacb;border-radius:18px;overflow:hidden;box-shadow:0 18px 44px -30px rgba(20,16,8,.5);">' +
    /* dark header */
    '<div style="background:#0b0d10;padding:30px 32px 26px;border-bottom:3px solid #e0b45c;">' +
    (CONFIG.LOGO_URL
      ? '<img src="' +
        CONFIG.LOGO_URL +
        '" alt="" width="44" height="44" style="display:block;width:44px;height:44px;object-fit:contain;margin-bottom:14px;border-radius:10px;background:#ffffff14;">'
      : '') +
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
    ' · SSM ' +
    esc_(CONFIG.ACADEMY_COMPANY_NO) +
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
    esc_(copy.footerNote) +
    '</div>' +
    '</div>'
  );
}

function parentEmailHtml_(data, ref, stamp, receiptFile, agreementFile) {
  const copy = emailCopy_(data);
  const parent = data.parent || {};
  const athlete = data.athlete || {};
  const terms = Array.isArray(data.terms) ? data.terms : [];
  const total = money_(data.total);
  const L = copy.labels;
  const P = copy.paymentLabels;

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
        ' ' +
        esc_(copy.classes) +
        '</span></td>' +
        '<td style="padding:9px 0;border-bottom:1px dashed #e3dacb;font:700 13px/1.5 Helvetica,Arial,sans-serif;color:#14171c;text-align:right;white-space:nowrap;">' +
        money_(t.price) +
        '</td></tr>'
    )
    .join('');

  const inner =
    '<p style="margin:0 0 18px;font:400 14px/1.7 Helvetica,Arial,sans-serif;color:#3c4048;">' +
    esc_(copy.dear(parent.name)) +
    '</p>' +
    '<p style="margin:0 0 22px;font:400 14px/1.7 Helvetica,Arial,sans-serif;color:#3c4048;">' +
    copy.intro('<b>' + esc_(athlete.name) + '</b>') +
    '</p>' +
    /* reference pill */
    '<div style="border:1px dashed #d9c8a4;background:#fdf8ee;border-radius:12px;padding:14px 18px;margin-bottom:22px;">' +
    '<div style="font:600 10px/1 Helvetica,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#a97e2f;">' +
    esc_(copy.refLabel) +
    '</div>' +
    '<div style="margin-top:6px;font:700 18px/1.3 Helvetica,Arial,sans-serif;color:#14171c;letter-spacing:.06em;">' +
    esc_(ref) +
    '</div>' +
    '<div style="margin-top:4px;font:400 11px/1.5 Helvetica,Arial,sans-serif;color:#8b8f98;">' +
    esc_(copy.submitted(stamp)) +
    '</div></div>' +
    /* details */
    '<div style="font:700 10px/1 Helvetica,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#c8102e;margin-bottom:10px;">' +
    esc_(copy.yourRegistration) +
    '</div>' +
    '<table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #ece6da;border-radius:12px;border-collapse:separate;overflow:hidden;margin-bottom:22px;">' +
    row_(L.athlete, athlete.name) +
    row_(L.chineseName, athlete.chineseName || '—') +
    row_(L.ageGender, (athlete.age || '—') + ' · ' + (athlete.gender || '—')) +
    row_(L.schoolClass, (athlete.school || '—') + ' · ' + (athlete.className || '—')) +
    row_(L.parent, parent.name + ' (' + (parent.relationshipLabel || parent.relationship || '') + ')') +
    row_(L.mobile, parent.phone) +
    row_(L.email, parent.email) +
    '</table>' +
    /* fees */
    '<div style="font:700 10px/1 Helvetica,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#c8102e;margin-bottom:10px;">' +
    esc_(copy.termFees) +
    '</div>' +
    '<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:8px;">' +
    termRows +
    '</table>' +
    '<table cellpadding="0" cellspacing="0" width="100%" style="background:#0b0d10;border-radius:12px;margin-bottom:24px;">' +
    '<tr><td style="padding:16px 18px;font:600 10px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:rgba(244,239,230,.6);">' +
    esc_(copy.totalDue) +
    '</td>' +
    '<td style="padding:16px 18px;text-align:right;font:700 22px/1 Helvetica,Arial,sans-serif;color:#f3d79a;">' +
    total +
    '</td></tr></table>' +
    /* payment instructions */
    '<div style="border:1px solid #ece6da;border-radius:12px;padding:16px 18px;margin-bottom:22px;background:#fbf7ef;">' +
    '<div style="font:700 10px/1 Helvetica,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#14171c;margin-bottom:10px;">' +
    esc_(copy.payment) +
    '</div>' +
    '<div style="font:400 12.5px/1.9 Helvetica,Arial,sans-serif;color:#3c4048;">' +
    esc_(P.bank) +
    ': <b>' +
    esc_(CONFIG.BANK_BANK_NAME) +
    '</b><br>' +
    esc_(P.accountName) +
    ': <b>' +
    esc_(CONFIG.BANK_ACCOUNT_NAME) +
    '</b><br>' +
    esc_(P.accountNumber) +
    ': <b>' +
    esc_(CONFIG.BANK_ACCOUNT_NO) +
    '</b><br>' +
    esc_(P.duitnow) +
    ': <b>' +
    esc_(CONFIG.BANK_DUITNOW) +
    '</b>' +
    '</div></div>' +
    /* attachments */
    (agreementFile ? '<div style="font:400 12.5px/1.7 Helvetica,Arial,sans-serif;color:#3c4048;margin-bottom:12px;">' + copy.attached(esc_(agreementFile.getName())) + '</div>' : '') +
    (receiptFile ? '<div style="font:400 12.5px/1.7 Helvetica,Arial,sans-serif;color:#3c4048;margin-bottom:16px;">' + copy.receiptReceived(esc_(receiptFile.getName())) + '</div>' : '') +
    /* next steps */
    '<div style="border-left:3px solid #c8102e;padding:4px 0 4px 14px;margin-bottom:22px;">' +
    '<div style="font:700 10px/1 Helvetica,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#c8102e;margin-bottom:8px;">' +
    esc_(copy.nextTitle) +
    '</div>' +
    '<div style="font:400 12.5px/1.8 Helvetica,Arial,sans-serif;color:#3c4048;">' +
    copy.next
      .map(function (line, index) {
        return index + 1 + '. ' + esc_(line);
      })
      .join('<br>') +
    '</div>' +
    '</div>' +
    '<div style="border-top:1px solid #ece6da;padding-top:18px;font:400 12px/1.7 Helvetica,Arial,sans-serif;color:#6c7079;">' +
    esc_(copy.questions) +
    '<a href="https://wa.me/' +
    String(parent.phoneIntl || CONFIG.ACADEMY_PHONE).replace(/[^\d]/g, '') +
    '" style="color:#c8102e;text-decoration:none;font-weight:600;">WhatsApp ' +
    esc_(CONFIG.ACADEMY_PHONE) +
    '</a><br><br>' +
    esc_(copy.regards) +
    '<br><b style="color:#14171c;">' +
    esc_(CONFIG.ACADEMY_NAME) +
    ' — ' +
    esc_(copy.team) +
    '</b></div>';

  return emailShell_(copy, copy.title, copy.preheader(ref), inner);
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
    row_('Parent', parent.name + ' (' + (parent.relationshipLabel || parent.relationship || 'Guardian') + ')') +
    row_('NRIC (MyKad)', parent.ic || '—') +
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
    EMAIL_COPY.en,
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
