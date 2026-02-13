# Google Apps Script (GAS) — Deploy & usage

1) Create a new Google Spreadsheet and note its ID (from URL).
2) Open Extensions → Apps Script and paste `google-apps-script.gs` content.
3) Run `setTargetSheetId('<SPREADSHEET_ID>')` once in the script editor to allow access.
4) Generate a secure token (16+ chars, random): e.g. `openssl rand -hex 32` → set via `setGASToken('token')`
5) Deploy → New deployment → Select "Web app" → Execute as: `Me` → Who has access: `Anyone`.
6) Copy the Web App URL (this is `GAS_URL`).

Usage: from the server, POST the CSV body to `GAS_URL` with Bearer token:

```bash
GAS_TOKEN='<token>' GAS_URL='https://script.google.com/.../exec' node scripts/push-to-gas.js exports/payments-2026-03-01.csv
```

Or with cron:

```bash
# Daily at 08:05, export and push
5 8 * * * cd /var/www/agri-point && GAS_TOKEN="<token>" GAS_URL="<url>" node scripts/export-payments.js && node scripts/push-to-gas.js exports/payments-$(date +%Y-%m-%d).csv
```

Notes:
- The token is checked in `doPost` via Bearer auth header.
- The script appends CSV rows to the target sheet.
- If sensitive data, use a secure token (16+ random alphanumeric chars).
