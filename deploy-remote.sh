#!/bin/bash
set -e

echo ''
echo '==========================================='
echo '  DEPLOIEMENT AGRI-PS.COM'
echo '==========================================='
echo ''

# Variables
APP_DIR='/var/www/agri-point-ecommerce'
GIT_BRANCH='main'

echo '[1/5] Pull du code depuis Git...'
cd $APP_DIR
git fetch origin
git reset --hard origin/$GIT_BRANCH
echo 'OK'
echo ''

echo '[2/5] Configuration environnement...'
cp .env.production .env 2>/dev/null || true
echo 'OK'
echo ''

echo '[3/5] Installation dependances...'
npm install --production
echo 'OK'
echo ''

echo '[4/5] Build de l application...'
npm run build
echo 'OK'
echo ''

echo '[5/5] Redemarrage PM2...'
pm2 stop agripoint-production 2>/dev/null || true
pm2 delete agripoint-production 2>/dev/null || true
pm2 start npm --name 'agripoint-production' -- start
pm2 save
echo 'OK'
echo ''

echo '==========================================='
echo '  DEPLOIEMENT TERMINE'
echo '==========================================='
echo ''

# Verification
sleep 5
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000)
echo "Code HTTP local: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo 'Application demarree avec succes!'
else
    echo 'ATTENTION: Code HTTP inattendu'
    echo 'Verifiez les logs: pm2 logs agripoint-production'
fi

echo ''
pm2 list
