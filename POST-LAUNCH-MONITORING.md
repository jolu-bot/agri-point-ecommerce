# Phase 8 — Post-Launch Monitoring (1-31 Mars 2026)

Résumé court
- Objectif: Assurer disponibilité, performance, réconciliation financière et support client pendant et après la campagne.
- Période: 1 mars 2026 → 31 mars 2026 (daily ops)

Principales responsabilités
- Dev / DevOps: monitoring infra, alertes, rollback
- Support: gestion des tickets client, FAQ, réponses rapides
- Finance: réconciliation des paiements, journaux de transactions
- Marketing / PM: suivi KPIs, rapport d'impact

Livrables de la Phase 8
- `monitoring-dashboard.md` — tableau de bord quotidien + métriques
- `payment-reconciliation.md` — procédure quotidienne & script d'export
- `impact-report.md` — gabarit de rapport d'impact hebdomadaire
- `support-procedures.md` — workflow support client & templates
- `HOSTINGER-CHECKLIST.md` — checklist pour prestataire Hostinger
- `ROLLBACK-PROCEDURE.md` — procédure d'urgence et rollback technique
- `NON-SMS-COMMUNICATIONS.md` — guide clients sans SMS
- `CONTRACTS-SLA.md` — contrats / SLA internes
- `scripts/monitoring-agent.js` — script de vérification automatique (heartbeat)

Cadence opérationnelle
- Surveillance: checks automatisés toutes les 5 minutes (agent)
- Reporting court: mise à jour horaire du dashboard (00:00-12:00: toutes les heures)
- Réconciliation: quotidienne à 08:00 (UTC+1)
- Rapport d'impact: hebdomadaire chaque Lundi 10:00

Escalation
- Niveau 1: Support → Dev (SLAs: 1h pour incidents critiques)
- Niveau 2: DevOps → PM (SLAs: 30 min pour incidents haute sévérité)
- Niveau 3: CTO (CRITICAL)

Fin.
