# 🎯 Guide Complet du Système de Version Control & Preview

## 📖 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Version Control System](#version-control-system)
3. [Mode Prévisualisation](#mode-prévisualisation)
4. [Import/Export de Configurations](#importexport-de-configurations)
5. [Guide d'Utilisation](#guide-dutilisation)
6. [Architecture Technique](#architecture-technique)

---

## 🎪 Vue d'ensemble

Le système CMS d'AGRI POINT SERVICE dispose maintenant de fonctionnalités de niveau entreprise pour gérer les configurations du site :

### ✨ Fonctionnalités Principales

- **🔄 Historique des Versions** - Toutes les modifications sont automatiquement sauvegardées
- **↩️ Rollback en 1 clic** - Restaurez n'importe quelle version précédente
- **👁️ Mode Prévisualisation** - Testez les changements avant de les publier
- **📥 Import/Export** - Transférez les configurations entre environnements
- **🏷️ Tags Intelligents** - Organisation automatique par type d'opération
- **👤 Attribution Utilisateur** - Traçabilité complète (qui, quand, quoi)
- **🛡️ Double Backup** - Protection automatique avant rollback/import

---

## 🔄 Version Control System

### Accès
```
/admin/config-versions
```

### 📊 Dashboard de Statistics

Le dashboard affiche 4 métriques clés :

| Métrique | Description | Icône |
|----------|-------------|-------|
| **Total Versions** | Nombre total de versions enregistrées | 🌿 Emerald |
| **Auto Saves** | Sauvegardes automatiques | 🔵 Blue |
| **Rollbacks** | Restaurations effectuées | 🟠 Orange |
| **Imports** | Configurations importées | 🟣 Purple |

### 📜 Timeline des Versions

Chaque version affiche :

- **Numéro de version** : v1, v2, v3...
- **Tags colorés** : Type d'opération
- **Description** : Contexte du changement
- **Utilisateur** : Qui a fait le changement
- **Date** : Quand le changement a été fait
- **Nombre de changements** : Combien de champs modifiés

### 🏷️ Système de Tags

| Tag | Couleur | Description | Icône |
|-----|---------|-------------|-------|
| `auto-save` | 🔵 Bleu | Sauvegarde automatique avant modification | 💾 |
| `manual` | 🟢 Vert | Sauvegarde manuelle par l'utilisateur | ✏️ |
| `rollback` | 🟠 Orange | Configuration restaurée | ↩️ |
| `import` | 🟣 Violet | Configuration importée | 📥 |
| `pre-rollback` | 🟡 Jaune | Backup avant restauration | 🛡️ |
| `pre-import` | 🩷 Rose | Backup avant import | 🛡️ |

### 🔍 Visualisation des Changements

Cliquez sur l'icône **👁️ View Details** pour voir :

```diff
Field: header.logo.sizes.mobile
- Old: w-10 h-10
+ New: w-11 h-11

Field: header.primaryText.content
- Old: AGRI POINT
+ New: AGRI POINT SERVICE
```

### ↩️ Rollback (Restauration)

#### Processus de Rollback Sécurisé

1. **Utilisateur** clique sur le bouton **↻ Restore** pour la version v10
2. **Confirmation** : Dialogue demandant confirmation
3. **Pre-Rollback Snapshot** : Sauvegarde actuelle (v15 → v16 avec tag `pre-rollback`)
4. **Restoration** : Application de la version v10
5. **Audit Entry** : Création de v17 avec tag `rollback` et `restoredFrom: v10`
6. **Success Toast** : "Version 10 restaurée avec succès!"
7. **Auto-Reload** : Rechargement après 1.5s pour appliquer

#### Sécurité

- ✅ **Double backup** : Votre config actuelle est sauvegardée AVANT la restauration
- ✅ **Undo possible** : Vous pouvez rollback le rollback
- ✅ **Admin only** : Seuls les administrateurs peuvent restaurer
- ✅ **Traçabilité** : L'historique indique quelle version a été restaurée

### 🗑️ Suppression de Version

- **Admin only** : Nécessite rôle administrateur
- **Confirmation** : Demande de confirmation avant suppression
- **Permanent** : La suppression est définitive
- **Non-destructif** : Ne supprime PAS la config active

### 🔄 Auto-Cleanup

Le système garde automatiquement **uniquement les 50 versions les plus récentes** :

- Déclencheur : Après chaque création de version
- Méthode : Suppression des versions au-delà de la 50ème
- Tri : Par numéro de version décroissant
- Transparent : Aucune action utilisateur requise

---

## 👁️ Mode Prévisualisation

### Concept

Le **Preview Mode** permet de tester les modifications visuellement **avant de les sauvegarder** dans la base de données.

### Workflow Complet

#### 1. Configuration dans l'Admin

```
/admin/site-config
```

1. Modifiez les paramètres (logo, textes, couleurs...)
2. Cliquez sur le bouton **👁️ Prévisualiser** (violet)
3. Une nouvelle fenêtre s'ouvre avec le site

#### 2. Visualisation en Direct

Un **banner violet** apparaît en haut du site :

```
┌─────────────────────────────────────────────────────────┐
│ 👁️ Mode Prévisualisation Actif                          │
│ Les modifications ne sont pas encore sauvegardées       │
│ [❌ Annuler] [💾 Enregistrer les Modifications]         │
└─────────────────────────────────────────────────────────┘
```

#### 3. Décision

Deux options :

| Action | Bouton | Effet |
|--------|--------|-------|
| **Enregistrer** | 💾 Blanc | Sauvegarde dans la DB + Recharge |
| **Annuler** | ❌ Transparent | Abandonne les changements + Recharge |

### 🎯 Avantages

- ✅ **Zéro risque** : Aucun changement en DB jusqu'à validation
- ✅ **Vue réelle** : Voir exactement comment le site apparaîtra
- ✅ **Test A/B** : Comparer plusieurs variations visuellement
- ✅ **Client demos** : Montrer au client sans affecter le site live

### 🏗️ Architecture Preview

```typescript
// Context Provider
PreviewModeContext {
  isPreviewMode: boolean,           // Mode actif?
  previewConfig: object | null,     // Config temporaire
  enablePreview(config),            // Activer avec config
  disablePreview(),                 // Désactiver
  updatePreviewConfig(updates),     // Mise à jour partielle
  savePreview()                     // Sauvegarder + désactiver
}

// Composants affectés
- DynamicHeaderBranding           // Utilise previewConfig si actif
- Tous les composants CMS         // (à étendre)

// Banner
- PreviewModeBanner               // Affiché si isPreviewMode = true
```

---

## 📥📤 Import/Export de Configurations

### Export

#### Depuis le Dashboard de Versions

```
/admin/config-versions
```

Deux options d'export :

| Bouton | Contenu Exporté | Fichier |
|--------|-----------------|---------|
| **Exporter Config** | Configuration actuelle uniquement | `agri-point-config-{timestamp}.json` |
| **Exporter + Versions** | Config + 10 dernières versions | `agri-point-config-{timestamp}.json` |

#### Structure du Fichier Exporté

```json
{
  "version": "1.0.0",
  "exportedAt": "2025-06-15T14:30:00.000Z",
  "exportedBy": {
    "userId": "abc123",
    "userName": "Admin User",
    "userEmail": "admin@agri-ps.com"
  },
  "config": {
    "branding": { ... },
    "header": { ... },
    "colors": { ... },
    "modules": { ... }
  },
  "versions": [
    // 10 dernières versions (si option sélectionnée)
  ]
}
```

### Import

#### Interface d'Import

1. Cliquez sur **📥 Import** (bouton violet)
2. Modal s'ouvre avec textarea
3. Collez le JSON exporté
4. **Validez** d'abord (bouton bleu)
5. Choisissez le mode d'import

#### Modes d'Import

| Mode | Description | Effet | Danger |
|------|-------------|-------|--------|
| **Merge** | Fusion avec config actuelle | Ajoute/écrase seulement les champs fournis | 🟢 Sûr |
| **Overwrite** | Remplacement complet | Efface tout et remplace | 🔴 Attention |

#### Validation Pré-Import

Le système vérifie automatiquement :

```typescript
✅ JSON valide (syntaxe correcte)
✅ branding.siteName présent
✅ colors.primary présent
❌ Structure incorrecte → Erreurs affichées
```

#### Processus de Sécurité

```
1. User colle JSON
2. Click "Valider" (dry run)
   → API valide sans appliquer
   → Retourne: { valid: true/false, errors: [] }
3. Si valide: Click "Import Merge" ou "Import Overwrite"
   → Pre-import snapshot créé (v15 avec tag 'pre-import')
   → Import appliqué
   → Import version entry créée (v16 avec tag 'import')
   → Success + Reload
```

### 🌐 Use Case Multi-Environnements

#### Workflow Dev → Staging → Production

```bash
# Développement Local
1. Configurer dans /admin/site-config
2. Tester en preview
3. Sauvegarder
4. Exporter: "agri-point-dev-2025-06-15.json"

# Staging
5. Import: Coller le JSON
6. Mode: Merge (sûr)
7. Tester application staging
8. Valider fonctionnement

# Production
9. Re-importer le même JSON
10. Mode: Merge (sûr)
11. Application live mise à jour
```

#### Avantages

- ✅ **Cohérence** : Même config partout
- ✅ **Traçabilité** : Fichier JSON versionné avec Git
- ✅ **Rollback facile** : Garder les JSON pour restauration rapide
- ✅ **CI/CD compatible** : Automatisation possible

---

## 📘 Guide d'Utilisation

### Scénario 1 : Modifier le Header

#### Étapes

1. **Admin Panel** : `/admin/site-config`
2. Onglet **Branding** ou **Header**
3. Modifier logo, textes, tailles
4. **Prévisualiser** : Voir le résultat en direct
5. Si satisfait : **Enregistrer**
6. **Auto-versioning** : v15 créée automatiquement (tag `auto-save`)

#### Result

- ✅ Changement appliqué sur le site
- ✅ Version sauvegardée dans l'historique
- ✅ Possibilité de rollback si problème

### Scénario 2 : Erreur après Modification

#### Problème

Vous avez sauvegardé une config qui casse le header.

#### Solution : Rollback

1. `/admin/config-versions`
2. Trouver la version précédente (v14)
3. Cliquer **↻ Restore** sur v14
4. Confirmer
5. **Automatic** :
   - Pre-rollback snapshot (v16)
   - Restauration de v14
   - Rollback entry (v17)
   - Site restauré

#### Temps d'exécution

⚡ **< 5 secondes** pour restaurer complètement

### Scénario 3 : Migration Dev → Prod

#### Contexte

Configuration perfectionnée en développement, besoin de la déployer en production.

#### Étapes

##### Dev

1. `/admin/site-config` - Configurer
2. **Exporter** : `config-dev.json`
3. Commit dans Git : `git add config-dev.json`

##### Production

4. Récupérer `config-dev.json`
5. `/admin/config-versions`
6. Cliquer **📥 Import**
7. Coller JSON
8. **Valider** (vérification)
9. Si OK : **Import Merge**
10. ✅ Production mise à jour

#### Sécurité

- Pre-import snapshot créé automatiquement
- Rollback possible instantanément si problème

### Scénario 4 : Tests A/B de Design

#### Contexte

Tester 3 variations de header pour choisir la meilleure.

#### Workflow

##### Variation A (Actuelle)

1. Exporter config actuelle
2. Sauvegarder : `variant-a.json`

##### Variation B

3. Modifier header (logo plus grand)
4. **Prévisualiser**
5. Screenshot + notes
6. **Annuler** (ne pas sauvegarder)

##### Variation C

7. Modifier header (couleurs différentes)
8. **Prévisualiser**
9. Screenshot + notes
10. **Annuler**

##### Décision

11. Choisir la meilleure variation
12. Re-appliquer les changements
13. **Enregistrer** la version choisie

#### Avantages

- Aucune modification DB pendant les tests
- Comparaison visuelle facile
- Décision éclairée avant commit

---

## 🏗️ Architecture Technique

### Schéma de Base de Données

#### Collection: `configversions`

```typescript
{
  _id: ObjectId,
  version: Number,                    // Auto-increment
  config: Object,                     // Full snapshot
  changedBy: {
    userId: String,
    userName: String,
    userEmail: String
  },
  changes: [
    {
      field: String,                  // "header.logo.url"
      oldValue: Any,
      newValue: Any
    }
  ],
  description: String,                // "Sauvegarde automatique..."
  tags: [String],                     // ["auto-save", "manual", ...]
  restoredFrom: String,               // Version d'origine si rollback
  createdAt: Date
}
```

#### Indexes

```javascript
// Compound indexes pour performance
db.configversions.createIndex({ version: -1, createdAt: -1 })
db.configversions.createIndex({ "changedBy.userId": 1, createdAt: -1 })
```

### API Routes

#### `/api/admin/config-versions`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **GET** | `?limit=20&skip=0&userId=xxx` | Fetch version history | Access Token |
| **POST** | Body: `{ config, changes, description, tags }` | Create version + auto-cleanup | Access Token |
| **PUT** | Body: `{ versionId }` | Rollback (double backup) | Admin Only |
| **DELETE** | `?versionId=xxx` | Remove version | Admin Only |

#### `/api/admin/config-import-export`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **GET** | `?format=json&includeVersions=true` | Export config as JSON download | Access Token |
| **POST** | Body: `{ config, overwrite, validateOnly }` | Import config with validation | Admin Only |

#### `/api/admin/site-config`

**Modification** : Auto-versioning sur PATCH

```typescript
// AVANT modification
const oldConfig = await SiteConfig.findOne({ isActive: true });

// Calculer changements
const changes = calculateChanges(oldConfig, newConfig);

// Créer snapshot AUTOMATIQUEMENT
await ConfigVersion.create({
  version: lastVersion + 1,
  config: oldConfig,
  changedBy: extractFromToken(request),
  changes: changes,
  tags: ['auto-save']
});

// PUIS appliquer modification
await SiteConfig.update(newConfig);
```

### Context Providers

#### SiteConfigContext

```typescript
{
  config: SiteConfig | null,         // Config active de la DB
  loading: boolean,
  updateConfig(updates): Promise<void>,
  refreshConfig(): Promise<void>
}
```

#### PreviewModeContext

```typescript
{
  isPreviewMode: boolean,
  previewConfig: any | null,          // Config temporaire (pas en DB)
  enablePreview(config): void,        // Active avec config
  disablePreview(): void,             // Désactive
  updatePreviewConfig(updates): void, // Mise à jour partielle
  savePreview(): Promise<void>        // Sauvegarde en DB + désactive
}
```

### Composants Clés

#### PreviewModeBanner

**Localisation** : `components/admin/PreviewModeBanner.tsx`

**Fonctionnement** :
```tsx
if (!isPreviewMode) return null;

return (
  <motion.div className="fixed top-0 left-0 right-0 z-[9999]">
    <div className="bg-gradient-to-r from-purple-500 to-rose-500">
      <div className="flex justify-between">
        <div>👁️ Mode Prévisualisation Actif</div>
        <div>
          <button onClick={handleDiscard}>❌ Annuler</button>
          <button onClick={handleSave}>💾 Enregistrer</button>
        </div>
      </div>
    </div>
  </motion.div>
);
```

#### DynamicHeaderBranding

**Modification** :

```typescript
// AVANT
const headerConfig = config?.header || defaultConfig;

// APRÈS
const { isPreviewMode, previewConfig } = usePreviewMode();
const activeConfig = isPreviewMode && previewConfig 
  ? previewConfig 
  : config;
const headerConfig = activeConfig?.header || defaultConfig;
```

**Effet** : Header affiche la config preview si mode actif

#### ConfigVersionsPage

**Localisation** : `app/admin/config-versions/page.tsx`

**Structure** : 670 lignes, 4 sections principales

```tsx
1. Stats Dashboard (4 gradient cards)
   - Total Versions
   - Auto Saves
   - Rollbacks
   - Imports

2. Version Timeline
   - Liste avec animations Framer Motion
   - Expand/collapse pour voir détails
   - Actions: View, Restore, Delete

3. Import Modal (AnimatePresence)
   - Textarea pour JSON
   - Validate → Import Merge/Overwrite
   - Validation errors display

4. Export Buttons
   - Config seule
   - Config + Versions
```

### Animations

**Library** : Framer Motion

```typescript
// Staggered list
{versions.map((v, i) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.03 }}
  >
    {/* Version item */}
  </motion.div>
))}

// Modal
<AnimatePresence>
  {showModal && (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
    >
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## 🚀 Prochaines Améliorations

### Features en Développement

| Feature | Priorité | ETA | Description |
|---------|----------|-----|-------------|
| **Audit Logs** | P1 | 45 min | Track toutes les actions admin (connexion, modification, suppression) |
| **CMS Analytics Dashboard** | P2 | 60 min | Métriques d'utilisation, graphiques d'activité |
| **Intelligent Validation** | P2 | 30 min | Validation avancée (URLs, couleurs hex, fonts) |
| **Search & Filter Versions** | P3 | 20 min | Recherche par description, utilisateur, dates |
| **Side-by-Side Comparison** | P3 | 40 min | Comparer 2 versions visuellement |
| **Scheduled Auto-Snapshots** | P3 | 30 min | Cron job quotidien pour backups auto |
| **Email Notifications** | P4 | 30 min | Alertes email sur rollback critique |
| **Multi-Environment Sync** | P4 | 90 min | Synchronisation automatique dev/staging/prod |

### Limitations Connues

- ❌ **Pas de recherche** sur les versions (texte, dates)
- ❌ **Pagination UI** manquante (API prête, interface non)
- ❌ **Pas de comparaison** côte-à-côte de versions
- ❌ **Un seul preview à la fois** (pas de preview multiples)
- ❌ **Preview limité au header** (étendre aux autres modules)

---

## 📞 Support

### Documentation Complète

- **Configuration CMS** : `GUIDE-CMS-AVANCE.md`
- **Déploiement** : `GUIDE-DEPLOIEMENT-HOSTINGER.md`
- **API Reference** : Documentation inline dans le code

### Contact

- **Email** : support@agri-ps.com
- **Admin Panel** : https://agri-ps.com/admin

---

## 🎉 Changelog

### Version 1.0.0 (Juin 2025)

#### ✨ New Features
- ✅ Version Control System complet
- ✅ Rollback en 1 clic avec double backup
- ✅ Mode Preview pour tester avant sauvegarde
- ✅ Import/Export de configurations JSON
- ✅ Auto-versioning sur toutes les modifications
- ✅ Dashboard de statistiques
- ✅ Timeline visuelle avec tags colorés
- ✅ Visualisation des diffs field-by-field
- ✅ Attribution utilisateur complète
- ✅ Auto-cleanup (garde 50 versions)

#### 🔧 Technical
- MongoDB model: `ConfigVersion`
- API routes: `/api/admin/config-versions`, `/api/admin/config-import-export`
- Context: `PreviewModeContext`
- Composants: `PreviewModeBanner`, `ConfigVersionsPage`
- Animations: Framer Motion
- Total: 1,143 lignes de code

#### 🎨 UI/UX
- Gradient cards pour statistics
- Tag system avec color coding
- Modal import/export responsive
- Dark mode support complet
- Animations fluides (stagger, fade, scale)

---

**Développé avec ❤️ pour AGRI POINT SERVICE**

🌿 *Produire plus, Gagner plus, Mieux vivre*
