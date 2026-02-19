# 🎨 Système CMS Avancé - Guide Complet

## 🌟 Vue d'ensemble

Votre site AGRI POINT dispose maintenant d'un **système CMS ultra-moderne** qui vous permet de **tout contrôler depuis le Dashboard Admin** sans jamais toucher au code!

## 📋 Fonctionnalités Principales

### 1. Configuration du Header (Logo & Textes)
**Page:** `/admin/site-config-advanced`

#### Ce que vous pouvez configurer:
- ✅ **Logo**
  - URL du fichier logo
  - Tailles responsive (Mobile / Tablet / Desktop)
  - Format: Classes Tailwind (ex: `w-11 h-11` = 44px)

- ✅ **Texte Principal** (AGRI POINT)
  - Contenu du texte
  - Tailles responsive
  - Police et couleurs
  
- ✅ **Sous-titre** (Service Agricole)
  - Contenu configurable
  - Tailles adaptatives
  - Style customisable

- ✅ **Hauteur du Header**
  - Mobile, Tablet, Desktop
  - Espacement entre éléments

#### Comment utiliser:
1. Accédez à `/admin/site-config-advanced`
2. Onglet "Header & Branding"
3. Développez les sections (Logo, Texte Principal, Sous-titre)
4. Modifiez les valeurs
5. Cliquez sur "Enregistrer"
6. Le site se recharge automatiquement avec les nouvelles valeurs!

### 2. Gestion des Modules & Fonctionnalités
**Page:** `/admin/site-config-advanced` (Onglet Modules)

#### Modules activables/désactivables:

**Produits**
- ✅ Module produits complet
- ✅ Avis clients (on/off)
- ✅ Affichage du stock (on/off)

**Commandes**
- ✅ Module commandes
- ✅ Confirmation automatique
- ✅ Vérification email obligatoire

**Paiements**
- ✅ Campost (reçu photo)
- ✅ MTN Mobile Money
- ✅ Orange Money
- ✅ NotchPay
- ✅ CinetPay
- ✅ Paiement à la livraison

**Campaigns**
- ✅ Module campagnes promotionnelles
- ✅ Compte à rebours

**Agriculture Urbaine**
- ✅ Module agriculture urbaine
- ✅ Cours en ligne (à venir)

**Blog** (Future)
- ✅ Module blog
- ✅ Commentaires

### 3. Gestion des Permissions & Rôles
**Page:** `/admin/permissions`

#### Rôles prédéfinis:
1. **Admin** (vous)
   - Accès total à tout
   - Ne peut pas être supprimé
   
2. **Manager**
   - Gestion produits et commandes
   - Pas d'accès aux paramètres critiques
   
3. **Customer** (clients)
   - Consultation produits
   - Passer commandes

#### Créer des rôles personnalisés:
1. Cliquez sur "Nouveau Rôle"
2. Entrez nom technique (ex: `content_manager`)
3. Entrez nom d'affichage (ex: "Gestionnaire de Contenu")
4. Cliquez "Créer le Rôle"
5. Configurez les permissions:
   - Cochez les ressources accessibles
   - Sélectionnez les actions autorisées
6. Cliquez "Enregistrer"

#### Ressources disponibles:
- `all` - Tous les modules 🌟
- `products` - Gestion produits
- `orders` - Gestion commandes
- `users` - Gestion utilisateurs
- `campaigns` - Campagnes marketing
- `payments` - Paiements
- `analytics` - Statistiques
- `settings` - Paramètres site
- `permissions` - Permissions
- `content` - Contenu éditorial

#### Actions disponibles:
- `view` - Voir
- `create` - Créer
- `edit` - Modifier
- `delete` - Supprimer
- `manage` - Gestion complète (inclut tout)

#### Attribuer un rôle à un utilisateur:
1. Dans la sidebar "Utilisateurs"
2. Sélectionnez le rôle dans le menu déroulant
3. Changement immédiat!

### 4. Paramètres Avancés
**Page:** `/admin/site-config-advanced` (Onglet Paramètres Avancés)

- **Mode Maintenance** - Désactiver temporairement le site
- **Inscription Ouverte** - Autoriser nouvelles inscriptions
- **AgriBot** - Assistant IA pour conseils agricoles
- **Newsletter** - Inscription newsletter sur le site

## 🚀 Initialisation (À faire une seule fois)

Pour initialiser la configuration du header dans votre base de données:

```bash
# Dans le terminal
node scripts/init-header-config.js
```

Cela va créer la configuration par défaut avec:
- Logo: 44-52-60px (responsive)
- Texte: text-sm → text-lg → text-xl
- Modules: tous actifs sauf blog
- Rôles: admin, manager, customer

## 📊 Utilisation Quotidienne

### Changements rapides du header:
1. `/admin/site-config-advanced`
2. Onglet "Header & Branding"
3. Ajustez logo/textes
4. Enregistrer → Actualisation auto!

### Activer/désactiver un module:
1. `/admin/site-config-advanced`
2. Onglet "Modules"
3. Toggle le switch
4. Enregistrer

### Donner accès à un employé:
1. `/admin/permissions`
2. Créez un rôle (ex: "Assistant Marketing")
3. Cochez permissions (campaigns: view, edit)
4. Sidebar → Trouvez l'utilisateur
5. Changez son rôle
6. ✅ Il a maintenant accès!

## 🎯 Exemples de Cas d'Usage

### Cas 1: Embaucher un gestionnaire de produits
```
1. Créer utilisateur via inscription ou admin
2. /admin/permissions → Trouvez l'utilisateur
3. Changez rôle: Manager
4. Il peut maintenant:
   - Voir et modifier produits
   - Gérer commandes
   - Pas toucher aux settings
```

### Cas 2: Campagne promotionnelle temporaire
```
1. /admin/site-config-advanced
2. Onglet Modules
3. Activez "Campaigns"
4. Activez "Compte à rebours"
5. Créez votre campagne
6. Après la campagne → Désactivez le module
```

### Cas 3: Logo trop grand
```
1. /admin/site-config-advanced
2. Header & Branding → Logo
3. Réduisez tailles:
   - Mobile: w-10 h-10 (au lieu de w-11 h-11)
   - Tablet: w-12 h-12 (au lieu de w-13 h-13)
   - Desktop: w-14 h-14 (au lieu de w-15 h-15)
4. Enregistrer
5. Vérifiez le résultat immédiatement!
```

### Cas 4: Texte "AGRI POINT" trop petit
```
1. /admin/site-config-advanced
2. Header & Branding → Texte Principal
3. Augmentez tailles:
   - Mobile: text-base (au lieu de text-sm)
   - Tablet: text-xl (au lieu de text-lg)
   - Desktop: text-2xl (au lieu de text-xl)
4. Enregistrer
```

## 🎨 Guide des Tailles Tailwind

### Tailles de logo/image:
- `w-8 h-8` = 32px (très petit)
- `w-10 h-10` = 40px (petit)
- `w-11 h-11` = 44px (actuel mobile) ⭐
- `w-12 h-12` = 48px (moyen)
- `w-13 h-13` = 52px (actuel tablet) ⭐
- `w-14 h-14` = 56px
- `w-15 h-15` = 60px (actuel desktop) ⭐
- `w-16 h-16` = 64px (grand)

### Tailles de texte:
- `text-xs` = 12px (très petit)
- `text-sm` = 14px (petit) ⭐ actuel mobile
- `text-base` = 16px (normal)
- `text-lg` = 18px (moyen) ⭐ actuel tablet
- `text-xl` = 20px (grand) ⭐ actuel desktop
- `text-2xl` = 24px (très grand)
- `text-3xl` = 30px (énorme)

## 🔧 Dépannage

### Le header ne change pas:
1. Vérifiez que vous avez cliqué "Enregistrer"
2. Rafraîchissez la page (Ctrl+F5)
3. Vérifiez la console pour erreurs
4. Réinitialisez: `node scripts/init-header-config.js`

### Les permissions ne fonctionnent pas:
1. Vérifiez que le rôle est bien sauvegardé
2. L'utilisateur doit se déconnecter/reconnecter
3. Vérifiez dans `/admin/users-management`

### Module désactivé mais toujours visible:
1. Certains modules nécessitent un redémarrage
2. Videz le cache du navigateur
3. Attendez le prochain déploiement Vercel

## 📞 Support

Pour toute question sur l'utilisation du CMS:
1. Consultez ce guide
2. Vérifiez les logs dans la console
3. Testez en mode prévisualisation d'abord

## 🎉 Prochaines Fonctionnalités

- [ ] Prévisualisation en temps réel (sans sauvegarder)
- [ ] Historique des modifications
- [ ] Import/Export de configurations
- [ ] Templates de rôles prédéfinis
- [ ] Notifications par email lors de changements
- [ ] Mode multi-langue pour le header
- [ ] Éditeur visuel drag & drop
- [ ] A/B testing des configurations

---

**Version:** 1.0.0  
**Dernière mise à jour:** 19 février 2026  
**Créé pour:** AGRI POINT SERVICE
