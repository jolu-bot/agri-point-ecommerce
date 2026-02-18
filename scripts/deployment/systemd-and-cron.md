# Systemd unit & cron examples

Systemd service (example) — crée `/etc/systemd/system/monitoring-agent.service`:

```
[Unit]
Description=AgriPoint Monitoring Agent
After=network.target

[Service]
Type=simple
User=www-data
Environment=NODE_ENV=production
WorkingDirectory=/var/www/agri-point-ecommerce
ExecStart=/usr/bin/node /var/www/agri-point-ecommerce/scripts/monitoring-agent.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activer et démarrer:

```bash
sudo systemctl daemon-reload
sudo systemctl enable monitoring-agent.service
sudo systemctl start monitoring-agent.service
sudo journalctl -u monitoring-agent.service -f
```

Cron example (si vous préférez cron plutôt que systemd timer):

```
# Run export-payments every day at 08:05
5 8 * * * cd /var/www/agri-point-ecommerce && /usr/bin/env API_URL=https://agri-ps.com /usr/bin/node scripts/export-payments.js --date=$(date +\%Y-\%m-\%d) >> /var/log/agri/export-payments.log 2>&1
```

PM2 startup snippet (to run agent with PM2 and persist across reboots):

```bash
# install pm2 globally if needed
npm install -g pm2
pm2 start scripts/monitoring-agent.js --name monitoring-agent
pm2 save
# generate startup for systemd
pm2 startup systemd -u $USER --hp $HOME
```

Notes
- Ajustez `WorkingDirectory` et chemins selon votre serveur.
- Assurez-vous que l'utilisateur a accès à `node` et aux dossiers `logs/` et `exports/`.
