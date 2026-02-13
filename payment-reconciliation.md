# Payment Reconciliation — Procédure quotidienne

Objectif
- Vérifier et rapprocher toutes les transactions liées à la campagne pour garantir cohérence entre la plateforme, le PSP (paiement) et la comptabilité.

Étapes quotidiennes (08:00 UTC+1)
1. Exporter les transactions du jour depuis l'admin (CSV) ou via l'API:
   - `GET /api/admin/orders?since=YYYY-MM-DD` → export CSV
2. Lister les paiements marqués `paid` dans Mongo:
```js
db.orders.find({ createdAt: { $gte: ISODate("2026-03-01") }, status: "paid" })
```
3. Export PSP (ex: Stripe/Paygate) : télécharger rapport de la journée
4. Rapprocher par `orderId`, `amount`, `paymentDate`
5. Noter écarts dans `reconciliation-YYYY-MM-DD.csv` et assigner à `Finance`

Automatisation (script recommandé)
- Script simple: `scripts/export-payments.js` (à créer) qui:
  - interroge `/api/admin/orders`
  - génère `exports/payments-YYYY-MM-DD.csv`

Gestion des écarts
- Si écart < 5000 FCFA: créer note interne et surveiller
- Si écart >= 5000 FCFA: escalade à Finance + Audit

Livrables journaliers
- `exports/payments-YYYY-MM-DD.csv` (joinable avec PSP)
- `reconciliation-YYYY-MM-DD.md` (notes & actions)

Fin.
