#!/bin/bash
# Script de déploiement Agri-Point sur Hostinger
# Usage: bash deploy.sh [HOSTINGER_IP] [USER] [PASSWORD]

set -e

HOSTINGER_IP=${1:-""}
HOSTINGER_USER=${2:-"root"}
HOSTINGER_PASS=${3:-""}

if [ -z "$HOSTINGER_IP" ]; then
  echo "❌ Usage: bash deploy.sh <HOSTINGER_IP> [USER] [PASSWORD]"
  exit 1
fi

echo "🚀 DÉPLOIEMENT AGRI-POINT VERS HOSTINGER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "IP: $HOSTINGER_IP"
echo "User: $HOSTINGER_USER"
echo ""

# Step 1: Créer le répertoire et cloner
echo "📁 Étape 1: Création du répertoire..."
ssh -o StrictHostKeyChecking=no $HOSTINGER_USER@$HOSTINGER_IP << 'EOF'
  mkdir -p /home/agripoint
  cd /home/agripoint
  git clone https://github.com/jolu-bot/agri-point-ecommerce.git . || git pull
  echo "✅ Répertoire prêt"
EOF

# Step 2: Créer .env.local
echo "🔐 Étape 2: Configuration variables d'env..."
ssh -o StrictHostKeyChecking=no $HOSTINGER_USER@$HOSTINGER_IP << 'EOF'
  cat > /home/agripoint/.env.local << 'ENVEOF'
# Production
NODE_ENV=production
NEXTAUTH_URL=https://votre-domaine.cm
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# MongoDB Atlas
MONGODB_URI=mongodb+srv://[USERNAME]:[PASSWORD]@cluster.mongodb.net/agripoint?retryWrites=true&w=majority

# Admin
ADMIN_EMAIL=admin@votre-domaine.cm

# Optional
DEBUG=false
ENVEOF
  
  echo "🔏 Variables créées. Éditez MONGODB_URI manuellement:"
  echo "vim /home/agripoint/.env.local"
EOF

# Step 3: Installer dépendances
echo "📦 Étape 3: Installation dépendances..."
ssh -o StrictHostKeyChecking=no $HOSTINGER_USER@$HOSTINGER_IP << 'EOF'
  cd /home/agripoint
  npm install --production
  npm run build
  echo "✅ Build complet"
EOF

# Step 4: Configurer Nginx
echo "🌐 Étape 4: Configuration Nginx..."
ssh -o StrictHostKeyChecking=no $HOSTINGER_USER@$HOSTINGER_IP << 'EOF'
  cat > /etc/nginx/conf.d/agripoint.conf << 'NGINXEOF'
upstream agripoint {
  server 127.0.0.1:3000 max_fails=5 fail_timeout=30s;
}

server {
  listen 80;
  server_name votre-domaine.cm www.votre-domaine.cm;
  client_max_body_size 50M;

  location / {
    proxy_pass http://agripoint;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }

  gzip on;
  gzip_types text/plain text/css text/javascript application/json;
  gzip_min_length 1000;
}
NGINXEOF

  nginx -t
  systemctl restart nginx
  echo "✅ Nginx configuré"
EOF

# Step 5: SSL avec certbot
echo "🔒 Étape 5: Configuration SSL..."
ssh -o StrictHostKeyChecking=no $HOSTINGER_USER@$HOSTINGER_IP << 'EOF'
  apt-get update
  apt-get install -y certbot python3-certbot-nginx
  
  certbot --nginx -d votre-domaine.cm -d www.votre-domaine.cm --non-interactive --agree-tos --email admin@votre-domaine.cm
  
  echo "✅ SSL installé"
EOF

# Step 6: PM2 Setup
echo "⚙️  Étape 6: Configuration PM2..."
ssh -o StrictHostKeyChecking=no $HOSTINGER_USER@$HOSTINGER_IP << 'EOF'
  npm install -g pm2
  cd /home/agripoint
  
  pm2 start npm --name "agripoint" -- start
  pm2 logs agripoint --lines 5
  pm2 save
  pm2 startup
  
  echo "✅ PM2 prêt"
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DÉPLOIEMENT COMPLET!"
echo ""
echo "📝 ACTIONS MANUELLES REQUISES:"
echo ""
echo "1. SSH vers Hostinger et configurez .env.local:"
echo "   ssh root@$HOSTINGER_IP"
echo "   vim /home/agripoint/.env.local"
echo "   # Remplacez [USERNAME]:[PASSWORD] et domaines"
echo ""
echo "2. Redémarrez PM2:"
echo "   pm2 restart agripoint"
echo ""
echo "3. Vérifiez les logs:"
echo "   pm2 logs agripoint"
echo ""
echo "4. Testez depuis URL:"
echo "   curl https://votre-domaine.cm"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
