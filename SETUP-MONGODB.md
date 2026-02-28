# Configuration MongoDB pour Distributeurs 🗺️

## État Actuel

✅ **Code Complété** (100%)
- Model : `models/Distributor.ts`
- API : `app/api/distributors/` (GET/POST/PUT/DELETE)
- Component : `components/agribot/AgriBot.tsx` (intégration API)
- Script : `scripts/seed-distributors.js`

⏳ **Configuration Requise** : MongoDB

---

## Option 1 : MongoDB Local (Développement)

### Installation MongoDB Community (Windows)

1. **Télécharger MongoDB** 
   - Allez sur : https://www.mongodb.com/try/download/community
   - Téléchargez MongoDB Community Server (version 7.x ou 6.x)
   - Installez avec les options par défaut
   - Cochez "Install MongoDB as a Service"

2. **Vérifier l'Installation**
```powershell
# Vérifier que MongoDB tourne
Get-Service MongoDB

# Devrait afficher "Running"
```

3. **Créer `.env.local`**
```bash
# Copier depuis .env.example
cp .env.example .env.local
```

Puis éditer `.env.local` et s'assurer que :
```env
MONGODB_URI=mongodb://localhost:27017/agripoint
```

4. **Remplir la Base de Données**
```bash
node scripts/seed-distributors.js
```

**Output Attendu :**
```
✓ Connecté à MongoDB
✓ Collection nettoyée
✓ 8 distributeurs inséré(s)

📍 Distributeurs ajoutés:
  • Agri Point - Yaoundé (Siège) (wholesaler) - Yaoundé
  • Agri Point - Douala (retailer) - Douala
  ...

✅ Seed complété avec succès !
```

5. **Démarrer le Serveur**
```bash
npm run dev
```

6. **Tester dans AgriBot**
- Ouvrir : http://localhost:3000
- Cliquer sur l'icône chat (AgriBot)
- Cliquer sur l'icône **Map** dans le header
- Voir les 8 distributeurs chargés dynamiquement

---

## Option 2 : MongoDB Atlas (Cloud - Recommandé)

### Avantages
- ✅ Pas d'installation locale
- ✅ Gratuit jusqu'à 512 MB
- ✅ Accessible depuis n'importe où
- ✅ Prêt pour la production

### Configuration

1. **Créer un Compte MongoDB Atlas**
   - Allez sur : https://www.mongodb.com/cloud/atlas/register
   - Créez un compte gratuit
   - Sélectionnez le plan **FREE** (M0)

2. **Créer un Cluster**
   - Choisissez AWS / GCP / Azure
   - Région : Choisir la plus proche (Europe ou US)
   - Cluster Name : `agripoint-cluster`
   - Cliquez **Create Cluster** (prend 3-5 min)

3. **Créer un Utilisateur**
   - Database Access → Add New Database User
   - Username : `agripoint-user`
   - Password : Générer ou créer (sécurisé !)
   - Database User Privileges : **Read and write to any database**
   - Add User

4. **Configurer IP Whitelist**
   - Network Access → Add IP Address
   - Choisir **Allow Access from Anywhere** (0.0.0.0/0) pour dev
   - Ou ajouter votre IP spécifique pour plus de sécurité
   - Confirm

5. **Obtenir Connection String**
   - Clusters → Connect → Drivers
   - Copiez le **Connection String** :
   ```
   mongodb+srv://agripoint-user:<password>@agripoint-cluster.xxxxx.mongodb.net/
   ```

6. **Créer `.env.local`**
```bash
cp .env.example .env.local
```

Puis éditer `.env.local` :
```env
MONGODB_URI=mongodb+srv://agripoint-user:VOTRE_MOT_DE_PASSE@agripoint-cluster.xxxxx.mongodb.net/agripoint?retryWrites=true&w=majority
```

⚠️ **Important** : Remplacez `<password>` par votre vrai mot de passe !

7. **Tester la Connexion**
```bash
node -e "require('mongoose').connect(process.env.MONGODB_URI || require('dotenv').config() && process.env.MONGODB_URI).then(() => console.log('✓ Connecté à MongoDB Atlas')).catch(e => console.error('✗ Erreur:', e.message))"
```

8. **Remplir la Base de Données**
```bash
node scripts/seed-distributors.js
```

9. **Démarrer le Serveur**
```bash
npm run dev
```

---

## Vérification de l'Intégration

### 1. Via AgriBot Modal
- Ouvrir http://localhost:3000
- Cliquer sur AgriBot (icône chat en bas à droite)
- Cliquer sur **Map** dans le header du chat
- Vérifier que les distributeurs apparaissent (avec spinner de chargement)

### 2. Via API Directe
```bash
# Windows PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/distributors" -Method GET | ConvertTo-Json -Depth 5
```

**Réponse Attendue :**
```json
{
  "success": true,
  "count": 8,
  "distributors": [
    {
      "_id": "...",
      "name": "Agri Point - Yaoundé (Siège)",
      "category": "wholesaler",
      "city": "Yaoundé",
      "coordinates": {
        "lat": 3.8474,
        "lng": 11.5021
      },
      ...
    }
  ]
}
```

### 3. Via MongoDB Compass (GUI)

- Télécharger : https://www.mongodb.com/try/download/compass
- Connecter avec votre URI (local ou Atlas)
- Naviguer vers : `agripoint` database → `distributors` collection
- Voir les 8 documents insérés

---

## Troubleshooting

### Erreur : "MONGODB_URI is undefined"
**Solution** : Créer `.env.local` avec la variable MONGODB_URI

```bash
# Copier depuis .env.example
cp .env.example .env.local

# Puis éditer .env.local et définir MONGODB_URI
```

### Erreur : "MongoServerError: bad auth"
**Solution** : Vérifier username/password dans l'URI

```env
# Correct
mongodb+srv://agripoint-user:MyP@ssw0rd@cluster.mongodb.net/...

# Incorrect (caractères spéciaux non encodés)
mongodb+srv://user:p@ss@cluster.mongodb.net/...
```

Si le mot de passe contient des caractères spéciaux, les encoder :
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`

### Erreur : "Connection timeout"
**Solution** : Vérifier Network Access dans MongoDB Atlas

- Aller sur Atlas → Network Access
- Ajouter votre IP ou 0.0.0.0/0

### Erreur : "Cannot connect to localhost:27017"
**Solution** : MongoDB local n'est pas installé ou ne tourne pas

```powershell
# Vérifier le service
Get-Service MongoDB

# Démarrer le service si arrêté
Start-Service MongoDB
```

### AgriBot montre seulement 4 distributeurs
**Solution** : Fallback aux données hardcodées (MongoDB pas connecté)

- Vérifier que MONGODB_URI est défini
- Vérifier que le script de seed a tourné avec succès
- Vérifier les logs du serveur pour les erreurs

---

## Pour la Production (Vercel)

1. **Utiliser MongoDB Atlas** (pas de MongoDB local)

2. **Ajouter MONGODB_URI dans Vercel**
   - Vercel Dashboard → Settings → Environment Variables
   - Ajouter : `MONGODB_URI` = votre connection string Atlas
   - ⚠️ Type : **Secret** (pas Plain Text)
   - Scope : Production + Preview + Development

3. **Redéployer**
```bash
git push origin main
```

4. **Seed Production DB**
Option 1 : Via terminal local
```bash
# Utiliser l'URI de production
MONGODB_URI="mongodb+srv://..." node scripts/seed-distributors.js
```

Option 2 : Via API administrative (à créer)
- Créer `/api/admin/seed-distributors`
- Protéger avec authentification admin
- Appeler une fois après déploiement

---

## Structure de la Base de Données

### Collection : `distributors`

```javascript
{
  _id: ObjectId("..."),
  name: "Agri Point - Yaoundé (Siège)",
  category: "wholesaler" | "retailer" | "partner",
  address: "Rue Camerounaise, Centre Ville",
  city: "Yaoundé",
  region: "Centre | Littoral | Nord-Ouest | ...",
  phone: "+237 6 XX XXX XXX",
  email: "yaounde@agripoint.cm",
  coordinates: {
    lat: 3.8474,
    lng: 11.5021
  },
  businessHours: "Lun-Sam: 7h-18h",
  description: "Siège principal - Gros commerce...",
  logo: "http://...", // optionnel
  products: ["rice", "maize", ...], // optionnel
  isActive: true,
  createdAt: ISODate("2025-01-15T10:30:00Z"),
  updatedAt: ISODate("2025-01-15T10:30:00Z")
}
```

### Indexes (Performance)

- `city + region` : Recherche par localisation
- `category` : Filtre par type de distributeur
- `text search` : Recherche full-text sur name + description
- `geospatial (2dsphere)` : Recherche par distance GPS

---

## État du Projet

```
┌─────────────────────────────────────────┐
│   DISTRIBUTORS MAP MONGODB READY       │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Model (Distributor.ts)              │
│  ✅ API Routes (/api/distributors)      │
│  ✅ AgriBot Integration (dynamic load)  │
│  ✅ Seed Script (8 distributors)        │
│  ✅ TypeScript (0 errors)               │
│  ✅ Fallback (hardcoded if API fails)   │
│                                         │
│  ⏳ MongoDB Configuration REQUIRED      │
│     → Suivre ce guide pour setup       │
│                                         │
└─────────────────────────────────────────┘
```

---

## Prochaines Étapes

1. ✅ Configurer MongoDB (local ou Atlas)
2. ✅ Créer `.env.local` avec MONGODB_URI
3. ✅ Run seed script
4. ✅ Tester dans AgriBot
5. ⏳ Créer `/admin/distributors` CRUD UI
6. ⏳ Ajouter plus de distributeurs
7. ⏳ Intégrer recherche par distance GPS

---

**Documentation complète** : Voir `DISTRIBUTORS-MONGODB-COMPLETE.md`  
**Quick Start** : Option 2 (MongoDB Atlas) recommandée pour démarrer rapidement
