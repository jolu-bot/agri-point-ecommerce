# 🌾 Campagne Engrais Mars 2026

Guide complet d'implémentation de la campagne de subvention des engrais pour le mois de mars 2026.

## 📁 Architecture

### Modèles Créés

#### `models/Campaign.ts`
Modèle MongoDB pour les campagnes avec:
- Informations campagne (nom, dates, description)
- Conditions d'éligibilité
- Système de paiement échelonné (70/30)
- Tarifs spéciaux
- Statistiques en temps réel

#### `models/Order.ts` (modifié)
Ajout des champs:
- `campaign`: Référence à la campagne
- `isCampaignOrder`: Flag pour identifier les commandes campagne
- `installmentPayment`: Détails du paiement échelonné
- `campaignEligibility`: Données d'éligibilité du client

### Pages Créées

#### `/app/campagne-engrais/page.tsx`
Page publique avec:
- 🎨 **Hero section** avec image de la campagne
- 💰 **Tarifs spéciaux** (15,000 FCFA engrais minéraux, 10,000 FCFA biofertilisants)
- 📋 **Conditions d'éligibilité** avec explications détaillées
- ✅ **Formulaire d'éligibilité** interactif
- 📄 **Termes et conditions**

#### `/app/admin/campaigns/page.tsx`
Dashboard admin avec:
- 📊 KPIs (total commandes, quantité, revenu, revenu moyen)
- 📈 Graphiques de statut des commandes
- 💳 Suivi des paiements échelonnés
- 📋 Tableau des commandes détaillées
- 📥 Export CSV des données

### API Endpoints

#### `GET /api/campaigns/march-2026`
Charge la campagne Mars 2026

```json
{
  "name": "Campagne Engrais - Mars 2026",
  "slug": "engrais-mars-2026",
  "startDate": "2026-03-01T00:00:00Z",
  "endDate": "2026-03-31T23:59:59Z",
  "specialPricing": {
    "mineralFertilizer": 15000,
    "biofertilizer": 10000
  },
  "paymentScheme": {
    "enabled": true,
    "firstPercentage": 70,
    "secondPercentage": 30
  }
}
```

#### `POST /api/campaigns/apply`
Vérifie l'éligibilité du client

**Requête:**
```json
{
  "campaignId": "...",
  "fullName": "John Doe",
  "email": "john@exemple.cm",
  "phone": "+237 6XX XXX XXX",
  "isMember": true,
  "cooperativeName": "COOP Agritech",
  "cooperativeEmail": "contact@coop.cm",
  "hasInsurance": true,
  "insuranceProvider": "CICAN",
  "quantity": 10,
  "productType": "mineral"
}
```

**Réponse:**
```json
{
  "success": true,
  "eligible": true,
  "message": "Éligibilité confirmée",
  "issues": [],
  "campaignData": {
    "id": "...",
    "slug": "engrais-mars-2026",
    "paymentScheme": {
      "enabled": true,
      "firstPercentage": 70,
      "secondPercentage": 30
    }
  }
}
```

#### `POST /api/campaigns/checkout`
Crée une commande campagne avec paiement échelonné

**Requête:**
```json
{
  "userId": "...",
  "items": [
    {
      "product": "...",
      "quantity": 10,
      "price": 15000,
      "total": 150000
    }
  ],
  "shippingAddress": { ... },
  "paymentMethod": "stripe",
  "campaignSlug": "engrais-mars-2026",
  "eligibilityData": { ... },
  "useInstallmentPayment": true
}
```

**Réponse:**
```json
{
  "success": true,
  "order": {
    "id": "...",
    "number": "CMD-...",
    "total": 150000,
    "status": "pending",
    "installmentPayment": {
      "firstAmount": 105000,
      "secondAmount": 45000,
      "secondPaymentDueDate": "2026-05-XX"
    }
  }
}
```

#### `GET /api/admin/campaigns/stats`
Récupère les stats de toutes les campagnes

```json
[
  {
    "_id": "...",
    "name": "Campagne Engrais - Mars 2026",
    "totalOrders": 125,
    "totalQuantity": 1050,
    "totalRevenue": 18750000,
    "orders": [
      {
        "orderNumber": "CMD-...",
        "total": 150000,
        "status": "delivered",
        "installmentPayment": {
          "enabled": true,
          "firstPaymentStatus": "paid",
          "secondPaymentStatus": "pending"
        }
      }
    ]
  }
]
```

## 🚀 Déploiement

### 1. Initialiser la Campagne

```bash
# Via script Node.js
node scripts/seed-campaign-march-2026.js

# Ou manuellement via MongoDB:
db.campaigns.insertOne({
  name: "Campagne Engrais - Mars 2026",
  slug: "engrais-mars-2026",
  description: "...",
  startDate: new Date("2026-03-01"),
  endDate: new Date("2026-03-31"),
  isActive: true,
  // ... autres champs
})
```

### 2. Upload Image Hero

La page s'attend à l'image à:
```
/public/images/campaigns/engrais-mars-2026-hero.jpg
```

Dimensions recommandées: **1920 x 600px** (16:5 aspect ratio)

### 3. Ajouter les Produits Campagne

#### Option A: Via Dashboard Admin (manuel)
1. Aller à `/admin/products`
2. Créer/modifier les produits:
   - **Engrais Minéraux 50kg** - 15,000 FCFA
   - **Biofertilisant 5L** - 10,000 FCFA
3. Ajouter les IDs de produit dans `campaign.products`

#### Option B: Automatiser via API
```bash
PUT /api/campaigns/[slug]
Content-Type: application/json

{
  "products": ["product-id-1", "product-id-2"]
}
```

### 4. Configurer les Emails

Créer les templates pour:
- **Confirmation d'éligibilité**: `templates/campaign-eligible.html`
- **Rappel paiement échelonné**: `templates/installment-reminder.html`
- **Notification 2ème tranche**: `templates/second-payment-due.html`

### 5. Build et Deploy

```bash
# Build
npm run build

# Vérifier les routes
npm run dev

# Déployer
git add .
git commit -m "feat: campagne engrais mars 2026"
git push
```

## 📋 Condition d'Éligibilité

Pour bénéficier de la campagne, le client doit:

✅ **Être membre d'une coopérative agréée**
   - Justification via email @cooperative.cm
   - Liste des coopératives agréées: TBD

✅ **Adhérer à une caisse mutuelle agricole**
   - Options: CICAN, CAMAO, ou autre agrée
   - Vérification via le domaine email

✅ **Commander au minimum 6 sacs/litres**
   - Pour engrais minéraux: minimum 6 sacs de 50kg
   - Pour biofertilisants: minimum 5 litres

## 💳 Système de Paiement Échelonné

### Calcul des Tranches

```
Commande: 10 sacs × 15,000 = 150,000 FCFA

TVA (2.5%):        3,750 FCFA
Livraison:         5,000 FCFA (ou 0 si > 50K)
Total:           158,750 FCFA

1ère Tranche (70%): 111,125 FCFA ← À la commande
2ème Tranche (30%):  47,625 FCFA ← Après récolte (J+60)
```

### Délais & Rappels

| Jour | Action |
|------|--------|
| J | Application paiement 1ère tranche |
| J+7 | Email de confirmation de commande |
| J+30 | Rappel de paiement 2ème tranche |
| J+40 | Dernier rappel de paiement |
| J+60 | Deadline de paiement 2ème tranche |
| J+70 | Suspension du compte si non payé |

## 📊 Métriques de Succès

Suivre au dashboard admin:

- **Taux de conversion**: Visites → Commandes
- **Valeur moyenne de commande**: Revenu total / Nombre commandes
- **Taux d'éligibilité**: Éligibles / Total applications
- **Taux de complétion paiement 2**: Payées / Total tranches 2
- **Revenu par région**: Agrégation des commandes par zones

## 🔧 Maintenance & Support

### Ajouter Une Nouvelle Campagne

Créer un fichier `scripts/seed-campaign-[month]-[year].js` similaire à `seed-campaign-march-2026.js`

### Modifier Une Campagne Existante

```bash
# Via API
PUT /api/campaigns/[slug]
Content-Type: application/json

{
  "specialPricing": { ... },
  "terms": { ... }
}
```

### Exporter les Données

```bash
# Via dashboard admin → Bouton "Exporter CSV"
# Génère un fichier: campagne-[slug]-[date].csv
```

### Conditions de Fin de Campagne

Une fois le mois de mars terminé:

1. Mettre `campaign.isActive = false`
2. Les commandes existantes conserveront le paiement échelonné
3. Les nouveaux clients ne pourront plus accéder à la campagne
4. Archiver les données pour reporting

## 📞 Support & Escalade

Pour les questions techniques:
- Issues GitHub: [repo]/issues
- Contact: support@agri-point.cm
- WhatsApp: +237 6XX XXX XXX

---

**Campagne créée:** 12 février 2026
**Statut:** ✅ Prête pour le lancement
**Prochaine revue:** 15 février 2026
