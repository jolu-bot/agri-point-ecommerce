# Post-Launch Quickstart

Commandes utiles

1) Lancer l'agent de monitoring (exécution unique):
```bash
node scripts/monitoring-agent.js
```

2) Lancer l'agent en permanence avec PM2:
```bash
npm run pm2:monitor:start
# Pour arrêter:
npm run pm2:monitor:stop
```

3) Exporter paiements d'une date (API local doit être accessible):
```bash
API_URL=http://localhost:3000 npm run export:payments -- --date=2026-03-01
```

4) Générer JSON pour dashboard (nécessite MONGODB_URI):
```bash
MONGODB_URI="mongodb+srv://..." npm run dashboard:generate
```

Fichiers produits
- `exports/payments-YYYY-MM-DD.csv`
- `exports/dashboard-<timestamp>.json`
- `logs/monitoring.log`

Installation PM2 (optionnel):
```bash
npm install -g pm2
```

Notes
- `export-payments.js` utilise l'endpoint `/api/admin/orders` du serveur pour récupérer les commandes.
- `generate-dashboard-data.js` se connecte directement à MongoDB pour produire des agrégations.
