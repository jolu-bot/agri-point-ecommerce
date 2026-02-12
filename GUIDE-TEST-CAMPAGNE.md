# 🧪 Guide de Test - Campagne Engrais Mars 2026

Guide complet pour tester la campagne engrais avant lancement en production.

## 📋 Table des Matières
1. [Setup Local](#setup-local)
2. [Test Fonctionnalités](#test-fonctionnalités)
3. [Test Formulaire Éligibilité](#test-formulaire-éligibilité)
4. [Test Paiement 70/30](#test-paiement-7030)
5. [Test Dashboard Admin](#test-dashboard-admin)
6. [Dépannage](#dépannage)

---

## 🚀 Setup Local

### 1. Installer les dépendances
```bash
cd c:\Users\jolub\Downloads\agri-point-ecommerce
npm install
```

### 2. Configurer l'environnement
Vérifier que `.env.local` contient:
```
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=...
NODE_ENV=development
```

### 3. Générer les assets
```bash
npm run generate:hero    # Générer image hero (déjà fait)
npm run seed:campaign    # Seed campagne (déjà fait)
npm run seed:campaign:products  # Seed produits (déjà fait)
```

### 4. Démarrer le serveur
```bash
npm run dev
```

**Accès:** http://localhost:3000

---

## 🌾 Test Fonctionnalités

### Page Campagne - Navigation
```
http://localhost:3000/campagne-engrais
```

**Checklist:**
- [ ] Hero image s'affiche (1920x600px)
- [ ] Texte principal visible: "CAMPAGNE ENGRAIS MARS 2026"
- [ ] Bouton "Je M'Inscris" visible
- [ ] Tarifs affichent: 15,000 FCFA / 10,000 FCFA
- [ ] Conditions d'éligibilité lisibles
- [ ] Formulaire visible en bas
- [ ] Responsive sur mobile ✅

### Configuration des Dates
```
Période: 01/03/2026 - 31/03/2026
Statut: ✅ ACTIVE
```

---

## ✅ Test Formulaire Éligibilité

### 1️⃣ Scénario: Non-Éligible (Pas Membre Coopérative)

**Saisir:**
```
Nom Complet: Test User 1
Email: test1@exemple.cm
Téléphone: +237 6XX XXX XXX
Type d'Engrais: Engrais Minéraux
Coopérative: COOP Test
Email Coopérative: test@coop.cm
☐ Je suis membre d'une coopérative (NON coché)
☑ J'adhère à une caisse mutuelle (Coché)
Organisme: CICAN
Quantité: 10
```

**Résultat attendu:**
```
❌ "Vous devez être membre d'une coopérative agréée"
Bouton submit: Disabled ou affiche error
```

**Vérifier:**
- [ ] Message d'erreur approprié
- [ ] Bouton ne peut pas être cliqué
- [ ] Pas de redirection checkout

---

### 2️⃣ Scénario: Non-Éligible (Pas d'Assurance)

**Saisir:**
```
Nom Complet: Test User 2
Email: test2@exemple.cm
Téléphone: +237 6XX XXX XXX
Type d'Engrais: Biofertilisants
Coopérative: COOP Agritech
Email Coopérative: contact@coop.cm
☑ Je suis membre d'une coopérative (Coché)
☐ J'adhère à une caisse mutuelle (NON coché)
Quantité: 5
```

**Résultat attendu:**
```
❌ "Vous devez adhérer à une caisse mutuelle agricole"
Bouton submit: Disabled
```

---

### 3️⃣ Scénario: Non-Éligible (Quantité Insuffisante)

**Saisir:**
```
Nom Complet: Test User 3
Email: test3@exemple.cm
Téléphone: +237 6XX XXX XXX
Type d'Engrais: Engrais Minéraux
Coopérative: COOP Success
Email Coopérative: success@coop.cm
☑ Je suis membre d'une coopérative (Coché)
☑ J'adhère à une caisse mutuelle (Coché)
Organisme: CAMAO
Quantité: 3  ← Minimum est 6!
```

**Résultat attendu:**
```
❌ "Quantité minimale: 6 sacs/litres"
Bouton submit: Disabled
```

---

### 4️⃣ Scénario: ✅ ÉLIGIBLE (Complet)

**Saisir:**
```
Nom Complet: John Doe
Email: john@exemple.cm
Téléphone: +237 655 123 456
Type d'Engrais: Engrais Minéraux
Coopérative: COOP Agritech Cameroun
Email Coopérative: contact@agritech.cm
☑ Je suis membre d'une coopérative (Coché)
☑ J'adhère à une caisse mutuelle (Coché)
Organisme: CICAN
Quantité: 10
```

**Cliquer:** "Vérifier l'Éligibilité et Passer la Commande"

**Résultat attendu:**
```
✅ "Vous êtes éligible! Proceedez à la commande."
Message vert visible
Redirection après 2s → /checkout?campaign=engrais-mars-2026
```

**Vérifier:**
- [ ] Message de succès s'affiche
- [ ] Pas d'erreurs en console
- [ ] Redirection vers checkout

---

## 💳 Test Paiement 70/30

### Vérification en Base de Données

Une fois redirigé au checkout, vérifier dans MongoDB:

```javascript
// Connecter via MongoDB Compass ou shell
use agri-point

// Chercher la commande créée
db.orders.findOne(
  { 
    "campaignEligibility.isEligible": true,
    "isCampaignOrder": true
  }
)
```

**Vérifier les champs:**
```json
{
  "isCampaignOrder": true,
  "campaign": ObjectId("..."),
  "campaignEligibility": {
    "isEligible": true,
    "cooperativeMember": true,
    "mutualInsuranceValid": true,
    "insuranceProvider": "CICAN"
  },
  "installmentPayment": {
    "enabled": true,
    "firstAmount": 105000,      // 70% du total
    "secondAmount": 45000,      // 30% du total
    "firstPaymentStatus": "pending",
    "secondPaymentStatus": "pending",
    "secondPaymentDueDate": "2026-05-12"  // J+60
  }
}
```

---

## 📊 Test Dashboard Admin

### Accès
```
http://localhost:3000/admin/campaigns
```

**Checklist:**
- [ ] Page charge sans erreurs
- [ ] Sélecteur campagne visible
- [ ] "Campagne Engrais - Mars 2026" dans la liste
- [ ] KPIs affichent:
  - Total Commandes: (nombre de tests)
  - Quantité Totale: (somme des quantités)
  - Revenu Total: (somme des totaux)
  - Revenu Moyen: (total / nombre)
- [ ] Tableau commandes affiche les tests créés
- [ ] Statut paiement 70/30 visible
- [ ] Bouton "Exporter CSV" fonctionnel

### Test CSV Export
Cliquer "Exporter CSV" et vérifier:
- [ ] Fichier téléchargé: `campagne-engrais-mars-2026-[date].csv`
- [ ] Colonnes: #Commande, Montant, Statut, Paiement, Date
- [ ] Toutes les commandes listent correctly

---

## 🔧 Dépannage

### Image Hero ne s'affiche pas
```bash
# Régénérer
npm run generate:hero

# Vérifier le fichier existe
ls public/images/campaigns/
```

### Formulaire ne soumet pas
**Vérifier en Console (F12 → Console):**
```
1. Pas d'erreurs JavaScript
2. API répond: /api/campaigns/apply
3. Réponse JSON contient "eligible": true
```

### Campagne non trouvée en BD
```bash
npm run seed:campaign
npm run seed:campaign:products
```

### Erreur Mongoose "duplicate index"
**Déjà corrigé!** Mais au besoin:
```bash
npm run build  # Le build corrige automatiquement
```

### Port 3000 déjà utilisé
```bash
# Utiliser un autre port
npm run dev -- -p 3001
# Accéder: http://localhost:3001
```

---

## ✅ Checklist Finale

Avant lancement en production:

- [ ] Build clean (npm run build)
- [ ] Tous les scénarios testés
- [ ] Images chargent correctement
- [ ] Paiement 70/30 en BD
- [ ] Dashboard admin fonctionnel
- [ ] Pas d'erreurs en console
- [ ] Responsive testé (mobile + desktop)
- [ ] Performance Lighthouse vérifiée

---

## 📞 Contacter pour Support

Si erreurs ou questions:
- Logs: `npm run dev` → Console
- Base de données: MongoDB Compass
- API: Tester endpoints avec Postman/Insomnia

---

**Test complété:** [Date du test]
**Tester:** [Votre nom]
**Status:** ✅ / ⚠️ / ❌
