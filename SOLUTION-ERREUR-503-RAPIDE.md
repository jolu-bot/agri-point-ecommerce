# 🆘 RÉSOLUTION RAPIDE - ERREUR 503 HOSTINGER

## 🎯 Vous avez une erreur 503 sur votre site ?

Ce dossier contient tous les outils pour résoudre rapidement votre problème !

---

## 🚀 SOLUTION RAPIDE (5 MINUTES)

### 1. Connectez-vous en SSH à votre serveur Hostinger

```bash
ssh votre-user@votre-serveur.hostinger.com
```

### 2. Allez dans le dossier de votre projet

```bash
cd /home/votre-user/public_html/agri-point-ecommerce
# OU selon votre installation
cd /var/www/agri-point-ecommerce
```

### 3. Exécutez le script de redémarrage

```bash
bash restart-app.sh
```

✅ **Dans 90% des cas, c'est suffisant !**

---

## 🔧 SOLUTION COMPLÈTE (SI LE REDÉMARRAGE NE SUFFIT PAS)

### 1. Exécutez le script d'initialisation complet

```bash
bash init-hostinger.sh
```

Ce script va :
- ✅ Vérifier que Node.js est installé
- ✅ Créer/vérifier le fichier .env.local
- ✅ Tester la connexion MongoDB
- ✅ Installer les dépendances
- ✅ Builder l'application
- ✅ Initialiser la base de données
- ✅ Configurer et démarrer PM2
- ✅ Vérifier que tout fonctionne

---

## 📋 DIAGNOSTIC MANUEL

Si les scripts automatiques ne fonctionnent pas, utilisez ces commandes :

### Tester la connexion MongoDB

```bash
node test-mongo-connection.js
```

Si vous voyez "✅ CONNEXION RÉUSSIE", MongoDB fonctionne correctement.

Sinon, consultez le **GUIDE-RESOLUTION-ERREUR-503.md** pour corriger votre MONGODB_URI.

### Vérifier l'état de PM2

```bash
pm2 status
```

Votre application doit être en état "online" ✅

Si elle est "stopped" ou "errored" ❌ :

```bash
pm2 logs
```

Consultez les logs pour voir l'erreur exacte.

---

## 📚 DOCUMENTATION DÉTAILLÉE

Consultez ces fichiers pour plus d'informations :

| Fichier | Description |
|---------|-------------|
| **GUIDE-RESOLUTION-ERREUR-503.md** | Guide complet avec toutes les solutions possibles |
| **ecosystem.config.js** | Configuration optimale de PM2 |
| **restart-app.sh** | Script de redémarrage automatique |
| **init-hostinger.sh** | Script d'initialisation complète |
| **test-mongo-connection.js** | Test de connexion MongoDB |
| **.htaccess** | Configuration Apache (si applicable) |

---

## 🔍 CAUSES COURANTES DE L'ERREUR 503

### 1. L'application Node.js n'est pas démarrée
**Solution :** `bash restart-app.sh`

### 2. MongoDB ne se connecte pas
**Solution :** Vérifiez MONGODB_URI dans .env.local
```bash
node test-mongo-connection.js
```

### 3. Mémoire RAM insuffisante
**Solution :** Redémarrez PM2
```bash
pm2 restart all
```

### 4. Port 3000 occupé par un autre processus
**Solution :** Libérez le port
```bash
kill -9 $(lsof -t -i:3000)
pm2 restart all
```

### 5. Variables d'environnement manquantes
**Solution :** Vérifiez .env.local
```bash
cat .env.local
```

---

## ✅ CHECKLIST DE VÉRIFICATION

Cochez au fur et à mesure :

- [ ] Je me suis connecté en SSH à Hostinger
- [ ] Je suis dans le bon dossier (celui avec package.json)
- [ ] J'ai exécuté `bash restart-app.sh`
- [ ] `pm2 status` montre "online" ✅
- [ ] `node test-mongo-connection.js` réussit ✅
- [ ] Le port 3000 est utilisé par Node.js
- [ ] Mon domaine pointe vers l'IP du serveur
- [ ] Nginx est configuré pour proxy vers localhost:3000

---

## 🆘 TOUJOURS BLOQUÉ ?

### Option 1 : Support Hostinger
- Live Chat 24/7 : https://www.hostinger.com
- Ticket : Panel Hostinger → Support → Nouveau ticket

### Option 2 : Réinstallation complète
```bash
bash init-hostinger.sh
```

### Option 3 : Consultez les logs détaillés
```bash
# Logs de l'application
pm2 logs --lines 50

# Logs Nginx
sudo tail -50 /var/log/nginx/error.log

# Logs système
journalctl -xe
```

---

## 📞 INFORMATIONS IMPORTANTES

### Identifiants par défaut
Après l'initialisation, vous pouvez vous connecter avec :
- **Email :** admin@agri-ps.com
- **Mot de passe :** admin123
- **⚠️ CHANGEZ CE MOT DE PASSE immédiatement !**

### Commandes PM2 utiles
```bash
pm2 logs              # Voir les logs en temps réel
pm2 monit             # Monitoring CPU/RAM
pm2 restart all       # Redémarrer
pm2 stop all          # Arrêter
pm2 delete all        # Supprimer tous les processus
```

### Structure des fichiers
```
votre-projet/
├── .env.local              # Variables d'environnement
├── ecosystem.config.js     # Configuration PM2
├── restart-app.sh          # Script de redémarrage
├── init-hostinger.sh       # Script d'initialisation
├── test-mongo-connection.js # Test MongoDB
├── .htaccess               # Config Apache
└── logs/                   # Logs de l'application
```

---

## 🎉 APRÈS LA RÉSOLUTION

Une fois que votre site fonctionne :

1. ✅ Testez votre site : https://votre-domaine.com
2. ✅ Connectez-vous au panel admin
3. ✅ Changez le mot de passe administrateur
4. ✅ Configurez les sauvegardes automatiques
5. ✅ Activez le monitoring : `pm2 monit`
6. ✅ Documentez votre configuration

---

**Bon courage ! 💪 Votre site sera bientôt en ligne ! 🚀**
