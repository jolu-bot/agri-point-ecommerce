# 🔴 ERREUR 503 : SERVICE UNAVAILABLE - GUIDE DE RÉSOLUTION

---

## 🚨 VOUS AVEZ UNE ERREUR 503 SUR HOSTINGER ?

**Vous êtes au bon endroit !** Ce guide va vous aider à résoudre rapidement votre problème.

---

## ⚡ SOLUTION ULTRA-RAPIDE (2 MINUTES)

### Étape 1 : Connectez-vous en SSH

```bash
ssh votre-user@votre-serveur.hostinger.com
```

### Étape 2 : Allez dans le dossier du projet

```bash
cd /home/votre-user/public_html/agri-point-ecommerce
```

### Étape 3 : Exécutez le script de redémarrage

```bash
bash restart-app.sh
```

✅ **Votre site devrait maintenant être en ligne !**

Testez : http://votre-domaine.com

---

## 📚 SI LE REDÉMARRAGE RAPIDE NE FONCTIONNE PAS

Consultez les documents dans cet ordre :

### 1️⃣ **[SOLUTION-ERREUR-503-RAPIDE.md](SOLUTION-ERREUR-503-RAPIDE.md)**
   📖 Guide de démarrage rapide avec les solutions les plus courantes  
   ⏱️ 5 minutes

### 2️⃣ **[RESUME-COMPLET-ERREUR-503.md](RESUME-COMPLET-ERREUR-503.md)**
   📖 Résumé structuré de toutes les causes possibles et leurs solutions  
   ⏱️ 15 minutes

### 3️⃣ **[GUIDE-RESOLUTION-ERREUR-503.md](GUIDE-RESOLUTION-ERREUR-503.md)**
   📖 Guide complet et détaillé avec toutes les solutions possibles  
   ⏱️ 30-60 minutes

### 📑 **[INDEX-RESOLUTION-503.md](INDEX-RESOLUTION-503.md)**
   📖 Index de navigation entre tous les documents disponibles

---

## 🛠️ OUTILS DISPONIBLES

### Scripts automatiques

| Script | Utilisation | Description |
|--------|-------------|-------------|
| `restart-app.sh` | `bash restart-app.sh` | Redémarrage rapide de l'application |
| `init-hostinger.sh` | `bash init-hostinger.sh` | Initialisation complète automatique |
| `test-mongo-connection.js` | `node test-mongo-connection.js` | Test de connexion MongoDB |

### Fichiers de configuration

- **ecosystem.config.js** - Configuration PM2 optimale
- **.htaccess** - Configuration Apache (hébergement partagé)
- **.env.production** - Template de variables d'environnement

---

## 🔍 DIAGNOSTIC RAPIDE

Avant de consulter la documentation complète, faites un diagnostic :

```bash
# Vérifier Node.js
node --version

# Vérifier PM2
pm2 status

# Tester MongoDB
node test-mongo-connection.js

# Vérifier le port 3000
lsof -i :3000
```

Si l'une de ces commandes échoue, consultez le guide approprié.

---

## 🎯 CAUSES COURANTES

| Symptôme | Cause probable | Solution rapide |
|----------|----------------|-----------------|
| 503 après connexion domaine | Application arrêtée | `bash restart-app.sh` |
| "MongoNetworkError" | MongoDB inaccessible | Vérifier `.env.local` → `MONGODB_URI` |
| "EADDRINUSE" | Port 3000 occupé | `kill -9 $(lsof -t -i:3000)` puis `pm2 restart all` |
| Application se coupe | Mémoire insuffisante | `pm2 restart all --max-memory-restart 500M` |
| 502 Bad Gateway | Next.js non démarré | `pm2 start ecosystem.config.js` |

---

## 📖 DOCUMENTATION COMPLÈTE

### Pour l'erreur 503

- **SOLUTION-ERREUR-503-RAPIDE.md** - Solution rapide (5 min)
- **RESUME-COMPLET-ERREUR-503.md** - Résumé structuré (15 min)
- **GUIDE-RESOLUTION-ERREUR-503.md** - Guide complet (30-60 min)
- **INDEX-RESOLUTION-503.md** - Index de navigation

### Configuration serveur

- **CONFIGURATION-NGINX-HOSTINGER.md** - Configuration Nginx pour VPS
- **SOLUTION-MONGODB-HOSTINGER.md** - Configuration MongoDB
- **DEPLOY-HOSTINGER-VPS.md** - Déploiement complet VPS
- **GUIDE-DEPLOIEMENT-HOSTINGER.md** - Guide de déploiement général

### Diagnostic

- **DIAGNOSTIC-ERREURS-PRODUCTION.md** - Diagnostic des erreurs production
- **DEMARRAGE-RAPIDE.md** - Guide de démarrage du projet

---

## 🚀 APRÈS LA RÉSOLUTION

Une fois votre site en ligne :

1. ✅ Testez votre site : https://votre-domaine.com
2. ✅ Connectez-vous : `admin@agri-ps.com` / `admin123`
3. ✅ **CHANGEZ le mot de passe admin immédiatement !**
4. ✅ Configurez le SSL (HTTPS)
5. ✅ Configurez les sauvegardes automatiques
6. ✅ Ajoutez vos produits

---

## 📞 BESOIN D'AIDE ?

### Support Hostinger (24/7)

- **Live Chat** : https://www.hostinger.com → Support → Live Chat
- **Ticket** : Panel Hostinger → Help → Submit Ticket
- **Téléphone** : Numéro dans votre panel Hostinger

### Informations à préparer

Avant de contacter le support :

```bash
# Collecter les informations
node --version > info.txt
pm2 status >> info.txt
node test-mongo-connection.js >> info.txt 2>&1
pm2 logs --lines 50 >> info.txt
```

Envoyez le fichier `info.txt` au support.

---

## ✅ CHECKLIST

- [ ] Je me suis connecté en SSH
- [ ] J'ai exécuté `bash restart-app.sh`
- [ ] `pm2 status` montre "online"
- [ ] `node test-mongo-connection.js` réussit
- [ ] Mon site est accessible
- [ ] Je peux me connecter au panneau admin
- [ ] J'ai changé le mot de passe admin
- [ ] SSL/HTTPS est activé

---

## 🎯 COMMANDES ESSENTIELLES

```bash
# Redémarrer l'application
bash restart-app.sh

# Voir les logs en temps réel
pm2 logs

# Monitoring
pm2 monit

# Redémarrer PM2
pm2 restart all

# Tester MongoDB
node test-mongo-connection.js

# Redémarrer Nginx (VPS uniquement)
sudo systemctl restart nginx
```

---

## 🎉 FÉLICITATIONS !

Si votre site fonctionne maintenant, bravo ! 🚀

Votre e-commerce **Agri-Point** est maintenant opérationnel et prêt à recevoir des commandes !

---

**💪 Bon courage et bon succès avec votre e-commerce ! 🌾**

---

## 📌 LIENS RAPIDES

- [Solution rapide (5 min)](SOLUTION-ERREUR-503-RAPIDE.md)
- [Résumé complet (15 min)](RESUME-COMPLET-ERREUR-503.md)
- [Guide détaillé (30-60 min)](GUIDE-RESOLUTION-ERREUR-503.md)
- [Index de navigation](INDEX-RESOLUTION-503.md)
- [Configuration Nginx](CONFIGURATION-NGINX-HOSTINGER.md)
- [Configuration MongoDB](SOLUTION-MONGODB-HOSTINGER.md)

---

_Dernière mise à jour : Février 2026_
