# 🚀 Activer Campagne MAINTENANT

Si vous voulez que votre page campagne soit visible **dès maintenant** sur votre site (avant le 1er mars), voici comment faire en 2 minutes.

---

## Option 1: Activer via script (Recommandé)

```bash
# 1. Exécuter le script d'activation
MONGODB_URI="mongodb+srv://..." node scripts/activate-campaign-now.js

# Output attendu:
# ✅ Campaign ACTIVATED: engrais-mars-2026
# Campaign status: {"isActive": true, "name": "Campagne Engrais Mars 2026"}
```

Voilà! La campagne est maintenant **ACTIVE** dans votre base de données.

---

## Option 2: Activer via MongoDB Compass (Manuel)

1. Ouvrir MongoDB Atlas → Collections → `agri` → `campaigns`
2. Trouver le document avec `slug: "engrais-mars-2026"`
3. Éditer: changer `isActive: false` → `isActive: true`
4. Sauvegarder

---

## Option 3: Activer via Admin Panel (Si déployé)

Si votre site est déjà live:

1. Aller à: `https://votre-site.cm/admin/campaigns`
2. Chercher "Campagne Engrais Mars 2026"
3. Cliquer "Publier" ou "Activer"
4. Sauvegarder

---

## Vérifier que la page est visible

Après activation, testez:

### Test 1: Page publique (dans un navigateur)

```
https://votre-site.cm/campagne-engrais
```

Vous devriez voir:
- ✅ Hero image (1920x600, engrais)
- ✅ Titre "Campagne Engrais Mars 2026"
- ✅ Formulaire d'éligibilité
- ✅ Bouton "Vérifier l'éligibilité"

### Test 2: API (terminal)

```bash
# Tester l'API campagne
curl -s https://votre-site.cm/api/campaigns/engrais-mars-2026 | jq .

# Ou via le script
API_URL="https://votre-site.cm" node scripts/test-campaign-visibility.js
```

---

## Qu'est-ce qui devient visible?

Une fois `isActive: true`:

| Élément | Visible |
|---------|---------|
| Page `/campagne-engrais` | ✅ Publique |
| Formulaire d'éligibilité | ✅ Actif |
| API `/api/campaigns/engrais-mars-2026` | ✅ Accessible |
| Admin dashboard | ✅ Montre statistiques |
| SMS de lancement | ⏳ Attendez le 1er mars |

---

## Avertissements

⚠️ **Avant d'activer maintenant:**

1. Vérifiez que le site est en production et accessible
2. Testez la page publique + formulaire
3. Assurez-vous que les paiements Stripe/Paygate sont configurés
4. Informez les clients via email/SMS si vous lancez tôt

---

## Après activation

Les clients peuvent maintenant:

1. Voir la page `/campagne-engrais`
2. Remplir le formulaire d'éligibilité
3. Placer des commandes
4. Payer (70% maintenant, 30% après récolte)

Les commandes apparaîtront en temps réel dans `/admin/campaigns`.

---

## Besoin de désactiver?

```bash
# Désactiver si nécessaire (avant le 1er mars)
MONGODB_URI="..." node -e "
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('agri');
  await db.collection('campaigns').updateOne(
    { slug: 'engrais-mars-2026' },
    { \$set: { isActive: false } }
  );
  console.log('✅ Campaign DEACTIVATED');
  await client.close();
})();
"
```

---

## Questions?

- Page ne s'affiche pas? → Vérifiez `isActive: true` dans MongoDB
- Formulaire ne fonctionne pas? → Vérifiez `/api/campaigns/apply` endpoint
- Paiement bloqué? → Vérifiez clés API Stripe/Paygate dans `.env`

---

**Prêt à activer?** Exécutez le script et testez en 2 minutes ⏱️
