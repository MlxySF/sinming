# Wushu Sport Academy — Registration Website

A bilingual (English / 中文) full-screen landing page plus a 4-step registration form built with **React + Vite**, made for a Malaysian wushu academy.
Submissions land in a **Google Sheet**, files (signature, receipt, signed agreement PDF) go
to a **Google Drive folder**, and the parent automatically receives a **styled confirmation
email** with their agreement attached.

No backend server, no database, no monthly fee — Google Apps Script does the work.

---

## What is inside

**1 · Landing page** (`/`)
Full-viewport hero with the academy branding, hero photography, a fee dialog and a
*Start registration* button that opens the form. The header holds a single control: the
**EN / 中文** switch — the entire site (landing, form, validation messages, success page)
switches language instantly and remembers the choice.

**2 · Step 1 — Agreement** (`#register`)
Terms & conditions covering fees, sudden schedule changes for competitions / performances /
events, the replacement-class policy, and the accepted reasons for leave. The parent ticks
consent, **signs with a mouse or finger on a canvas**, and the app turns that signature into
a cropped PNG, then builds a **signed PDF agreement** in the browser.

**3 · Step 2 — Parent details**
Name, MyKad NRIC (auto-formatted `900101-14-5678`), Malaysian mobile
(auto-formatted `012-345 6789` / `011-2345 6789`), email and relationship with the athlete.

**4 · Step 3 — Athlete details**
English name, Chinese name, MyKad NRIC, gender, school and class. **Age is calculated
automatically from the birth year inside the NRIC** (month and day are ignored).

**5 · Step 4 — Payment**
Multi-select term checkboxes (dates + price each) that add up into a total due (RM), the
bank transfer details with copy buttons, and a drag-and-drop **receipt upload**.

**6 · Submit**
Writes a row to the Google Sheet → saves the three files to Drive → emails the parent (HTML
template + agreement PDF) and notifies the admin → shows an animated success page with the
reference number and a *Download agreement* button.

---

## Quick start (local)

```bash
npm install          # once
npm run dev          # http://localhost:5173
```

The form starts in **preview mode** until you connect Google (nothing is saved, and the
success page tells you so).

### Connect Google Sheets + email

Follow **[`google-apps-script/SETUP.md`](google-apps-script/SETUP.md)** — about 5 minutes.
Then create `.env` from `.env.example`:

```bash
VITE_SHEETS_ENDPOINT=https://script.google.com/macros/s/AKfycb.../exec
VITE_FORM_TOKEN=            # optional shared secret
```

and rebuild:

```bash
npm run build
```

### Publish it

Follow **[`DEPLOYMENT.md`](DEPLOYMENT.md)** — cPanel / File Manager, FTP, Netlify, Vercel and
GitHub Pages, plus a go-live checklist and troubleshooting.

---

## The one file you will edit most: `src/config.js`

| Export | What it controls |
| --- | --- |
| `ACADEMY` | Name, email, phone, SSM/company number, **logo links**, PDF letterhead |
| `BANK` | Bank name, account name, account number |
| `PAYMENT_TERMS` | The term checkboxes — term number, year, class dates (type them in your own words, e.g. `Jan 4, 11, 18, 25`), sessions, price (RM) |
| `formatMoney` | Currency formatting (`RM`) |

Wording lives in two dictionaries that mirror each other exactly:

| File | Contents |
| --- | --- |
| `src/i18n/en.js` | Every English string: hero, form labels, validation errors, terms, success page, PDF labels |
| `src/i18n/zh.js` | The same keys in Chinese |

Change → `npm run build` → re-upload `dist`. That is the whole update loop.

---

## Project structure

```
├── index.html                  fonts + page shell
├── vite.config.js              relative asset paths, dev server config
├── .env.example                where the Apps Script URL goes
├── src/
│   ├── main.jsx                React entry point
│   ├── App.jsx                 landing ▸ form ▸ success switching
│   ├── config.js               business details (fees, bank, academy, terms)
│   ├── i18n/
│   │   ├── en.js               every English string
│   │   ├── zh.js               every Chinese string
│   │   └── index.jsx           language provider + useI18n() hook
│   ├── styles.css              design system (colours, type, components)
│   ├── components/
│   │   ├── Landing.jsx         full-screen hero + fee dialog
│   │   ├── LanguageToggle.jsx  EN / 中文 switch
│   │   ├── RegistrationFlow.jsx  state, validation, submit pipeline
│   │   ├── Stepper.jsx         4-step progress indicator
│   │   ├── StepShell.jsx       card layout shared by all steps
│   │   ├── SignaturePad.jsx    canvas signature capture
│   │   ├── Fields.jsx          input / select / segmented controls
│   │   ├── Success.jsx         animated confirmation page
│   │   └── Icons.jsx           inline SVG icons
│   ├── steps/
│   │   ├── StepAgreement.jsx   step 1
│   │   ├── StepParent.jsx      step 2
│   │   ├── StepAthlete.jsx     step 3
│   │   └── StepPayment.jsx     step 4
│   └── lib/
│       ├── agreement.js        jsPDF agreement builder (lazy-loaded)
│       ├── signature.js        strokes ▸ cropped PNG
│       ├── submit.js           POST to Apps Script
│       ├── terms.js            selected terms, totals, localised date ranges
│       └── utils.js            validation, formatting, image compression
├── google-apps-script/
│   ├── Code.gs                 the backend: sheet + drive + emails
│   └── SETUP.md                step-by-step Google setup
└── DEPLOYMENT.md               how to get it onto your web hosting
```

---

## Notes

- **Bundle**: the landing page ships ~87 kB gzipped; the 400 kB PDF library is only
  downloaded when the parent actually submits.
- **Typography**: English uses Anton (display) + Cormorant Garamond (accent) + Inter (body).
  Chinese switches to **Ma Shan Zheng** (brush calligraphy) for headlines, the 武 seal and the
  watermarks, and **Noto Serif SC** for paragraph copy — set in `src/styles.css` under the
  `html[data-lang='zh']` rules.
- **Language** starts as English, switches instantly with the header toggle, is stored in
  `localStorage`, and the parent's choice is sent with the submission so the confirmation
  email is written in the same language.
- **Malaysian formats**: NRIC is validated and formatted as `YYMMDD-PB-###G`; mobile numbers
  as `012-345 6789` or `011-2345 6789`; the athlete's age comes from the NRIC birth year.
- **Signature images** are cropped, trimmed of empty space and exported at 1200 px wide.
- **Receipt photos** are automatically resized (max 1700 px, JPEG) so a phone photo of 8 MB
  becomes ~300 kB before upload.
- **Validation** runs on every step, with inline messages; nothing can be submitted without a
  signature, the required details, at least one term and a receipt.
- **Your Apps Script URL is visible in the built JavaScript** (that is unavoidable for any
  static site). The optional `VITE_FORM_TOKEN` / `SHARED_TOKEN` pair stops random junk posts.
- Fonts load from Google Fonts; if you host in a region that blocks them, the CSS falls back
  to system fonts without breaking the layout.
