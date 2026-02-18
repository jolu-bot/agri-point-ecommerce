# 💳 Guide Agrégateurs de Paiement - Cameroun

## 🎯 TOP 5 AGRÉGATEURS POUR LE CAMEROUN (2026)

---

## 🥇 1. NOTCHPAY (⭐ RECOMMANDÉ #1 - 100% CAMEROUNAIS)

### 📍 Pourquoi Notchpay en #1?
- ✅ **Créé au Cameroun** pour les Camerounais
- ✅ Support client local (français + anglais)
- ✅ Activation en **24h** maximum
- ✅ Mobile Money: MTN, Orange Money, Express Union, Eumm
- ✅ Cartes Visa/Mastercard
- ✅ FCFA (XAF) natif
- ✅ API REST moderne et simple
- ✅ Plugins WordPress/WooCommerce disponibles
- ✅ Webhooks en temps réel

### 💰 Tarification
```
Frais de transaction: 3.5% + 100 FCFA
Mobile Money:         3.5% (MTN, Orange, Express Union)
Cartes bancaires:     3.9% + 100 FCFA
Pas de frais d'abonnement mensuel
Pas de frais cachés
```

### 📱 Méthodes de paiement supportées
- MTN Mobile Money (Cameroun)
- Orange Money (Cameroun)
- Express Union Mobile Money
- EU Mobile Money (Eumm)
- Visa/Mastercard (local + international)

### 🚀 S'inscrire
**URL:** https://notchpay.co
**Email:** support@notchpay.co
**WhatsApp:** +237 6 XX XX XX XX (disponible sur le site)

### ⚡ Activation rapide (5 étapes)
1. Créer compte sur https://notchpay.co
2. Renseigner informations entreprise
3. Uploader CNI + Registre commerce (ou Attestation)
4. Ajouter compte Mobile Money pour recevoir fonds
5. Validation en 24-48h max

### 🔧 Intégration (next.js)
```javascript
// Installation
npm install notchpay-nodejs

// Configuration simple
import Notchpay from 'notchpay-nodejs';

const notchpay = new Notchpay({
  publicKey: 'pb.notchpay_xxxxx',
  privateKey: 'sk.notchpay_xxxxx'
});

// Créer un paiement
const payment = await notchpay.initializePayment({
  amount: 15000, // en FCFA
  currency: 'XAF',
  email: 'client@example.com',
  callback: 'https://agri-ps.com/api/webhooks/notchpay'
});
```

### ✅ Avantages
- Support client réactif (basé à Douala)
- Comprend le contexte camerounais
- Activation très rapide
- Documentation en français
- Communauté active au Cameroun

### ⚠️ Inconvénients
- Moins connu à l'international
- Limité à l'Afrique Centrale (expansion en cours)

---

## 🥈 2. CINETPAY (⭐ RECOMMANDÉ #2 - LEADER AFRIQUE FRANCOPHONE)

### 📍 Pourquoi CinetPay?
- ✅ Leader en Afrique francophone
- ✅ **10+ pays africains** (dont Cameroun)
- ✅ Mobile Money: MTN, Orange, Moov, Flooz
- ✅ Cartes bancaires + PayPal
- ✅ Interface en français
- ✅ Conversion automatique devises
- ✅ Documentation excellente

### 💰 Tarification
```
Mobile Money:     3.5% par transaction
Cartes bancaires: 3.9% par transaction
Frais setup:      0 FCFA
Retrait fonds:    Gratuit (Mobile Money)
```

### 📱 Méthodes de paiement
- MTN Mobile Money (CM, CI, SN, BF, BJ, ML, GN, NE, TG, RDC)
- Orange Money (CM, CI, SN, BF, BJ, ML, GN, NE, TG)
- Moov Money
- Flooz (Togo)
- Visa/Mastercard
- PayPal (option)

### 🚀 S'inscrire
**URL:** https://cinetpay.com
**Support:** support@cinetpay.com
**Tel:** +225 07 08 81 90 92 (Côte d'Ivoire - WhatsApp OK)

### 📋 Documents requis
- Carte d'identité nationale (CNI)
- Registre de commerce OU Attestation entrepreneur
- Numéro Mobile Money pour retrait
- Justificatif de domicile (facture eau/électricité)

### 🔧 Intégration
```javascript
// Installation
npm install cinetpay-nodejs

// Configuration
import CinetPay from 'cinetpay-nodejs';

const cinetpay = new CinetPay({
  apikey: 'votre_apikey',
  site_id: 'votre_site_id',
  notify_url: 'https://agri-ps.com/api/webhooks/cinetpay'
});

// Initier paiement
const payment = await cinetpay.generatePaymentLink({
  amount: 15000,
  currency: 'XAF',
  transaction_id: 'ORDER123',
  description: 'Achat engrais',
  customer_name: 'Jean Dupont',
  customer_email: 'jean@example.com'
});
```

### ✅ Avantages
- Multi-pays (expansion facile)
- Très stable et fiable
- Dashboard complet
- Support réactif
- Intégration simple

### ⚠️ Inconvénients
- Support basé en Côte d'Ivoire (pas local Cameroun)
- Activation peut prendre 2-3 jours

---

## 🥉 3. FEDAPAY (LEADER BÉNIN/TOGO)

### 📍 Pourquoi FedaPay?
- ✅ Très populaire en Afrique de l'Ouest
- ✅ Interface moderne et élégante
- ✅ API excellente (REST + GraphQL)
- ✅ Support Cameroun disponible
- ✅ Webhooks puissants
- ✅ SDK pour plusieurs langages

### 💰 Tarification
```
Mobile Money:     3.5% + 50 FCFA
Cartes bancaires: 3.9% + 100 FCFA
Transfert bancaire: 1.5%
Frais setup:      0 FCFA
```

### 📱 Méthodes de paiement
- MTN Mobile Money (Bénin, Togo, Cameroun en expansion)
- Moov Money
- Cartes Visa/Mastercard
- Virement bancaire

### 🚀 S'inscrire
**URL:** https://fedapay.com
**Email:** hello@fedapay.com
**WhatsApp:** +229 96 00 00 00

### 🔧 Intégration
```javascript
npm install fedapay

import FedaPay from 'fedapay';

FedaPay.setApiKey('sk_live_xxxxx');
FedaPay.setEnvironment('live');

const transaction = await FedaPay.Transaction.create({
  amount: 15000,
  currency: { iso: 'XAF' },
  description: 'Achat engrais HUMIFORTE',
  callback_url: 'https://agri-ps.com/api/webhooks/fedapay',
  customer: {
    firstname: 'Jean',
    lastname: 'Dupont',
    email: 'jean@example.com',
    phone: '+237670000000'
  }
});
```

### ✅ Avantages
- API de très bonne qualité
- Documentation excellente
- Interface utilisateur moderne
- Support développeur actif

### ⚠️ Inconvénients
- Principalement Bénin/Togo (expansion Cameroun récente)
- Moins d'opérateurs Mobile Money au Cameroun

---

## 4. CAMPAY (100% CAMEROUNAIS - EN CROISSANCE)

### 📍 Pourquoi CamPay?
- ✅ Startup camerounaise (basée à Yaoundé)
- ✅ Focus Mobile Money local
- ✅ Support client en français
- ✅ Activation rapide
- ✅ API moderne

### 💰 Tarification
```
Mobile Money:     3.8% par transaction
Cartes bancaires: 4.2% par transaction
Frais minimum:    100 FCFA
```

### 📱 Méthodes
- MTN Mobile Money
- Orange Money
- Visa/Mastercard

### 🚀 S'inscrire
**URL:** https://campay.net
**Support:** support@campay.net

### ✅ Avantages
- Local et réactif
- Compréhension du marché camerounais
- Tarifs compétitifs

### ⚠️ Inconvénients
- Plus récent (moins de recul)
- Documentation en développement
- Moins d'opérateurs que Notchpay

---

## 5. MAVIANCE (SMOBILPAY)

### 📍 Pourquoi Maviance?
- ✅ Pioneer au Cameroun (10+ ans)
- ✅ Solution enterprise-grade
- ✅ Tous les opérateurs Mobile Money
- ✅ API solide et éprouvée

### 💰 Tarification
```
Variable selon volume
Négociable pour gros volumes
Frais setup possibles
```

### 📱 Méthodes
- MTN Mobile Money
- Orange Money
- Express Union
- YUP

### 🚀 S'inscrire
**URL:** https://www.maviance.com
**Email:** info@maviance.com

### ✅ Avantages
- Très établi au Cameroun
- Fiable et stable
- Support enterprise

### ⚠️ Inconvénients
- Plus orienté B2B/Enterprise
- Setup peut être long
- Documentation moins moderne
- Frais moins transparents

---

## 📊 COMPARATIF DÉTAILLÉ

| Critère | Notchpay | CinetPay | FedaPay | CamPay | Maviance |
|---------|----------|----------|---------|--------|----------|
| **Pays origine** | 🇨🇲 Cameroun | 🇨🇮 Côte d'Ivoire | 🇧🇯 Bénin | 🇨🇲 Cameroun | 🇨🇲 Cameroun |
| **Activation** | 24-48h | 2-3 jours | 2-3 jours | 48h | 1 semaine |
| **Frais Mobile Money** | 3.5% | 3.5% | 3.5% | 3.8% | Variable |
| **Frais cartes** | 3.9% | 3.9% | 3.9% | 4.2% | Variable |
| **MTN Money** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Orange Money** | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| **Express Union** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Support FR** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Support local CM** | ✅✅ | ❌ | ❌ | ✅ | ✅ |
| **API qualité** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Multi-pays** | 🇨🇲 | 🌍 10+ | 🌍 5+ | 🇨🇲 | 🇨🇲 |
| **Prix/Qualité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎯 MA RECOMMANDATION POUR AGRI-PS.COM

### 🏆 SOLUTION OPTIMALE: DOUBLE AGRÉGATEUR

```
1️⃣ PRINCIPAL: Notchpay
   ✅ 100% camerounais
   ✅ Activation 24h
   ✅ Support local réactif
   ✅ Tous les Mobile Money (MTN, Orange, Express Union)
   ✅ Tarifs transparents
   ✅ Parfait pour démarrer RAPIDEMENT

2️⃣ BACKUP: CinetPay (ajouter dans 1-2 mois)
   ✅ Multi-pays (si expansion future)
   ✅ API excellente
   ✅ Très stable
   ✅ Redundance en cas de problème Notchpay
```

### 📅 PLAN D'IMPLÉMENTATION

**SEMAINE 1 (MAINTENANT):**
```
Jour 1: Inscription Notchpay
Jour 2: Upload documents KYC
Jour 3: Validation compte (24-48h)
Jour 4: Récupération clés API
Jour 5: Intégration dans le code (je m'en occupe)
Jour 6: Tests paiements
Jour 7: Mise en production
```

**SEMAINE 4-6 (APRÈS PREMIERS CLIENTS):**
```
- Inscription CinetPay
- Intégration en parallèle
- Offrir choix au client: Notchpay ou CinetPay
- Augmenter le taux de conversion
```

---

## 🚀 PROCHAINES ÉTAPES IMMÉDIATES

### 1. INSCRIPTION NOTCHPAY (5 MIN)

**Allez sur:** https://notchpay.co

**Cliquez sur:** "Créer un compte" ou "Get Started"

**Préparez ces documents:**
- 📄 Carte Nationale d'Identité (CNI) - scan/photo claire
- 🏢 Registre de commerce OU Attestation entrepreneur
  - Si pas encore: Attestation sur l'honneur possible
- 📱 Numéro Mobile Money actif (MTN ou Orange) pour recevoir les fonds
- 📧 Email professionnel: admin@agri-ps.com
- 📞 Téléphone: +237 6XX XX XX XX

### 2. REMPLIR LE FORMULAIRE

```
Nom entreprise:     Agri-Point Sénégal (ou votre nom)
Type d'activité:    E-commerce / Vente produits agricoles
Site web:           https://agri-ps.com
Email:              admin@agri-ps.com
Téléphone:          +237 XXX XXX XXX
Ville:              Yaoundé (ou votre ville)
```

### 3. COMPTE MOBILE MONEY POUR RETRAITS

**Vous devez lier un compte Mobile Money pour recevoir vos fonds:**

**Option A - MTN Mobile Money:**
```
Numéro:             +237 6XX XXX XXX
Nom du compte:      Votre nom complet (identique à la CNI)
```

**Option B - Orange Money:**
```
Numéro:             +237 6XX XXX XXX
Nom du compte:      Votre nom complet (identique à la CNI)
```

### 4. ATTENDRE VALIDATION (24-48H)

Notchpay vous enverra:
- ✅ Email de confirmation
- ✅ Accès au dashboard
- ✅ Clés API (Publique + Secrète)

### 5. ENVOYER-MOI LES CLÉS

Une fois approuvé, depuis votre dashboard Notchpay:
```
Dashboard → Paramètres → API Keys

Vous verrez:
- Public Key:  pb.notchpay_xxxxxxxxxxxxx
- Private Key: sk.notchpay_xxxxxxxxxxxxx
```

**Envoyez-moi ces 2 clés** et j'intègre tout en 30 minutes!

---

## 💡 ALTERNATIVE ULTRA-RAPIDE: CINETPAY EN PARALLÈLE

Si vous voulez démarrer encore plus vite:

**Inscrivez-vous sur CinetPay ET Notchpay en parallèle:**
- CinetPay peut être plus rapide à valider (2-3 jours)
- Notchpay suit (24-48h)
- Vous aurez 2 options de paiement = meilleur taux de conversion

---

## 📞 CONTACTS UTILES

### Notchpay
- 🌐 Site: https://notchpay.co
- 📧 Email: support@notchpay.co
- 📱 Support disponible sur leur site

### CinetPay
- 🌐 Site: https://cinetpay.com
- 📧 Email: support@cinetpay.com
- 📱 WhatsApp: +225 07 08 81 90 92

### FedaPay
- 🌐 Site: https://fedapay.com
- 📧 Email: hello@fedapay.com

---

## ⚡ ACTION IMMÉDIATE

**QUE FAIRE MAINTENANT:**

1. **Choisissez:** Notchpay OU CinetPay OU les deux
2. **Inscrivez-vous** sur le site (5 minutes)
3. **Uploadez** vos documents KYC
4. **Attendez** validation (24-48h)
5. **Récupérez** vos clés API
6. **Envoyez-moi** les clés → J'intègre en 30 min

**Pendant l'attente de validation, je peux:**
- Préparer le code d'intégration
- Configurer les webhooks
- Créer les pages de paiement
- Tester en mode sandbox

---

## 🎯 QUELLE SOLUTION PRÉFÉREZ-VOUS?

**A)** Notchpay (100% camerounais, activation 24h)
**B)** CinetPay (multi-pays, API excellente)
**C)** Les deux en parallèle (redondance + conversion)
**D)** Autre (FedaPay, CamPay, Maviance)

Dites-moi votre choix et je prépare tout!
