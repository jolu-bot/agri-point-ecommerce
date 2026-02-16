/**
 * Configuration PM2 pour l'application Agri-Point
 * Ce fichier configure PM2 pour gérer l'application Next.js en production
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [{
    name: 'agri-point',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    
    // Redémarrage automatique si la mémoire dépasse 800MB
    max_memory_restart: '800M',
    
    // Variables d'environnement
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Gestion des logs
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Redémarrage automatique
    autorestart: true,
    
    // Nombre maximum de redémarrages consécutifs
    max_restarts: 10,
    
    // Temps minimum avant de considérer l'app comme "stable"
    min_uptime: '10s',
    
    // Délai entre les redémarrages automatiques
    restart_delay: 4000,
    
    // Surveiller les changements de fichiers (désactivé en production)
    watch: false,
    
    // Options de monitoring
    listen_timeout: 10000,
    kill_timeout: 5000,
    
    // Comportement au démarrage
    wait_ready: true,
    
    // Cron pour redémarrage préventif (optionnel - commenté par défaut)
    // cron_restart: '0 2 * * *', // Redémarre tous les jours à 2h du matin
    
    // Variables d'environnement depuis le fichier .env.local
    env_file: '.env.local'
  }]
};
