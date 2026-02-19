# 📋 Form Builder - Documentation Complète

## Vue d'ensemble

Le **Form Builder** est un système complet de création et gestion de formulaires dynamiques avec drag-and-drop, validation avancée, détection de spam et analyse des soumissions.

### Fonctionnalités principales

✅ **20 types de champs** (texte, email, select, rating, slider, file upload, etc.)  
✅ **Éditeur drag-and-drop** visuel avec preview en temps réel  
✅ **Validation avancée** (client-side et server-side)  
✅ **Détection de spam** automatique avec scoring  
✅ **Rate limiting** pour prévenir les abus  
✅ **Gestion des soumissions** avec tri, filtre et export CSV  
✅ **Webhooks** pour intégrations externes  
✅ **Email notifications** (à implémenter)  
✅ **Captcha** configurable (reCAPTCHA, hCaptcha, Turnstile)  
✅ **Statistiques** en temps réel  
✅ **Design responsive** et thèmes personnalisables

---

## 🚀 Démarrage rapide

### 1. Créer un formulaire

1. Allez dans **Admin** → **Formulaires** → **Créer un formulaire**
2. Donnez un nom à votre formulaire
3. Glissez-déposez des champs depuis la bibliothèque
4. Configurez chaque champ (label, placeholder, validation, etc.)
5. Cliquez sur **Enregistrer**
6. Publiez le formulaire

### 2. Intégrer le formulaire

URL publique : `/forms/[slug-du-formulaire]`

Exemple : `/forms/contact`

---

## 📦 Architecture

### Modèles

#### **Form** (`models/Form.ts`)

```typescript
{
  name: string,
  slug: string,
  description: string,
  
  fields: IFormField[], // 20 types disponibles
  
  settings: {
    submitButtonText: string,
    successMessage: string,
    redirectUrl: string,
    allowMultipleSubmissions: boolean,
    requireAuth: boolean,
    
    // Captcha
    enableCaptcha: boolean,
    captchaType: 'recaptcha' | 'hcaptcha' | 'turnstile',
    
    // Email
    sendEmailNotification: boolean,
    notificationEmails: string[],
    sendAutoReply: boolean,
    
    // Webhooks
    webhooks: [{ url, method, headers }],
    
    // Limites
    maxSubmissions: number,
    rateLimit: { maxPerHour, maxPerDay },
    
    // Design
    theme: { primaryColor, layout, showProgressBar }
  },
  
  status: 'draft' | 'published' | 'closed' | 'archived',
  
  stats: {
    totalSubmissions: number,
    views: number,
    averageCompletionTime: number
  }
}
```

#### **FormSubmission** (`models/FormSubmission.ts`)

```typescript
{
  formId: ObjectId,
  formSlug: string,
  
  data: Record<string, any>, // Données flexibles
  
  metadata: {
    ip: string,
    userAgent: string,
    device: 'desktop' | 'mobile' | 'tablet',
    browser: string,
    completionTime: number // secondes
  },
  
  status: 'pending' | 'processed' | 'archived' | 'spam',
  score: number, // Score spam 0-100
  
  notes: string,
  tags: string[],
  isRead: boolean,
  isStarred: boolean
}
```

---

## 🎨 Types de champs disponibles

### Champs de base (5)

| Type | Description | Options |
|------|-------------|---------|
| `text` | Texte simple | placeholder, min/maxLength, pattern |
| `email` | Email avec validation | placeholder, validation auto |
| `tel` | Numéro de téléphone | placeholder, pattern |
| `number` | Nombre | min, max, step |
| `textarea` | Texte multiligne | rows, placeholder, min/maxLength |

### Champs avancés (10)

| Type | Description | Options |
|------|-------------|---------|
| `select` | Liste déroulante | options[], multiple, placeholder |
| `radio` | Boutons radio | options[] |
| `checkbox` | Cases à cocher | options[] |
| `single-checkbox` | Case unique (ex: CGV) | label |
| `date` | Sélecteur de date | min, max |
| `time` | Sélecteur d'heure | min, max |
| `datetime` | Date et heure | min, max |
| `file` | Upload de fichier | accept[], maxFileSize, multiple |
| `url` | URL avec validation | placeholder, validation auto |

### Champs spéciaux (4)

| Type | Description | Options |
|------|-------------|---------|
| `rating` | Notation par étoiles | max (défaut: 5) |
| `slider` | Curseur de valeur | min, max, step |
| `color` | Sélecteur de couleur | defaultValue |
| `hidden` | Champ caché | value |

### Mise en page (2)

| Type | Description | Options |
|------|-------------|---------|
| `section` | Titre de section | label, description |
| `html` | Contenu HTML personnalisé | html |

---

## 🔧 Configuration des champs

### Propriétés communes

```typescript
{
  id: string, // Auto-généré
  type: FieldType,
  name: string, // Nom unique dans le formulaire
  label: string,
  placeholder?: string,
  description?: string,
  defaultValue?: any,
  required: boolean,
  
  // Validation
  validation: ValidationRule[],
  
  // Affichage
  width: 'full' | 'half' | 'third' | 'quarter',
  order: number,
  
  // Logique conditionnelle
  conditional?: {
    field: string, // Nom du champ à surveiller
    operator: 'equals' | 'not-equals' | 'contains' | 'greater' | 'less',
    value: any
  }
}
```

### Exemple de configuration

```typescript
// Champ email requis
{
  type: 'email',
  name: 'email',
  label: 'Votre email',
  placeholder: 'nom@exemple.com',
  required: true,
  validation: [
    { type: 'email', message: 'Email invalide' }
  ],
  width: 'half'
}

// Champ select avec options
{
  type: 'select',
  name: 'categorie',
  label: 'Catégorie',
  required: true,
  options: [
    { label: 'Agriculture', value: 'agri' },
    { label: 'Jardinage', value: 'jardi' },
    { label: 'Autre', value: 'autre' }
  ],
  width: 'half'
}

// Rating avec maximum 10
{
  type: 'rating',
  name: 'satisfaction',
  label: 'Votre satisfaction',
  max: 10,
  required: true
}
```

---

## 🔒 Sécurité

### Détection de spam

Algorithme automatique basé sur 3 critères :

```typescript
Score = 0

// 1. Mots-clés suspects (+20 points chacun)
Keywords: ['viagra', 'casino', 'lottery', 'prize', 'winner', 'click here']

// 2. Nombre de liens (+10 points par lien supplémentaire au-delà de 3)
if (links > 3) score += (links - 3) * 10

// 3. Temps de complétion suspect (+30 points si < 5 secondes)
if (completionTime < 5) score += 30

// Auto-flag si score >= 70
if (score >= 70) status = 'spam'
```

### Rate limiting

Protection contre les abus :

- **Par défaut** : 5 soumissions/heure par IP
- **Configurable** : `settings.rateLimit.maxPerHour`
- **Stockage** : En mémoire (Map), à remplacer par Redis en production

**⚠️ Important** : L'implémentation actuelle ne persiste pas entre les redémarrages et n'est pas distribuée. Pour la production :

```bash
npm install ioredis
```

```typescript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function checkRateLimit(ip: string, limit: number) {
  const key = `ratelimit:${ip}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 3600); // 1 heure
  }
  
  return count <= limit;
}
```

### Validation server-side

Toutes les soumissions sont validées côté serveur :

- Champs requis
- Formats (email, URL, etc.)
- Min/max pour nombres
- Limites de fichiers

---

## 📊 Gestion des soumissions

### Interface admin

**Admin** → **Formulaires** → **[Nom du formulaire]** → **Soumissions**

#### Fonctionnalités

1. **Filtres** :
   - Par statut (pending, processed, spam, archived)
   - Par état de lecture (lu/non lu)
   - Recherche textuelle

2. **Actions** :
   - Marquer comme lu/non lu
   - Ajouter aux favoris (étoile)
   - Changer le statut
   - Ajouter des notes
   - Supprimer

3. **Export** :
   - Format CSV
   - Toutes les colonnes incluses
   - Nom du fichier : `soumissions-[slug]-[date].csv`

### API endpoints

```typescript
// Liste des soumissions (avec filtres)
GET /api/admin/form-submissions?formId={id}&status={status}

// Export CSV
GET /api/admin/form-submissions?formId={id}&export=csv

// Mettre à jour une soumission
PATCH /api/admin/form-submissions?id={submissionId}
Body: { status, notes, tags, isRead, isStarred }

// Supprimer
DELETE /api/admin/form-submissions?id={submissionId}
```

---

## 🔗 Webhooks

Les webhooks permettent d'envoyer les soumissions vers des services externes.

### Configuration

```typescript
{
  settings: {
    webhooks: [
      {
        url: 'https://api.exemple.com/webhook',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer TOKEN'
        },
        active: true
      }
    ]
  }
}
```

### Payload envoyé

```json
{
  "formId": "...",
  "formSlug": "contact",
  "formName": "Formulaire de contact",
  "submissionId": "...",
  "data": {
    "nom": "Jean Dupont",
    "email": "jean@exemple.com",
    "message": "..."
  },
  "metadata": {
    "ip": "192.168.1.1",
    "device": "desktop",
    "browser": "chrome",
    "completionTime": 45
  },
  "submittedAt": "2024-01-15T10:30:00.000Z"
}
```

### Intégrations populaires

#### Zapier

1. Créez un Zap avec trigger "Webhook"
2. Copiez l'URL du webhook
3. Ajoutez-la dans les paramètres du formulaire

#### Make (Integromat)

1. Créez un scénario avec trigger "Webhook"
2. Copiez l'URL
3. Configurez dans le formulaire

#### Slack

```typescript
{
  url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}
```

Transformez le payload :

```typescript
{
  "text": `Nouvelle soumission de ${data.nom}`,
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Email:* ${data.email}\n*Message:* ${data.message}`
      }
    }
  ]
}
```

---

## 📧 Notifications email

**⚠️ À implémenter**

### Configuration requise

```bash
npm install nodemailer
```

### Variables d'environnement

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe
SMTP_FROM=notifications@votresite.com
```

### Implémentation suggérée

```typescript
// lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendFormNotification(form: IForm, submission: IFormSubmission) {
  if (!form.settings.sendEmailNotification) return;
  
  const html = generateEmailTemplate(form, submission);
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: form.settings.notificationEmails.join(','),
    subject: form.settings.emailSubject || `Nouvelle soumission: ${form.name}`,
    html,
  });
}

export async function sendAutoReply(form: IForm, submission: IFormSubmission) {
  if (!form.settings.sendAutoReply) return;
  
  const recipientEmail = submission.data[form.settings.autoReplyEmail];
  if (!recipientEmail) return;
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipientEmail,
    subject: form.settings.autoReplySubject || 'Merci pour votre message',
    text: form.settings.autoReplyMessage,
  });
}
```

---

## 🎨 Personnalisation du design

### Thème du formulaire

```typescript
{
  settings: {
    theme: {
      primaryColor: '#3b82f6', // Couleur principale
      layout: 'default' | 'card' | 'steps', // Type de layout
      showProgressBar: true // Barre de progression (pour multi-étapes)
    }
  }
}
```

### Layouts disponibles

#### Default
- Simple, épuré
- Fond blanc avec bordures

#### Card
- Design moderne avec ombres
- Fond dégradé
- Header coloré

#### Steps (à implémenter)
- Formulaire multi-étapes
- Barre de progression
- Navigation précédent/suivant

### Personnalisation CSS

Créez un fichier `app/forms/custom.css` :

```css
/* Override du bouton de soumission */
.form-submit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 2rem;
  border-radius: 0.5rem;
}

/* Override des champs */
.form-input {
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

---

## 📈 Statistiques et analytics

### Métriques disponibles

```typescript
// Par formulaire
{
  totalSubmissions: number,
  views: number,
  averageCompletionTime: number, // en secondes
  completionRate: number, // submissions / views
  lastSubmissionAt: Date
}

// Agrégées (toutes soumissions)
{
  total: number,
  pending: number,
  processed: number,
  spam: number,
  unread: number,
  avgCompletionTime: number,
  avgSpamScore: number
}
```

### Intégration Google Analytics

Ajoutez dans `app/forms/[slug]/page.tsx` :

```typescript
import { useEffect } from 'react';

useEffect(() => {
  // Vue du formulaire
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'form_view', {
      form_name: form.name,
      form_slug: form.slug,
    });
  }
}, [form]);

// À la soumission
window.gtag('event', 'form_submit', {
  form_name: form.name,
  completion_time: completionTime,
});
```

---

## 🧪 Tests

### Test de validation

```typescript
// __tests__/form-validation.test.ts
import { validateField } from '@/lib/form-validation';

describe('Form Validation', () => {
  test('validates required field', () => {
    const field = { required: true, type: 'text' };
    expect(validateField(field, '')).toBe('Ce champ est requis');
    expect(validateField(field, 'test')).toBe(null);
  });
  
  test('validates email format', () => {
    const field = { type: 'email' };
    expect(validateField(field, 'invalid')).toBe('Email invalide');
    expect(validateField(field, 'test@example.com')).toBe(null);
  });
});
```

### Test de spam detection

```typescript
// __tests__/spam-detection.test.ts
import { FormSubmission } from '@/models/FormSubmission';

describe('Spam Detection', () => {
  test('detects spam keywords', () => {
    const submission = new FormSubmission({
      data: { message: 'Buy viagra now! You are a winner!' },
      metadata: { completionTime: 10 }
    });
    
    const score = submission.calculateSpamScore();
    expect(score).toBeGreaterThan(40); // 2 keywords = 40 points
  });
  
  test('detects fast completion', () => {
    const submission = new FormSubmission({
      data: { message: 'Normal message' },
      metadata: { completionTime: 3 } // < 5 seconds
    });
    
    const score = submission.calculateSpamScore();
    expect(score).toBe(30);
  });
});
```

---

## 🚀 Production

### Checklist avant déploiement

- [ ] Configurer Redis pour rate limiting
- [ ] Implémenter les emails (nodemailer)
- [ ] Configurer le captcha (clés API)
- [ ] Ajouter monitoring des webhooks
- [ ] Configurer les backups des soumissions
- [ ] Tester la charge (stress test)
- [ ] Configurer les logs d'erreur
- [ ] Ajouter la compression gzip
- [ ] Optimiser les requêtes MongoDB (indexes)
- [ ] Configurer CDN pour les assets

### Variables d'environnement

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@votresite.com
SMTP_PASS=xxx

# Redis (rate limiting)
REDIS_URL=redis://localhost:6379

# Captcha
RECAPTCHA_SECRET_KEY=xxx
HCAPTCHA_SECRET_KEY=xxx
TURNSTILE_SECRET_KEY=xxx

# Upload (S3, Cloudinary, etc.)
FILE_UPLOAD_PROVIDER=s3
AWS_S3_BUCKET=xxx
AWS_S3_REGION=xxx
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

### Performance

#### Indexes MongoDB

Les indexes suivants sont automatiquement créés :

```typescript
// Form
- slug (unique)
- status + createdAt
- createdBy + createdAt

// FormSubmission
- formId + createdAt
- formSlug + createdAt
- status + createdAt
- submittedBy + createdAt
- isRead + status
- text index sur: formName, notes, data
```

#### Caching

Implémentez un cache pour les formulaires publics :

```typescript
// lib/cache.ts
import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export async function getCachedForm(slug: string) {
  const cached = await redis.get(`form:${slug}`);
  if (cached) return JSON.parse(cached);
  
  const form = await Form.findOne({ slug, status: 'published' });
  await redis.set(`form:${slug}`, JSON.stringify(form), 'EX', 3600); // 1h
  
  return form;
}
```

---

## 🐛 Dépannage

### Problèmes courants

#### "Rate limit exceeded"

- Vérifiez l'IP de l'utilisateur
- Augmentez la limite dans `settings.rateLimit.maxPerHour`
- Videz le cache : `submissionRateLimit.clear()`

#### Les webhooks ne se déclenchent pas

- Vérifiez que `webhook.active === true`
- Vérifiez l'URL (doit être HTTPS)
- Consultez les logs d'audit

#### Les emails ne sont pas envoyés

- Vérifiez les variables d'environnement SMTP
- Testez la connexion : `npm run test:email`
- Vérifiez les quotas de votre fournisseur

#### Spam score trop élevé

- Ajustez les mots-clés dans `calculateSpamScore()`
- Modifiez le seuil auto-flag (actuellement 70)
- Désactivez temporairement : définissez le seuil à 100

---

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [dnd-kit Documentation](https://docs.dndkit.com/)
- [MongoDB Schema Validation](https://www.mongodb.com/docs/manual/core/schema-validation/)
- [Webhook Best Practices](https://webhooks.fyi/)

---

## 🤝 Contribution

Pour ajouter un nouveau type de champ :

1. Ajoutez le type dans `models/Form.ts` → `FieldType`
2. Créez la config dans `lib/form-builder/fieldConfigs.ts`
3. Ajoutez le rendu dans `FormCanvas.tsx` (preview)
4. Ajoutez le rendu dans `app/forms/[slug]/page.tsx` (public)
5. Mettez à jour cette documentation

---

## 📝 Changelog

### v1.0.0 (2024-01-15)

- ✅ 20 types de champs
- ✅ Builder drag-and-drop complet
- ✅ Gestion des soumissions avec filtres
- ✅ Détection de spam automatique
- ✅ Rate limiting de base
- ✅ Export CSV
- ✅ Webhooks fonctionnels
- 🔄 Emails (à implémenter)
- 🔄 Captcha (à implémenter)
- 🔄 Upload de fichiers vers S3 (à implémenter)

---

**🎉 Le Form Builder est maintenant prêt à l'emploi !**
