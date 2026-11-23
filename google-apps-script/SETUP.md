# Connect the form to Google Sheets + Email (5 minutes)

This folder contains **one file**: `Code.gs`. Paste it into Google Apps Script and your
website will be able to:

- add every registration as a **row in a Google Sheet**,
- save the **signature image**, **payment receipt** and **signed agreement PDF** into a
  Google Drive folder,
- send an **attractive confirmation email** to the parent (with the agreement attached)
  and a notification to you.

You do **not** need a server, a database or any paid service. Google does the work.

---

## Step 1 — Create the Google Sheet

1. Go to <https://sheets.new> (signed in with the Google account that should own the data).
2. Rename the file to something obvious, e.g. **Wushu Sport Academy — Registrations**.
3. Rename the first tab (bottom left) to **`Registrations`** — spelling must match exactly.
   *(If you skip this, the script creates the tab for you anyway.)*

## Step 2 — Open the script editor

1. In that sheet: **Extensions ▸ Apps Script**.
2. Delete everything inside `Code.gs` (the placeholder `function myFunction()`).
3. Open `Code.gs` from this folder, copy **all** of it, paste it in, and press
   **💾 Save**.

## Step 3 — Edit the CONFIG block (top of the file)

Change these to your real details:

```js
const CONFIG = {
  SPREADSHEET_ID: '',                              // leave empty (script is bound to the sheet)
  SHEET_NAME: 'Registrations',
  DRIVE_FOLDER_ID: '',              // ← optional: paste your Drive folder ID here
  DRIVE_FOLDER_NAME: 'Wushu Sport Academy — Registrations',
  ADMIN_EMAILS: 'admin@wushusportacademy.com',     // ← your email
  ACADEMY_NAME: 'Wushu Sport Academy',
  ACADEMY_EMAIL: 'admin@wushusportacademy.com',
  ACADEMY_PHONE: '019-219 1688',
  ACADEMY_COMPANY_NO: '202301234567',
  LOGO_URL: '',              // optional public https link — shows in emails

  BANK_BANK_NAME: 'Maybank',
  BANK_ACCOUNT_NAME: 'Wushu Sport Academy Sdn Bhd',
  BANK_ACCOUNT_NO: '5123 4567 8901',

  SHARED_TOKEN: '',          // optional — must match VITE_FORM_TOKEN
  SEND_PARENT_EMAIL: true,
  SEND_ADMIN_EMAIL: true,
  TIMEZONE: 'Asia/Kuala_Lumpur',
};
```

Save again.

## Step 4 — Choose where uploads are saved

Every registration creates three files: the signature, the payment receipt and the
signed agreement PDF. They are saved in your Google Drive.

**Option A — use a folder you already have (recommended).** In Google Drive, open
(or create) the folder you want. Look at the address bar — the folder ID is the long
string after `/folders/`:

```
https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYzXxYyZz
                                         └──── this is DRIVE_FOLDER_ID ────┘
```

Paste it into `CONFIG` at the top of `Code.gs`:

```js
DRIVE_FOLDER_ID: '1AbCdEfGhIjKlMnOpQrStUvWxYzXxYyZz',
```

Make sure the Google account running the script (the one that owns the Sheet) has
**editor** access to that folder — otherwise uploads are rejected and the reason is
written to the Apps Script log.

**Option B — let the script create one.** Leave `DRIVE_FOLDER_ID` empty. The script
looks for a folder named `DRIVE_FOLDER_NAME` and creates it on the first upload.

Then, in the Apps Script editor choose the function **`setupOnce`** in the dropdown
and press **Run**. Approve the permissions when Google asks
(*"Review permissions" ▸ choose account ▸ Advanced ▸ Go to … (unsafe) ▸ Allow* — this
warning is normal for your own scripts).

The log will show links to the sheet and the upload folder — click the folder link to
confirm it is the one you want. That is the fastest way to check a folder ID.

## Step 5 — Deploy as a Web App

1. Top right: **Deploy ▸ New deployment**.
2. Click the gear icon ▸ **Web app**.
3. Fill in:
   - **Description**: `Registration form v1`
   - **Execute as**: **Me**
   - **Who has access**: **Anyone**  ← important, otherwise the website cannot reach it
4. Click **Deploy**, then **Authorise access** if prompted.
5. Copy the **Web app URL**. It looks like:

   ```
   https://script.google.com/macros/s/AKfycb..................../exec
   ```

> Every time you edit `Code.gs` you must publish the change:
> **Deploy ▸ Manage deployments ▸ ✏️ (edit) ▸ Version: New version ▸ Deploy**.
> The URL stays the same.

## Step 6 — Test it in your browser

Paste the URL into a browser address bar and hit enter. You should see:

```json
{"ok":true,"message":"Wushu Sport Academy registration endpoint is live.","sheet":"Registrations","rows":0,...}
```

If you see a Google sign-in page instead, go back to step 5 and set
**Who has access = Anyone**.

## Step 7 — Put the URL into the website

1. In the project folder (next to `package.json`) copy `.env.example` to `.env`.
2. Paste your URL:

   ```bash
   VITE_SHEETS_ENDPOINT=https://script.google.com/macros/s/AKfycb.../exec
   ```

3. Rebuild the site so the URL is baked in:

   ```bash
   npm run build
   ```

4. Upload the new `dist` folder to your hosting (see `DEPLOYMENT.md`).

**Important:** `VITE_` values are compiled into the website at build time. If you only
change `.env`, nothing changes on your live site until you run `npm run build` and
re-upload.

---

## What ends up in the Google Sheet?

| Column | Example |
| --- | --- |
| Timestamp | 23 Nov 2026, 14:08 |
| Reference | WSA-261123-4K7Q |
| Status | Pending verification |
| Parent Name / NRIC / Mobile / Email / Relationship | … |
| Athlete Name / Chinese Name / NRIC / Age / Gender / School / Class | … |
| Terms | Term 1 · 2027 (4 Jan – 28 Mar 2027) \| Term 2 · 2027 (…) |
| Total Due (RM) | 480 |
| Receipt File / Receipt Link | `WSA-…-receipt.jpg` + Drive link |
| Agreement File / Agreement Link | `WSA-…-Registration-Agreement.pdf` + Drive link |
| Signature Link | Drive link to the signature PNG |
| Email Sent | `Sent to parent@email.com` |
| Notes | submission URL |

Change **Status** to `Confirmed` once you have verified the bank transfer.

## Good practice

- Keep the sheet private — do not share it "anyone with the link can edit".
- Each uploaded file (signature, receipt, agreement) is link-shared as view-only so
  the links in the admin email open for you. Tighten this in `saveFile_()` if your
  policy forbids it — the admin keeps access either way.
- Check the sheet once a day; it is your enrolment ledger.
- Free Gmail accounts can send ~100 emails/day through Apps Script (plenty).
- The parent confirmation email is sent in the language the parent used on the
  form (English or Chinese) — the signed PDF agreement is always in English.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `{"ok":false,"error":"No spreadsheet found..."}` | Open the script from the Sheet (Extensions ▸ Apps Script), or set `SPREADSHEET_ID`. |
| Parent email not received | Check spam; check the **Email Sent** column; free accounts have daily send limits. |
| Form shows "We could not reach the server" | The deployment access is not **Anyone**, or you edited the code without deploying a new version. |
| `Script function not found: doPost` | The code was pasted into the wrong file/project — paste it into `Code.gs` of the sheet's script. |
| Submit fails with "Cannot open the upload folder DRIVE_FOLDER_ID" | The folder ID in `CONFIG` is wrong, or the account running the script cannot edit that folder. Open the folder in Drive, copy the ID from the URL again, and share the folder with your script account as **Editor**. |
| Everything is saved but emails go to spam | Add SPF/DKIM? Not possible with Gmail API free tier — ask parents to whitelist your address. |
