# How to put this website on your web hosting

Written for someone who has never deployed a React site. Follow it top to bottom.

---

## Part 0 — The one thing to understand first

React is **not** uploaded the way a plain HTML site is. The files in `src/` are the
"recipe". Your browser cannot read them directly. You must **build** them once, and the
build produces a normal, static website in a folder called **`dist`**.

| Folder | What it is | Upload to hosting? |
| --- | --- | --- |
| `src/` | The React source code you edit | ❌ No |
| `node_modules/` | Downloaded libraries (hundreds of MB) | ❌ No |
| `public/` | Images and static files | ❌ No (already copied into `dist`) |
| **`dist/`** | **The finished website** (`index.html` + `assets/`) | ✅ **Yes — this is the website** |

Three files inside `dist` after a build:

```
dist/
├── index.html
├── hero-wushu.jpg
└── assets/
    ├── index-xxxxxxxx.js
    ├── index-xxxxxxxx.css
    └── ...other chunks
```

Upload the **contents of `dist`**, not the `dist` folder itself.

---

## Part 1 — Build the website on your computer

### 1.1 Install Node.js (once)

Download the LTS version from <https://nodejs.org> and install it. To confirm it worked,
open Terminal (Mac) or Command Prompt / PowerShell (Windows) and type:

```bash
node -v
npm -v
```

You should see version numbers (e.g. `v22.x` and `10.x`).

### 1.2 Install the project libraries (once)

In Terminal, `cd` into the project folder (the one with `package.json`):

```bash
cd path/to/sinming
npm install
```

### 1.3 Add your Google Apps Script URL (once)

1. Copy `.env.example` → rename the copy to `.env`.
2. Paste your Web App URL after `VITE_SHEETS_ENDPOINT=` (see
   `google-apps-script/SETUP.md` to get it).

```bash
VITE_SHEETS_ENDPOINT=https://script.google.com/macros/s/AKfycb..../exec
```

> Skip this step only if you want the form in **preview/demo mode** (nothing is saved).

### 1.4 Build

```bash
npm run build
```

Wait 2–10 seconds. You now have a `dist` folder — that is your whole website.

**Optional — check it before uploading:**

```bash
npm run preview
```

Open <http://localhost:4173>, click through the form, and confirm it works.

---

## Part 2 — Upload to cPanel hosting (Hostinger, Exabytes, Shinjiru, GoDaddy…)

This is the most common setup for a small business in Malaysia (Hostinger, Exabytes,
Vodien, Shinjiru, GoDaddy…).

1. Log in to your hosting control panel (cPanel / hPanel).
2. Open **File Manager**.
3. Go into **`public_html`** (this folder *is* your website's root).
4. **Delete** the old placeholder files inside `public_html`
   (`index.html`, `default.php`, etc.) — but **keep** `.htaccess` if one exists.
5. Zip the **contents of `dist`** on your computer:
   select `index.html`, `hero-wushu.jpg` and the `assets` folder → right-click → compress.
   *(Do not zip the `dist` folder itself — the files must sit directly in `public_html`.)*
6. In File Manager click **Upload**, choose your zip, wait for it to finish.
7. Right-click the uploaded zip ▸ **Extract** ▸ extract into `/public_html`.
8. Delete the zip afterwards.
9. Visit `https://yourdomain.com`.

Your `public_html` should end up looking like:

```
public_html/
├── index.html
├── hero-wushu.jpg
├── assets/
└── .htaccess   (optional, see Part 6)
```

### If you see a blank page or unstyled text

99% of the time the folder structure is wrong — usually you uploaded `dist/index.html`
sitting next to a `dist/assets` folder. `index.html` and `assets/` must be **siblings**
inside `public_html`. Also hard-refresh with **Ctrl/Cmd + Shift + R**.

---

## Part 3 — Upload with FTP (FileZilla)

1. Get the FTP details from your host: host, username, password, port 21.
2. In FileZilla: **File ▸ Site Manager ▸ New site** and enter them ▸ **Connect**.
3. On the right side (your server), open `public_html`.
4. On the left side (your computer), open the `dist` folder.
5. Select everything **inside** `dist` (`index.html`, `hero-wushu.jpg`, `assets`) and drag
   it into `public_html` on the right. Choose **Overwrite** when asked.
6. Wait for the queue to finish, then visit your domain.

---

## Part 4 — Free hosting with Netlify (easiest, no cPanel)

1. Run `npm run build` (with your `.env` in place).
2. Go to <https://app.netlify.com/drop>.
3. Drag the **`dist` folder** onto the page.
4. You get a live URL like `https://wushu-academy-abc123.netlify.app` in ~10 seconds.
5. **Domain:** Site settings ▸ Domain management ▸ Add a domain ▸ follow the DNS steps.

> Netlify Drop re-uploads each time you rebuild. For automatic deploys, connect a GitHub
> repo with build command `npm run build` and publish directory `dist`.

---

## Part 5 — Vercel (also free)

**Option A — dashboard**

1. Push this folder to a GitHub repository.
2. Go to <https://vercel.com> ▸ **Add New ▸ Project** ▸ import the repo.
3. Framework preset: **Vite**. Build command `npm run build`. Output directory `dist`.
4. Environment variable: `VITE_SHEETS_ENDPOINT` = your Apps Script URL.
5. **Deploy**.

**Option B — command line**

```bash
npm i -g vercel
vercel        # follow the prompts, accept the Vite defaults
vercel --prod
```

---

## Part 6 — Nice extras

### Force HTTPS + cache assets (`.htaccess`, Apache/cPanel)

Create `public_html/.htaccess` with:

```apache
# Always use HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Long cache for hashed assets, no cache for index.html
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml
</IfModule>
```

### Sub-folder install (e.g. `yourdomain.com/register/`)

Already handled — the build uses **relative** asset paths (`base: './'` in
`vite.config.js`), so you can upload `dist` contents into any sub-folder and it works.

---

## Part 7 — How to change content later

| I want to change… | Edit this file | Then |
| --- | --- | --- |
| Term dates / fees | `src/config.js` → `PAYMENT_TERMS` | `npm run build` + re-upload `dist` |
| Bank account, DuitNow | `src/config.js` → `BANK` | same |
| Academy name, phone, email, address | `src/config.js` → `ACADEMY` | same |
| Terms & conditions wording | `src/i18n/en.js` + `src/i18n/zh.js` → `terms.list` | same |
| Any English / Chinese wording | `src/i18n/en.js`, `src/i18n/zh.js` | same |
| Colours / fonts | `src/styles.css` (`:root` variables at the top) | same |
| Email template wording | `google-apps-script/Code.gs` → `EMAIL_COPY` / `parentEmailHtml_` | Deploy ▸ Manage deployments ▸ new version |
| Google Sheet email / admin notifications | `google-apps-script/Code.gs` → `CONFIG` | new deployment version |

> Rule of thumb: **anything in `src/` or `.env` requires a rebuild**; anything in
> `Code.gs` requires a **new Apps Script deployment version**.

### Working locally while you edit

```bash
npm run dev
```

Open <http://localhost:5173>. Every save refreshes the page instantly.

---

## Part 8 — Go-live checklist

- [ ] `npm run build` finishes with no errors.
- [ ] `.env` contains the real `VITE_SHEETS_ENDPOINT`.
- [ ] Opening the Apps Script URL in a browser returns `{"ok":true,...}`.
- [ ] A real test registration appears in the Google Sheet.
- [ ] The parent confirmation email arrives (with the PDF attached).
- [ ] The receipt and signature files are in your Google Drive folder.
- [ ] Tested on a phone — the landing page, the signature pad and the file upload.
- [ ] Your `PAYMENT_TERMS`, `BANK` and `ACADEMY` details are the real ones.
- [ ] HTTPS is on (padlock) — the signature pad and uploads need a secure origin.

---

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| Blank white page after upload | Wrong folder layout. `index.html` must sit next to `assets/`. |
| Page loads but no styling | Old cached `index.html`. Hard refresh, and clear the host cache. |
| "We could not reach the server" on submit | Apps Script not deployed with access **Anyone**, or you edited code without redeploying. |
| Form says "Preview mode" on the success page | `VITE_SHEETS_ENDPOINT` was empty when you built. Fix `.env`, rebuild, re-upload. |
| Fonts look like Times New Roman | The Google Fonts request is blocked. Check the network or self-host the fonts. |
| Signature pad not drawing on iPad | Make sure the site is HTTPS; `touch-action` is already handled. |
| Receipt upload fails on an iPhone HEIC photo | The site auto-converts to JPEG; if it still fails, ask for a screenshot instead. |
| Images 404 | You uploaded `dist` by drag-and-drop into `public_html/dist/`. Move the contents up one level. |
