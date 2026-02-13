# Google Apps Script (GAS) — Deploy & usage

1) Create a new Google Spreadsheet and note its ID (from URL).
2) Open Extensions → Apps Script and paste `google-apps-script.gs` content.
3) Run `setTargetSheetId('<SPREADSHEET_ID>')` once in the script editor to allow access.
4) Deploy → New deployment → Select "Web app" → Execute as: `Me` → Who has access: `Anyone` (or your org).
5) Copy the Web App URL (this is `GAS_URL`).

Usage: from the server, POST the CSV body to `GAS_URL`:

```bash
GAS_URL='https://script.google.com/.../exec' node scripts/push-to-gas.js exports/payments-2026-03-01.csv
```

Notes:
- Using `Anyone` allows unauthenticated POST; if sensitive, restrict and implement token check inside `doPost`.
- The script appends CSV rows to the target sheet.
