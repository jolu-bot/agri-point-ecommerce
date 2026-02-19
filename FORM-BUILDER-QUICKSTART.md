# 🚀 Guide de Démarrage Rapide - Form Builder

## En 5 minutes : Créez votre premier formulaire

### Étape 1 : Accéder au Form Builder

1. Connectez-vous à l'admin : `/admin`
2. Cliquez sur **Formulaires** dans le menu
3. Cliquez sur **Créer un formulaire**

### Étape 2 : Configuration de base

**Donnez un nom à votre formulaire :**
- Nom : `Formulaire de contact`
- Le slug sera auto-généré : `formulaire-de-contact`

### Étape 3 : Ajouter des champs

#### Bibliothèque de champs (à gauche)

Glissez-déposez ces champs sur le canvas :

1. **Nom** (Texte)
   - Type : `text`
   - Label : "Votre nom"
   - Requis : ✅
   - Largeur : Moitié

2. **Email** (Email)
   - Type : `email`
   - Label : "Votre email"
   - Requis : ✅
   - Largeur : Moitié

3. **Sujet** (Select)
   - Type : `select`
   - Label : "Sujet"
   - Options :
     - "Question générale"
     - "Support technique"
     - "Partenariat"
   - Largeur : Pleine

4. **Message** (Textarea)
   - Type : `textarea`
   - Label : "Votre message"
   - Lignes : 6
   - Requis : ✅
   - Largeur : Pleine

### Étape 4 : Personnaliser chaque champ

Cliquez sur un champ pour ouvrir l'éditeur (à droite) :

#### Onglet "Champ"
- **Label** : Texte affiché
- **Nom** : Identifiant unique (auto-généré)
- **Placeholder** : Texte d'aide
- **Description** : Info supplémentaire
- **Valeur par défaut** : Valeur pré-remplie
- **Largeur** : Full, Moitié, Tiers, Quart

#### Onglet "Validation"
- **Requis** : Active/désactive l'obligation
- **Min/Max** : Pour nombres et textes
- **Pattern** : Regex personnalisé

### Étape 5 : Configurer les paramètres

Cliquez sur l'icône ⚙️ en haut à droite :

#### Soumission
- **Texte du bouton** : "Envoyer"
- **Message de succès** : "Merci ! Nous vous répondrons bientôt."
- **URL de redirection** : `/merci` (optionnel)
- **Autoriser plusieurs soumissions** : ✅

#### Email (optionnel)
- **Notifications email** : ✅
- **Emails** : `admin@votresite.com`
- **Réponse automatique** : ✅
- **Champ email** : `email`
- **Message** : "Merci pour votre message..."

#### Sécurité
- **Rate limiting** : 5 soumissions/heure
- **Captcha** : 🔄 (à configurer)

#### Design
- **Couleur principale** : #3b82f6
- **Layout** : Card (moderne)

### Étape 6 : Publier

1. Cliquez sur **Enregistrer**
2. Changez le statut de "Brouillon" à "Publié"
3. Votre formulaire est maintenant accessible sur :
   ```
   https://votresite.com/forms/formulaire-de-contact
   ```

---

## ✅ Checklist de vérification

Avant de publier, vérifiez :

- [ ] Tous les champs requis sont marqués
- [ ] Les labels sont clairs et explicites
- [ ] La validation est correctement configurée
- [ ] Le message de succès est personnalisé
- [ ] Les emails de notification sont corrects
- [ ] Le rate limiting est adapté à votre usage

---

## 🎯 Cas d'usage populaires

### 1. Formulaire de contact simple

**Champs :**
- Nom (texte, requis)
- Email (email, requis)
- Message (textarea, requis)

**Paramètres :**
- Notification email : ✅
- Réponse automatique : ✅
- Rate limit : 5/heure

---

### 2. Inscription à un événement

**Champs :**
- Nom complet (texte, requis)
- Email (email, requis)
- Téléphone (tel)
- Nombre de places (nombre, min: 1, max: 10)
- Régime alimentaire (select avec options)
- Commentaires (textarea)

**Paramètres :**
- Limite de soumissions : 100
- Webhook vers Zapier pour créer un ticket
- Email de confirmation automatique

---

### 3. Enquête de satisfaction

**Champs :**
- Satisfaction générale (rating, max: 5)
- Qualité du service (slider, 0-10)
- Recommanderiez-vous ? (radio : Oui/Non/Peut-être)
- Points positifs (textarea)
- Points à améliorer (textarea)
- Email (optionnel pour suivi)

**Paramètres :**
- Autoriser soumissions anonymes
- Export CSV pour analyse
- Pas de notifications email

---

### 4. Demande de devis

**Champs :**
- **Section** "Vos informations"
  - Entreprise (texte, requis)
  - Nom du contact (texte, requis)
  - Email (email, requis)
  - Téléphone (tel, requis)

- **Section** "Votre projet"
  - Type de projet (select, requis)
  - Budget estimé (select avec tranches)
  - Description (textarea, requis)
  - Fichiers (file upload, multiple)

- **Section** "Échéances"
  - Date de début souhaitée (date)
  - Urgence (radio : Normal/Urgent)

- Case à cocher CGV (single-checkbox, requis)

**Paramètres :**
- Webhook vers CRM
- Email au commercial avec détails
- Réponse automatique avec PDF
- Rate limit : 3/heure

---

## 🔧 Fonctionnalités avancées

### Logique conditionnelle

Affichez un champ selon la valeur d'un autre :

```typescript
// Champ "Autre précision" visible seulement si "Autre" est sélectionné
{
  type: 'text',
  name: 'autre_precision',
  label: 'Précisez',
  conditional: {
    field: 'categorie', // Nom du champ select
    operator: 'equals',
    value: 'autre'
  }
}
```

**Opérateurs disponibles :**
- `equals` : Égal à
- `not-equals` : Différent de
- `contains` : Contient
- `greater` : Supérieur à
- `less` : Inférieur à

### Validation personnalisée

Pattern regex pour validation avancée :

```typescript
// Code postal français
{
  type: 'text',
  name: 'code_postal',
  validation: [
    {
      type: 'pattern',
      value: '^[0-9]{5}$',
      message: 'Code postal invalide (5 chiffres)'
    }
  ]
}

// Numéro de téléphone français
{
  type: 'tel',
  name: 'telephone',
  validation: [
    {
      type: 'pattern',
      value: '^0[1-9][0-9]{8}$',
      message: 'Format : 0123456789'
    }
  ]
}
```

### Webhooks pour intégrations

#### Zapier

1. Créez un Zap avec trigger "Webhooks by Zapier"
2. Choisissez "Catch Hook"
3. Copiez l'URL : `https://hooks.zapier.com/hooks/catch/xxx/yyy/`
4. Dans le Form Builder → Paramètres → Webhooks :
   ```json
   {
     "url": "https://hooks.zapier.com/hooks/catch/xxx/yyy/",
     "method": "POST",
     "active": true
   }
   ```
5. Testez en soumettant le formulaire
6. Dans Zapier, continuez le Zap (ex: créer une fiche Google Sheets)

#### Slack notifications

Dans les paramètres webhook du formulaire :
```json
{
  "url": "https://hooks.slack.com/services/T00/B00/xxx",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "active": true
}
```

Le payload sera automatiquement envoyé à Slack.

Pour un message formaté, créez un middleware qui transforme le payload.

---

## 📊 Gérer les soumissions

### Interface des soumissions

**Admin** → **Formulaires** → **[Nom]** → **Soumissions**

#### Filtres disponibles
- **Recherche** : Cherche dans toutes les données
- **Statut** : Pending, Processed, Spam, Archived
- **Lecture** : Toutes, Lues, Non lues

#### Actions sur une soumission
1. **⭐ Favoris** : Marquer comme important
2. **📝 Notes** : Ajouter des commentaires internes
3. **🔄 Statut** : Changer le statut (pending → processed)
4. **🗑️ Supprimer** : Supprimer définitivement

#### Export CSV

1. Cliquez sur **Exporter CSV**
2. Le fichier contient :
   - Toutes les données du formulaire
   - Métadonnées (IP, appareil, navigateur)
   - Date de soumission
   - Statut et notes

3. Ouvrez avec Excel/Google Sheets pour analyse

---

## 🎨 Personnalisation visuelle

### Changer la couleur du formulaire

Dans les paramètres → Design → Couleur principale :

```
#3b82f6(Bleu)
#10b981 (Vert)
#8b5cf6 (Violet)
#f59e0b (Orange)
#ef4444 (Rouge)
```

Le header et les boutons prendront cette couleur.

### Layouts disponibles

#### Default
- Simple et épuré
- Fond blanc
- Idéal pour intégration iframe

#### Card
- Design moderne
- Fond dégradé
- Ombres et bordures arrondies
- Recommandé pour pages dédiées

#### Steps (🔄 à venir)
- Formulaire multi-étapes
- Barre de progression
- Idéal pour longs formulaires

---

## 🚨 Gestion du spam

### Détection automatique

Chaque soumission reçoit un **score de spam** (0-100) :

- **0-30** : Légitime (vert)
- **31-69** : Suspect (orange)
- **70-100** : Spam (rouge, auto-archivé)

### Critères de détection

1. **Mots-clés** : viagra, casino, lottery, etc. (+20 points)
2. **Liens excessifs** : Plus de 3 URLs (+10 points par lien)
3. **Rapidité** : Rempli en moins de 5 secondes (+30 points)

### Actions sur le spam

Dans **Soumissions** → Filtrer par "Spam" :

1. **Faux positif** : Changez le statut en "Pending"
2. **Spam confirmé** : Supprimez ou archivez
3. **Bloquer l'IP** : (🔄 fonctionnalité à venir)

### Réduire le spam

1. **Activez le captcha** (reCAPTCHA, hCaptcha)
2. **Rate limiting strict** : 3-5 soumissions/heure
3. **Champ honeypot** : Ajoutez un champ caché :
   ```typescript
   {
     type: 'hidden',
     name: 'website', // Les bots le rempliront
     defaultValue: ''
   }
   ```
   Puis rejetez si non vide côté serveur.

---

## 🔐 Sécurité et conformité

### RGPD

Pour être conforme RGPD :

1. **Ajoutez une case de consentement** :
   ```typescript
   {
     type: 'single-checkbox',
     name: 'rgpd_consent',
     label: 'J\'accepte que mes données soient utilisées pour traiter ma demande',
     required: true
   }
   ```

2. **Lien vers la politique de confidentialité** :
   ```typescript
   {
     type: 'html',
     defaultValue: '<p class="text-sm text-gray-600">Consultez notre <a href="/confidentialite" class="text-blue-600 underline">politique de confidentialité</a></p>'
   }
   ```

3. **Permet suppression** : Les utilisateurs peuvent demander la suppression de leurs données via l'admin

4. **Durée de conservation** : Archivez automatiquement après X jours (🔄 à implémenter)

### Stockage sécurisé

- Les soumissions sont stockées dans MongoDB
- Les données sensibles ne sont pas loguées
- Les IPs sont anonymisées (🔄 option à ajouter)

---

## 💡 Tips & Astuces

### 1. Optimiser le taux de complétion

✅ **Réduire le nombre de champs** : Maximum 7-8 champs
✅ **Marquer clairement les champs requis** : Étoile rouge *
✅ **Placeholder explicites** : "Ex: jean.dupont@gmail.com"
✅ **Messages d'erreur clairs** : "Format : 0123456789"
✅ **Barre de progression** : Pour formulaires longs
✅ **Sauvegarde auto** : (🔄 à implémenter)

### 2. Augmenter la conversion

✅ **Message de succès engageant** : "🎉 Merci ! On vous répond sous 24h"
✅ **Redirection vers contenu** : Page de remerciement avec bonus
✅ **Email de confirmation immédiat** : Rassure l'utilisateur
✅ **Design soigné** : Layout Card avec couleur de marque

### 3. Analyser les performances

Dans **Soumissions** → Statistiques :

- **Temps moyen de complétion** : Si >5 min, le formulaire est trop long
- **Taux de spam** : Si >20%, renforcez la sécurité
- **Soumissions/vues** : Taux de conversion

Exportez en CSV pour analyse approfondie dans Excel.

---

## 🆘 Besoin d'aide ?

### Problème : Le formulaire ne s'affiche pas

1. Vérifiez que le statut est "Publié"
2. Vérifiez l'URL : `/forms/[slug-exact]`
3. Consultez la console navigateur (F12)

### Problème : Les soumissions ne s'enregistrent pas

1. Vérifiez la connexion MongoDB
2. Vérifiez les logs serveur
3. Testez le rate limiting (attendez 1h si bloqué)

### Problème : Les emails ne partent pas

1. Vérifiez les variables d'environnement SMTP
2. Activez "Notifications email" dans les paramètres
3. Testez avec un email de test

### Support

Pour toute question : consultez la [Documentation complète](./FORM-BUILDER-README.md)

---

**🎊 Vous êtes prêt ! Créez votre premier formulaire maintenant.**
