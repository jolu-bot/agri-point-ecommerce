# 🔧 SOLUTION MONGODB SUR HOSTINGER - GUIDE COMPLET

## 🎯 PROBLÈME ACTUEL
- ✅ Site déployé et fonctionne
- ❌ MongoDB ne se connecte pas
- ❌ Erreur 500 sur toutes les APIs
- ❌ Impossible d'accéder au panel admin
- ❌ Aucun produit affiché

**Cause** : `.env.local` utilise `mongodb://localhost:27017/agripoint` mais MongoDB n'est pas accessible sur Hostinger.

---

## 📋 OPTION 1 : MONGODB ATLAS (CLOUD) - ⭐ RECOMMANDÉ

### ✅ Avantages
- 🆓 Gratuit (512 MB)
- ⚡ Rapide à configurer (5 minutes)
- 🔒 Sécurisé et sauvegardé automatiquement
- 🌍 Accessible partout
- 💪 Pas besoin d'installer MongoDB sur le serveur

### 📝 ÉTAPES DÉTAILLÉES

#### 1. Créer un compte MongoDB Atlas (si pas déjà fait)
1. Allez sur https://www.mongodb.com/cloud/atlas/register
2. Inscrivez-vous avec votre email
3. Choisissez le plan **GRATUIT (M0)**

#### 2. Créer un cluster
1. Cliquez sur **"Create"** (Créer un cluster)
2. Choisissez **"M0 FREE"**
3. Région : **AWS / Paris** ou proche de votre serveur
4. Cluster Name : `agripoint`
5. Cliquez **"Create Cluster"**
6. ⏳ Attendez 3-5 minutes

#### 3. Créer un utilisateur de base de données
1. Dans le menu gauche → **Database Access**
2. Cliquez **"Add New Database User"**
3. Remplissez :
   - Username : `agripoint_user`
   - Password : **Générez un mot de passe fort** (notez-le !)
   - Built-in Role : **Read and write to any database**
4. Cliquez **"Add User"**

#### 4. Autoriser l'accès depuis Hostinger
1. Dans le menu gauche → **Network Access**
2. Cliquez **"Add IP Address"**
3. Choisissez **"ALLOW ACCESS FROM ANYWHERE"** (0.0.0.0/0)
   - ⚠️ Pour production, vous pouvez ajouter uniquement l'IP de votre serveur Hostinger
4. Cliquez **"Confirm"**

#### 5. Obtenir l'URI de connexion
1. Retournez dans **"Database"** → Cliquez **"Connect"**
2. Choisissez **"Connect your application"**
3. Driver : **Node.js** / Version : **5.5 or later**
4. Copiez l'URI, elle ressemble à :
```
mongodb+srv://agripoint_user:<password>@agripoint.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
5. **Remplacez `<password>` par le mot de passe créé à l'étape 3**
6. **Ajoutez le nom de la base de données** avant le `?` :
```
mongodb+srv://agripoint_user:VOTRE_MOT_DE_PASSE@agripoint.xxxxx.mongodb.net/agripoint?retryWrites=true&w=majority
```

#### 6. Configurer sur Hostinger

**A. Via l'interface Hostinger (si disponible)** :
1. Allez dans votre panel Hostinger
2. Section **"Variables d'environnement"** ou **"Advanced"**
3. Ajoutez :
   - Nom : `MONGODB_URI`
   - Valeur : `mongodb+srv://agripoint_user:VOTRE_MOT_DE_PASSE@agripoint.xxxxx.mongodb.net/agripoint?retryWrites=true&w=majority`

**B. Via SSH** :
```bash
# Se connecter à Hostinger
ssh votre-user@votre-serveur.hostinger.com

# Aller dans le dossier du projet
cd /home/votre-user/public_html/agri-point-ecommerce
# OU selon votre configuration Hostinger

# Créer/éditer le fichier .env.local
nano .env.local

# Remplacez la ligne MONGODB_URI par :
MONGODB_URI=mongodb+srv://agripoint_user:VOTRE_MOT_DE_PASSE@agripoint.xxxxx.mongodb.net/agripoint?retryWrites=true&w=majority

# Sauvegarder : Ctrl+O puis Enter, Quitter : Ctrl+X
```

#### 7. Initialiser la base de données
```bash
# Toujours en SSH sur Hostinger
node scripts/init-production.js
```

**Résultat attendu** :
```
🔄 Connexion à MongoDB...
📍 URI: mongodb+srv://agripoint_user:****@agripoint.xxxxx.mongodb.net/agripoint
✅ Connecté à MongoDB
✅ Compte admin créé: admin@agri-ps.com
✅ Configuration du site créée
📊 Utilisateurs: 1
📊 Configurations: 1
```

#### 8. Redémarrer l'application
```bash
# Si vous utilisez PM2
pm2 restart all

# Ou si vous utilisez Node directement
npm run build
npm start
```

---

## 📋 OPTION 2 : MONGODB SUR LE VPS HOSTINGER

### ⚠️ Plus complexe, mais données 100% sous votre contrôle

### 📝 ÉTAPES DÉTAILLÉES

#### 1. Vérifier si MongoDB est déjà installé
```bash
# SSH sur Hostinger
ssh votre-user@votre-serveur.hostinger.com

# Vérifier si MongoDB existe
mongod --version
# OU
systemctl status mongod
```

**Si MongoDB n'est PAS installé**, continuez ci-dessous.

#### 2. Installer MongoDB sur Ubuntu/Debian (Hostinger VPS)

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Importer la clé GPG publique de MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Ajouter le dépôt MongoDB
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Recharger les sources
sudo apt update

# Installer MongoDB
sudo apt install -y mongodb-org

# Démarrer MongoDB
sudo systemctl start mongod

# Activer au démarrage
sudo systemctl enable mongod

# Vérifier le statut
sudo systemctl status mongod
```

#### 3. Créer un utilisateur MongoDB

```bash
# Se connecter à MongoDB
mongosh

# Dans le shell MongoDB, exécutez :
use admin
db.createUser({
  user: "agripoint_admin",
  pwd: "VOTRE_MOT_DE_PASSE_FORT",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})

# Quitter
exit
```

#### 4. Activer l'authentification MongoDB

```bash
# Éditer la configuration
sudo nano /etc/mongod.conf

# Trouver la section 'security:' et modifier :
security:
  authorization: enabled

# Sauvegarder : Ctrl+O, Enter, Ctrl+X

# Redémarrer MongoDB
sudo systemctl restart mongod
```

#### 5. Configurer l'URI de connexion

```bash
# Aller dans le projet
cd /home/votre-user/public_html/agri-point-ecommerce

# Éditer .env.local
nano .env.local

# Modifier MONGODB_URI :
MONGODB_URI=mongodb://agripoint_admin:VOTRE_MOT_DE_PASSE_FORT@localhost:27017/agripoint?authSource=admin

# Sauvegarder
```

#### 6. Initialiser la base de données
```bash
node scripts/init-production.js
```

#### 7. Redémarrer l'application
```bash
pm2 restart all
# OU
npm run build && npm start
```

---

## 🔥 DÉPANNAGE RAPIDE

### Erreur : "MongoNetworkError"
**Solution** : MongoDB n'est pas démarré
```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

### Erreur : "Authentication failed"
**Solution** : Mot de passe incorrect dans MONGODB_URI
- Vérifiez que le mot de passe ne contient pas de caractères spéciaux non encodés
- Encodez les caractères spéciaux : `@` → `%40`, `#` → `%23`, etc.

### Erreur : "Connection timeout"
**Solution Atlas** : IP non autorisée
1. MongoDB Atlas → Network Access
2. Ajoutez l'IP de votre serveur Hostinger ou 0.0.0.0/0

### Erreur : "Database not found"
**Solution** : Le nom de la base n'est pas dans l'URI
```
❌ mongodb+srv://user:pass@cluster.net/?retryWrites=true
✅ mongodb+srv://user:pass@cluster.net/agripoint?retryWrites=true
```

---

## 📞 QUELLE OPTION CHOISIR ?

### Choisissez **OPTION 1 (Atlas)** si :
- ✅ Vous voulez la solution la plus simple
- ✅ Vous n'avez pas d'expérience avec MongoDB
- ✅ Vous voulez des sauvegardes automatiques
- ✅ Hostinger shared hosting (pas de SSH complet)

### Choisissez **OPTION 2 (VPS Local)** si :
- ✅ Vous avez un VPS Hostinger avec accès root
- ✅ Vous voulez contrôler 100% vos données
- ✅ Vous avez de l'expérience Linux
- ✅ Vous voulez éviter les limites de stockage

---

## ✅ APRÈS LA CONFIGURATION

Une fois MongoDB configuré, vous pourrez :
1. 🔐 Vous connecter avec `admin@agri-ps.com` / `admin123`
2. 📦 Accéder au panel admin
3. ➕ Ajouter vos produits
4. 👥 Gérer les utilisateurs
5. 📊 Voir les commandes

---

## 📝 BESOIN D'AIDE ?

Dites-moi quelle option vous préférez et je vous guiderai étape par étape !
