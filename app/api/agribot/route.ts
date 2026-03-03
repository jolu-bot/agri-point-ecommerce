import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import ChatConversation from '@/models/ChatConversation';

// ─── Interfaces ───────────────────────────────────────────────────
interface UserMemory {
  sessionId?: string;
  location?: string;
  region?: string;
  mainCrops?: string[];
  surface?: string;
  farmType?: string;
  keyFacts?: string[];
  conversationCount?: number;
}

// Vérifie que la clé OpenAI est bien configurée (pas un placeholder)
function isOpenAIReady(): boolean {
  const k = process.env.OPENAI_API_KEY || '';
  return k.startsWith('sk-') && k.length > 30 && !k.includes('votre') && !k.includes('your');
}

// Vérifie Anthropic
function isAnthropicReady(): boolean {
  const k = process.env.ANTHROPIC_API_KEY || '';
  return k.startsWith('sk-ant-') && k.length > 30;
}

// Vérifie Google Gemini
function isGeminiReady(): boolean {
  const k = process.env.GOOGLE_AI_API_KEY || '';
  return k.length > 20 && !k.includes('votre') && !k.includes('your');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ═══════════════════════════════════════════════════════════════════
// RATE LIMITING — 30 requêtes / heure / IP
// ═══════════════════════════════════════════════════════════════════
const _ipMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const e   = _ipMap.get(ip);
  if (!e || now > e.resetAt) { _ipMap.set(ip, { count: 1, resetAt: now + 3_600_000 }); return true; }
  if (e.count >= 30) return false;
  e.count++;
  return true;
}

// ═══════════════════════════════════════════════════════════════════
// CACHE DE RÉPONSES — 30 min TTL
// ═══════════════════════════════════════════════════════════════════
const _responseCache = new Map<string, { response: string; intent: string; ts: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCacheKey(message: string, location?: string, crops?: string[]): string {
  const norm = message.toLowerCase().trim().replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF\s]/g, '');
  return `${norm}|${location || ''}|${(crops || []).join(',')}`;
}

function getCached(key: string): { response: string; intent: string } | null {
  const e = _responseCache.get(key);
  if (!e || Date.now() - e.ts > CACHE_TTL_MS) { _responseCache.delete(key); return null; }
  return { response: e.response, intent: e.intent };
}

function setCache(key: string, response: string, intent: string) {
  _responseCache.set(key, { response, intent, ts: Date.now() });
  // Nettoyage si trop grand
  if (_responseCache.size > 500) {
    const oldest = [..._responseCache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) _responseCache.delete(oldest[0]);
  }
}

// ═══════════════════════════════════════════════════════════════════
// DONNÉES CLIMATIQUES CAMEROUN
// ═══════════════════════════════════════════════════════════════════
const CAMEROON_CLIMATE: Record<string, { pluieAnnuelle: string; saisons: string; conseils: string }> = {
  'Centre':       { pluieAnnuelle: '1600mm', saisons: '4 saisons (2 pluvieuses : mars-juin / sept-nov)', conseils: 'Idéal tomate, maïs, légumes. Plantation mars ou sept. Drainage important.' },
  'Littoral':     { pluieAnnuelle: '3800mm', saisons: '2 saisons sèches courtes (jan-fév / juil-août)', conseils: 'Très humide. Attention mildiou et pourriture. Privilégier biofertilisants + fongicides préventifs.' },
  'Ouest':        { pluieAnnuelle: '1800mm', saisons: '2 saisons nettes (sèche déc-fév / pluvieuse mars-nov)', conseils: 'Excellent pour cacao, café, maïs. Altitude fraîche favorable légumes. Bonne fertilité naturelle.' },
  'Nord-Ouest':   { pluieAnnuelle: '1700mm', saisons: 'Pluvieuse mars-oct, sèche nov-fév', conseils: 'Collines fertiles. Café Arabica, cacao, maïs. Irrigation complémentaire en saison sèche.' },
  'Sud-Ouest':    { pluieAnnuelle: '3000mm', saisons: 'Quasi permanente, courte sèche déc-fév', conseils: 'Zone volcanique très fertile (mont Cameroun). Bananier, cacao, café. Humidité forte → antifongiques.' },
  'Adamaoua':     { pluieAnnuelle: '1500mm', saisons: 'Pluvieuse avr-oct, sèche nov-mars', conseils: 'Plateau frais. Élevage + maïs + pommes de terre. Températures basses la nuit → maladies fongiques.' },
  'Nord':         { pluieAnnuelle: '900mm',  saisons: 'Pluvieuse mai-sept, longue sèche oct-avr', conseils: 'Coton, sorgho, arachide. Irrigation indispensable. Chaleur intense → stress hydrique. Arrosage matin.' },
  'Extrême-Nord': { pluieAnnuelle: '600mm',  saisons: 'Pluvieuse juin-sept (courte), très longue sèche', conseils: 'Zone aride. Sorgho, niébé, oignon. Eau précieuse. Retenue d\'eau et goutte-à-goutte recommandés.' },
  'Est':          { pluieAnnuelle: '1700mm', saisons: '2 saisons pluvieuses mars-juin / sept-nov', conseils: 'Forêt dense. Cacao, manioc, banane. Manque de routes = logistique complexe. Livraison possible.' },
  'Sud':          { pluieAnnuelle: '1800mm', saisons: '4 saisons, très humide', conseils: 'Cacao excellent, palmier à huile, manioc. Humidité permanente → maladies fongiques à surveiller.' },
};

function getClimateContext(region?: string, location?: string): string {
  const key = region || Object.keys(CAMEROON_CLIMATE).find(r =>
    location && location.toLowerCase().includes(r.toLowerCase())
  );
  if (!key || !CAMEROON_CLIMATE[key]) return '';
  const c = CAMEROON_CLIMATE[key];
  return `\n\n[CLIMAT RÉGIONAL]\nRégion : ${key} | Pluie : ${c.pluieAnnuelle} | ${c.saisons}\nConseils clés : ${c.conseils}`;
}

// ═══════════════════════════════════════════════════════════════════
// DÉTECTION DE CONTEXTE MANQUANT
// Retourne une question de clarification si contexte insuffisant
// ═══════════════════════════════════════════════════════════════════
function detectMissingContext(
  message: string,
  history: Array<{ role: string; content: string }>,
  memory: UserMemory
): string | null {
  const m = message.toLowerCase();
  const historyText = history.map(h => h.content).join(' ').toLowerCase();

  // Questions qui nécessitent la localisation
  const needsLocation = /conseil|programme|calendrier|quand planter|saison|maladie|fertilis|dose|rendement|récolte|semis|climat|pluie|irrigation/i.test(message);
  const hasLocation = memory.location
    || /yaound|douala|bafoussam|garoua|maroua|bertoua|ebolowa|bamenda|buea|kribi|centre|littoral|ouest|nord|sud|est|adamaoua/i.test(historyText)
    || /yaound|douala|bafoussam|garoua|maroua|bertoua|ebolowa|bamenda|buea|kribi|centre|littoral|ouest|nord|sud|est|adamaoua/i.test(m);

  if (needsLocation && !hasLocation) {
    return 'Pour vous donner un conseil précis adapté à votre zone climatique, **dans quelle ville ou région du Cameroun** êtes-vous ? (ex: Yaoundé, Douala, Bafoussam, Garoua…)';
  }

  // Questions qui nécessitent la culture
  const needsCrop = /programme|dose|calendrier|quand appliquer|combien|fertiliser|traiter|protéger|pulvéris/i.test(message)
    && !/campagne|commande|compte|inscription|livraison|paiement/i.test(m);
  const hasCrop = (memory.mainCrops?.length ?? 0) > 0
    || /tomate|cacao|café|maïs|mais|banane|manioc|igname|arachide|chou|carotte|laitue|gombo|piment|poivron/i.test(historyText)
    || /tomate|cacao|café|maïs|mais|banane|manioc|igname|arachide|chou|carotte|laitue|gombo|piment|poivron/i.test(m);

  if (needsCrop && !hasCrop && !hasLocation) {
    // Ne pose qu'une question à la fois — si location manque, elle est prioritaire
    // Ici location est déjà présente, on peut demander la culture
  } else if (needsCrop && !hasCrop && hasLocation) {
    return 'Pour personnaliser mes recommandations : **quelle est votre culture principale** ? (ex: tomate, cacao, café, maïs, légumes…) Et avez-vous une idée de la **surface cultivée** ?';
  }

  return null; // Contexte suffisant
}

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
- **Téléphone/WhatsApp** : +237 657 39 39 39 | WhatsApp: 657 39 39 39
- **Email** : infos@agri-ps.com | **Site** : https://agri-ps.com
- **Horaires** : Lun-Sam 7h30-18h30, Dimanche sur WhatsApp uniquement

---

### PARTENAIRES OFFICIELS
- **CAMPOST** : Réseau de paiement et logistique postale — versements en bureau de poste
- **MINADER** : Ministère de l'Agriculture et du Développement Rural — homologation produits
- **Bange Bank** : Partenaire financier — solutions de financement agricole pour les producteurs
- **EMOH** : Partenaire logistique et distribution
- **CIVIA** : Partenaire institutionnel
- **PLANOPAC** : Plateforme Nationale des Organisations Paysannes du Cameroun — réseau de coopératives agricoles (https://www.facebook.com/PLANOPAC)

---

### LES 3 PROGRAMMES PHARES AGRI POINT SERVICE

#### PRODUIRE PLUS (https://agri-ps.com/produire-plus)
- **Objectif** : Augmenter les rendements agricoles de +40% à +150%
- **Services AP Agripoint** :
  1. **Identification des filières** — Analyse des filières agricoles porteuses dans votre région
  2. **Fourniture d'intrants de qualité** — Accès aux biofertilisants et engrais certifiés à prix compétitifs
  3. **Renforcement des capacités** — Formations techniques et accompagnement terrain pour les agriculteurs
  4. **Résultats prouvés** — Plus de 50 000 agriculteurs accompagnés avec des résultats mesurables
- **Partenaire clé** : PLANOPAC (réseau national de coopératives)

#### GAGNER PLUS (https://agri-ps.com/gagner-plus)
- **Objectif** : Doublez vos bénéfices agricoles
- **Avantages** :
  - Réduction des coûts de production jusqu'à 40%
  - Accès aux marchés premium
  - Formation en gestion financière agricole
  - Plan de financement avec Bange Bank
- **Plan de paiement CMA** : 70% comptant à la commande, 30% après la récolte (réservé aux membres des Caisses Mutuelles Agricoles)
- **Partenaire financier** : Bange Bank

#### MIEUX VIVRE (https://agri-ps.com/mieux-vivre)
- **Objectif** : Améliorer la qualité de vie des agriculteurs et leurs familles
- **Opérateur** : Les Caisses Mutuelles Agricoles Africaines (CMA)
- **Services disponibles** :
  1. **Épargne agricole** — À partir de 500 000 FCFA, solutions d'épargne adaptées au cycle agricole
  2. **Logement** — Accompagnement habitat à partir de 3 000 000 FCFA
  3. **Assurances** — Protection des récoltes et couverture agricole complète
  4. **Transport** — Solutions logistiques pour l'acheminement des récoltes
- **Note** : Les services Mieux Vivre sont gérés par les CMA (Caisses Mutuelles Agricoles Africaines), partenaires d'AGRI POINT SERVICE

---

### CATALOGUE PRODUITS COMPLET

#### GRILLE TARIFAIRE OFFICIELLE (FCFA — Mise à jour 2025)

| Produit | Prix unitaire |
|---------|--------------|
| NPK 20-10-10 (SARAH) | 19 500 F CFA |
| NPK 05-05-45 | 23 000 F CFA |
| NPK 00-00-36 | 20 500 F CFA |
| NPK 06-08-28 | 22 000 F CFA |
| NPK 12-14-19 | 23 000 F CFA |
| URÉE 46% (50kg) | 22 000 F CFA |
| URÉE 46% (25kg) | 11 000 F CFA |
| SULPHATE D'AMMONIAQUE | 17 500 F CFA |
| Biofertilisants (Humiforte, Fosnutren, Kadostim, Aminolforte) | 13 500 F CFA chacun |
| NATUR CARE | 65 000 F CFA |
| Herbicide Ladaba 1L | 2 500 F CFA |
| Herbicide Ladaba 5L | 12 000 F CFA |

---

#### 1. HUMIFORTE (NPK 6-4-0.2)
- **Type** : Biofertilisant foliaire à base d'acides humiques
- **Prix** : **13 500 F CFA**
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
- **Prix** : **13 500 F CFA**
- **NPK** : Phosphore 6.5% | Potassium 4.2% + bore + zinc
- **Action** : Garantit floraison abondante, améliore nouaison des fruits
- **Cultures** : Tomates, poivrons, concombres, haricots, légumineuses, bananier
- **Dosage** : 1.5 L/Ha dès l'apparition des premiers boutons floraux
- **Fréquence** : Toutes les 10-15 jours pendant la phase florale
- **Usage mixte** : Peut être mélangé avec HUMIFORTE en phases de transition
- **Formats** : 500 mL, 1L, 5L, 20L

#### 3. KADOSTIM 20
- **Type** : Biostimulant fruticole — post-floraison
- **Prix** : **13 500 F CFA**
- **Composition** : Acides aminés + oligo-éléments + hormones naturelles de croissance
- **Action** : Calibre et qualité supérieure des fruits, coloration, conservation
- **Cultures** : Cacao, café, manguier, avocatier, agrumes, ananas, papaye
- **Dosage** : 2 L/Ha en fin de floraison, à répéter 20 jours après
- **Résultats visibles** : 15-21 jours après application
- **Export** : Certifié pour cultures d'exportation, zéro résidu
- **Formats** : 1L, 5L, 20L

#### 4. AMINOL 20
- **Type** : Biostimulant anti-stress à base d'acides aminés hydrolysés
- **Prix** : **13 500 F CFA**
- **Composition** : 20 acides aminés libres + vitamines B + microéléments
- **Action** : Protection contre sécheresse, chaleur, salinité, pathogènes
- **Cultures** : Cacao, café, poivre, palmier, cultures sous stress climatique
- **Dosage** : 1 L/Ha — absorption foliaire en moins de 2 heures
- **Usage urgence** : Dès premiers signes de flétrissement, résultat visible en 48h
- **Préventif** : En début de saison sèche (juin-juillet) avant installation du stress
- **Formats** : 500 mL, 1L, 5L

#### 5. NATUR CARE
- **Type** : Engrais organique liquide NPK complet
- **Prix** : **65 000 F CFA**
- **Origine** : 100% organique, dérivé de déchets végétaux fermentés
- **Action** : Restaure fertilité sol, stimule microbiote, améliore structure sol
- **Cultures** : Toutes cultures, sols appauvris, agriculture biologique
- **Dosage** : 5 L/Ha en irrigation ou pulvérisation sol, renouveler chaque mois
- **Effet sol** : Résultats sur structure du sol visibles après 2-3 applications
- **Certification** : Homologué agriculture biologique — label MINADER Cameroun
- **Formats** : 1L, 5L, 20L, 200L (bidon professionnel)

#### 6. SARAH NPK 20-10-10
- **Type** : Engrais minéral NPK haute qualité
- **Prix** : **19 500 F CFA** (sac 50kg)
- **NPK** : 20-10-10 — Haute concentration d'azote pour croissance rapide
- **Cultures** : Toutes cultures
- **Action** : Fertilisation de fond, apport NPK équilibré

#### 7. URÉE 46%
- **Type** : Engrais azoté haute concentration
- **Prix** : **22 000 F CFA** (sac 50kg) | **11 000 F CFA** (sac 25kg)
- **NPK** : 46-0-0
- **Cultures** : Céréales, maraîchage
- **Action** : Boost de croissance végétative

#### 8. SULPHATE D'AMMONIAQUE
- **Type** : Engrais azoté soufré
- **Prix** : **17 500 F CFA**
- **Action** : Apport azote + soufre pour cultures exigeantes

#### 9. Herbicide LADABA
- **Type** : Herbicide de pré/post-levée
- **Prix** : **2 500 F CFA** (1L) | **12 000 F CFA** (5L)
- **Action** : Désherbage efficace des parcelles

#### 10. Gamme NPK Spécialisée
- **NPK 05-05-45** : 23 000 F CFA — Riche en potassium, cultures fruitières
- **NPK 00-00-36** : 20 500 F CFA — Potassium pur, maturation fruits
- **NPK 06-08-28** : 22 000 F CFA — Équilibre P-K, tubercules et racines
- **NPK 12-14-19** : 23 000 F CFA — Formule polyvalente

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

**Étape 4 — Paiement via Campost**
- Rendez-vous au bureau Campost le plus proche de chez vous
- Demandez un versement sur le compte **AGRI POINT SERVICES SAS**
- Mentionnez votre numéro de commande comme référence
- Photographiez le reçu et envoyez-le par WhatsApp au +237 676 026 601
- Confirmation de commande sous 24h après réception du reçu
- **Paiement à la livraison (cash)** : Option disponible selon la zone

**Étape 5 — Confirmation**
- Email de confirmation avec numéro de commande (ex: AP-2026-00123)
- SMS de confirmation sur votre numéro

#### Comment suivre ma commande ?
- **Option 1** : Se connecter → "Mon Compte" → "Mes Commandes"
- **Option 2** : Demander à l'Assistant le statut avec votre numéro de commande
- **Option 3** : Appeler le +237 657 39 39 39 avec votre numéro de commande
- **États commande** : En attente → Confirmée → En préparation → Expédiée → Livrée

#### Comment annuler / retourner une commande ?
- Annulation possible AVANT expédition via "Mon Compte" → "Annuler la commande"
- Retour produit : Dans les 7 jours suivant livraison, produit intact
- Contact : retour@agri-ps.com ou WhatsApp 657 39 39 39
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
| Produire Plus | https://agri-ps.com/produire-plus | Services AP Agripoint : identification filières, intrants, renforcement capacités | Voir le programme |
| Gagner Plus | https://agri-ps.com/gagner-plus | Doublez vos bénéfices : -40% coûts, financement Bange Bank, plan CMA 70/30 | Calculer mes gains |
| Mieux Vivre | https://agri-ps.com/mieux-vivre | Services CMA : épargne, logement, assurances, transport pour agriculteurs | En savoir plus |
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
- **Mode de paiement** : Campost (versement en bureau) | Cash à la livraison
- **Référence** : Mentionner le numéro de commande lors du versement Campost
- Confirmer → Notre équipe valide sous 24h après réception du reçu

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

**Horaires** : Lundi–Samedi 7h30–18h30 | Dimanche : WhatsApp uniquement (+237 657 39 39 39)

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
- Configuration serveur Vercel ou tout autre hébergeur
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
  {
    type: 'function',
    function: {
      name: 'calculate_roi',
      description: 'Calcule le retour sur investissement (ROI) estimé en F CFA pour un agriculteur. À appeler quand quelqu\'un demande combien il peut gagner, quel est le bénéfice financier des produits AGRI POINT, ou veut estimer son gain supplémentaire.',
      parameters: {
        type: 'object',
        required: ['culture', 'surface'],
        properties: {
          culture:       { type: 'string', description: 'Type de culture (tomate, cacao, maïs, café, etc.)' },
          surface:       { type: 'string', description: 'Surface cultivée en m² ou Ha' },
          currentYield:  { type: 'string', description: 'Rendement actuel estimé (ex: 1 tonne/Ha, 500kg/saison)' },
          pricePerKg:    { type: 'string', description: 'Prix de vente local par kg en F CFA' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_page_content',
      description: 'Récupère le contenu dynamique d\'une section du site : événements à venir, formations, foires, webinaires ou carte des distributeurs. Appeler dès qu\'on mentionne des événements, formations ou la carte des revendeurs.',
      parameters: {
        type: 'object',
        required: ['page'],
        properties: {
          page: { type: 'string', description: 'Section : evenements | carte | actualites' },
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

      if (!order) return `❌ Commande **${args.orderNumber}** non trouvée.\n\nVérifiez l'orthographe du numéro ou contactez-nous :\n📞 +237 657 39 39 39 | 💬 WhatsApp 657 39 39 39`;

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
        `\n💬 Questions ? WhatsApp 657 39 39 39 avec ce numéro de commande.`,
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

**Étape 4** — Payer via Campost
→ Versement au bureau Campost le plus proche sur le compte AGRI POINT SERVICES SAS

**Étape 5** — Confirmation
→ Email + SMS avec numéro de commande AP-XXXX-XXXXX`,

        paiement: `## Modes de Paiement Acceptés

🏢 **Campost – Versement en bureau de poste** (Mode principal recommandé)
→ Rendez-vous au bureau Campost le plus proche
→ Versement sur le compte **AGRI POINT SERVICES SAS**
→ Mentionnez votre numéro de commande comme référence
→ Envoyez le reçu par WhatsApp : +237 676 026 601
→ Confirmation sous 24h — disponible dans les 10 régions du Cameroun
→ Voir tous les points de dépôt : [/points-campost]

💵 **Cash à la livraison**
→ Payez en espèces directement au livreur à la réception
→ Disponible selon la zone de livraison

📌 Le numéro de compte AGRI POINT SERVICES SAS vous sera communiqué lors de la confirmation de commande.`,

        suivi: `## Suivre ma Commande

**Option 1** — Sur le site
→ Se connecter → "Mon Compte" → "Mes Commandes"
→ Voir statut en temps réel

**Option 2** — Via l'Assistant Agri Point (ici même !)
→ Donner votre numéro de commande AP-XXXX-XXXXX

**Option 3** — Par téléphone
→ 📞 +237 657 39 39 39 (avoir le numéro sous la main)
→ 💬 WhatsApp 657 39 39 39

**Statuts possibles :**
- ⏳ En attente → Paiement non encore confirmé
- ✅ Confirmée → Paiement validé, préparation imminente
- 🔄 En préparation → Votre colis est en cours de constitution
- 🚚 Expédiée → Transitaire en route
- 📦 Livrée → Mission accomplie !`,

        retour: `## Retourner un Produit

✅ **Conditions** : Dans les 7 jours suivant la livraison, produit intact et scellé

**Procédure :**
1. Contacter : retour@agri-ps.com ou WhatsApp 657 39 39 39
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
            `📞 Questions : +237 657 39 39 39 | 💬 WhatsApp 657 39 39 39`,
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
      const waText = encodeURIComponent(`Bonjour, je suis mis en relation par l'Assistant Agri Point Services.\nMotif : ${label}${args.summary ? '\n' + args.summary : ''}`);
      return `## 👨‍💼 Passage à un conseiller humain\n\n**Motif :** ${label}${ctx}\n\nUn agronome AGRI POINT SERVICE va prendre en charge votre demande :\n\n- 💬 [**WhatsApp maintenant**](https://wa.me/237657393939?text=${waText}) — réponse rapide\n- 📞 [**+237 657 39 39 39**](tel:+237657393939) — lun-sam 7h-19h\n- ✉️ infos@agri-ps.com\n\nPrésentez votre numéro de commande si vous en avez un. Notre équipe vous répondra dans les meilleurs délais 🌱`;
    }

    // ── calculate_roi ──
    if (name === 'calculate_roi') {
      const surfaceStr   = args.surface || '1Ha';
      const numMatch     = surfaceStr.match(/[\d.,]+/);
      const isM2         = surfaceStr.toLowerCase().includes('m');
      const rawNum       = numMatch ? parseFloat(numMatch[0].replace(',', '.')) : 1;
      const surfaceHa    = isM2 ? rawNum / 10000 : rawNum;

      const yieldRef: Record<string, { base: number; boost: number; price: number; unit: string }> = {
        tomate:  { base: 15,  boost: 0.60, price: 300,  unit: 'kg' },
        cacao:   { base: 0.6, boost: 0.40, price: 2500, unit: 'kg' },
        'café':  { base: 0.8, boost: 0.35, price: 2000, unit: 'kg' },
        maïs:    { base: 2,   boost: 0.45, price: 150,  unit: 'kg' },
        manioc:  { base: 10,  boost: 0.35, price: 100,  unit: 'kg' },
        default: { base: 2,   boost: 0.40, price: 200,  unit: 'kg' },
      };

      const cultKey  = Object.keys(yieldRef).find(k => args.culture?.toLowerCase().includes(k)) || 'default';
      const ref      = yieldRef[cultKey];
      const baseKg   = args.currentYield
        ? (parseFloat(args.currentYield.match(/[\d.,]+/)?.[0]?.replace(',', '.') || '0') || ref.base * 1000 * surfaceHa)
        : ref.base * 1000 * surfaceHa;
      const prixKg   = args.pricePerKg
        ? (parseFloat(args.pricePerKg.match(/[\d.,]+/)?.[0]?.replace(',', '.') || '0') || ref.price)
        : ref.price;

      const gainKg        = Math.round(baseKg * ref.boost);
      const gainBrut      = Math.round(gainKg * prixKg);
      const coutProduits  = Math.round(surfaceHa * 18000); // ~18 000 F CFA/Ha programme complet
      const gainNet       = gainBrut - coutProduits;
      const roiPct        = coutProduits > 0 ? Math.round((gainNet / coutProduits) * 100) : 0;

      return [
        `## 💰 Calculateur ROI — ${args.culture} sur ${args.surface}`,
        ``,
        `| Indicateur | Valeur |`,
        `|-----------|--------|`,
        `| Surface | **${args.surface}** (${surfaceHa.toFixed(2)} Ha) |`,
        `| Rendement actuel estimé | **${Math.round(baseKg).toLocaleString('fr-FR')} kg** |`,
        `| Gain supplémentaire (+${Math.round(ref.boost * 100)}%) | **+${gainKg.toLocaleString('fr-FR')} kg** |`,
        `| Prix unitaire | **${prixKg} F CFA/${ref.unit}** |`,
        ``,
        `### 📈 Résultat financier`,
        `- Gain brut supplémentaire : **+${gainBrut.toLocaleString('fr-FR')} F CFA**`,
        `- Investissement produits AGRI POINT : ~${coutProduits.toLocaleString('fr-FR')} F CFA`,
        `- 🎉 **Gain net estimé : +${gainNet.toLocaleString('fr-FR')} F CFA**`,
        `- **ROI : +${roiPct}%** sur l'investissement`,
        ``,
        `> ⚠️ Estimation basée sur les résultats moyens observés. Résultats variables selon conditions terrain.`,
        ``,
        `🛒 [Commander maintenant](https://agri-ps.com/produits) | 📞 +237 657 39 39 39`,
      ].join('\n');
    }

    // ── get_page_content ──
    if (name === 'get_page_content') {
      const page = args.page?.toLowerCase() || 'evenements';
      try {
        const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://agri-ps.com';
        if (page.includes('event') || page.includes('ément')) {
          const res = await fetch(`${baseUrl}/api/events?limit=5`, { next: { revalidate: 600 } });
          if (res.ok) {
            type EventItem = { title: string; date: string; location: string; description?: string; link?: string };
            const data = await res.json() as { events?: EventItem[] };
            const events = data.events || [];
            if (events.length > 0) {
              const lines = [
                `## 📅 Événements AGRI POINT SERVICE`,
                '',
                ...events.map(e => [
                  `### ${e.title}`,
                  `📅 ${new Date(e.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`,
                  `📍 ${e.location}`,
                  e.description || '',
                  e.link ? `🔗 [Détails](${e.link})` : '',
                ].filter(Boolean).join('\n')),
                '',
                `📋 [Voir tous les événements](https://agri-ps.com/evenements)`,
              ];
              return lines.join('\n');
            }
          }
        }
      } catch { /* fallback statique */ }

      const fallbacks: Record<string, string> = {
        evenements: `## 📅 Événements AGRI POINT SERVICE\n\n🔗 [Calendrier complet](https://agri-ps.com/evenements)\n\nProchains événements :\n- 🌾 **Foire Agricole Régionale** — Yaoundé (prochainement)\n- 📚 **Formation biofertilisants** — Douala (sur inscription)\n- 🌐 **Webinaire mensuel** — En ligne, 1er vendredi du mois\n\n📞 +237 657 39 39 39 pour s'inscrire`,
        carte: `## 🗺️ Carte des Distributeurs\n\n🔗 [Voir la carte interactive](https://agri-ps.com/carte)\n\nNos agences :\n- 📍 Yaoundé — Quartier Fouda (siège)\n- 📍 Douala — Bonapriso\n- 📍 Bafoussam — Centre-ville\n- 📍 Garoua — Quartier Dougoï\n- 📍 Maroua — Centre commercial`,
        actualites: `## 📰 Actualités AGRI POINT\n\n- 🌾 Campagne Engrais Mars 2026 — Inscriptions ouvertes !\n- 📱 Cette saison : AMINOL 20 prioritaire (saison sèche)\n- 🏆 98% satisfaction client confirmée\n\n💬 WhatsApp 657 39 39 39`,
      };
      const key = Object.keys(fallbacks).find(k => page.includes(k)) || 'evenements';
      return fallbacks[key];
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
    roi: ['combien', 'gagner', 'bénéfice', 'retour', 'investissement', 'rendement', 'revenu', 'profit', 'gain'],
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
// SYSTEM_PROMPT de base — la mémoire et le climat sont injectés dynamiquement via buildSystemPrompt()
const SYSTEM_PROMPT_BASE = `Tu es **l'Assistant d'Agri Point Services** 🌿 — un conseiller agricole expert, empathique et disponible 24h/24.
AGRI POINT SERVICES est la référence en biofertilisants et solutions agricoles au Cameroun depuis 2010.

## IDENTITÉ & PRÉSENTATION
- Tu te présentes TOUJOURS comme **«l'Assistant d'Agri Point Services»** — jamais comme "AgriBot" ou "une IA".
- En début de conversation, tu te présentes naturellement : «Bonjour ! Je suis l'Assistant d'Agri Point Services 🌿 — votre conseiller agricole expert…»
- **Important** : Un Conseiller Expert d'Agri Point Services peut également intervenir à tout moment pour vous accompagner avec une expertise terrain approfondie. Si le client a besoin d'un suivi humain → propose l'escalade vers un conseiller humain.
- Tu incarnes l'expertise d'un agronome avec 15 ans d'expérience terrain au Cameroun.

## PERSONNALITÉ & TON — NIVEAU CHAMPION
Tu converses COMME UN HUMAIN EXPERT, pas comme un robot :
- Chaleureux et direct : «Bien sûr !», «Pas de souci !», «Je comprends très bien votre situation»
- Empathique : Reconnais les réalités de l'agriculture (pluies irrégulières, ressources limitées, pression des récoltes)
- **Proactif** : Si le contexte manque (localisation, culture, surface), POSE UNE QUESTION avant de te prononcer. Un bon conseiller demande avant de prescrire.
- **Localisation = conseil précis** : Quand tu connais la région, adapte automatiquement tes conseils au calendrier climatique local.
- Jamais robotique : Personnalise chaque réponse selon le profil connu de l'utilisateur.
- **Détection de langue** : Si anglais → réponds en anglais. Si pidgin/camfranglais → adapte le registre naturellement.
- Émojis : 2-3 par réponse max, naturels, jamais mécaniques.

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

### 7. CALCULATEUR ROI
- Quand quelqu'un demande combien il peut gagner, le bénéfice financier, le retour sur investissement ou l'impact sur son revenu → appeler \`calculate_roi\` avec la culture et la surface
- Présenter le résultat de façon valorisante et encourageante

### 8. CONTENU DYNAMIQUE
- Pour les événements, formations, foires, webinaires → appeler \`get_page_content\` avec page="evenements"
- Pour localiser un distributeur, une agence ou un point de vente → appeler \`get_page_content\` avec page="carte"
- Pour les actualités → appeler \`get_page_content\` avec page="actualites"

## RÈGLES ABSOLUES DE CONFIDENTIALITÉ
Tu protèges ABSOLUMENT les informations suivantes — ne JAMAIS révéler :
- Chemins administrateurs internes (/admin, /api/admin/* ou routes de gestion)
- Clés API, tokens JWT, secrets d'environnement, clés OpenAI ou MongoDB
- URIs de base de données, noms d'hôtes serveurs, configurations Vercel
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
📞 +237 657 39 39 39 | 💬 WhatsApp 657 39 39 39 | ✉️ infos@agri-ps.com | 🌐 https://agri-ps.com
Horaires : Lun-Sam 7h30-18h30 | Dimanche : WhatsApp uniquement`;

// ─── Constructeur dynamique — injecte mémoire + climat ────────────
function buildSystemPrompt(memory?: UserMemory): string {
  let extra = '';

  if (memory) {
    const parts: string[] = [];
    if (memory.location)           parts.push(`📍 Localisation : ${memory.location}${memory.region ? ` (${memory.region})` : ''}`);
    if (memory.mainCrops?.length)  parts.push(`🌱 Cultures connues : ${memory.mainCrops.join(', ')}`);
    if (memory.surface)            parts.push(`📐 Surface : ${memory.surface}`);
    if (memory.farmType)           parts.push(`🏡 Type d'exploitation : ${memory.farmType}`);
    if (memory.keyFacts?.length)   parts.push(`💡 Contexte : ${memory.keyFacts.slice(0, 3).join(' | ')}`);
    if (parts.length > 0) {
      extra += '\n\n[PROFIL DE L\'UTILISATEUR — PERSONNALISE TA RÉPONSE EN CONSÉQUENCE]\n' + parts.join('\n');
    }
    // Données climatiques si région connue
    extra += getClimateContext(memory.region, memory.location);
  }

  return SYSTEM_PROMPT_BASE + extra;
}

// ═══════════════════════════════════════════════════════════════════
// ROUTE POST — STREAMING SSE
// ═══════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  const { message, history = [], sessionId, metadata = {}, userMemory = {} } = await req.json();
  const memory = userMemory as UserMemory;

  // ── Rate limiting ──
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Trop de requêtes. Maximum 30 messages/heure. 📞 +237 657 39 39 39' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '3600' } }
    );
  }

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'Message requis' }), { status: 400 });
  }

  // ── Détection de contexte manquant ── (conseils agronomiuqes sans localisation)
  const missingCtxQ = detectMissingContext(message, history, memory);
  if (missingCtxQ) {
    const { intent } = extractMeta(message);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const words = missingCtxQ.split(' ');
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', token: words[i] + ' ' })}\n\n`));
            i++;
          } else {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', intent, suggestions: [], tags: [] })}\n\n`));
            clearInterval(interval);
            controller.close();
          }
        }, 15);
      },
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
  }

  // ── Vérification cache de réponses (questions factuelles non personnelles) ──
  const isCacheable = !/commande|compte|paiement|livraison|ap-\d|mon panier|ma commande/i.test(message);
  const cacheKey = isCacheable ? getCacheKey(message, memory.location, memory.mainCrops) : null;
  if (cacheKey) {
    const cached = getCached(cacheKey);
    if (cached) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const words = cached.response.split(/(\s+)/);
          let i = 0;
          const interval = setInterval(() => {
            if (i < words.length) {
              if (words[i]) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', token: words[i] })}\n\n`));
              i++;
            } else {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', intent: cached.intent, suggestions: [], tags: [], fromCache: true })}\n\n`));
              clearInterval(interval);
              controller.close();
            }
          }, 8);
        },
      });
      return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
    }
  }

  // ── Construit le prompt système enrichi avec la mémoire et le climat ──
  const dynamicSystemPrompt = buildSystemPrompt(memory);

  // Mode démo si aucune IA disponible
  if (!isOpenAIReady() && !isAnthropicReady() && !isGeminiReady()) {
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

  // ── Anthropic direct si OpenAI absent mais Anthropic configuré ──
  if (!isOpenAIReady() && isAnthropicReady()) {
    const { tags, intent } = extractMeta(message);
    const anthropicMessages = [
      ...history.slice(-8).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant', content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };
        try {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': process.env.ANTHROPIC_API_KEY!,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
              max_tokens: 800, stream: true, system: dynamicSystemPrompt,
              messages: anthropicMessages,
            }),
          });
          if (!res.ok || !res.body) throw new Error('Anthropic error');
          const reader = res.body.getReader(); const decoder = new TextDecoder();
          let buf = ''; let full = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split('\n'); buf = lines.pop() || '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (!data || data === '[DONE]') continue;
              try {
                const ev = JSON.parse(data);
                if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
                  const t = ev.delta.text || '';
                  if (t) { full += t; send({ type: 'token', token: t }); }
                }
              } catch { /* skip */ }
            }
          }
          if (cacheKey && full.length > 50) setCache(cacheKey, full, intent);
          send({ type: 'done', tags, intent, suggestions: [], escalate: false, provider: 'anthropic' });
        } catch {
          // Fallback Gemini ou demo
          const { demo } = getDemoResponse(message);
          for (const w of demo.split(/(\s+)/)) { if (w) send({ type: 'token', token: w }); await new Promise(r => setTimeout(r, 12)); }
          send({ type: 'done', tags, intent, suggestions: [], escalate: false });
        }
        controller.close();
      },
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
  }

  // ── Gemini direct si OpenAI et Anthropic absents mais Gemini configuré ──
  if (!isOpenAIReady() && !isAnthropicReady() && isGeminiReady()) {
    const { tags, intent } = extractMeta(message);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
            {
              method: 'POST', headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: dynamicSystemPrompt }] },
                contents: [
                  ...history.slice(-6).map((m: { role: string; content: string }) => ({
                    role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }],
                  })),
                  { role: 'user', parts: [{ text: message }] },
                ],
                generationConfig: { maxOutputTokens: 800, temperature: 0.65 },
              }),
            }
          );
          if (geminiRes.ok) {
            const d = await geminiRes.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
            const text = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
            for (const w of text.split(/(\s+)/)) { if (w) send({ type: 'token', token: w }); await new Promise(r => setTimeout(r, 8)); }
            if (cacheKey && text.length > 50) setCache(cacheKey, text, intent);
            send({ type: 'done', tags, intent, suggestions: [], escalate: false, provider: 'gemini' });
          } else { throw new Error('Gemini error'); }
        } catch {
          const { demo } = getDemoResponse(message);
          for (const w of demo.split(/(\s+)/)) { if (w) send({ type: 'token', token: w }); await new Promise(r => setTimeout(r, 14)); }
          send({ type: 'done', tags, intent, suggestions: [], escalate: false });
        }
        controller.close();
      },
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
  }

  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: dynamicSystemPrompt },
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
            : toolNames.includes('calculate_roi') ? '💰 Calcul du retour sur investissement...'
            : toolNames.includes('get_page_content') ? '📅 Chargement du contenu...'
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

        // ── Mise en cache de la réponse (si cacheable) ──
        if (cacheKey && fullContent.length > 50) {
          setCache(cacheKey, fullContent, intent);
        }

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
                    'metadata.model': isOpenAIReady() ? (process.env.OPENAI_MODEL || 'gpt-4o-mini') : isAnthropicReady() ? 'claude-haiku' : 'demo',
                    'metadata.lastIntent': intent,
                    'metadata.userLocation': memory.location || undefined,
                    'metadata.userCrops': memory.mainCrops?.length ? memory.mainCrops.join(',') : undefined,
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

        // ── Tentative Anthropic Claude si disponible ──
        if (isAnthropicReady()) {
          try {
            send({ type: 'token', token: '' }); // signal de démarrage
            const anthropicMessages = [
              ...history.slice(-8).map((m: { role: string; content: string }) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
              })),
              { role: 'user' as const, content: message },
            ];

            const res = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY!,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
              },
              body: JSON.stringify({
                model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
                max_tokens: 800,
                stream: true,
                system: dynamicSystemPrompt,
                messages: anthropicMessages,
              }),
            });

            if (res.ok && res.body) {
              const reader  = res.body.getReader();
              const decoder = new TextDecoder();
              let buf = '';
              let anthropicFull = '';

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                const lines = buf.split('\n');
                buf = lines.pop() || '';
                for (const line of lines) {
                  if (!line.startsWith('data: ')) continue;
                  const data = line.slice(6).trim();
                  if (data === '[DONE]' || data === 'event: message_stop') continue;
                  try {
                    const ev = JSON.parse(data);
                    if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
                      const t = ev.delta.text || '';
                      if (t) { anthropicFull += t; send({ type: 'token', token: t }); }
                    }
                  } catch { /* skip malformed */ }
                }
              }

              const { tags, intent } = extractMeta(message);
              if (cacheKey && anthropicFull.length > 50) setCache(cacheKey, anthropicFull, intent);
              send({ type: 'done', tags, intent, suggestions: [], escalate: false, provider: 'anthropic' });
              controller.close();
              return;
            }
          } catch (anthropicErr) {
            console.error('Anthropic fallback error:', anthropicErr instanceof Error ? anthropicErr.message : anthropicErr);
          }
        }

        // ── Tentative Google Gemini si disponible ──
        if (isGeminiReady()) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
              {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                  system_instruction: { parts: [{ text: dynamicSystemPrompt }] },
                  contents: [
                    ...history.slice(-6).map((m: { role: string; content: string }) => ({
                      role: m.role === 'assistant' ? 'model' : 'user',
                      parts: [{ text: m.content }],
                    })),
                    { role: 'user', parts: [{ text: message }] },
                  ],
                  generationConfig: { maxOutputTokens: 800, temperature: 0.65 },
                }),
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
              const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (geminiText) {
                for (const word of geminiText.split(/(\s+)/)) {
                  if (word) { send({ type: 'token', token: word }); await new Promise(r => setTimeout(r, 8)); }
                }
                const { tags, intent } = extractMeta(message);
                if (cacheKey && geminiText.length > 50) setCache(cacheKey, geminiText, intent);
                send({ type: 'done', tags, intent, suggestions: [], escalate: false, provider: 'gemini' });
                controller.close();
                return;
              }
            }
          } catch (geminiErr) {
            console.error('Gemini fallback error:', geminiErr instanceof Error ? geminiErr.message : geminiErr);
          }
        }

        // ── Fallback final — JAMAIS d'erreur visible : basculer en mode offline ──
        try {
          const { demo, intent } = getDemoResponse(message);
          const parts = demo.split(/(\s+)/);
          for (const part of parts) {
            if (part) send({ type: 'token', token: part });
            await new Promise(r => setTimeout(r, 12));
          }
          send({ type: 'done', tags: [], intent, suggestions: [], escalate: false });
        } catch {
          send({
            type: 'error',
            message: '⚠️ Service momentanément indisponible.\n\n📞 **+237 657 39 39 39**\n💬 **WhatsApp 657 39 39 39**\n\nNos conseillers vous répondent immédiatement !',
          });
        }
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
// MOTEUR DE RÉPONSES HORS-LIGNE — Couverture 35+ sujets
// ═══════════════════════════════════════════════════════════════════
function getDemoResponse(message: string): { demo: string; intent: string } {
  const m = message.toLowerCase();

  // ── CAMPAGNE ENGRAIS ──────────────────────────────────────────────
  if (m.includes('campagne') || m.includes('engrais mars') || m.includes('prix spécial') || m.includes('subventionné') || m.includes('coopérative') || m.includes('mutuelle') || m.includes('cican') || m.includes('camao') || m.includes('mars 2026') || m.includes('acompte') || m.includes('70%') || m.includes('30%')) {
    return { intent: 'campagne', demo: `## 🌾 Campagne Engrais Mars 2026 — Guide Complet

Accédez à des engrais de qualité **à des prix préférentiels** négociés pour les agriculteurs organisés !

### ✅ 3 Conditions d'éligibilité
1. 🏢 Être membre d'une **coopérative agréée** (reconnue MINADER)
2. 🤝 Adhérer à une **mutuelle agricole** : CICAN, CAMAO ou organisme agréé
3. 📦 Commander **au minimum 6 sacs ou litres**

### 💰 Produits disponibles
- 🌱 **Engrais Minéraux** — Sacs 50 kg, tarif préférentiel
- 🧪 **Biofertilisants** — À partir de 5 litres (HUMIFORTE, FOSNUTREN, etc.)

### 💳 Paiement 70/30
- **70%** à la commande (acompte en ligne)
- **30%** restants à la livraison

### 📝 S'inscrire — Étape par étape
1. Aller sur 👉 **https://agri-ps.com/campagne-engrais**
2. Saisir : Nom complet, Email, Téléphone
3. Choisir le type de produit + quantité (min. 6)
4. Indiquer le nom et l'email de votre coopérative
5. Cocher ✅ «Membre coopérative agréée» + ✅ «Adhère à mutuelle»
6. Cliquer **«Soumettre ma candidature»** → Payer 70% en ligne

📞 Questions : **+237 657 39 39 39** | 💬 WhatsApp **657 39 39 39**` };
  }

  // ── INSCRIPTION / CRÉATION DE COMPTE ──────────────────────────────
  if ((m.includes('inscrire') || m.includes('créer un compte') || m.includes('creer') || m.includes('inscription') || m.includes("s'inscrire") || m.includes('nouveau compte') || m.includes('enregistrer')) && !m.includes('campagne')) {
    return { intent: 'compte', demo: `## 👤 Créer votre compte sur agri-ps.com

### Étapes simples :
1. 🌐 Aller sur **https://agri-ps.com**
2. Cliquer l'icône **"Mon Compte"** (en haut à droite)
3. Cliquer **"Créer un compte"** ou **"S'inscrire"**
4. Remplir :
   - **Prénom & Nom**
   - **Email** valide (pour recevoir vos confirmations)
   - **Téléphone** : +237 6XX XX XX XX
   - **Mot de passe** : min. 8 caractères (lettres + chiffres recommandé)
5. ✅ Cocher **"J'accepte les CGU et CGV"**
6. Cliquer **"Créer mon compte"**
7. 📧 Ouvrez votre email → cliquer le **lien de confirmation** (valable 24h)
8. 🎉 Votre compte est actif ! Vous pouvez commander.

> 💡 Conseil : utilisez l'email que vous consultez régulièrement

📞 Problème d'inscription ? **+237 657 39 39 39** | 💬 WhatsApp **657 39 39 39**` };
  }

  // ── CONNEXION / MOT DE PASSE ───────────────────────────────────────
  if (m.includes('connect') || m.includes('login') || m.includes('mot de passe') || (m.includes('compte') && (m.includes('oublié') || m.includes('réinit')))) {
    return { intent: 'compte', demo: `## 🔐 Se connecter à votre espace client

### Se connecter :
1. 🌐 Aller sur **https://agri-ps.com**
2. Cliquer **"Mon Compte"** (haut à droite, icône personne)
3. Entrer votre **email** + **mot de passe**
4. *(Optionnel)* Cocher "Rester connecté" sur votre propre appareil
5. Cliquer **"Se connecter"**

---

### 🔑 Mot de passe oublié ?
1. Cliquer **"Mot de passe oublié"** sur la page de connexion
2. Saisir votre **adresse email**
3. Cliquer **"Envoyer"**
4. Vérifier votre **boîte email** (vérifier aussi le dossier SPAM)
5. Cliquer le **lien de réinitialisation** (valable 1h)
6. Choisir votre nouveau mot de passe → confirmer

> 💡 Si l'email n'arrive pas : vérifier les SPAM, ou contacter le support

📞 **+237 657 39 39 39** | 💬 WhatsApp **657 39 39 39**` };
  }

  // ── SUIVI DE COMMANDE ──────────────────────────────────────────────
  if (m.includes('suivi') || m.includes('où est ma commande') || m.includes('statut') || (m.includes('commande') && (m.includes('ap-') || /\bap\s*[\-–]\s*\d/.test(m)))) {
    return { intent: 'commande', demo: `## 📦 Suivre ma commande

### Option 1 — Sur le site (recommandé)
1. Se connecter → **"Mon Compte"** → **"Mes Commandes"**
2. Retrouver votre commande par numéro ou date
3. Voir le **statut en temps réel**

### Option 2 — Via AgriBot
Donner votre numéro de commande **AP-XXXX-XXXXX** dans ce chat

### Option 3 — Par téléphone
📞 **+237 657 39 39 39** (avoir son numéro de commande)
💬 WhatsApp **657 39 39 39**

---

### 📊 Les différents statuts
| Statut | Signification |
|--------|--------------|
| ⏳ En attente | Paiement non encore confirmé |
| ✅ Confirmée | Paiement validé, préparation imminente |
| 🔄 En préparation | Votre colis est en cours de constitution |
| 🚚 Expédiée | En transit vers vous |
| 📦 Livrée | Mission accomplie ! |
| ❌ Annulée | Commande annulée |

> 📸 Pour accélérer la confirmation : envoyez le **reçu Campost** par WhatsApp au **657 39 39 39**` };
  }

  // ── COMMENT COMMANDER / PASSER UNE COMMANDE ───────────────────────
  if (m.includes('comment') && (m.includes('acheter') || m.includes('commander') || m.includes('passer une commande')) || (m.includes('acheter') || m.includes('commande') && !m.includes('suivi'))) {
    return { intent: 'commande', demo: `## 🛒 Comment commander sur agri-ps.com

### Étape 1 — Choisir votre produit
→ Menu **"Boutique"** ou barre de recherche 🔍
→ Filtrer par culture, catégorie ou budget

### Étape 2 — Ajouter au panier
→ Choisir le **format** : 250mL, 1L, 5L, 20L
→ Choisir la **quantité**
→ Cliquer **"Ajouter au panier"** 🛒

### Étape 3 — Valider la commande
→ Icône panier (haut à droite) → **"Procéder au paiement"**
→ Vérifier le récapitulatif
→ Renseigner l'**adresse de livraison**

### Étape 4 — Payer via Campost
→ Se rendre au bureau **Campost** le plus proche
→ Verser sur le compte **AGRI POINT SERVICES SAS**
→ Mentionner votre **numéro de commande** comme référence
→ 📸 Envoyer le reçu par WhatsApp : **+237 676 026 601**

### Étape 5 — Confirmation
→ Email + SMS avec votre numéro de commande **AP-XXXX-XXXXX**
→ Livraison sous 24-48h à Yaoundé, 3-5j ailleurs

🚚 **Livraison gratuite** dès **50 000 F CFA** d'achat !` };
  }

  // ── PAIEMENT ──────────────────────────────────────────────────────
  if (m.includes('paiement') || m.includes('payer') || m.includes('campost') || m.includes('espèce') || m.includes('virement')) {
    return { intent: 'commande', demo: `## 💳 Modes de Paiement Acceptés

### 🏢 Campost — Mode principal recommandé
- Se rendre au bureau **Campost** le plus proche (disponible dans les 10 régions)
- Verser sur le compte **AGRI POINT SERVICES SAS**
- Mentionner votre **numéro de commande** comme référence
- 📸 Envoyer le reçu par WhatsApp : **+237 676 026 601**
- ✅ Confirmation sous **24h** après réception du reçu

### 💵 Cash à la livraison
- Payez en espèces directement au livreur
- Disponible selon la zone de livraison

---

> 📌 Le **numéro de compte exact** AGRI POINT SERVICES SAS vous sera communiqué dans l'email de confirmation de commande.

📞 Questions paiement : **+237 657 39 39 39** | 💬 **657 39 39 39**` };
  }

  // ── LIVRAISON ─────────────────────────────────────────────────────
  if (m.includes('livraison') || m.includes('délai') || m.includes('délais') || m.includes('expédition') || m.includes('frais de livraison') || m.includes('zone')) {
    return { intent: 'commande', demo: `## 🚚 Livraison AGRI POINT SERVICE

| Zone | Délai | Frais |
|------|-------|-------|
| 📍 Yaoundé centre | 24-48h | 1 500 F CFA |
| 📍 Yaoundé périphérie | 48-72h | 2 000 F CFA |
| 📍 Douala | 48-72h | 2 500 F CFA |
| 📍 Bafoussam, Garoua, Ngaoundéré | 3-5 jours | 3 000-4 000 F CFA |
| 📍 Zones rurales | 5-10 jours | Sur devis |

### 🎁 Livraison GRATUITE
Toute commande **≥ 50 000 F CFA** dans les grandes villes !

### 📦 Click & Collect (gratuit)
Retrait direct à notre siège : **Yaoundé, Quartier Fouda**

### 📍 Suivi
- Email de confirmation avec numéro de suivi
- WhatsApp **657 39 39 39** pour mises à jour

> ⏰ Les délais peuvent varier selon les conditions météo et les routes en zone rurale.` };
  }

  // ── RETOUR / REMBOURSEMENT ────────────────────────────────────────
  if (m.includes('retour') || m.includes('rembours') || m.includes('annul') || m.includes('échange') || m.includes('défectueux') || m.includes('problème commande')) {
    return { intent: 'commande', demo: `## 🔄 Retour & Remboursement

### ✅ Conditions de retour
- Dans les **7 jours** après livraison
- Produit **intact, scellé**, dans son emballage d'origine
- Avec justificatif (facture ou numéro de commande)

### 📋 Procédure
1. Contacter : **retour@agri-ps.com** ou WhatsApp **657 39 39 39**
2. Indiquer le motif (produit défectueux, erreur de commande…)
3. Recevoir les instructions de retour
4. Expédier le produit à notre adresse
5. ✅ Remboursement sous **3-5 jours ouvrables** après réception

### ❌ Annulation de commande
- Avant expédition → **"Mon Compte" → "Annuler ma commande"**
- Après expédition → contacter le service client

### 📞 Urgence
📞 **+237 657 39 39 39**
💬 WhatsApp **657 39 39 39**
✉️ support@agri-ps.com` };
  }

  // ── TOMATE ────────────────────────────────────────────────────────
  if (m.includes('tomate')) {
    return { intent: 'culture', demo: `## 🍅 Programme Complet Tomates

### Plan de fertilisation par phase

| Phase | Produit | Dose/Ha | Intervalle |
|-------|---------|---------|-----------|
| 🌱 Préparation sol | **NATUR CARE** | 5 L/Ha | 1 fois avant plantation |
| 🌿 Végétatif (J0→J30) | **HUMIFORTE** | 1.5 L/Ha | /2 semaines |
| 🌸 Floraison | **FOSNUTREN 20** | 1.5 L/Ha | Dès boutons floraux |
| 🍅 Fructification | **KADOSTIM 20** | 2 L/Ha | ×2 post-floraison |
| 🌡️ Si stress/maladie | **AMINOL 20** | 1 L/Ha | Dès apparition |

### 🎯 Résultats attendus
- +50% à +80% de rendement
- Fruits plus gros, mieux colorés
- Résistance accrue aux pathogènes

### ⏰ Appliquer
Matin avant 9h ou soir après 17h (éviter chaleur du midi)

🛒 [Commander](https://agri-ps.com/produits) | 📞 **+237 657 39 39 39**` };
  }

  // ── CACAO / CAFÉ ──────────────────────────────────────────────────
  if (m.includes('cacao') || m.includes('café') || m.includes('cafe ')) {
    return { intent: 'culture', demo: `## ☕🍫 Programme Cacao & Café

### Plan de fertilisation

| Phase | Produit | Dose/Ha | Objectif |
|-------|---------|---------|---------|
| 🌿 Végétatif | **HUMIFORTE** | 2 L/Ha toutes 2 sem. | Feuillaison dense |
| 💪 Anti-stress | **AMINOL 20** | 1 L/Ha urgent | Résistance sécheresse |
| 🌸 Floraison | **FOSNUTREN 20** | 1.5 L/Ha | Nouaison |
| 🍫 Post-floraison ×2 | **KADOSTIM 20** | 2 L/Ha | Calibre & export |

### 🏆 Résultats sur 3 ans au Cameroun
- Cacao : **+35-45%** rendement + meilleure fermentation
- Café : **+30-40%** + arômes améliorés + valeur export

### 🌤️ Conseil Saison Sèche (Juil-Sept)
🚨 **AMINOL 20 OBLIGATOIRE** dès juillet — protège contre la sécheresse intense

### 📲 Suivi agronomique
📞 +237 657 39 39 39 | conseil@agri-ps.com` };
  }

  // ── MAÏS ─────────────────────────────────────────────────────────
  if (m.includes('maïs') || m.includes('mais') || m.includes('maize') || m.includes('corn')) {
    return { intent: 'culture', demo: `## 🌽 Programme Complet Maïs

| Phase | Produit | Dose/Ha |
|-------|---------|---------|
| Préparation sol | **NATUR CARE** | 5 L/Ha |
| Levée → Montaison | **HUMIFORTE** | 1.5 L/Ha / 2 sem. |
| Pollinisation | **FOSNUTREN 20** | 1.5 L/Ha |
| Post-récolte | **NATUR CARE** | 5 L/Ha (restauration) |

### 🎯 Gains
- **+40-50%** de rendement grain
- Épis plus remplis, meilleure qualité nutritive
- Sol restauré pour la saison suivante

### 💡 Astuce
Commencer le HUMIFORTE dès la **levée complète** (J10-J15). Ne pas attendre les premiers signes de carence.

🛒 [Boutique](https://agri-ps.com/produits) | 📞 +237 657 39 39 39` };
  }

  // ── AGRUMES / MANGUE / ANANAS / PAPAYE / AVOCAT ───────────────────
  if (m.includes('agrume') || m.includes('manguier') || m.includes('mangue') || m.includes('ananas') || m.includes('papaye') || m.includes('avocat') || m.includes('citron') || m.includes('pamplemousse')) {
    return { intent: 'culture', demo: `## 🍊 Programme Cultures Fruitières

### Plan général (toutes cultures fruitières)

| Phase | Produit | Dose/Ha |
|-------|---------|---------|
| Entretien végétatif | **HUMIFORTE** | 1.5-2 L/Ha / 3 sem. |
| Avant/pendant floraison | **FOSNUTREN 20** | 1.5 L/Ha |
| Après floraison | **KADOSTIM 20** | 2 L/Ha ×2 |
| Si stress (sécheresse/maladie) | **AMINOL 20** | 1 L/Ha urgent |
| Restauration sol annuelle | **NATUR CARE** | 5 L/Ha |

### 🥭 Spécifique Mangue & Avocatier
- FOSNUTREN 20 **15-20 jours avant** la floraison attendue
- KADOSTIM 20 dès la **chute des pétales** pour calibrer les fruits

### 🍍 Ananas & Papaye
- Très sensibles au stress hydrique → **AMINOL 20** préventif dès saison sèche

📞 **+237 657 39 39 39** pour programme personnalisé` };
  }

  // ── POIVRON / LÉGUMES MARAÎCHAGE ──────────────────────────────────
  if (m.includes('poivron') || m.includes('concombre') || m.includes('haricot') || m.includes('légume') || m.includes('legume') || m.includes('laitue') || m.includes('chou') || m.includes('carotte') || m.includes('oignon') || m.includes('ail')) {
    return { intent: 'culture', demo: `## 🥬 Programme Maraîchage & Légumes

| Phase | Produit | Dose | Fréquence |
|-------|---------|------|-----------|
| Sol avant semis | **NATUR CARE** | 5 L/Ha | 1 fois |
| Végétatif | **HUMIFORTE** | 1 L/Ha | / 2 sem. |
| Floraison | **FOSNUTREN 20** | 1.5 L/Ha | Au bouton floral |
| Fructification | **KADOSTIM 20** | 2 L/Ha (si fruits) | Post-floraison |
| Urgence stress | **AMINOL 20** | 1 L/Ha | Immédiat |

### 🌿 Conseils maraîchage
- Appliquer toujours le **matin avant 9h** ou **soir après 17h**
- Ne pas mélanger avec des produits alcalins
- Petits jardins/balcons : réduire à **1/2 dose** avec 200-400 mL/L eau

🛒 [Voir les produits](https://agri-ps.com/produits) | 📞 +237 657 39 39 39` };
  }

  // ── PALMIER / BANANIER / POIVRE / MANIOC ──────────────────────────
  if (m.includes('palmier') || m.includes('bananier') || m.includes('banane') || m.includes('poivre') || m.includes('plantain') || m.includes('manioc') || m.includes('igname')) {
    return { intent: 'culture', demo: `## 🌴 Cultures Tropicales — Palmier, Bananier, Poivre

### Programme adapté

| Culture | Phase clé | Produit recommandé | Dose |
|---------|----------|-------------------|------|
| Palmier | Végétatif | **HUMIFORTE** | 2 L/Ha |
| Palmier | Floraison | **FOSNUTREN 20** | 1.5 L/Ha |
| Bananier | Toutes phases | **HUMIFORTE** + **NATUR CARE** | 1.5+5 L/Ha |
| Poivre | Végétatif | **HUMIFORTE** | 1.5 L/Ha |
| Poivre | Anti-stress | **AMINOL 20** | 1 L/Ha |
| Manioc/Igname | Sol | **NATUR CARE** | 5 L/Ha |

### 💡 Spécificités
- **Palmier** : résultats visibles après 2 cycles — patience requise
- **Bananier** : forte consommation azote → HUMIFORTE prioritaire
- **Poivre** : très sensible au stress → associer AMINOL 20 systématiquement en saison sèche

📞 Conseil personnalisé : **+237 657 39 39 39**` };
  }

  // ── HUMIFORTE (spécifique) ─────────────────────────────────────────
  if (m.includes('humiforte')) {
    return { intent: 'produit', demo: `## 🌿 HUMIFORTE — Biofertilisant de Croissance

**Type** : Biofertilisant foliaire à base d'acides humiques
**Composition** : Azote 6% | Phosphore 4% | Potassium 0.2% + acides humiques & fulviques

### 🎯 Action & Bénéfices
- Stimule la **croissance végétative**
- Densifie le feuillage et renforce les racines
- Prépare la floraison (précède FOSNUTREN)

### 📊 Dosage
| Surface | Dose |
|---------|------|
| 1 Ha | 1 à 1.5 L |
| 500 m² | 75 à 100 mL |
| Balcon/pot | 5 mL/L d'eau |

**Fréquence** : Toutes les 2-3 semaines
**Application** : Matin avant 9h ou soir après 17h

### 📦 Formats disponibles
250 mL | 500 mL | 1 L | 5 L | 20 L

### 🌱 Cultures idéales
Tomate, cacao, café, maïs, agrumes, palmier, maraîchage, agriculture urbaine

🛒 [Acheter HUMIFORTE](https://agri-ps.com/produits) | 📞 +237 657 39 39 39` };
  }

  // ── FOSNUTREN ─────────────────────────────────────────────────────
  if (m.includes('fosnutren')) {
    return { intent: 'produit', demo: `## 🌸 FOSNUTREN 20 — Biofertilisant Floral

**Type** : Biofertilisant phospho-potassique
**Composition** : Phosphore 6.5% | Potassium 4.2% + Bore + Zinc

### 🎯 Action & Bénéfices
- Garantit une **floraison abondante**
- Améliore la **nouaison des fruits** (moins de chute)
- Augmente le taux de fécondation

### 📊 Dosage
| Surface | Dose | Moment |
|---------|------|--------|
| 1 Ha | 1.5 L | Au bouton floral |
| 500 m² | 75 mL | Mêmes conditions |
| Pot/balcon | 3-4 mL/L | Dès premières fleurs |

**Renouveler** : Toutes les 10-15 jours en phase florale

### 📦 Formats disponibles
500 mL | 1 L | 5 L | 20 L

### 💡 Peut être combiné avec
HUMIFORTE (en transition végétatif → floraison) ✅

🛒 [Acheter FOSNUTREN 20](https://agri-ps.com/produits) | 📞 +237 657 39 39 39` };
  }

  // ── KADOSTIM ──────────────────────────────────────────────────────
  if (m.includes('kadostim')) {
    return { intent: 'produit', demo: `## 🍅 KADOSTIM 20 — Biostimulant Fruticole

**Type** : Biostimulant post-floraison
**Composition** : Acides aminés + oligo-éléments + hormones naturelles

### 🎯 Action & Bénéfices
- **Calibre** supérieur des fruits
- Meilleure **coloration** et conservation post-récolte
- Réduction des fruits déformés ou petits
- 🏆 Certifié export — zéro résidu

### 📊 Dosage
| Surface | Dose | Moment |
|---------|------|--------|
| 1 Ha | 2 L | Dès chute des pétales |
| 1 Ha | 2 L | 20 jours après |
| 500 m² | 100 mL par application | Idem |

**Résultats visibles** : 15-21 jours après la première application

### 📦 Formats disponibles
1 L | 5 L | 20 L

### 🌱 Cultures idéales
Cacao, café, manguier, avocatier, agrumes, ananas, tomate, papaye

🛒 [Acheter KADOSTIM 20](https://agri-ps.com/produits) | 📞 +237 657 39 39 39` };
  }

  // ── AMINOL 20 ─────────────────────────────────────────────────────
  if (m.includes('aminol')) {
    return { intent: 'produit', demo: `## 💪 AMINOL 20 — Biostimulant Anti-Stress

**Type** : Biostimulant à base d'acides aminés hydrolysés
**Composition** : 20 acides aminés libres + vitamines B + microéléments

### 🎯 Action & Bénéfices
- Protection contre **sécheresse, chaleur, salinité**
- Boost immunitaire contre les pathogènes
- **Absorption foliaire en moins de 2 heures !**
- Résultat visible en **48h**

### 📊 Dosage
| Surface | Dose | Moment |
|---------|------|--------|
| 1 Ha | 1 L | Dès stress visible |
| 500 m² | 50 mL | OU prévention mensuelle |
| Pot/balcon | 2-3 mL/L | Si flétrissement |

### ⚡ Utilisation urgence
Appliquer dès les **premiers signes de flétrissement** → résultat visible en 48h.

### 🗓️ Préventif
**Juillet-Août** (saison sèche) → appliquer AVANT l'installation du stress

### 📦 Formats
500 mL | 1 L | 5 L

🛒 [Acheter AMINOL 20](https://agri-ps.com/produits) | 📞 +237 657 39 39 39` };
  }

  // ── NATUR CARE ────────────────────────────────────────────────────
  if (m.includes('natur care') || m.includes('naturcare') || m.includes('natur-care')) {
    return { intent: 'produit', demo: `## 🌍 NATUR CARE — Engrais Organique Liquide

**Type** : Engrais NPK 100% organique
**Origine** : Déchets végétaux fermentés

### 🎯 Action & Bénéfices
- **Restaure la fertilité** des sols appauvris
- Stimule le **microbiome du sol**
- Améliore la **structure et la rétention d'eau**
- 🏆 Certifié **Agriculture Biologique** — label MINADER Cameroun

### 📊 Dosage
| Usage | Dose | Mode |
|-------|------|------|
| Grande culture (1 Ha) | 5 L/Ha | Irrigation ou sol |
| Jardin/potager | 3-5 mL/L | À l'arrosage |
| Maraîchage | 5 L/Ha | Mensuel |

**Renouveler** : 1 fois par mois

### ⚠️ Important
Ne pas mélanger avec d'autres produits. Appliquer **séparément** au sol.

### 📦 Formats
1 L | 5 L | 20 L | 200 L (professionnel)

🛒 [Acheter NATUR CARE](https://agri-ps.com/produits) | 📞 +237 657 39 39 39` };
  }

  // ── AGRICULTURE URBAINE / BALCON / POTAGER ────────────────────────
  if (m.includes('balcon') || m.includes('terrasse') || m.includes('pot') || m.includes('jardin') || m.includes('urbain') || m.includes('appartement') || m.includes('micro') || m.includes('ville')) {
    return { intent: 'conseil', demo: `## 🏙️ Agriculture Urbaine — Guide Complet

### 🌿 Produits recommandés pour la ville
| Type | Produit | Dose | Fréquence |
|------|---------|------|-----------|
| Balcon/terrasse | **HUMIFORTE** | 5 mL/L d'eau | /2 semaines |
| Pots/bacs | **NATUR CARE** | 3 mL/L à l'arrosage | Mensuel |
| Floraison balcon | **FOSNUTREN 20** | 3 mL/L | Dès boutons floraux |
| Urgence stress | **AMINOL 20** | 2 mL/L | Si flétrissement |

### 🥗 Cultures idéales en ville
- **Comestibles** : Tomates cerises, basilic, coriandre, menthe, poivrons, laitues, oignons
- **Fruits** : Fraisiers, mini-citronnier en pot
- **Aromates** : Thym, romarin, persil, ciboulette

### 💡 Conseils essentiels
1. Arroser **matin ou soir** — jamais en plein soleil
2. Utiliser de la terre **enrichie** : substrat universel + NATUR CARE
3. Drainages des pots **obligatoires** pour éviter l'asphyxie des racines
4. Commencer petit : 2-3 cultures max pour débuter

### 🔗 Guide détaillé
👉 [Agriculture Urbaine](https://agri-ps.com/agriculture-urbaine)

📞 **+237 657 39 39 39**` };
  }

  // ── MALADIES / DIAGNOSTIC / URGENCE ───────────────────────────────
  if (m.includes('malade') || m.includes('maladie') || m.includes('jaun') || m.includes('stress') || m.includes('fané') || m.includes('flétri') || m.includes('mort') || m.includes('tach') || m.includes('pourri') || m.includes('champignon') || m.includes('virus') || m.includes('insecte') || m.includes('ravageur') || m.includes('mildiou') || m.includes('oïdium') || m.includes('carence') || m.includes('urgence') || m.includes('sos') || m.includes('aide vite')) {
    return { intent: 'urgence', demo: `## 🚨 Diagnostic Rapide — Guide d'Urgence

### 🔍 Tableau de diagnostic

| Symptôme | Cause probable | Action IMMÉDIATE | Produit |
|----------|--------------|-----------------|---------|
| Feuilles jaunes (bas) | Carence azote | Pulvériser dès aujourd'hui | **HUMIFORTE** |
| Feuilles jaunes (haut) | Carence fer/manganèse | AMINOL + chélate | **AMINOL 20** |
| Plantes flasques/fanées | Stress hydrique | Appliquer + irriguer | **AMINOL 20** |
| Chute des fleurs | Manque phosphore/bore | Au stade bouton | **FOSNUTREN 20** |
| Fruits petits/difformes | Post-floraison négligée | 2L/Ha urgent | **KADOSTIM 20** |
| Sol dur/compact | Biologie dégradée | Mensuel + labour | **NATUR CARE** |
| Mildiou/oïdium | Carence immunité | Hebdomadaire préventif | **AMINOL 20** |
| Faible germination | Sol pauvre | Avant semis urgence | **NATUR CARE** |

### ⚡ Si flétrissement visible
**AMINOL 20** — Action en moins de **2 heures** après pulvérisation, résultat **48h**

---

### 👨‍🌾 Pour un diagnostic terrain précis
📞 **+237 657 39 39 39** — Agronome disponible maintenant
💬 Envoyer des **photos** de vos plantes par WhatsApp : **657 39 39 39**` };
  }

  // ── CALCUL DE DOSE / COMMENT UTILISER ────────────────────────────
  if (m.includes('dose') || m.includes('dosage') || m.includes('combien mettre') || m.includes('quantité') || m.includes('comment utiliser') || m.includes('comment appliquer') || m.includes('volume') || m.includes('mélanger')) {
    return { intent: 'conseil', demo: `## 🧮 Guide de Calcul des Doses

### Formule simple
\`Surface (m²) ÷ 10 000 = Surface en Ha\`
\`Dose (L/Ha) × Surface en Ha = Quantité à utiliser\`

### Exemple concret
- Surface : **500 m²** → 0.05 Ha
- Produit : **HUMIFORTE** (1.5 L/Ha)
- Dose : **0,05 × 1,5 = 0,075 L = 75 mL**

### 📊 Doses standard par produit

| Produit | Dose/Ha | Pour 100 m² | Pour balcon 10 m² |
|---------|---------|-------------|-----------------|
| **HUMIFORTE** | 1.5 L/Ha | 15 mL | 1.5 mL (5mL/L eau) |
| **FOSNUTREN 20** | 1.5 L/Ha | 15 mL | 3 mL/L eau |
| **KADOSTIM 20** | 2 L/Ha | 20 mL | 2 mL/L eau |
| **AMINOL 20** | 1 L/Ha | 10 mL | 2 mL/L eau |
| **NATUR CARE** | 5 L/Ha | 50 mL | 3-5 mL/L arrosage |

### 💧 Volume d'eau recommandé
- Pulvérisateur 15L → couvre environ **750 m²** (diluer selon produit)
- Grande surface 1 Ha → **200-400 L d'eau**

📞 Besoin d'un calcul précis ? **+237 657 39 39 39**` };
  }

  // ── PRIX / COMBIEN ────────────────────────────────────────────────
  if (m.includes('prix') || m.includes('coût') || (m.includes('combien') && (m.includes('produit') || m.includes('litre') || m.includes('sac'))) || m.includes('tarif') || m.includes('budget')) {
    return { intent: 'produit', demo: `## 💰 Tarifs & Formats AGRI POINT SERVICE

Nos biofertilisants sont disponibles en plusieurs formats pour toutes les surfaces.

### 📦 Formats disponibles (selon produit)

| Format | Idéal pour | Prix indicatif |
|--------|-----------|---------------|
| 250 mL | Essai / balcon | ✅ Accessible |
| 500 mL | Petits jardins | ✅ Accessible |
| 1 L | 0.5-1 Ha | ✅ Accessible |
| 5 L | 3-5 Ha | 💰 Économique |
| 20 L | Grande surface | 💰💰 Professionnel |
| 200 L | Coopératives | Sur devis |

### 🌐 Prix en temps réel
Retrouvez les **prix exacts et actualisés** sur :
👉 [https://agri-ps.com/produits](https://agri-ps.com/produits)

### 💡 Astuce économie
- **Lot familial** : 1L × 5 produits → programme complet économique
- **Volume 5L+** : tarif dégressif disponible

📞 Devis grandes quantités : **+237 657 39 39 39**
💬 WhatsApp : **657 39 39 39**` };
  }

  // ── ROI / BÉNÉFICE / GAIN ─────────────────────────────────────────
  if (m.includes('roi') || m.includes('gain') || m.includes('bénéfice') || m.includes('rentable') || m.includes('retour sur invest') || m.includes('revenu') || m.includes('profit') || (m.includes('combien') && (m.includes('gagner') || m.includes('rapport')))) {
    return { intent: 'roi', demo: `## 💰 Calculateur ROI — Retour sur Investissement

### 📈 Gains moyens constatés avec nos produits

| Culture | Rendement actuel | Gain avec AGRI-PS | Revenus supplémentaires |
|---------|-----------------|------------------|------------------------|
| 🍅 Tomate (1 Ha) | 10-15 t/Ha | **+50-80%** | +450 000 - 900 000 FCFA |
| ☕ Café (1 Ha) | 600-800 kg | **+30-40%** | +360 000 - 640 000 FCFA |
| 🍫 Cacao (1 Ha) | 400-600 kg | **+35-45%** | +350 000 - 675 000 FCFA |
| 🌽 Maïs (1 Ha) | 1.5-2 t/Ha | **+40-50%** | +135 000 - 225 000 FCFA |

### 💵 Coût programme complet (1 Ha)
Investissement produits AGRI POINT : **~18 000 FCFA/Ha**

### 🏆 ROI typique
Pour **1 Ha de tomates** :
- Gain supplémentaire brut : **~675 000 FCFA**
- Coût programme : **~18 000 FCFA**
- **ROI : +3 650% !**

> ⚠️ Estimations basées sur résultats moyens terrain. Variables selon conditions.

📞 Simulation personnalisée : **+237 657 39 39 39**
💬 WhatsApp : **657 39 39 39**` };
  }

  // ── BIO / AGRICULTURE BIOLOGIQUE ─────────────────────────────────
  if (m.includes('biologique') || m.includes('bio ') || m.includes('certifi') || m.includes('organique') || m.includes('naturel') || m.includes('sans chimique') || m.includes('pas dangereux') || m.includes('sûr')) {
    return { intent: 'conseil', demo: `## 🌿 Nos Produits sont-ils Biologiques & Sûrs ?

### ✅ Certification & Sécurité
- **NATUR CARE** : 100% certifié Agriculture Biologique — Label MINADER Cameroun
- **Tous nos produits** : Base biologique, **zéro métaux lourds**, zéro synthèse chimique
- **Délai avant récolte** : **Aucun** — pas de restriction de récolte après application
- **Compatibilité AB** : HUMIFORTE, FOSNUTREN, KADOSTIM, AMINOL 20 — tous compatibles agriculture biologique

### 🧤 Précautions d'usage
- Port de **gants** recommandé par précaution lors de l'application
- Conserver à l'abri du soleil, entre **10-35°C**
- **DLC** : 2 ans après fabrication (date sur chaque flacon)

### 🌾 Peut-on les mélanger ?
| Combinaison | Compatible |
|-------------|-----------|
| HUMIFORTE + FOSNUTREN | ✅ Oui |
| AMINOL 20 + tout autre | ✅ Oui |
| NATUR CARE + autres | ❌ Séparément au sol |
| Avec pesticides standard | ✅ Oui (pas alkali) |

📞 **+237 657 39 39 39** | Certification disponible sur demande` };
  }

  // ── COMPARAISON PRODUITS ──────────────────────────────────────────
  if (m.includes('comparaison') || m.includes('comparer') || m.includes('différence') || m.includes('meilleur produit') || m.includes('lequel choisir') || m.includes('quel produit')) {
    return { intent: 'produit', demo: `## ⚖️ Comparatif Complet des Produits AGRI POINT

| Produit | Rôle principal | Phase idéale | Urgence | Urbain |
|---------|---------------|-------------|---------|--------|
| **HUMIFORTE** | Croissance végétative | Végétatif | Faible | ✅ Idéal |
| **FOSNUTREN 20** | Floraison abondante | Floraison | Moyenne | ✅ Bon |
| **KADOSTIM 20** | Qualité des fruits | Post-floraison | Faible | ⚠️ Peu utile |
| **AMINOL 20** | Anti-stress urgent | TOUT stade | 🚨 Urgent | ✅ Oui |
| **NATUR CARE** | Restauration sol | Hors saison/sol | Prévention | ✅ Idéal |

### 📝 La règle des 5 étapes
Végétatif → **HUMIFORTE**
Floraison → **FOSNUTREN 20**
Post-floraison → **KADOSTIM 20**
Urgence/Stress → **AMINOL 20**
Restauration sol → **NATUR CARE**

### 🌱 Programme starter recommandé
Pour débuter : **HUMIFORTE + FOSNUTREN + AMINOL 20** (les 3 essentiels)

📞 Conseil personnalisé : **+237 657 39 39 39**
🛒 [Comparer & Commander](https://agri-ps.com/produits)` };
  }

  // ── SAISON / CALENDRIER ───────────────────────────────────────────
  if (m.includes('saison') || m.includes('calendrier') || m.includes('quand') || m.includes('maintenant') || m.includes('actuellement') || m.includes('ce mois')) {
    return { intent: 'conseil', demo: `## 🌤️ Conseils Saisonniers & Calendrier Cultural 2026

### 📅 Saison actuelle au Cameroun (Fév 2026)
**Petite Saison Sèche** → Priorité : **NATUR CARE** pour restaurer et préparer vos sols avant les pluies

---

### 📆 Calendrier Cultural Complet 2026

| Période | Saison | Actions & Produits |
|---------|--------|-------------------|
| Jan–Fév | Petite saison sèche | **NATUR CARE** restauration sol + préparation |
| Mar–Avr | Grande saison pluies | **HUMIFORTE** végétatif + **AMINOL** préventif |
| Mai–Juin | Grande saison pluies | **FOSNUTREN** floraison |
| Juil–Août | Grande saison sèche | 🚨 **AMINOL 20** anti-stress OBLIGATOIRE |
| Sept–Oct | Petite saison pluies | **KADOSTIM** post-floraison |
| Nov–Déc | Petite saison sèche | **NATUR CARE** sol + bilan campagne |

### 💡 Règle d'or
Ne jamais attendre les symptômes en saison sèche → agir **préventivement** en juin.

📞 **+237 657 39 39 39** pour un calendrier personnalisé à votre région` };
  }

  // ── FORMATIONS / ÉVÉNEMENTS ───────────────────────────────────────
  if (m.includes('formation') || m.includes('événement') || m.includes('evenement') || m.includes('webinaire') || m.includes('foire') || m.includes('séminaire') || m.includes('agenda')) {
    return { intent: 'navigation', demo: `## 📅 Formations & Événements AGRI POINT SERVICE

### 🗓️ Types d'événements disponibles
- 🌾 **Formations terrain** — Par région, sur inscription
- 🌐 **Webinaires mensuels** — En ligne, 1er vendredi du mois
- 🏪 **Foires agricoles** — Yaoundé, Douala, Bafoussam
- 👥 **Sessions coopératives** — Gratuites pour groupes de 10+

### 📋 Programme formations
| Type | Durée | Public cible | Coût |
|------|-------|-------------|------|
| Introduction biofertilisants | 2h | Tous | Gratuit |
| Fertilisation globale | 1 jour | Agriculteurs | Gratuit (groupes) |
| Agriculture urbaine | 3h | Citadins | Gratuit |
| Programme certifié MINADER | 3 jours | Professionnels | Sur devis |

### 📍 Inscription & Programme
👉 [Voir le calendrier complet](https://agri-ps.com/evenements)

📞 Réserver une formation : **+237 657 39 39 39**
💬 WhatsApp : **657 39 39 39**` };
  }

  // ── DISTRIBUTEUR / REVENDEUR ──────────────────────────────────────
  if (m.includes('distributeur') || m.includes('revendeur') || m.includes('revendre') || m.includes('point de vente') || m.includes('partenaire') || m.includes('agence') || m.includes('représentant') || m.includes('devenir')) {
    return { intent: 'navigation', demo: `## 🤝 Devenir Distributeur / Revendeur AGRI POINT

### ✅ Avantages partenaires
- 💰 **Prix préférentiels** : remise 15-25% sur commandes
- 📚 **Formation produits gratuite** (2 jours)
- 🎯 **Support commercial dédié** — conseiller attitré
- 📣 **Visibilité** sur notre site (carte des revendeurs)

### 📋 Critères d'éligibilité
- Volume minimum : **200 000 FCFA/mois**
- Espace de **stockage** adapté
- Couverture d'une zone géographique définie

### 📍 Nos agences actuelles
| Ville | Contact |
|-------|---------|
| Yaoundé (siège) | +237 657 39 39 39 |
| Douala | +237 657 39 39 39 |
| Bafoussam | +237 657 39 39 39 |
| Garoua | +237 657 39 39 39 |

### 📲 Candidature
📧 **commercial@agri-ps.com**
📞 **+237 657 39 39 39** — Demander le Service Commercial` };
  }

  // ── À PROPOS / HISTOIRE ───────────────────────────────────────────
  if (m.includes('à propos') || m.includes('a propos') || m.includes('qui êtes') || m.includes('qui etes') || m.includes('histoire') || m.includes('entreprise') || m.includes('fondé') || m.includes('depuis quand') || m.includes('agri point')) {
    return { intent: 'navigation', demo: `## 🌿 AGRI POINT SERVICE — Notre Histoire

### ✨ Qui sommes-nous ?
**AGRI POINT SERVICE** est une entreprise camerounaise fondée en **2010**, spécialisée dans les **biofertilisants** et solutions de fertilisation agricole.

**Slogan** : *"Produire plus, Gagner plus, Mieux vivre"*

### 📊 AGRI POINT en chiffres
| Indicateur | Chiffre |
|-----------|--------|
| Années d'expérience | **15 ans** (depuis 2010) |
| Agriculteurs accompagnés | **50 000+** |
| Taux de satisfaction client | **98%** |
| Couverture géographique | **10 régions** sur 10 |

### 🎯 Vision 2030
- Atteindre **1 million d'agriculteurs**
- S'étendre dans **20 pays africains**

### 📍 Siège social
B.P. 5111 Yaoundé, Quartier Fouda, Cameroun
📞 +237 657 39 39 39 | ✉️ infos@agri-ps.com

👉 [En savoir plus](https://agri-ps.com/a-propos)` };
  }

  // ── CONTACT / TÉLÉPHONE ───────────────────────────────────────────
  if (m.includes('contact') || m.includes('téléphone') || m.includes('appeler') || m.includes('email') || m.includes('whatsapp') || m.includes('joindre') || m.includes('service client') || m.includes('adresse') || m.includes('horaire')) {
    return { intent: 'navigation', demo: `## 📞 Nous Contacter — Tous les Canaux

### 📱 Contact direct
| Canal | Contact | Disponibilité |
|-------|---------|-------------|
| 📞 Téléphone | **+237 657 39 39 39** | Lun-Sam 7h30-18h30 |
| 💬 WhatsApp | **+237 676 026 601** | Lun-Sam + Dim urgent |
| ✉️ Email général | **infos@agri-ps.com** | Réponse 24-48h |
| 🌐 Site web | **www.agri-ps.com** | 24h/24 |

### 🎯 Contacts spécialisés
| Département | Email | Motif |
|-------------|-------|-------|
| 🤝 Service Client | support@agri-ps.com | Commandes, livraisons |
| 🌾 Conseil Agricole | conseil@agri-ps.com | Questions techniques |
| 🤝 Partenariats | commercial@agri-ps.com | Devenir revendeur |

### 📍 Siège — Yaoundé
B.P. 5111, Quartier Fouda, Cameroun

### 🌐 Formulaire de contact
👉 [https://agri-ps.com/contact](https://agri-ps.com/contact)` };
  }

  // ── CGV / CGU / MENTIONS LÉGALES ─────────────────────────────────
  if (m.includes('cgv') || m.includes('cgu') || (m.includes('condition') && (m.includes('vente') || m.includes('utilisation'))) || m.includes('mentions légales') || m.includes('confidentialité') || m.includes('données') || m.includes('rgpd')) {
    return { intent: 'navigation', demo: `## 📋 Informations Légales — AGRI POINT SERVICE

### 📄 Documents légaux disponibles
| Document | Lien |
|----------|------|
| **CGV** | [/cgv](https://agri-ps.com/cgv) |
| **CGU** | [/cgu](https://agri-ps.com/cgu) |
| **Confidentialité** | [/confidentialite](https://agri-ps.com/confidentialite) |
| **Mentions légales** | [/mentions-legales](https://agri-ps.com/mentions-legales) |

### 🔒 Vos droits (données personnelles)
- **Droit d'accès** à vos données
- **Droit de rectification** et suppression
- **Opposition** à la prospection commerciale

Demande : **privacy@agri-ps.com**

**AGRI POINT SERVICE SAS** — B.P. 5111 Yaoundé, Cameroun
📞 **+237 657 39 39 39** | ✉️ infos@agri-ps.com` };
  }

  // ── CATALOGUE / BOUTIQUE ──────────────────────────────────────────
  if (m.includes('boutique') || m.includes('catalogue') || m.includes('tous les produits') || m.includes('voir les produits') || m.includes('shop')) {
    return { intent: 'produit', demo: `## 🛒 Catalogue AGRI POINT SERVICE

### Nos 5 Biofertilisants

| Produit | Rôle | Formats |
|---------|------|---------|
| 🌿 **HUMIFORTE** | Croissance végétative | 250mL → 20L |
| 🌸 **FOSNUTREN 20** | Floraison abondante | 500mL → 20L |
| 🍅 **KADOSTIM 20** | Qualité des fruits | 1L → 20L |
| 💪 **AMINOL 20** | Anti-stress urgent | 500mL → 5L |
| 🌍 **NATUR CARE** | Restauration sol | 1L → 200L |

### 🔍 Accéder au catalogue complet
👉 **[https://agri-ps.com/produits](https://agri-ps.com/produits)**

### 💡 Pas sûr de votre besoin ?
Dites-moi votre **culture** et votre **problème** — je vous recommande le produit exact !

📞 **+237 657 39 39 39** | 💬 WhatsApp **657 39 39 39**` };
  }

  // ── PILIERS / PRODUIRE PLUS / GAGNER PLUS / MIEUX VIVRE ──────────
  if (m.includes('produire plus') || m.includes('augmenter rendement') || m.includes('gagner plus') || m.includes('revenu agricole') || m.includes('mieux vivre') || m.includes('qualité de vie')) {
    return { intent: 'conseil', demo: `## 🚀 Les 3 Piliers AGRI POINT SERVICE

### 📈 [Produire Plus](https://agri-ps.com/produire-plus)
Augmenter vos rendements de **+40% à +150%** grâce aux biofertilisants.
→ Programme de fertilisation adapté à chaque culture
→ Diagnostic sol + calendrier personnalisé

### 💰 [Gagner Plus](https://agri-ps.com/gagner-plus)
Optimiser vos **revenus agricoles** par hectare.
→ Meilleure qualité = meilleur prix de vente
→ Calcul ROI gratuit avec nos conseillers

### 🏡 [Mieux Vivre](https://agri-ps.com/mieux-vivre)
Améliorer la **qualité de vie** des agriculteurs et de leur famille.
→ Moins de travail manuel (produits liquides faciles)
→ Agriculture durable sans risque sanitaire

---

Dites-moi votre **situation** (surface, culture, objectif) et je vous guide vers la solution idéale !

📞 **+237 657 39 39 39**` };
  }

  // ── RÉPONSE PAR DÉFAUT — Accueil + Guidance ───────────────────────
  return { intent: 'conseil', demo: `## Bonjour ! Je suis **l'Assistant d'Agri Point Services** 🌿

Votre conseiller expert AGRI POINT — **15 ans d'expertise agricole** au Cameroun.

### 🎯 Je peux vous aider sur :

| Sujet | Exemples |
|-------|---------|
| 🌾 **Cultures** | Tomate, cacao, café, maïs, légumes, agrumes... |
| 💊 **Produits** | HUMIFORTE, FOSNUTREN, KADOSTIM, AMINOL, NATUR CARE |
| 🧮 **Calculs** | Doses, surfaces, volumes d'eau, ROI |
| 🛒 **Boutique** | Commander, suivre, payer, livraison |
| 🏙️ **Ville** | Agriculture urbaine, balcon, terrasse |
| 🌾 **Campagne** | Offres spéciales Mars 2026 |
| 👤 **Compte** | Inscription, connexion, profil |
| 🚨 **Urgence** | Diagnostic rapide, traitement immédiat |

### 💬 Exemples de questions
- *"Quel programme pour mes tomates sur 500 m² ?"*
- *"Comment m'inscrire à la campagne engrais ?"*
- *"Mes plantes sont jaunes, que faire ?"*
- *"Combien puis-je gagner avec HUMIFORTE sur 2 Ha ?"*

---

📞 **+237 657 39 39 39** | 💬 **WhatsApp 657 39 39 39** | Lun-Sam 7h30-18h30` };
}


