/**
 * Script de correction des accents perdus dans 3 fichiers
 * Les ? représentent des caractères accentués français perdus lors du commit initial
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// ─── Corrections pour app/a-propos/page.tsx ──────────────────
const aProposReplacements = [
  // Hero
  ["? PROPOS D'AGRI POINT", "À PROPOS D'AGRI POINT"],
  ["une ferme ? la fois", "une ferme à la fois"],
  ["vers la prosp?rit? avec", "vers la prospérité avec"],
  ["Agriculteurs accompagn?s", "Agriculteurs accompagnés"],
  ["d?veloppons continuellem", "développons continuellem"],
  ["Agriculteurs accompagn?s", "Agriculteurs accompagnés"],
  ["D'expertise terrain", "D'expertise terrain"],
  ["R?gions couvertes", "Régions couvertes"],
  ["accessible ? tous les agriculteurs africains", "accessible à tous les agriculteurs africains"],
  ["quelle que soit la taille", "quelle que soit la taille"],
  // Mission points
  ["production gr?ce ? des biofertilisants", "production grâce à des biofertilisants"],
  ["Am?liorer les revenus", "Améliorer les revenus"],
  ["solutions ?conomiques et des conseils personnalis?s", "solutions économiques et des conseils personnalisés"],
  ["Prot?ger l'environnement", "Protéger l'environnement"],
  ["r?g?n?ratrice des sols", "régénératrice des sols"],
  ["Renforcer les communaut?s", "Renforcer les communautés"],
  ["acc?s ? la sant? et l'?ducation", "accès à la santé et l'éducation"],
  // Vision 2030
  ["accompagner 1 million d'agriculteurs africains vers l'autosuffisance alimentaire", "accompagner 1 million d'agriculteurs africains vers l'autosuffisance alimentaire"],
  ["1 million d'agriculteurs accompagn?s", "1 million d'agriculteurs accompagnés"],
  ["100% agriculture biologique certifi?e", "100% agriculture biologique certifiée"],
  ["50 000 emplois cr??s dans l'agritech", "50 000 emplois créés dans l'agritech"],
  // Valeurs
  ["Nous d?veloppons continuellement", "Nous développons continuellement"],
  ["adapt?es aux r?alit?s africaines", "adaptées aux réalités africaines"],
  ["bien-?tre des agriculteurs", "bien-être des agriculteurs"],
  ["Durabilit?", "Durabilité"],
  ["g?n?rations futures", "générations futures"],
  ["agriculture r?g?n?ratrice", "agriculture régénératrice"],
  ["Int?grit?", "Intégrité"],
  ["r?sultats. Pas de promesses", "résultats. Pas de promesses"],
  ["pouvoir des communaut?s", "pouvoir des communautés"],
  ["partenariats gagnant-gagnant", "partenariats gagnant-gagnant"],
  ["Qualit? sans compromis", "Qualité sans compromis"],
  // Timeline
  ["Cr?ation ? Yaound?", "Création à Yaoundé"],
  ["d?mocratiser l'agriculture", "démocratiser l'agriculture"],
  ["biofertilisants d?velopp?s localement, test?s", "biofertilisants développés localement, testés"],
  ["agences r?gionales. 10 000", "agences régionales. 10 000"],
  ["assurance sant?, micro-cr?dit", "assurance santé, micro-crédit"],
  ["?pargne pour nos adh?rents", "épargne pour nos adhérents"],
  ["R?volution Digitale", "Révolution Digitale"],
  ["Conseils agricoles par SMS", "Conseils agricoles par SMS"],
  ["Application mobile lanc?e.", "Application mobile lancée."],
  ["Leader R?gional", "Leader Régional"],
  ["pr?sence dans 10 r?gions", "présence dans 10 régions"],
  ["expansion vers les pays voisins", "expansion vers les pays voisins"],
  // Team
  ["Notre ?quipe", "Notre équipe"],
  ["Experts passionn?s au service", "Experts passionnés au service"],
  ["Fondateur & Directeur G?n?ral", "Fondateur & Directeur Général"],
  ["PhD en Sciences du Sol. 20 ans d'exp?rience", "PhD en Sciences du Sol. 20 ans d'expérience"],
  ["agriculture biologique", "agriculture biologique"],
  ["Sp?cialiste biofertilisants, ancienne chercheuse ? l'IRAD", "Spécialiste biofertilisants, ancienne chercheuse à l'IRAD"],
  ["Expert en d?veloppement rural", "Expert en développement rural"],
  ["Sp?cialiste micro-finance", "Spécialiste micro-finance"],
  // Certifications
  ["certifi?s agriculture biologique", "certifiés agriculture biologique"],
  ["qualit? certifi?", "qualité certifié"],
  ["Label Commerce ?quitable", "Label Commerce équitable"],
  ["certifi?s ?quitables", "certifiés équitables"],
  ["Familles assur?es", "Familles assurées"],
  ["Terres r?g?n?r?es", "Terres régénérées"],
  // Contact
  ["Yaound?, Cameroun", "Yaoundé, Cameroun"],
  ["Quartier Fouda ? B.P.", "Quartier Fouda — B.P."],
  ["ce qui guide chaque d?cision", "ce qui guide chaque décision"],
  ["Ce qui guide chaque d?cision", "Ce qui guide chaque décision"],
  ["Certifications & R?compenses", "Certifications & Récompenses"],
  ["Des r?sultats concrets", "Des résultats concrets"],
  ["AGRI POINT SERVICES SARL ? Yaound?", "AGRI POINT SERVICES SARL — Yaoundé"],
  ["T?l?phone", "Téléphone"],
  ["cr?ons un avenir prosp?re", "créons un avenir prospère"],
  ["Devenir Adh?rent", "Devenir Adhérent"],
  ["D?couvrir nos produits", "Découvrir nos produits"],
  ["Satisfaction client", "Satisfaction client"],
];

// ─── Corrections pour app/gagner-plus/page.tsx ───────────────
const gagnerPlusReplacements = [
  ["Rentabilit? Maximale Garantie", "Rentabilité Maximale Garantie"],
  ["Triplez vos b?n?fices agricoles", "Triplez vos bénéfices agricoles"],
  ["Transformez votre activit? agricole", "Transformez votre activité agricole"],
  ["R?duisez vos co?ts de 60%", "Réduisez vos coûts de 60%"],
  ["augmentez vos reven", "augmentez vos reven"],
  ['"Co?ts de production"', '"Coûts de production"'],
  ["Co?ts de production", "Coûts de production"],
  ["R?duction drastique des co?ts", "Réduction drastique des coûts"],
  ["?conomisez 60% sur les engrais chimiques", "Économisez 60% sur les engrais chimiques"],
  ["R?duisez vos besoins en eau", "Réduisez vos besoins en eau"],
  ["Moins de traitements phytosa", "Moins de traitements phytosa"],
  ["Revenus multipli?s", "Revenus multipliés"],
  ["sup?rieurs gr?ce au label BIO", "supérieurs grâce au label BIO"],
  ["Rendements doubl?s ou tripl?s", "Rendements doublés ou triplés"],
  ["Deux ? trois r?coltes par an", "Deux à trois récoltes par an"],
  ["Acc?s aux march?s premium", "Accès aux marchés premium"],
  ["Certification bio facilit?e", "Certification bio facilitée"],
  ["Contrats avec acheteurs internationaux", "Contrats avec acheteurs internationaux"],
  ["Exportation vers l'Europe et l'Am?riq", "Exportation vers l'Europe et l'Amériq"],
  ["Investissement rentabilis? en 6 mois", "Investissement rentabilisé en 6 mois"],
  ["B?n?fices d?s la premi?re r?colte", "Bénéfices dès la première récolte"],
  ["Accompagnement financier disponib", "Accompagnement financier disponib"],
  ["Simulation bas?e sur les r?sultats r?els", "Simulation basée sur les résultats réels"],
  ['"ma?s"', '"maïs"'],
  ["culture: \"ma?s\"", "culture: \"maïs\""],
  ["{ value: \"ma?s\"", "{ value: \"maïs\""],
  ["label: \"Ma?s\"", "label: \"Maïs\""],
  ["Ma?s", "Maïs"],
  ["ma?s", "maïs"],
  ["J'ai tripl? mes revenus", "J'ai triplé mes revenus"],
  ["gr?ce ? leur qualit?", "grâce à leur qualité"],
  ["C?lestine Mballa", "Célestine Mballa"],
  ["Yaound?, Centre", "Yaoundé, Centre"],
  ["Mara?chage", "Maraîchage"],
  ["grands restaurants et h?tels", "grands restaurants et hôtels"],
  ["Ma production bio se vend", "Ma production bio se vend"],
  ["Caf? Arabica", "Café Arabica"],
  ["Mon caf? est export? en Europe", "Mon café est exporté en Europe"],
  ["Strat?gies de Mon?tisation", "Stratégies de Monétisation"],
  ["Acc?s march?s premium", "Accès marchés premium"],
  ["Supprimez les interm?diaires", "Supprimez les intermédiaires"],
  ["R?seau de clients directs", "Réseau de clients directs"],
  ["Livraison organis?e", "Livraison organisée"],
  ["Paiement s?curis?", "Paiement sécurisé"],
  ["Cultures ? Haute Valeur", "Cultures à Haute Valeur"],
  ["Analyse de march?", "Analyse de marché"],
  ["Acc?s semences premium", "Accès semences premium"],
  ["Techniques sp?cialis?es", "Techniques spécialisées"],
  ["Agriculteur prosp?re", "Agriculteur prospère"],
  ["positionn? pour ne pas chevaucher", "positionné pour ne pas chevaucher"],
  ["Surface cultiv?e (hectares)", "Surface cultivée (hectares)"],
  ["Surface cultiv?e en hectares", "Surface cultivée en hectares"],
  ["Histoires de R?ussite", "Histoires de Réussite"],
  ["Ils ont transform? leurs revenus", "Ils ont transformé leurs revenus"],
  ["Apr?s", "Après"],
  ["Produits rentables s?lectionn?s", "Produits rentables sélectionnés"],
  ["Commencez ? Gagner Plus", "Commencez à Gagner Plus"],
  ["Plus de 15 000 agriculteurs ont d?j? multipli?", "Plus de 15 000 agriculteurs ont déjà multiplié"],
];

// ─── Corrections pour app/mieux-vivre/page.tsx ───────────────
const mieuxVivreReplacements = [
  ["Votre Bien-?tre, Notre Priorit?", "Votre Bien-être, Notre Priorité"],
  ["Transformez votre qualit? de vie", "Transformez votre qualité de vie"],
  ["services essentiels : sant?, ?ducation", "services essentiels : santé, éducation"],
  ["logement, ?pargne et technologies", "logement, épargne et technologies"],
  ["B?tissez un avenir pr", "Bâtissez un avenir pr"],
  ["D?couvrir les services", "Découvrir les services"],
  ["Calculer mon ?pargne", "Calculer mon épargne"],
  ["Familles accompagn?es", "Familles accompagnées"],
  ["FCFA ?pargn?s/famille", "FCFA épargnés/famille"],
  ["Sant? & Protection", "Santé & Protection"],
  ["Micro-assurance sant? accessible", "Micro-assurance santé accessible"],
  ["Couverture d?c?s et invalidit?", "Couverture décès et invalidité"],
  ["Acc?s aux soins de qualit? ? prix r?duit", "Accès aux soins de qualité à prix réduit"],
  ["Assurance sant? familiale d?s 5 000", "Assurance santé familiale dès 5 000"],
  ["Assurance d?c?s jusqu'? 2 millions", "Assurance décès jusqu'à 2 millions"],
  ["cliniques de qualit?", "cliniques de qualité"],
  ["?pargne & Micro-cr?dit", "Épargne & Micro-crédit"],
  ["Solutions d'?pargne s?curis?es", "Solutions d'épargne sécurisées"],
  ["Cr?dits agricoles accessibles", "Crédits agricoles accessibles"],
  ["Warrantage pour s?curiser vos r?coltes", "Warrantage pour sécuriser vos récoltes"],
  ["?pargne avec int?r?ts de 6% par an", "Épargne avec intérêts de 6% par an"],
  ["Micro-cr?dit jusqu'? 5 millions", "Micro-crédit jusqu'à 5 millions"],
  ["Warrantage des stocks apr?s r?colte", "Warrantage des stocks après récolte"],
  ["?ducation", "Éducation"],
  ["Formation continue pour vous et vos enfants", "Formation continue pour vous et vos enfants"],
  ["Bourses d'?tudes.", "Bourses d'études."],
  ["Alphab?tisation num?rique", "Alphabétisation numérique"],
  ["Bourses d'?tudes pour enfants d'adh?rents", "Bourses d'études pour enfants d'adhérents"],
  ["Cours d'alphab?tisation et calcul", "Cours d'alphabétisation et calcul"],
  ["maisons am?lior?es", "maisons améliorées"],
  ["Cr?dit habitat", "Crédit habitat"],
  ["?lectrification solaire", "Électrification solaire"],
  ["Cr?dit habitat jusqu'? 10 millions", "Crédit habitat jusqu'à 10 millions"],
  ["Plans de maisons rurales optimis?es", "Plans de maisons rurales optimisées"],
  ["Kits solaires avec paiement ?chelonn?", "Kits solaires avec paiement échelonné"],
  ["Mat?riaux de construction ? prix r?duits", "Matériaux de construction à prix réduits"],
  ["technologies agricoles modernes", "technologies agricoles modernes"],
  ["T?l?phones intelligents", "Téléphones intelligents"],
  ["Smartphones pour agriculteurs ? cr?dit", "Smartphones pour agriculteurs à crédit"],
  ["Applications mobiles gratuites (m?t?o, prix)", "Applications mobiles gratuites (météo, prix)"],
  ["Formation num?rique et internet", "Formation numérique et internet"],
  ["Aide d'urgence. Soutien aux personnes ?g?es", "Aide d'urgence. Soutien aux personnes âgées"],
  ["Fonds d'urgence pour impr?vus", "Fonds d'urgence pour imprévus"],
  ["Soutien financier fun?railles", "Soutien financier funérailles"],
  ["Accompagnement des a?n?s", "Accompagnement des aînés"],
  ["Plans d'?pargne", "Plans d'épargne"],
  ["?pargne Libre", "Épargne Libre"],
  ["Retrait ? tout moment", "Retrait à tout moment"],
  ["Int?r?ts mensuels", "Intérêts mensuels"],
  ["Carte d'?pargne gratuite", "Carte d'épargne gratuite"],
  ["?pargne Programm?e", "Épargne Programmée"],
  ["Cotisations r?guli?res", "Cotisations régulières"],
  ["Pr?l?vement automatique", "Prélèvement automatique"],
  ["Bonus fid?lit?", "Bonus fidélité"],
  ["?pargne Projet", "Épargne Projet"],
  ["Pour r?aliser vos r?ves", "Pour réaliser vos rêves"],
  ["Objectif personnalis?", "Objectif personnalisé"],
  ["Cr?dit compl?mentaire possible", "Crédit complémentaire possible"],
  ["Assurance ?pargne incluse", "Assurance épargne incluse"],
  ["Assurance Sant?", "Assurance Santé"],
  ["Gr?ce ? l'assurance sant?, j'ai pu faire op?rer", "Grâce à l'assurance santé, j'ai pu faire opérer"],
  ["sans m'endetter. C'est un soulagement", "sans m'endetter. C'est un soulagement"],
  ["850 000 FCFA ?conomis?s", "850 000 FCFA économisés"],
  ["Yaound?", "Yaoundé"],
  ["?pargne & Cr?dit", "Épargne & Crédit"],
  ["J'ai ?pargn? 3 millions en 2 ans", "J'ai épargné 3 millions en 2 ans"],
  ["J'ai obtenu un cr?dit pour agrandir", "J'ai obtenu un crédit pour agrandir"],
  ["3 000 000 FCFA ?pargn?s", "3 000 000 FCFA épargnés"],
  ["avec le cr?dit habitat", "avec le crédit habitat"],
  ["Mes enfants ont maintenant un toit s?r", "Mes enfants ont maintenant un toit sûr"],
  ["Comment adh?rer aux services", "Comment adhérer aux services"],
  ["L'adh?sion est simple et gratuite", "L'adhésion est simple et gratuite"],
  ["agence la plus proche ave", "agence la plus proche ave"],
  ["montant minimum pour ouvrir une ?pargne", "montant minimum pour ouvrir une épargne"],
  ["Vous pouvez commencer ? ?pargner", "Vous pouvez commencer à épargner"],
  ["Comment fonctionne l'assurance sant?", "Comment fonctionne l'assurance santé"],
  ["Cotisation mensuelle de 5 000 FCFA par personne", "Cotisation mensuelle de 5 000 FCFA par personne"],
  ["Puis-je obtenir un cr?dit agricole", "Puis-je obtenir un crédit agricole"],
  ["vous pouvez acc?der ? un cr?dit de 2 ? 5", "vous pouvez accéder à un crédit de 2 à 5"],
  ["Un accompagnement complet pour votre ?panouissement", "Un accompagnement complet pour votre épanouissement"],
  ["? partir de", "À partir de"],
  ["Taux d", "Taux d"],
  ["int?r?t", "intérêt"],
  ["Ouvrir une ?pargne", "Ouvrir une épargne"],
  ["T?moignages qui changent des vies", "Témoignages qui changent des vies"],
  ["Questions Fr?quentes", "Questions Fréquentes"],
  ["Solutions pratiques pour am?liorer votre quotidien", "Solutions pratiques pour améliorer votre quotidien"],
  ["Commencez ? Mieux Vivre", "Commencez à Mieux Vivre"],
  ["25 000+ familles qui ont transform?", "25 000+ familles qui ont transformé"],
  ["Adh?rer maintenant", "Adhérer maintenant"],
];

function applyReplacements(content, replacements, filename) {
  let result = content;
  let count = 0;
  for (const [from, to] of replacements) {
    if (result.includes(from)) {
      result = result.split(from).join(to);
      count++;
    }
  }
  return { result, count };
}

const files = [
  ['app/a-propos/page.tsx', aProposReplacements],
  ['app/gagner-plus/page.tsx', gagnerPlusReplacements],
  ['app/mieux-vivre/page.tsx', mieuxVivreReplacements],
];

for (const [relPath, replacements] of files) {
  const fullPath = path.join(ROOT, relPath);
  const original = fs.readFileSync(fullPath, 'utf8');
  const { result, count } = applyReplacements(original, replacements, relPath);
  fs.writeFileSync(fullPath, result, 'utf8');
  
  // Count remaining ? marks in visible strings
  const lines = result.split('\n');
  let remaining = 0;
  lines.forEach(l => {
    const t = l.trimStart();
    if (!t.startsWith('//') && !t.startsWith('*') && l.includes('?')) remaining++;
  });
  
  console.log(`${relPath}: ${count} replacements applied, ${remaining} lines still have '?'`);
}
