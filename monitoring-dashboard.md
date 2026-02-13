# Monitoring Dashboard — Daily Operations

Objectif
- Fournir une vue consolidée et actionable chaque heure pendant la période de campagne.

KPIs essentiels (à afficher en priorité)
- Uptime du site (HTTP 200 %)
- Temps de réponse moyen API (ms)
- Nombre d'ordres par heure
- Revenus par heure (FCFA)
- Taux d'erreur API (% d'500)
- File d'attente SMS / messages envoyés
- Connexions DB actives / erreurs DB

Sources de données
- Metrics: `app/api/health` (GET), PM2 logs, serveur Nginx
- Données applicatives: MongoDB aggregations (orders, payments)
- SMS: Infobip delivery reports (via webhook ou API)

Exemples de requêtes Mongo (agrégations)
1) Orders par heure (dernières 24h):
```js
db.orders.aggregate([
  { $match: { createdAt: { $gte: new Date(Date.now()-24*3600*1000) } } },
  { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
  { $sort: { "_id": 1 } }
])
```

2) Paiements impayés (70/30) :
```js
db.orders.find({ "installmentPayment.remaining": { $gt: 0 } })
```

Outils recommandés
- Grafana + Prometheus (metrics infra)
- Netdata ou Datadog pour alertes temps réel
- Dashboard simple: tableau Google Sheets connecté via script d'export

Alertes & seuils
- HTTP 5xx > 1% sur 10 min → ALERTE CRITIQUE
- Réponse API moyenne > 1000ms → ALERTE
- DB reconnects > 3/h → ALERTE
- SMS delivery < 90% dans 10 min → ALERTE

Actions quotidiennes
- 08:00: Export CSV des paiements → `payment-reconciliation.md`
- Toutes les heures (00:00-12:00): capture screenshot du dashboard et partager Slack

Fin.
