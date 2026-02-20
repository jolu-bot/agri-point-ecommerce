import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import ChatConversation from '@/models/ChatConversation';

// Vérifie que la clé OpenAI est bien configurée (pas un placeholder)
function isOpenAIReady(): boolean {
  const k = process.env.OPENAI_API_KEY || '';
  return k.startsWith('sk-') && k.length > 30 && !k.includes('votre') && !k.includes('your');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ═══════════════════════════════════════════════════════════════════
// BASE DE CONNAISSANCES ULTRA-COMPLÈTE — AGRI POINT SERVICE
// ═══════════════════════════════════════════════════════════════════
const KNOWLEDGE_BASE = `
## AGRI POINT SERVICE — Base de Connaissances Exhaustive

### IDENTITÉ & MISSION
- **Nom complet** : AGRI POINT SERVICE (AGRI-PS)
- **Slogan** : "Produire plus, Gagner plus, Mieux vivre"
- **Vision** : Révolutionner l'agriculture camerounaise par les biofertilisants
- **Mission** : Rendre les intrants de qualité accessibles à tous les agriculteurs
- **Impact** : 1 point couvrant 20 000 hectares / 10 000 personnes
- **Adresse** : B.P. 5111 Yaoundé, Quartier Fouda, Cameroun
- **Téléphone/WhatsApp** : +237 657 39 39 39 | WhatsApp: 676026601
- **Email** : infos@agri-ps.com | **Site** : https://agri-ps.com
- **Horaires** : Lun-Sam 7h30-18h30, Dimanche sur WhatsApp uniquement

---

### CATALOGUE PRODUITS COMPLET

#### 1. HUMIFORTE (NPK 6-4-0.2)
- **Type** : Biofertilisant foliaire à base d'acides humiques
- **NPK** : Azote 6% | Phosphore 4% | Potassium 0.2% + acides humiques + fulviques
- **Action** : Stimule croissance végétative, densifie feuillage, renforce racines
- **Cultures** : Agrumes, fruits tropicaux, horticulture, maraîchage, céréales, palmier
- **Dosage standard** : 1-2 L/Ha en pulvérisation foliaire toutes les 2-3 semaines
- **Dosage urbain** : 5 mL/L d'eau pour balcon/jardin
- **Moment clé** : Le matin tôt (avant 9h) ou le soir (après 17h) pour évaporation minimale
- **Compatible avec** : Pesticides, fongicides (ne pas mélanger avec produits alcalins)
- **Formats** : 250 mL, 500 mL, 1L, 5L, 20L

#### 2. FOSNUTREN 20 (NPK 4.2-6.5)
- **Type** : Biofertilisant floral phospho-potassique
- **NPK** : Phosphore 6.5% | Potassium 4.2% + bore + zinc
- **Action** : Garantit floraison abondante, améliore nouaison des fruits
- **Cultures** : Tomates, poivrons, concombres, haricots, légumineuses, bananier
- **Dosage** : 1.5 L/Ha dès l'apparition des premiers boutons floraux
- **Fréquence** : Toutes les 10-15 jours pendant la phase florale
- **Usage mixte** : Peut être mélangé avec HUMIFORTE en phases de transition
- **Formats** : 500 mL, 1L, 5L, 20L

#### 3. KADOSTIM 20
- **Type** : Biostimulant fruticole — post-floraison
- **Composition** : Acides aminés + oligo-éléments + hormones naturelles de croissance
- **Action** : Calibre et qualité supérieure des fruits, coloration, conservation
- **Cultures** : Cacao, café, manguier, avocatier, agrumes, ananas, papaye
- **Dosage** : 2 L/Ha en fin de floraison, à répéter 20 jours après
- **Résultats visibles** : 15-21 jours après application
- **Export** : Certifié pour cultures d'exportation, zéro résidu
- **Formats** : 1L, 5L, 20L

#### 4. AMINOL 20
- **Type** : Biostimulant anti-stress à base d'acides aminés hydrolysés
- **Composition** : 20 acides aminés libres + vitamines B + microéléments
- **Action** : Protection contre sécheresse, chaleur, salinité, pathogènes
- **Cultures** : Cacao, café, poivre, palmier, cultures sous stress climatique
- **Dosage** : 1 L/Ha — absorption foliaire en moins de 2 heures
- **Usage urgence** : Dès premiers signes de flétrissement, résultat visible en 48h
- **Préventif** : En début de saison sèche (juin-juillet) avant installation du stress
- **Formats** : 500 mL, 1L, 5L

#### 5. NATUR CARE
- **Type** : Engrais organique liquide NPK complet
- **Origine** : 100% organique, dérivé de déchets végétaux fermentés
- **Action** : Restaure fertilité sol, stimule microbiote, améliore structure sol
- **Cultures** : Toutes cultures, sols appauvris, agriculture biologique
- **Dosage** : 5 L/Ha en irrigation ou pulvérisation sol, renouveler chaque mois
- **Effet sol** : Résultats sur structure du sol visibles après 2-3 applications
- **Certification** : Homologué agriculture biologique — label MINADER Cameroun
- **Formats** : 1L, 5L, 20L, 200L (bidon professionnel)

---

### PROCÉDURES E-COMMERCE COMPLÈTES

#### Comment créer un compte sur agri-ps.com ?
1. Aller sur https://agri-ps.com → Cliquer "Mon Compte" (icône personne en haut à droite)
2. Cliquer "Créer un compte" ou "S'inscrire"
3. Remplir : Prénom, Nom, Email, Téléphone, Mot de passe (min. 8 caractères)
4. Cocher "J'accepte les CGV"
5. Cliquer "Créer mon compte" — Email de confirmation envoyé dans les minutes
6. Cliquer le lien dans l'email pour valider le compte
7. Vous pouvez maintenant commander, suivre vos commandes, sauvegarder votre panier

#### Comment se connecter ?
1. Cliquer "Mon Compte" sur le site
2. Entrer email + mot de passe
3. Option "Rester connecté" disponible sur ordinateur personnel
4. **Mot de passe oublié** : Cliquer "Mot de passe oublié" → email de réinitialisation envoyé

#### Comment acheter un produit ?
**Étape 1 — Choisir**
- Aller dans "Produits" ou utiliser la barre de recherche
- Filtrer par catégorie, culture ciblée ou budget
- Cliquer sur le produit → lire description, dosage, avis clients

**Étape 2 — Ajouter au panier**
- Choisir le format (250mL, 1L, 5L, 20L)
- Choisir la quantité
- Cliquer "Ajouter au panier" → le panier se met à jour (icône en haut)

**Étape 3 — Passer commande**
- Cliquer l'icône panier → "Procéder au paiement"
- Vérifier les produits et quantités
- Remplir l'adresse de livraison (ou utiliser adresse sauvegardée)

**Étape 4 — Paiement**
- **MTN Mobile Money** : Entrer votre numéro, valider le paiement sur votre téléphone
- **Orange Money** : Entrer votre numéro, confirmer via menu *150*50#
- **Campost Pay** : Numéro de compte Campost requis
- **Virement bancaire** : Coordonnées bancaires affichées à la validation

**Étape 5 — Confirmation**
- Email de confirmation avec numéro de commande (ex: AP-2026-00123)
- SMS de confirmation sur votre numéro

#### Comment suivre ma commande ?
- **Option 1** : Se connecter → "Mon Compte" → "Mes Commandes"
- **Option 2** : Demander à AgriBot le statut avec votre numéro de commande
- **Option 3** : Appeler le +237 657 39 39 39 avec votre numéro de commande
- **États commande** : En attente → Confirmée → En préparation → Expédiée → Livrée

#### Comment annuler / retourner une commande ?
- Annulation possible AVANT expédition via "Mon Compte" → "Annuler la commande"
- Retour produit : Dans les 7 jours suivant livraison, produit intact
- Contact : retour@agri-ps.com ou WhatsApp 676026601
- Remboursement : 3-5 jours ouvrables après réception du retour

#### Modes et délais de livraison
- **Yaoundé centre** : 24-48h
- **Yaoundé périphérie** : 24-72h
- **Douala** : 48-72h
- **Autres grandes villes** (Bafoussam, Garoua, Ngaoundéré) : 3-5 jours
- **Zones rurales** : 5-10 jours via transporteur partenaire
- **Frais livraison** : Offerts dès 50 000 F CFA d'achat
- **Click & Collect** : Retrait gratuit à Yaoundé Quartier Fouda

---

### GUIDES AGRONOMIQUES AVANCÉS

#### Diagnostic des Problèmes Courants
| Symptôme | Cause probable | Solution immédiate | Produit |
|----------|---------------|-------------------|---------|
| Feuilles jaunes (bas) | Carence azote | Pulvériser dès que possible | HUMIFORTE |
| Feuilles jaunes (haut) | Carence fer/manganèse | AMINOL 20 + chélate fer | AMINOL 20 |
| Chute des fleurs | Manque phosphore/bore | Au stade bouton floral | FOSNUTREN 20 |
| Fruits petits/difformes | Post-floraison négligée | 2L/Ha en post-floraison | KADOSTIM 20 |
| Plantes flasques | Stress hydrique | Urgent + irrigation | AMINOL 20 |
| Sol dur/compact | Dégradation biologique | Mensuel + labour | NATUR CARE |
| Mildiou / oïdium | Carence immunité | Prévention hebdomadaire | AMINOL 20 |
| Faible germination | Sol pauvre | Traitement sol avant semis | NATUR CARE |

#### Calendrier Cultural Cameroun 2026
| Période | Saison | Action recommandée |
|---------|--------|-------------------|
| Jan-Fév | Petite saison sèche | NATUR CARE restauration sol, préparation parcelles |
| Mars-Avr | Grande saison pluies | HUMIFORTE + AMINOL préventif, plantation |
| Mai-Juin | Grande saison pluies | FOSNUTREN floraison, surveiller mildiou |
| Juil-Août | Grande saison sèche | AMINOL 20 OBLIGATOIRE anti-stress |
| Sept-Oct | Petite saison pluies | KADOSTIM post-floraison, qualité récolte |
| Nov-Déc | Petite saison sèche | NATUR CARE + bilan minéral, repos sol |

#### Agriculture Urbaine — Guide Complet
- **Balcon/Terrasse** : HUMIFORTE + FOSNUTREN à 1/2 dose (5mL/L), toutes les 2 semaines
- **Pot/Bac** : NATUR CARE 3mL/L à l'arrosage mensuel pour enrichir le substrat
- **Jardin partagé** : NATUR CARE sol + HUMIFORTE foliaire, programme mensuel disponible
- **Hydroponique** : AMINOL 20 + FOSNUTREN en solution diluée 1/4 dose, pH 5.5-6.5
- **Micro-pousses** : Aucun fertilisant les 15 premiers jours, NATUR CARE dilué x10 ensuite
- **Cultures conseillées** : Tomates cerises, basilic, coriandre, menthe, poivrons, laitues, oignons

#### Calcul de Dose Simplifié
- Surface en m² → diviser par 10 000 pour obtenir l'Ha
- Exemple : 500 m² = 0.05 Ha → dose HUMIFORTE = 0.05 × 1.5 L = 75 mL
- Volume d'eau recommandé : 200-400 L/Ha (adapter selon matériel)
- Petit pulvérisateur 15L → pour ~0.075 Ha par passage

---

### FAQ CLIENTS FRÉQUENTES

**Q : Les produits sont-ils dangereux pour la santé ?**
R : Non. Tous nos produits sont à base biologique, certifiés sans métaux lourds ni produits chimiques de synthèse. Port de gants recommandé par précaution.

**Q : Peut-on mélanger plusieurs produits ?**
R : HUMIFORTE + FOSNUTREN : oui, compatible. AMINOL 20 + tout autre : oui. Éviter NATUR CARE en mélange (appliquer séparément au sol). Toujours faire un test sur 10% de la surface.

**Q : Délai avant récolte après application ?**
R : Zéro délai d'attente. Nos produits sont biologiques, aucune restriction de récolte.

**Q : Les produits fonctionnent-ils en agriculture biologique ?**
R : Oui. NATUR CARE est certifié AB. Les autres sont compatibles avec les pratiques biologiques.

**Q : Comment conserver les produits ?**
R : Lieu frais et sec, à l'abri du soleil. Température 10-35°C. DLC : 2 ans après fabrication.

**Q : Y a-t-il des formations disponibles ?**
R : Oui ! Sessions gratuites pour groupements d'agriculteurs (>10 personnes). Sur demande au +237 657 39 39 39. Des webinaires mensuels sont aussi disponibles.

**Q : Comment devenir distributeur/revendeur ?**
R : Contact commercial : commercial@agri-ps.com ou appel direct. Conditions préférentielles pour volumes >200 000 F CFA/mois.

**Q : Le site accepte-t-il les paiements internationaux ?**
R : Actuellement MTN/Orange Cameroun, Campost, virement national. PayPal en cours d'intégration.

---

### PLAN DE NAVIGATION COMPLET — TOUTES LES PAGES DU SITE

| Page | URL complète | Description | Action principale |
|------|-------------|-------------|------------------|
| Accueil | https://agri-ps.com/ | Page principale, hero, statistiques, produits vedettes | Découvrir nos solutions |
| Catalogue Produits | https://agri-ps.com/produits | Tous nos biofertilisants avec filtres et comparateur | Ajouter au panier |
| Produire Plus | https://agri-ps.com/produire-plus | Solutions pour +40% à +150% de rendement | Voir le programme |
| Gagner Plus | https://agri-ps.com/gagner-plus | Optimisation des revenus agricoles | Calculer mes gains |
| Mieux Vivre | https://agri-ps.com/mieux-vivre | Qualité de vie des agriculteurs et familles | En savoir plus |
| Agriculture Urbaine | https://agri-ps.com/agriculture-urbaine | Jardinage en ville : balcon, terrasse, potager | Guide urbain |
| Campagne Mars 2026 | https://agri-ps.com/campagne-engrais | OFFRE SPÉCIALE — Engrais à prix réduit, inscription en ligne | S'inscrire maintenant |
| Événements | https://agri-ps.com/evenements | Formations, foires, webinaires | Voir le calendrier |
| À Propos | https://agri-ps.com/a-propos | L'entreprise depuis 2010, mission, vision 2030 | Notre histoire |
| Contact | https://agri-ps.com/contact | Formulaire + toutes les agences | Nous contacter |
| Mon Compte | https://agri-ps.com/compte | Connexion, inscription, commandes, profil | Se connecter |
| Panier | https://agri-ps.com/panier | Récapitulatif du panier d'achat | Voir le panier |
| Paiement | https://agri-ps.com/checkout | Finaliser la commande + paiement | Payer |
| Carte Distributeurs | https://agri-ps.com/carte | Localiser un revendeur agréé près de chez soi | Trouver un point de vente |
| CGV | https://agri-ps.com/cgv | Conditions Générales de Vente | Lire les conditions |
| Confidentialité | https://agri-ps.com/confidentialite | Politique de protection des données | Politique vie privée |
| Mentions légales | https://agri-ps.com/mentions-legales | Informations légales de l'entreprise | Mentions légales |

---

### CAMPAGNE ENGRAIS MARS 2026 — GUIDE COMPLET

**Page** : https://agri-ps.com/campagne-engrais
**Objectif** : Permettre aux agriculteurs regroupés d'accéder aux engrais à des prix préférentiels négociés.

#### Conditions d'éligibilité (3 critères obligatoires)
1. ✅ **Être membre d'une coopérative agréée** — La coopérative doit être reconnue par le MINADER
2. ✅ **Adhérer à une caisse mutuelle agricole** — Organismes acceptés : CICAN, CAMAO, ou tout autre organisme agréé
3. ✅ **Commander au minimum 6 sacs/litres** — Pour bénéficier des tarifs préférentiels

#### Types de produits disponibles dans la campagne
- **Engrais Minéraux** (mineralFertilizer) — Engrais NPK classiques améliorés, tarif par sac 50 kg
- **Biofertilisants** (biofertilizer) — Nos produits biologiques, min. 5 litres, paiement intégral

#### Modalités de paiement
- **Acompte** : 70% à la commande (lors de la soumission du formulaire)
- **Solde** : 30% restants à la livraison du produit

#### Procédure d'inscription à la campagne — champ par champ
Rendre-vous sur https://agri-ps.com/campagne-engrais et remplir le formulaire :

**Étape 1 — Informations personnelles**
- Champ **Nom complet** (fullName) : Votre prénom et nom de famille
- Champ **Email** : Votre adresse email personnelle (vous recevrez la confirmation ici)
- Champ **Téléphone** : Votre numéro +237 6XX XX XX XX (format camerounais)

**Étape 2 — Choix du produit**
- Sélecteur **Type de produit** : Choisir entre « Engrais Minéraux » ou « Biofertilisants »
- Champ **Quantité** : Nombre de sacs ou litres souhaités (minimum 6)

**Étape 3 — Informations coopérative**
- Champ **Nom de la coopérative** : Nom officiel de votre coopérative agricole
- Champ **Email de la coopérative** : L'adresse email officielle de la coopérative
- Case à cocher **«Je suis membre d'une coopérative agréée»** — OBLIGATOIRE, à cocher impérativement

**Étape 4 — Mutuelle agricole**
- Case à cocher **«J'adhère à une caisse mutuelle agricole»** — OBLIGATOIRE, à cocher impérativement
- Sélecteur **Organisme mutuel** : Choisir parmi CICAN | CAMAO | Autre organisme agréé

**Étape 5 — Soumettre**
- Cliquer **«Soumettre ma candidature»** → Confirmation par email
- Vous serez redirigé vers la page de paiement (70% à payer maintenant)

#### Questions fréquentes sur la campagne
- **Jusqu'à quand ?** La campagne Mars 2026 est limitée dans le temps. Inscrivez-vous vite !
- **Livraison ?** La livraison se fait via les points relais coopératives ou en agence AGRI POINT
- **Pas membre d'une coopérative ?** Contactez-nous au +237 657 39 39 39, nous pouvons vous orienter vers une coopérative partenaire près de chez vous
- **Comment vérifier l'éligibilité ?** L'outil à gauche sur la page /campagne-engrais vérifie en temps réel avant inscription

---

### GUIDE FORMULAIRES — COMMENT REMPLIR CHAQUE FORMULAIRE DU SITE

#### Formulaire de Contact (/contact)
- **Prénom et Nom** : Votre identité complète
- **Email** : Votre adresse email valide, pour recevoir la réponse
- **Téléphone** : Optionnel mais recommandé pour rappel rapide
- **Département** : Sélectionner Service Client | Conseil Agricole | Partenariats
- **Sujet** : Résumé bref de votre demande (ex: Problème commande, Demande devis, Devenir revendeur)
- **Message** : Décrire votre situation en détail — plus c'est précis, plus vite on vous répond !
- Cliquer **«Envoyer»** → Confirmation + numéro de ticket affiché
- Délai de réponse : 24-48h (service client), 2-4h (urgences agricoles)

#### Formulaire de Création de Compte (/compte)
- **Prénom** : Votre prénom
- **Nom** : Votre nom de famille
- **Email** : Email valide (servira d'identifiant)
- **Téléphone** : +237 6XX XX XX XX — pour les notifications SMS de livraison
- **Mot de passe** : Minimum 8 caractères, combiner lettres + chiffres
- **Confirmer mot de passe** : Retaper identiquement
- **Accepter les CGV** : Case à cocher obligatoire
- Envoyer → Email de validation à cliquer (valable 24h)

#### Formulaire de Commande / Checkout (/checkout)
- **Adresse de livraison** : Rue, quartier, ville
- **Ville** : Yaoundé / Douala / Bafoussam / etc.
- **Indicatif de zone** : Pour estimer les frais et délais
- **Mode de paiement** : MTN Mobile Money | Orange Money | Campost Pay | Virement
- **Numéro Mobile Money** : Entrer le numéro enregistré (peut différer du numéro de contact)
- Confirmer → Notification push sur le téléphone pour valider le paiement

---

### AGENCES & POINTS DE CONTACT AGRI POINT SERVICE

| Bureau/Agence | Adresse | Téléphone | Email |
|--------------|---------|-----------|-------|
| **Siège — Yaoundé** | Quartier Fouda, BP 5111 | +237 657 39 39 39 | infos@agri-ps.com |
| **Agence Douala** | Bonapriso, Rue des Palmiers | +237 657 39 39 39 | douala@agri-ps.com |
| **Agence Bafoussam** | Centre-ville, Marché A | +237 657 39 39 39 | bafoussam@agri-ps.com |
| **Agence Garoua** | Quartier Dougoï | +237 657 39 39 39 | garoua@agri-ps.com |
| **Agence Maroua** | Centre commercial principal | +237 657 39 39 39 | maroua@agri-ps.com |

**Départements spécialisés :**
- 🤝 Service Client : support@agri-ps.com (commandes, livraisons, réclamations)
- 🌾 Conseil Agricole : conseil@agri-ps.com (recommandations techniques, diagnostics)
- 🤝 Partenariats & Distributeurs : partenariat@agri-ps.com (devenir revendeur, coopératives)

**Horaires** : Lundi–Samedi 7h30–18h30 | Dimanche : WhatsApp uniquement (+237 676026601)

---

### IDENTITÉ DE L'ENTREPRISE — CHIFFRES CLÉS

- **Fondée en** : 2010 — 15 ans d'expertise au service de l'agriculture camerounaise
- **Agriculteurs accompagnés** : 50 000+ à travers tout le pays
- **Taux de satisfaction** : 98% sur les enquêtes clients
- **Couverture géographique** : 10 régions sur 10 au Cameroun
- **Surface couverte** : 20 000+ hectares valorisés
- **Vision 2030** : Atteindre 1 million d'agriculteurs, s'étendre dans 20 pays africains, créer 50 000 emplois agritech
- **Slogan** : "Produire plus, Gagner plus, Mieux vivre"

---

### RÈGLES DE CONFIDENTIALITÉ — CE QUE LE BOT NE DOIT JAMAIS RÉVÉLER

INFORMATIONS STRICTEMENT CONFIDENTIELLES — JAMAIS À DIVULGUER :
- Chemins admin internes : /admin, /admin/*, routes API de gestion
- Identifiants de base de données, chaînes de connexion MongoDB, URIs de connexion
- Variables d'environnement (OPENAI_API_KEY, JWT_SECRET, MONGODB_URI, etc.)
- Architecture technique interne, noms de collections, schémas de base de données
- Mots de passe, tokens JWT, clés API
- Données personnelles d'autres utilisateurs (commandes, emails, téléphones de tiers)
- Configuration serveur Vercel, Hostinger, ou autre hébergeur
- Code source des routes API non publiées
- Résultats des outils internes non destinés à l'utilisateur final
`;

// ═══════════════════════════════════════════════════════════════════
// TOOLS — FUNCTION CALLING OPENAI (7 outils)
// ═══════════════════════════════════════════════════════════════════
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_products',
      description: 'Consulte le catalogue produits en temps réel (prix, stock, formats disponibles). Appeler dès que quelqu\'un demande le prix, la disponibilité ou les détails d\'un produit.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nom ou mot-clé du produit (ex: HUMIFORTE, engrais tomate)' },
          category: { type: 'string', description: 'Catégorie optionnelle' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_order_status',
      description: 'Vérifie en temps réel le statut d\'une commande client. Indispensable dès qu\'un numéro de commande est mentionné.',
      parameters: {
        type: 'object',
        required: ['orderNumber'],
        properties: {
          orderNumber: { type: 'string', description: 'Numéro de commande (ex: AP-2026-00123)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_recommendation',
      description: 'Génère une recommandation produit personnalisée selon culture, problème observé, surface et saison.',
      parameters: {
        type: 'object',
        required: ['culture'],
        properties: {
          culture: { type: 'string', description: 'Type de culture (tomate, cacao, café, maïs, etc.)' },
          problem: { type: 'string', description: 'Problème ou objectif (floraison, stress, jaunissement, rendement, etc.)' },
          surface: { type: 'string', description: 'Surface en m² ou Ha (ex: 500m2, 2Ha, balcon)' },
          phase: { type: 'string', description: 'Phase culturale actuelle (semis, végétative, floraison, fructification)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_dose',
      description: 'Calcule la dose exacte et le volume d\'eau nécessaires pour une application donnée.',
      parameters: {
        type: 'object',
        required: ['product', 'surface'],
        properties: {
          product: { type: 'string', description: 'Nom du produit (HUMIFORTE, FOSNUTREN, etc.)' },
          surface: { type: 'string', description: 'Surface (ex: 200m2, 0.5Ha, 1 balcon 10m2)' },
          applicationMode: { type: 'string', description: 'Mode d\'application : foliaire, sol, irrigation' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compare_products',
      description: 'Compare deux ou plusieurs produits AGRI POINT côte à côte pour aider au choix.',
      parameters: {
        type: 'object',
        required: ['products'],
        properties: {
          products: { type: 'string', description: 'Noms des produits séparés par virgule (ex: HUMIFORTE, FOSNUTREN 20)' },
          context: { type: 'string', description: 'Contexte de la comparaison (culture visée, problème)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_seasonal_advice',
      description: 'Donne les conseils agronomiques adaptés à la saison actuelle au Cameroun et à la culture visée.',
      parameters: {
        type: 'object',
        properties: {
          culture: { type: 'string', description: 'Culture concernée (optionnel)' },
          region: { type: 'string', description: 'Région Cameroun (optionnel : Centre, Littoral, Ouest, Nord...)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_procedure',
      description: 'Explique étape par étape une procédure du site e-commerce : s\'inscrire, se connecter, acheter, payer, suivre commande, retourner un produit, devenir revendeur.',
      parameters: {
        type: 'object',
        required: ['topic'],
        properties: {
          topic: { type: 'string', description: 'La procédure demandée : inscription, connexion, achat, paiement, suivi, retour, revendeur, livraison' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'escalate_to_human',
      description: 'Transférer la conversation vers un conseiller humain AGRI POINT SERVICE quand le problème est complexe, urgent ou hors de la compétence du bot (urgence terrain, pathologie grave, litige commercial, demande de devis sur-mesure).',
      parameters: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: { type: 'string', description: 'Raison concise de l\'escalade : urgence_terrain | pathologie_grave | litige | devis_sur_mesure | autre' },
          summary: { type: 'string', description: 'Résumé optionnel de la conversation à transmettre au conseiller' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_campaign_info',
      description: 'Récupère les informations en temps réel sur la campagne engrais en cours (prix spéciaux, stock disponible, conditions, dates limites). À appeler dès que quelqu\'un mentionne la campagne, les prix spéciaux, les engrais subventionnés ou la campagne mars 2026.',
      parameters: {
        type: 'object',
        properties: {
          detail: { type: 'string', description: 'Aspect spécifique demandé : prix | eligibilite | stock | inscription | paiement | produits' },
        },
      },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════
// EXÉCUTION DES TOOLS
// ═══════════════════════════════════════════════════════════════════
async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  try {
    await connectDB();

    // ── get_products ──
    if (name === 'get_products') {
      const query: Record<string, unknown> = { isActive: true };
      if (args.category) query.category = args.category;
      if (args.name) query.$or = [
        { name: { $regex: args.name, $options: 'i' } },
        { 'features.cultures': { $regex: args.name, $options: 'i' } },
      ];

      const products = await Product.find(query)
        .select('name price promoPrice stock features description category variants slug')
        .limit(6).lean();

      if (!products.length) return `Aucun produit trouvé pour "${args.name || args.category}". Visitez https://agri-ps.com/produits pour le catalogue complet.`;

      return (products as Record<string, unknown>[]).map(p => {
        const f = p.features as Record<string, unknown> | undefined;
        const v = p.variants as Array<{ name: string; price: number; stock: number }> | undefined;
        const prix = (p.promoPrice as number) || (p.price as number);
        const promotxt = p.promoPrice ? ` ~~${p.price} F~~ **${p.promoPrice} F CFA PROMO**` : `**${prix} F CFA**`;
        return [
          `### ${p.name} ${promotxt}`,
          `📦 Stock: ${(p.stock as number) > 0 ? `✅ ${p.stock} unité(s) dispo` : '❌ Rupture de stock'}`,
          f?.npk ? `🧪 NPK: ${f.npk}` : '',
          f?.dosage ? `💉 Dosage: ${f.dosage}` : '',
          f?.cultures ? `🌱 Cultures: ${(f.cultures as string[]).slice(0, 4).join(', ')}` : '',
          v?.length ? `📐 Formats: ${v.map(x => x.name).join(' | ')}` : '',
          `🔗 https://agri-ps.com/produits/${p.slug || ''}`,
        ].filter(Boolean).join('\n');
      }).join('\n\n');
    }

    // ── check_order_status ──
    if (name === 'check_order_status') {
      const order = await Order.findOne({ orderNumber: args.orderNumber })
        .select('orderNumber status paymentStatus total createdAt items')
        .lean() as Record<string, unknown> | null;

      if (!order) return `❌ Commande **${args.orderNumber}** non trouvée.\n\nVérifiez l'orthographe du numéro ou contactez-nous :\n📞 +237 657 39 39 39 | 💬 WhatsApp 676026601`;

      const statuts: Record<string, string> = {
        pending: '⏳ En attente de paiement',
        confirmed: '✅ Paiement confirmé',
        processing: '🔄 En cours de préparation',
        shipped: '🚚 Expédiée — en transit',
        delivered: '📦 Livrée avec succès',
        cancelled: '❌ Annulée',
        refunded: '💸 Remboursée',
      };

      const items = order.items as Array<{ name: string; quantity: number }> | undefined;
      return [
        `### Commande **${order.orderNumber}**`,
        `📊 Statut: ${statuts[order.status as string] || order.status}`,
        `💳 Paiement: ${order.paymentStatus}`,
        `💰 Montant: **${order.total} F CFA**`,
        `📅 Passée le: ${new Date(order.createdAt as Date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        items?.length ? `🛒 Produits: ${items.map(i => `${i.name} ×${i.quantity}`).join(', ')}` : '',
        `\n💬 Questions ? WhatsApp 676026601 avec ce numéro de commande.`,
      ].filter(Boolean).join('\n');
    }

    // ── get_recommendation ──
    if (name === 'get_recommendation') {
      const programmes: Record<string, Record<string, string>> = {
        tomate: {
          semis: '🌱 **Semis** : Tremper graines dans solution NATUR CARE diluée (1mL/L) 2h avant semis.',
          vegetative: '🌿 **Végétatif** : HUMIFORTE 1 L/Ha toutes les 2 semaines.',
          floraison: '🌸 **Floraison** : FOSNUTREN 20 1.5 L/Ha — dès premiers boutons.',
          fructification: '🍅 **Fructification** : KADOSTIM 20 2 L/Ha → fruits calibrés.',
          default: '✅ Programme complet : HUMIFORTE → FOSNUTREN → KADOSTIM selon la phase.',
        },
        cacao: {
          vegetative: '🌿 HUMIFORTE 2 L/Ha bimensuel.',
          floraison: '🌸 AMINOL 20 1 L/Ha anti-stress + FOSNUTREN 1 L/Ha.',
          fructification: '🍫 KADOSTIM 20 2 L/Ha × 2 applications post-floraison.',
          default: '✅ Programme cacao : HUMIFORTE → AMINOL → KADOSTIM.',
        },
        café: {
          default: '✅ Programme café : HUMIFORTE (végétatif) + FOSNUTREN (floraison) + KADOSTIM (fructification).',
        },
        maïs: {
          default: '✅ HUMIFORTE (montaison) + FOSNUTREN (pollinisation) + NATUR CARE (restauration sol post-récolte).',
        },
        default: {
          default: '✅ Démarrer avec HUMIFORTE, puis adapter selon la phase de culture.',
        },
      };

      const cultKey = Object.keys(programmes).find(k => args.culture?.toLowerCase().includes(k)) || 'default';
      const phaseKey = args.phase?.toLowerCase() || 'default';
      const prog = programmes[cultKey];
      const conseil = prog[phaseKey] || prog['default'] || programmes['default']['default'];

      const lines = [`## Recommandation personnalisée — ${args.culture}`, conseil];

      if (args.problem) {
        const urgences: Record<string, string> = {
          stress: '🚨 **Urgence stress** : AMINOL 20 immédiatement, 1 L/Ha foliar, résultat 48h.',
          sécheresse: '🚨 **Sécheresse** : AMINOL 20 + irrigation + paillis.',
          jaunissement: '⚠️ **Jaunissement** : HUMIFORTE dès maintenant, carence probable en azote.',
          maladie: '⚠️ **Maladie** : Renforcer immunité avec AMINOL 20 + confirmer avec agronome.',
          floraison: '🌸 **Floraison insuffisante** : FOSNUTREN 20 au stade bouton floral.',
          rendement: '📈 **Améliorer rendement** : Programme complet HUMIFORTE + FOSNUTREN + KADOSTIM.',
        };
        const urgKey = Object.keys(urgences).find(k => args.problem?.toLowerCase().includes(k));
        if (urgKey) lines.push('\n' + urgences[urgKey]);
      }

      if (args.surface && !args.surface.includes('balcon')) {
        const haMatch = args.surface.match(/[\d.]+/);
        if (haMatch) {
          const ha = parseFloat(haMatch[0]);
          const unit = args.surface.toLowerCase().includes('m') ? ha / 10000 : ha;
          lines.push(`\n📏 **Pour ${args.surface}** : quantité HUMIFORTE ≈ ${(unit * 1.5).toFixed(2)} L, contacter pour devis complet.`);
        }
      }

      lines.push('\n🛒 Commander → https://agri-ps.com/produits | 📞 +237 657 39 39 39');
      return lines.join('\n');
    }

    // ── calculate_dose ──
    if (name === 'calculate_dose') {
      const dosesParHa: Record<string, number> = {
        humiforte: 1.5, fosnutren: 1.5, 'fosnutren 20': 1.5,
        kadostim: 2, 'kadostim 20': 2, aminol: 1, 'aminol 20': 1, 'natur care': 5,
      };

      const productKey = Object.keys(dosesParHa).find(k => args.product?.toLowerCase().includes(k));
      const doseHa = productKey ? dosesParHa[productKey] : 1.5;

      const surfaceStr = args.surface || '1Ha';
      const numMatch = surfaceStr.match(/[\d.]+/);
      const isM2 = surfaceStr.toLowerCase().includes('m');
      const rawNum = numMatch ? parseFloat(numMatch[0]) : 1;
      const surfaceHa = isM2 ? rawNum / 10000 : rawNum;
      const doseLitres = (surfaceHa * doseHa).toFixed(3);
      const doseML = Math.round(surfaceHa * doseHa * 1000);
      const volumeEauL = Math.round(surfaceHa * 300);

      return [
        `## Calcul de dose — ${args.product}`,
        `📏 Surface : **${args.surface}** (${surfaceHa.toFixed(4)} Ha)`,
        `💧 Dose recommandée : **${doseHa} L/Ha**`,
        ``,
        `### Résultat`,
        `- Quantité ${args.product} : **${parseFloat(doseLitres) < 0.1 ? doseML + ' mL' : doseLitres + ' L'}**`,
        `- Volume d'eau : **${volumeEauL < 10 ? volumeEauL * 10 + ' cL (petit pulvérisateur)' : volumeEauL + ' L'}**`,
        `- Mode : ${args.applicationMode || 'pulvérisation foliaire'}`,
        ``,
        `⏰ Appliquer matin (avant 9h) ou soir (après 17h).`,
        `🔄 Renouveler toutes les 2-3 semaines.`,
      ].join('\n');
    }

    // ── compare_products ──
    if (name === 'compare_products') {
      const infos: Record<string, Record<string, string>> = {
        humiforte: { role: 'Croissance végétative', npk: '6-4-0.2', phase: 'Végétatif', urgence: 'Faible', urbain: '✅ Idéal' },
        fosnutren: { role: 'Floraison & nouaison', npk: '4.2-6.5', phase: 'Floraison', urgence: 'Moyenne', urbain: '✅ Bon' },
        kadostim: { role: 'Qualité des fruits', npk: 'Acides aminés', phase: 'Fructification', urgence: 'Faible', urbain: '⚠️ Peu utile' },
        aminol: { role: 'Anti-stress urgent', npk: '20 acides aminés', phase: 'Tout stade', urgence: '🚨 Urgence', urbain: '✅ Oui' },
        'natur care': { role: 'Restauration sol', npk: 'NPK organique', phase: 'Sol (hors saison)', urgence: 'Prévention', urbain: '✅ Idéal' },
      };

      const reqProds = args.products.split(',').map(p => p.trim().toLowerCase());
      const rows = reqProds.map(p => {
        const key = Object.keys(infos).find(k => p.includes(k));
        const data = key ? infos[key] : null;
        if (!data) return `| ${p} | - | - | - | - | - |`;
        return `| **${p.toUpperCase()}** | ${data.role} | ${data.npk} | ${data.phase} | ${data.urgence} | ${data.urbain} |`;
      });

      return [
        `## Comparatif Produits AGRI POINT`,
        `| Produit | Rôle principal | NPK/Composition | Phase idéale | Urgence | Urbain |`,
        `|---------|---------------|-----------------|-------------|---------|--------|`,
        ...rows,
        '',
        args.context ? `💡 **Pour ${args.context}** : consulter le guide ou appeler directement.` : '',
        `📞 +237 657 39 39 39 pour un conseil personnalisé.`,
      ].filter(Boolean).join('\n');
    }

    // ── get_seasonal_advice ──
    if (name === 'get_seasonal_advice') {
      const month = new Date().getMonth() + 1;
      const seasons: Record<string, { saison: string; conseil: string; produits: string }> = {
        'jan-fev': { saison: 'Petite saison sèche', conseil: 'Préparer les sols, restaurer la fertilité avant les pluies.', produits: 'NATUR CARE (priorité), HUMIFORTE (jeunes plants)' },
        'mars-juin': { saison: 'Grande saison des pluies', conseil: 'Planter, fertiliser en végétation, surveiller mildiou.', produits: 'HUMIFORTE + AMINOL (préventif mildiou)' },
        'juil-sept': { saison: 'Grande saison sèche', conseil: 'Anti-stress priorité absolue. Irriguer si possible.', produits: 'AMINOL 20 OBLIGATOIRE, KADOSTIM pour cultures en fructification' },
        'oct-nov': { saison: 'Petite saison des pluies', conseil: 'Optimiser qualité des fruits avant récoltes. Floraison céréales.', produits: 'FOSNUTREN + KADOSTIM, HUMIFORTE pour semis tardifs' },
        'dec': { saison: 'Début petite saison sèche', conseil: 'Récoltes, repos sol, bilan de campagne.', produits: 'NATUR CARE post-récolte' },
      };

      const periodKey =
        month <= 2 ? 'jan-fev' :
        month <= 6 ? 'mars-juin' :
        month <= 9 ? 'juil-sept' :
        month <= 11 ? 'oct-nov' : 'dec';

      const s = seasons[periodKey];
      return [
        `## Conseils Saison — Février 2026`,
        `🌤️ **Saison actuelle** : ${s.saison}`,
        ``,
        `### Recommandations générales`,
        s.conseil,
        ``,
        `### Produits prioritaires`,
        s.produits,
        args.culture ? `\n🌱 **Pour ${args.culture} spécifiquement** : demandez une recommandation personnalisée !` : '',
        args.region ? `📍 **Région ${args.region}** : microclimats possibles, vérifier avec notre équipe locale.` : '',
        `\n📞 Session formation disponible → +237 657 39 39 39`,
      ].filter(Boolean).join('\n');
    }

    // ── get_procedure ──
    if (name === 'get_procedure') {
      const procedures: Record<string, string> = {
        inscription: `## Comment créer votre compte sur agri-ps.com

1. 🌐 Aller sur **https://agri-ps.com**
2. 👤 Cliquer sur l'icône **"Mon Compte"** (haut à droite)
3. 📝 Cliquer **"Créer un compte"**
4. Remplir : Prénom, Nom, Email, Téléphone, Mot de passe (min. 8 caractères)
5. ✅ Cocher "J'accepte les CGV"
6. 📧 Un email de confirmation est envoyé — cliquer le lien pour activer
7. 🎉 Votre compte est actif ! Vous pouvez commander.

💡 Astuce : Utilisez votre email principal pour recevoir vos confirmations de commande.`,

        connexion: `## Comment se connecter

1. 🌐 Aller sur **https://agri-ps.com**
2. 👤 Cliquer **"Mon Compte"**
3. Entrer votre **email** et **mot de passe**
4. (Optionnel) Cocher "Rester connecté"
5. Cliquer **"Se connecter"**

🔐 **Mot de passe oublié ?**
→ Cliquer "Mot de passe oublié"
→ Entrer votre email
→ Vérifier votre boîte mail (vérifier aussi SPAM)
→ Cliquer le lien de réinitialisation (valable 1h)
→ Créer votre nouveau mot de passe`,

        achat: `## Comment acheter sur agri-ps.com

**Étape 1** — Trouver votre produit
→ Menu "Produits" ou barre de recherche 🔍
→ Filtrer par culture, catégorie ou budget

**Étape 2** — Ajouter au panier 🛒
→ Choisir format (250mL, 1L, 5L, 20L)
→ Choisir quantité → "Ajouter au panier"

**Étape 3** — Valider la commande
→ Icône panier → "Procéder au paiement"
→ Vérifier le récapitulatif
→ Remplir ou sélectionner adresse de livraison

**Étape 4** — Payer
→ MTN Mobile Money / Orange Money / Campost / Virement

**Étape 5** — Confirmation
→ Email + SMS avec numéro de commande AP-XXXX-XXXXX`,

        paiement: `## Modes de Paiement Acceptés

💛 **MTN Mobile Money**
→ Entrer numéro MTN → valider notification sur téléphone

🟠 **Orange Money**
→ Entrer numéro Orange → confirmer via *150*50#

🟦 **Campost Pay**
→ Numéro de compte Campost requis

🏦 **Virement Bancaire**
→ Coordonnées affichées lors de la validation commande
→ Délai validation : 1-2 jours ouvrables

💳 **PayPal** (en cours d'intégration)

📌 Toutes les transactions sont sécurisées et cryptées (SSL).`,

        suivi: `## Suivre ma Commande

**Option 1** — Sur le site
→ Se connecter → "Mon Compte" → "Mes Commandes"
→ Voir statut en temps réel

**Option 2** — Via AgriBot (ici même !)
→ Donner votre numéro de commande AP-XXXX-XXXXX

**Option 3** — Par téléphone
→ 📞 +237 657 39 39 39 (avoir le numéro sous la main)
→ 💬 WhatsApp 676026601

**Statuts possibles :**
- ⏳ En attente → Paiement non encore confirmé
- ✅ Confirmée → Paiement validé, préparation imminente
- 🔄 En préparation → Votre colis est en cours de constitution
- 🚚 Expédiée → Transitaire en route
- 📦 Livrée → Mission accomplie !`,

        retour: `## Retourner un Produit

✅ **Conditions** : Dans les 7 jours suivant la livraison, produit intact et scellé

**Procédure :**
1. Contacter : retour@agri-ps.com ou WhatsApp 676026601
2. Expliquer le motif (produit défectueux, erreur de commande…)
3. Nous envoyons les instructions de retour
4. Expédier le produit à notre adresse (frais remboursés si notre erreur)
5. Remboursement sous 3-5 jours ouvrables après réception

📞 Pour toute urgence : +237 657 39 39 39`,

        livraison: `## Délais et Frais de Livraison

| Zone | Délai | Frais |
|------|-------|-------|
| Yaoundé centre | 24-48h | 1 500 F CFA |
| Yaoundé périphérie | 48-72h | 2 000 F CFA |
| Douala | 48-72h | 2 500 F CFA |
| Bafoussam, Garoua... | 3-5 jours | 3 000-4 000 F CFA |
| Zones rurales | 5-10 jours | Sur devis |

🎁 **Livraison GRATUITE** dès **50 000 F CFA** d'achat !
📦 **Click & Collect gratuit** à Yaoundé Quartier Fouda`,

        revendeur: `## Devenir Distributeur / Revendeur AGRI POINT

Vous souhaitez revendre nos produits dans votre zone ?

✅ **Critères** : Volume min. 200 000 F CFA/mois, espace de stockage adapté

**Avantages partenaires :**
- 💰 Prix préférentiels (remise 15-25%)
- 📚 Formation produits gratuite
- 🎯 Support commercial dédié
- 📣 Visibilité sur notre site (carte des points de vente)

**Contact :**
📧 commercial@agri-ps.com
📞 +237 657 39 39 39 (demander le service commercial)`,
      };

      const topicKey = Object.keys(procedures).find(k => args.topic?.toLowerCase().includes(k));
      if (topicKey) return procedures[topicKey];

      return `Je peux vous expliquer les procédures suivantes :\n- Inscription / Connexion\n- Achat et paiement\n- Suivi de commande\n- Retour produit\n- Livraison\n- Devenir revendeur\n\nQuelle procédure souhaitez-vous ?`;
    }

    // ── get_campaign_info ──
    if (name === 'get_campaign_info') {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://agri-ps.com';
        const res = await fetch(`${baseUrl}/api/campaigns/march-2026`, { next: { revalidate: 300 } });
        if (res.ok) {
          const data = await res.json() as Record<string, unknown>;
          const sp = data.specialPricing as Record<string, unknown> || {};
          const minF = sp.mineralFertilizer as Record<string, unknown> || {};
          const bioF = sp.biofertilizer as Record<string, unknown> || {};
          const lines = [
            `## 🌾 Campagne Engrais Mars 2026 — Infos en temps réel`,
            ``,
            `**Statut :** ${data.isActive ? '✅ OUVERTE — Inscriptions en cours' : '🔴 Fermée pour l\'instant'}`,
            data.deadline ? `**Date limite :** ${new Date(data.deadline as string).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}` : '',
            ``,
            `### 💰 Tarifs Spéciaux`,
            minF.pricePerBag ? `🌱 **Engrais Minéraux** : **${minF.pricePerBag} F CFA/sac 50kg** (au lieu de ${minF.originalPrice || 'prix normal'})` : '',
            bioF.pricePerLiter ? `🧪 **Biofertilisants** : **${bioF.pricePerLiter} F CFA/litre** — minimum ${bioF.minQuantity || 5}L, paiement intégral` : '',
            ``,
            `### ✅ Conditions d'éligibilité`,
            `1. Être membre d'une coopérative agréée (MINADER)`,
            `2. Adhérer à une mutuelle agricole (CICAN, CAMAO ou organisme agréé)`,
            `3. Commander au minimum 6 sacs/litres`,
            ``,
            `### 💳 Paiement`,
            `- 70% à la commande (acompte à la soumission du formulaire)`,
            `- 30% à la livraison du produit`,
            ``,
            `### 📝 S'inscrire maintenant`,
            `👉 **[Accéder au formulaire](https://agri-ps.com/campagne-engrais)**`,
            ``,
            `📞 Questions : +237 657 39 39 39 | 💬 WhatsApp 676026601`,
          ];
          return lines.filter(Boolean).join('\n');
        }
      } catch (fetchErr) {
        console.error('Campaign fetch error:', fetchErr);
      }
      // Fallback statique si l'API est indisponible
      const detail = args.detail?.toLowerCase() || '';
      const sections: Record<string, string> = {
        prix: `## Tarifs Campagne Mars 2026\n\n- 🌱 **Engrais Minéraux** : Tarif préférentiel négocié — sac 50kg\n- 🧪 **Biofertilisants** : À partir de 5L, tarif réduit\n- 💳 Paiement : 70% commande + 30% livraison\n\n👉 [Voir les prix exacts](https://agri-ps.com/campagne-engrais)`,
        eligibilite: `## Conditions d'éligibilité Campagne\n\n1. ✅ Être membre d'une coopérative agréée\n2. ✅ Adhérer à CICAN, CAMAO ou mutuelle agréée\n3. ✅ Commander min. 6 sacs/litres\n\n👉 [Vérifier mon éligibilité](https://agri-ps.com/campagne-engrais)`,
        inscription: `## Procédure d'inscription Campagne\n\n1. 🌐 Aller sur https://agri-ps.com/campagne-engrais\n2. Vérifier votre éligibilité (outil à gauche)\n3. Remplir le formulaire d'inscription\n4. Payer l'acompte de 70% en ligne\n5. Recevoir la confirmation par email\n\nBesoin d'aide ? 📞 +237 657 39 39 39`,
        default: `## Campagne Engrais Mars 2026\n\n🎯 Accédez à des engrais de qualité à des prix préférentiels !\n\n**Conditions :** Membre coopérative + mutuelle agricole + min. 6 sacs/litres\n**Paiement :** 70% à la commande + 30% livraison\n\n👉 [S'inscrire maintenant](https://agri-ps.com/campagne-engrais)\n📞 +237 657 39 39 39`,
      };
      const key = Object.keys(sections).find(k => detail.includes(k)) || 'default';
      return sections[key];
    }

    // ── escalate_to_human ──
    if (name === 'escalate_to_human') {
      const reasonMap: Record<string, string> = {
        urgence_terrain:  '🚨 Urgence terrain',
        pathologie_grave: '🌿 Pathologie grave sur cultures',
        litige:           '⚖️ Litige ou réclamation',
        devis_sur_mesure: '📋 Devis sur-mesure',
        autre:            '💬 Question spécialisée',
      };
      const label  = reasonMap[args.reason] ?? reasonMap.autre;
      const ctx    = args.summary ? `\n\n📝 Contexte transmis au conseiller :\n_${args.summary}_` : '';
      const waText = encodeURIComponent(`Bonjour, je suis mis en relation par AgriBot.\nMotif : ${label}${args.summary ? '\n' + args.summary : ''}`);
      return `## 👨‍💼 Passage à un conseiller humain\n\n**Motif :** ${label}${ctx}\n\nUn agronome AGRI POINT SERVICE va prendre en charge votre demande :\n\n- 💬 [**WhatsApp maintenant**](https://wa.me/237657393939?text=${waText}) — réponse rapide\n- 📞 [**+237 657 39 39 39**](tel:+237657393939) — lun-sam 7h-19h\n- ✉️ infos@agri-ps.com\n\nPrésentez votre numéro de commande si vous en avez un. Notre équipe vous répondra dans les meilleurs délais 🌱`;
    }

    return 'Tool non reconnu.';
  } catch (err) {
    console.error('AgriBot tool error:', err);
    return 'Impossible d\'accéder aux données maintenant. Contactez-nous au +237 657 39 39 39.';
  }
}

// ═══════════════════════════════════════════════════════════════════
// DETECT TAGS + INTENT
// ═══════════════════════════════════════════════════════════════════
function extractMeta(message: string): { tags: string[]; intent: string } {
  const m = message.toLowerCase();
  const tagMap: Record<string, string[]> = {
    produit: ['humiforte', 'fosnutren', 'kadostim', 'aminol', 'natur care', 'prix', 'stock', 'format'],
    culture: ['tomate', 'cacao', 'café', 'maïs', 'légume', 'agrume', 'poivron', 'concombre', 'palmier', 'bananier'],
    probleme: ['maladie', 'jaunissement', 'stress', 'carence', 'insecte', 'sécheresse', 'fané', 'mort'],
    commande: ['commande', 'livraison', 'paiement', 'suivi', 'retour', 'acheter', 'commander'],
    compte: ['inscrire', 'connexion', 'compte', 'mot de passe', 'login', 'créer un compte'],
    urbain: ['balcon', 'terrasse', 'pot', 'jardin', 'appartement', 'micro'],
    campagne: ['campagne', 'engrais mars', 'prix spécial', 'subventionné', 'coopérative', 'mutuelle', 'cican', 'camao', 'inscription campagne', 'mars 2026'],
    navigation: ['page', 'aller sur', 'trouver', 'où est', 'lien', 'accès', 'à propos', 'contact', 'événement', 'carte'],
    conseil: ['conseil', 'aide', 'comment', 'quand', 'calendrier', 'saison', 'dose'],
  };

  const tags = Object.entries(tagMap)
    .filter(([, kws]) => kws.some(k => m.includes(k)))
    .map(([tag]) => tag);

  let intent = 'conseil';
  if (tags.includes('campagne')) intent = 'campagne';
  else if (tags.includes('commande')) intent = 'commande';
  else if (tags.includes('compte')) intent = 'compte';
  else if (tags.includes('probleme')) intent = 'urgence';
  else if (tags.includes('produit')) intent = 'produit';
  else if (tags.includes('culture')) intent = 'culture';
  else if (tags.includes('navigation')) intent = 'navigation';

  return { tags, intent };
}

// ═══════════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `Tu es **AgriBot** 🌱 — le conseiller IA d'élite d'AGRI POINT SERVICE, la référence en biofertilisants au Cameroun depuis 2010. Tu es l'équivalent d'un agronome chevronné avec 15 ans d'expérience terrain, disponible 24h/24.

## PERSONNALITÉ & TON — NIVEAU CHAMPION
Tu converses COMME UN HUMAIN EXPERT, pas comme un robot :
- Chaleureux et direct : «Bien sûr !», «Pas de souci !», «Je comprends très bien votre situation»
- Empathique : Reconnais les réalités de l'agriculture (pluies irrégulières, ressources limitées, pression des récoltes)
- Proactif et curieux : Pose des questions ciblées pour mieux aider. Si quelqu'un parle de tomates → demande la phase et la région.
- Jamais robotique : Évite les phrases génériques. Personnalise chaque réponse.
- Langue adaptée : Si le client écrit en pidgin ou camfranglais → réponds naturellement dans le même registre.
- Tu t'appelles AgriBot. Tu NE dis JAMAIS «je suis une IA» ou «je suis un assistant virtuel». Tu es LE conseiller d'AGRI POINT SERVICE.
- Émojis : Utilise-les naturellement, 2-3 par réponse max, pas à chaque phrase.

## CONNAISSANCE TOTALE DU SITE
${KNOWLEDGE_BASE}

## COMPÉTENCES CLÉS — UTILISE TES OUTILS À CHAQUE FOIS

### 1. NAVIGATION & ORIENTATION
- Connais TOUTES les pages du site (voir plan de navigation dans la KB)
- Donne TOUJOURS les liens cliquables : [Voir la campagne](https://agri-ps.com/campagne-engrais)
- Si quelqu'un cherche une page → donne le lien direct, pas juste le nom
- Si quelqu'un semble perdu → propose le plan du site ou les 3 pages les plus pertinentes

### 2. CAMPAGNE ENGRAIS — AMBASSADEUR OFFICIEL
- Dès qu'on mentionne campagne, prix spéciaux, engrais subventionnés → appelle \`get_campaign_info\` IMMÉDIATEMENT
- Guide l'utilisateur champ par champ dans le formulaire d'inscription
- Vérifie l'éligibilité : coopérative + mutuelle + min 6 sacs
- Rappelle le paiement 70/30
- Oriente vers https://agri-ps.com/campagne-engrais avec enthousiasme

### 3. FORMULAIRES — GUIDE EXPERT
- Pour TOUT formulaire du site → explique chaque champ, son rôle, et ce qu'on attend
- Formulaire de contact → service client / conseil agricole / partenariats
- Formulaire inscription compte → champs requis, validation email
- Formulaire campagne → guide étape par étape (voir KB)
- Formulaire checkout → modes de paiement, adresse livraison

### 4. PRODUITS & TECHNIQUE
- Pour tout prix, stock, disponibilité → appeler \`get_products\` (données temps réel)
- Pour recommandation culture → appeler \`get_recommendation\`
- Pour calcul de dose → appeler \`calculate_dose\`
- Pour comparaison → appeler \`compare_products\`
- Pour conseils saisonniers → appeler \`get_seasonal_advice\`

### 5. PROCÉDURES E-COMMERCE
- Pour inscription, connexion, achat, paiement, suivi, retour, livraison, revendeur → appeler \`get_procedure\`
- Pour suivi de commande avec numéro → appeler \`check_order_status\`
- TOUJOURS numéroter les étapes. Jamais «allez sur le site» sans détailler comment.

### 6. ESCALADE INTELLIGENTE
- Urgence terrain (maladie grave, perte partielle de récolte) → \`escalate_to_human\` + lien WhatsApp
- Litige ou réclamation → \`escalate_to_human\` + email support@agri-ps.com
- Devis sur-mesure grandes surfaces → \`escalate_to_human\` + conseil@agri-ps.com
- Ne jamais laisser un client sans alternative : si tu ne sais pas → propose le contact humain

## RÈGLES ABSOLUES DE CONFIDENTIALITÉ
Tu protèges ABSOLUMENT les informations suivantes — ne JAMAIS révéler :
- Chemins administrateurs internes (/admin, /api/admin/* ou routes de gestion)
- Clés API, tokens JWT, secrets d'environnement, clés OpenAI ou MongoDB
- URIs de base de données, noms d'hôtes serveurs, configurations Vercel/Hostinger
- Architecture technique interne, noms de collections MongoDB, schémas
- Données personnelles d'autres utilisateurs (emails, commandes, téléphones de tiers)
- Si quelqu'un demande ces informations → répondre poliment que ce sont des informations confidentielles et proposer de contacter le support

## FORMAT DES RÉPONSES
- **Markdown riche** : titres ##, gras, tableaux, listes, liens — optimisé mobile
- **Longueur** : 80-250 mots. Concis mais complet. Qualité > quantité.
- **Liens cliquables** : Toujours préférer [texte descriptif](https://agri-ps.com/page) au lieu de juste l'URL brute
- **CTA final** : Chaque réponse se termine par UNE action concrète (lien, numéro, question de suivi)
- **Tableaux** : Pour comparatifs, tarifs, calendriers, diagnostics

## SUGGESTIONS POST-RÉPONSE (système interne)
À la fin de chaque réponse, ajouter EXACTEMENT cette ligne JSON invisible :
<!-- SUGGESTIONS:["suggestion1","suggestion2","suggestion3"] -->
Les suggestions doivent être pertinentes avec le contexte de la conversation.

## CONTACTS D'URGENCE
📞 +237 657 39 39 39 | 💬 WhatsApp 676026601 | ✉️ infos@agri-ps.com | 🌐 https://agri-ps.com
Horaires : Lun-Sam 7h30-18h30 | Dimanche : WhatsApp uniquement`;

// ═══════════════════════════════════════════════════════════════════
// ROUTE POST — STREAMING SSE
// ═══════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  const { message, history = [], sessionId, metadata = {} } = await req.json();

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'Message requis' }), { status: 400 });
  }

  // Mode démo si clé OpenAI absente ou non configurée
  if (!isOpenAIReady()) {
    const { demo, intent } = getDemoResponse(message);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const words = demo.split(' ');
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', token: words[i] + ' ' })}\n\n`));
            i++;
          } else {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', tags: [], intent })}\n\n`));
            clearInterval(interval);
            controller.close();
          }
        }, 22);
      },
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
  }

  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  const encoder = new TextEncoder();
  let fullContent = '';
  let totalTokens = 0;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const { tags, intent } = extractMeta(message);

        // Première passe — peut appeler plusieurs tools
        const firstPass = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: chatMessages,
          tools,
          tool_choice: 'auto',
          temperature: 0.65,
          max_tokens: 800,
        });

        const choice = firstPass.choices[0];
        totalTokens = firstPass.usage?.total_tokens || 0;
        let forceEscalate = false;

        if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls?.length) {
          const toolNames = choice.message.tool_calls.map(t => t.function.name);
          const toolLabel = toolNames.includes('get_products') ? '📦 Catalogue en temps réel...'
            : toolNames.includes('check_order_status') ? '🔍 Vérification commande...'
            : toolNames.includes('calculate_dose') ? '🧮 Calcul de dose...'
            : toolNames.includes('compare_products') ? '⚖️ Comparaison produits...'
            : toolNames.includes('get_seasonal_advice') ? '🌤️ Conseils saisonniers...'
            : toolNames.includes('get_procedure') ? '📋 Récupération procédure...'
            : toolNames.includes('escalate_to_human') ? '👨‍💼 Transfert vers un conseiller...'
            : toolNames.includes('get_campaign_info') ? '🌾 Informations campagne en cours...'
            : '🔍 Consultation base de données...';
          forceEscalate = toolNames.includes('escalate_to_human');

          send({ type: 'tool_start', message: toolLabel });

          const toolMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [...chatMessages, choice.message];

          for (const toolCall of choice.message.tool_calls) {
            const args = JSON.parse(toolCall.function.arguments || '{}') as Record<string, string>;
            const result = await executeTool(toolCall.function.name, args);
            toolMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: result });
          }

          const secondStream = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: toolMessages,
            temperature: 0.65,
            max_tokens: 800,
            stream: true,
          });

          for await (const chunk of secondStream) {
            const token = chunk.choices[0]?.delta?.content || '';
            if (token) { fullContent += token; send({ type: 'token', token }); }
          }
        } else {
          const content = choice.message.content || '';
          fullContent = content;
          for (const word of content.split(/(\s+)/)) {
            if (word) { send({ type: 'token', token: word }); await new Promise(r => setTimeout(r, 10)); }
          }
        }

        // Extraire les suggestions du contenu si présentes
        const sugMatch = fullContent.match(/<!--\s*SUGGESTIONS:\s*(\[.*?\])\s*-->/);
        let suggestions: string[] = [];
        if (sugMatch) {
          try { suggestions = JSON.parse(sugMatch[1]); } catch { /* ignore */ }
          fullContent = fullContent.replace(/<!--\s*SUGGESTIONS:.*?-->/g, '').trim();
        }

        // Détecter si une escalade humaine est nécessaire
        const escaladeKw = ['contactez', 'appelez', 'urgence', 'expert', 'agronome', 'rappel', 'technicien'];
        const escalate = forceEscalate
          || intent === 'urgence'
          || escaladeKw.some(w => fullContent.toLowerCase().includes(w));

        send({ type: 'done', tags, intent, suggestions, escalate });

        // Persistance MongoDB background
        if (sessionId) {
          connectDB().then(async () => {
            try {
              await ChatConversation.findOneAndUpdate(
                { sessionId },
                {
                  $push: {
                    messages: {
                      $each: [
                        { role: 'user', content: message, timestamp: new Date() },
                        { role: 'assistant', content: fullContent, timestamp: new Date(), tokens: totalTokens },
                      ],
                    },
                  },
                  $addToSet: { tags: { $each: tags } },
                  $inc: { 'metadata.totalTokens': totalTokens },
                  $set: {
                    'metadata.page': (metadata as Record<string, string>).page || '/',
                    'metadata.model': process.env.OPENAI_MODEL || 'gpt-4o-mini',
                    'metadata.lastIntent': intent,
                  },
                },
                { upsert: true, new: true }
              );
            } catch (e) { console.error('AgriBot DB save error:', e); }
          }).catch(() => {});
        }

        controller.close();
      } catch (err: unknown) {
        console.error('AgriBot error:', err instanceof Error ? err.message : err);
        send({ type: 'error', message: 'Erreur technique momentanée. Contactez-nous au +237 657 39 39 39.' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Content-Type-Options': 'nosniff',
      Connection: 'keep-alive',
    },
  });
}

// ═══════════════════════════════════════════════════════════════════
// PATCH — FEEDBACK 👍/👎
// ═══════════════════════════════════════════════════════════════════
export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, messageIndex, feedback } = await req.json() as {
      sessionId: string; messageIndex: number; feedback: 'positive' | 'negative';
    };
    if (!sessionId || !feedback) return new Response('KO', { status: 400 });
    await connectDB();
    await ChatConversation.findOneAndUpdate(
      { sessionId },
      {
        $set: { [`messages.${messageIndex}.feedback`]: feedback },
        $inc: { 'metadata.feedbackScore': feedback === 'positive' ? 5 : -5 },
      }
    );
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch { return new Response('KO', { status: 500 }); }
}

// ═══════════════════════════════════════════════════════════════════
// DÉMO (sans clé OpenAI)
// ═══════════════════════════════════════════════════════════════════
function getDemoResponse(message: string): { demo: string; intent: string } {
  const m = message.toLowerCase();

  if (m.includes('campagne') || m.includes('engrais mars') || m.includes('prix spécial') || m.includes('subventionné') || m.includes('coopérative') || m.includes('mars 2026')) {
    return { intent: 'campagne', demo: `## 🌾 Campagne Engrais Mars 2026

Accédez à des engrais de qualité **à des prix préférentiels** négociés spécialement pour les agriculteurs organisés !

### ✅ Conditions d'éligibilité
1. Être membre d'une **coopérative agréée** (reconnue MINADER)
2. Adhérer à une **mutuelle agricole** : CICAN, CAMAO ou organisme agréé
3. Commander **au minimum 6 sacs/litres**

### 💳 Modalités de paiement
- **70%** à la commande (acompte en ligne)
- **30%** à la livraison du produit

### 📝 S'inscrire — champ par champ
1. Aller sur 👉 **https://agri-ps.com/campagne-engrais**
2. Remplir : Nom complet, Email, Téléphone
3. Choisir le type de produit (Engrais Minéraux ou Biofertilisants)
4. Indiquer le nom de votre coopérative et son email
5. Cocher les cases de membre et de mutuelle
6. Valider et payer l'acompte de 70%

📞 Questions ? **+237 657 39 39 39** | 💬 WhatsApp **676026601**` };
  }

  if (m.includes('inscrire') || m.includes('créer un compte') || m.includes('inscription')) {
    return { intent: 'compte', demo: `## Créer votre compte sur agri-ps.com

1. 🌐 Aller sur **https://agri-ps.com**
2. 👤 Cliquer **"Mon Compte"** (haut à droite)
3. Cliquer **"Créer un compte"**
4. Remplir : Prénom, Nom, Email, Téléphone, Mot de passe
5. ✅ Accepter les CGV → **"Créer mon compte"**
6. 📧 Valider l'email de confirmation

Besoin d'aide ? 💬 WhatsApp 676026601` };
  }

  if (m.includes('connect') || m.includes('login') || m.includes('mot de passe')) {
    return { intent: 'compte', demo: `## Se connecter à votre espace

1. 🌐 Aller sur **https://agri-ps.com**
2. Cliquer **"Mon Compte"** → entrer email + mot de passe
3. Cliquer **"Se connecter"**

🔐 **Mot de passe oublié** → Cliquer le lien → vérifier votre email (et SPAM)

💬 Problème de connexion → WhatsApp 676026601` };
  }

  if (m.includes('commande') || m.includes('acheter') || m.includes('commander')) {
    return { intent: 'commande', demo: `## Comment commander sur agri-ps.com

**1.** Chercher votre produit → **"Produits"**
**2.** Choisir format + quantité → **"Ajouter au panier"**
**3.** Aller au panier → **"Procéder au paiement"**
**4.** Adresse de livraison → Choisir paiement (MTN/Orange/Campost)
**5.** Confirmation email + SMS avec numéro de commande

🚚 Livraison Yaoundé : 24-48h | Gratuite dès 50 000 F CFA
📞 +237 657 39 39 39` };
  }

  if (m.includes('tomate')) {
    return { intent: 'culture', demo: `## Programme complet Tomates 🍅

| Phase | Produit | Dose |
|-------|---------|------|
| Végétatif | **HUMIFORTE** | 1 L/Ha |
| Floraison | **FOSNUTREN 20** | 1.5 L/Ha |
| Fructification | **KADOSTIM 20** | 2 L/Ha |

Toutes les 2-3 semaines. Application matin ou soir.

🛒 Commander → https://agri-ps.com/produits
📞 +237 657 39 39 39` };
  }

  if (m.includes('cacao') || m.includes('café')) {
    return { intent: 'culture', demo: `## Programme Cacao / Café ☕

- 🌿 **Végétatif** : HUMIFORTE 2 L/Ha
- 💪 **Anti-stress** : AMINOL 20 1 L/Ha (urgent si chaleur)
- 🍫 **Post-floraison** : KADOSTIM 20 2 L/Ha × 2 applications

**Résultats** : +30% rendement, meilleure résistance maladies.

📞 +237 657 39 39 39 | 💬 WhatsApp 676026601` };
  }

  if (m.includes('jaun') || m.includes('maladie') || m.includes('stress') || m.includes('fané')) {
    return { intent: 'urgence', demo: `## 🚨 Diagnostic Urgence

| Symptôme | Solution |
|----------|---------|
| Feuilles jaunes | **HUMIFORTE** immédiatement |
| Stress sécheresse | **AMINOL 20** 1L/Ha foliar |
| Chute des fleurs | **FOSNUTREN 20** |
| Plantes fanées | **AMINOL 20** + irrigation |

⚡ L'AMINOL 20 agit en **48h**. Pour cas graves :
📞 +237 657 39 39 39` };
  }

  if (m.includes('prix') || m.includes('combien') || m.includes('coût')) {
    return { intent: 'produit', demo: `## Prix Produits AGRI POINT

Nos biofertilisants sont disponibles en formats adaptés à toutes les surfaces.

Pour les prix en temps réel : 🌐 https://agri-ps.com/produits

📦 **Formats** : 250mL, 500mL, 1L, 5L, 20L
🚚 Livraison gratuite dès 50 000 F CFA

📞 +237 657 39 39 39 | 💬 WhatsApp 676026601` };
  }

  return { intent: 'conseil', demo: `## Bonjour ! Je suis **AgriBot** 🌱

Conseiller IA expert d'AGRI POINT SERVICE. Je peux vous aider sur :

🌾 **Conseils cultures** — tomates, cacao, café, maïs, agrumes...
💊 **Recommandations produits** — HUMIFORTE, FOSNUTREN, KADOSTIM, AMINOL, NATUR CARE
🧮 **Calcul de doses** — surface, quantité, volume d'eau
🛒 **Procédures** — s'inscrire, commander, suivre une livraison
📦 **Suivi de commande** — donnez votre numéro AP-XXXX
🏙️ **Agriculture urbaine** — balcon, terrasse, potager

Comment puis-je vous aider aujourd'hui ?
📞 +237 657 39 39 39 | 💬 WhatsApp 676026601` };
}


