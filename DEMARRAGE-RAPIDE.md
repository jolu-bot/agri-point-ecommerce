# 🚀 Démarrage Rapide - Post Optimisation

## ⚡ Étapes à Suivre

### 1️⃣ Installation des Dépendances

Ouvrez un terminal dans le dossier du projet et exécutez:

```bash
cd C:\Users\jolub\Downloads\agri-point-ecommerce
npm install
```

**Temps estimé:** 2-3 minutes  
**Nouveaux packages:** @opentelemetry/api, @vercel/otel

---

### 2️⃣ Vérification du Build

Testez que tout compile correctement:

```bash
npm run build
```

**Temps estimé:** 1-2 minutes  
**Attendu:** Build successful, pas d'erreurs critiques

---

### 3️⃣ Démarrage du Serveur

#### Mode Développement:
```bash
npm run dev
```

#### Mode Production:
```bash
npm run build
npm run start
```

**URL:** http://localhost:3000

---

### 4️⃣ Tests des Optimisations

#### A. Vérifier le Tracing
1. Ouvrir le site
2. Naviguer sur différentes pages
3. Les traces apparaissent dans la console (dev mode)

#### B. Tester le Cache
1. Aller sur `/produits`
2. Actualiser la page → Devrait charger plus vite la 2ème fois
3. Console: `[Cache] Hit: /api/products`

#### C. Lazy Loading
1. Aller sur `/admin/analytics`
2. Observer le chargement progressif des charts
3. Network tab: Charts chargés à la demande

---

### 5️⃣ Analyse de Performance

#### Option A: Lighthouse (Chrome DevTools)
1. Ouvrir Chrome DevTools (F12)
2. Onglet "Lighthouse"
3. Sélectionner "Performance"
4. Cliquer "Analyze page load"

**Scores attendus:**
- Performance: 85-95
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

#### Option B: Script Automatique
```bash
npm run perf
```

Génère un rapport dans `performance-reports/`

---

### 6️⃣ Corrections ESLint (Si Nécessaire)

```bash
npm run lint
```

**Erreurs courantes à corriger:**
- Variables non utilisées → Supprimer
- Dépendances manquantes → Ajouter au useEffect
- Labels manquants → Ajouter aria-label

---

## 🎯 Checklist de Vérification

### Fonctionnalités
- [ ] Page d'accueil charge en < 2s
- [ ] Navigation fluide entre pages
- [ ] Recherche produits fonctionne
- [ ] Panier fonctionne
- [ ] Checkout fonctionne
- [ ] Login/Register fonctionne

### Panel Admin
- [ ] Login admin fonctionne
- [ ] Dashboard affiche statistiques
- [ ] Liste produits charge
- [ ] Liste commandes charge
- [ ] Liste utilisateurs charge
- [ ] Modification produit fonctionne
- [ ] Changement statut commande fonctionne

### Performance
- [ ] Images en WebP/AVIF
- [ ] Lazy loading actif
- [ ] Cache fonctionne (vérifier console)
- [ ] Bundle size < 300KB (First Load)
- [ ] LCP < 2.5s
- [ ] No layout shift

---

## 🐛 Dépannage

### Erreur: Module not found
```bash
npm install
npm run build
```

### Erreur: Port already in use
```bash
# Utiliser un autre port
PORT=3001 npm run dev
```

### Performance toujours lente
1. Vérifier connexion internet
2. Vider cache navigateur (Ctrl+Shift+Del)
3. Vérifier base de données MongoDB (connexion)
4. Tester en mode production (npm run build && npm start)

### Build échoue
```bash
# Nettoyer et réinstaller
npm run clean
npm install
npm run build
```

---

## 📊 Monitoring en Production

### Vercel (Recommandé)
1. Déployer sur Vercel
2. Tracing automatique activé
3. Voir "Speed Insights" dashboard

### Alternative: Custom Backend
Modifier `instrumentation.ts`:

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

export function register() {
  const sdk = new NodeSDK({
    serviceName: 'agri-point-ecommerce',
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    }),
  });
  sdk.start();
}
```

Puis définir dans `.env.local`:
```env
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-collector:4318/v1/traces
```

---

## 🎨 Utilisation des Optimisations

### Cache
```typescript
import { fetchWithCache } from '@/lib/cache';

// Fetch avec cache 5 min
const products = await fetchWithCache('/api/products', {}, 300000);
```

### Lazy Components
```typescript
import { BarChart } from '@/lib/lazy-components';

// Composant chargé à la demande
<BarChart data={chartData} />
```

### Debounce
```typescript
import { debounce } from '@/lib/performance';

const handleSearch = debounce((query) => {
  // Recherche API
}, 300);
```

### Tracing
```typescript
import { createSpan, addSpanAttributes } from '@/lib/telemetry';

await createSpan('fetch-products', async () => {
  const products = await fetchProducts();
  addSpanAttributes({
    'product.count': products.length,
  });
  return products;
});
```

---

## 📚 Documentation Disponible

1. **ACTION-PLAN.md** - Plan d'action complet
2. **TRACING-GUIDE.md** - Guide du tracing OpenTelemetry
3. **OPTIMISATIONS-APPLIQUEES.md** - Détails des optimisations
4. **Ce fichier** - Démarrage rapide

---

## ✅ Résumé

Vous avez maintenant:
- ✅ Tracing OpenTelemetry configuré
- ✅ Lazy loading des composants lourds
- ✅ Système de cache intelligent
- ✅ Utilitaires de performance (debounce, throttle, memoize)
- ✅ Configuration optimisée Next.js
- ✅ Scripts d'analyse de performance

**Prochaine étape:** Exécuter `npm install` puis tester !

---

**Questions?** Consultez les fichiers de documentation ou exécutez:
```bash
npm run optimize  # Lint + Type-check + Build
```
