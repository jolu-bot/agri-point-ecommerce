# Rollback Procedure — Urgence technique

Quand utiliser
- Crashs répétés, erreurs critiques non résolues dans 30 minutes, perte de données critique.

Étapes rapides (30 min plan)
1. Communiquer: Slack #campaign-launch + notifier PM & CTO
2. Mettre en maintenance: activer page maintenance (NGINX redirect)
3. Vérifier dernier commit stable (git log --oneline):
   - `git checkout <previous-stable-commit>`
4. Rebuild & restart:
```powershell
npm ci
npm run build
pm2 restart agri-point
```
5. Valider: `curl -I https://agri-point.cm/campagne-engrais` → HTTP 200
6. Si rollback impossible: activer failover vers backup server (documenté par DevOps)

Check-list post-rollback
- Valider DB integrity
- Notifier clients affectés via `NON-SMS-COMMUNICATIONS.md` if nécessaire
- Rédiger post-mortem 24h

Fin.
