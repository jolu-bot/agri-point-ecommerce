# Hostinger Checklist — Post-Launch Support

Actions techniques à vérifier quotidiennement
- SSL: Let’s Encrypt renouvellement automatique
- Backup: vérifier snapshot quotidien MongoDB
- Nginx: vérifier logs d'erreurs (/var/log/nginx/error.log)
- Disque: espace libre > 20%
- CPU/Memory: signaler si > 70% soutenu

Accès & coordonnées
- Fournir accès SSH restreint au DevOps (clé publique)
- Vérifier firewall / ports (80,443,22)

Maintenance planifiée
- Fenêtre: 02:00-03:00 UTC+1 seulement si nécessaire

Procédure d'urgence pour Hostinger
1. Contacter support Hostinger via ticket + téléphone
2. Fournir logs, time window, reproduction steps
3. Demander assistance sur reverse proxy / réseau si DB unreachable

Fin.
