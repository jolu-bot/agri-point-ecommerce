// ═══════════════════════════════════════════════════════════════════
// CALENDRIER CULTURAL CAMEROUN — Données par culture et région
// ═══════════════════════════════════════════════════════════════════

export interface CulturalMonth {
  month: number;       // 1-12
  label: string;       // "Jan", "Fév"...
  activities: string[];// ["Semis", "Fertilisation", "Récolte"...]
  intensity: 'none' | 'low' | 'medium' | 'high'; // niveau activité
  alert?: string;      // Alerte spécifique si besoin
}

export interface CropCalendar {
  crop: string;
  emoji: string;
  regions: {
    [region: string]: CulturalMonth[];
  };
  products: Array<{ name: string; slug: string; usecase: string }>;
}

const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function mkMonth(month: number, activities: string[], intensity: CulturalMonth['intensity'], alert?: string): CulturalMonth {
  return { month, label: MONTHS_FR[month - 1], activities, intensity, alert };
}

// --- TOMATE -------------------------------------------------------
const tomateCalendar: CropCalendar = {
  crop: 'Tomate',
  emoji: '🍅',
  products: [
    { name: 'HUMIFORTE', slug: 'humiforte', usecase: 'Stimulant racinaire — au repiquage' },
    { name: 'FOSNUTREN', slug: 'fosnutren-20', usecase: 'Fructification — à la floraison' },
    { name: 'KADOSTIM', slug: 'kadostim-20', usecase: 'Anti-stress — en saison sèche' },
    { name: 'NATUR CARE', slug: 'natur-care', usecase: 'Protection foliaire — préventif' },
  ],
  regions: {
    Centre: [
      mkMonth(1, ['Pépinière S1', 'Arrosage régulier'], 'medium'),
      mkMonth(2, ['Pépinière S2', 'Enrichissement sol'], 'medium'),
      mkMonth(3, ['Repiquage', 'HUMIFORTE J0', 'Tuteurage'], 'high'),
      mkMonth(4, ['Fertilisation FOSNUTREN', 'Traitement préventif', 'Irrigation'], 'high'),
      mkMonth(5, ['Floraison — FOSNUTREN x2', 'Surveillance maladies'], 'high', '🌧️ Pluies fortes → mildiou'),
      mkMonth(6, ['Récolte S1', 'Compostage post-récolte'], 'high'),
      mkMonth(7, ['Repos ou prépa S2'], 'low'),
      mkMonth(8, ['Préparation sol S2'], 'low'),
      mkMonth(9, ['Pépinière S2', 'Paillage'], 'medium'),
      mkMonth(10, ['Repiquage S2', 'HUMIFORTE', 'Fertilisation'], 'high'),
      mkMonth(11, ['Floraison — FOSNUTREN', 'Traitement fongique'], 'high', '🌧️ Fin pluies → pourriture'),
      mkMonth(12, ['Récolte S2', 'Bilan + planification'], 'high'),
    ],
    Littoral: [
      mkMonth(1, ['Saison sèche — Arrosage intensif', 'Pépinière'], 'medium'),
      mkMonth(2, ['Repiquage', 'HUMIFORTE', 'Mulching indispensable'], 'high'),
      mkMonth(3, ['Fertilisation intensive', 'Floraison'], 'high'),
      mkMonth(4, ['Récolte', 'Prévention mildiou'], 'high', '☔ Début pluies → drainage'),
      mkMonth(5, ['Pluies fortes — Drainage', 'Anti-fongique'], 'medium', '⚠️ Risque mildiou élevé'),
      mkMonth(6, ['Repos'], 'none'),
      mkMonth(7, ['Pépinière S2'], 'medium'),
      mkMonth(8, ['Repiquage S2', 'HUMIFORTE'], 'high'),
      mkMonth(9, ['Fertilisation', 'Floraison FOSNUTREN'], 'high'),
      mkMonth(10, ['Récolte S2'], 'high'),
      mkMonth(11, ['Post-récolte'], 'low'),
      mkMonth(12, ['Préparation S1'], 'low'),
    ],
    Ouest: [
      mkMonth(1, [], 'none'),
      mkMonth(2, [], 'none'),
      mkMonth(3, ['Début saison — Pépinière', 'Préparation sol'], 'medium'),
      mkMonth(4, ['Repiquage', 'HUMIFORTE', 'Irrigation complémentaire'], 'high'),
      mkMonth(5, ['Fertilisation', 'FOSNUTREN floraison'], 'high'),
      mkMonth(6, ['Récolte S1'], 'high'),
      mkMonth(7, ['Post-récolte', 'Engrais vert'], 'low'),
      mkMonth(8, ['Préparation sol S2'], 'medium'),
      mkMonth(9, ['Pépinière S2', 'Compostage'], 'medium'),
      mkMonth(10, ['Repiquage S2', 'HUMIFORTE'], 'high'),
      mkMonth(11, ['Floraison FOSNUTREN', 'Buttage'], 'high'),
      mkMonth(12, ['Récolte S2', 'Bilan'], 'high'),
    ],
    Nord: [
      mkMonth(1, ['Irrigation obligatoire', 'Mulching'], 'medium'),
      mkMonth(2, ['Pépinière sous ombrage', 'Arrosage matin'], 'medium'),
      mkMonth(3, ['Repiquage matinal', 'HUMIFORTE + KADOSTIM'], 'high', '🌡️ Chaleur max → KADOSTIM anti-stress'),
      mkMonth(4, ['Fertilisation intensive', 'Ombrage partiel'], 'high'),
      mkMonth(5, ['Récolte S1', 'Compostage'], 'high'),
      mkMonth(6, ['Début pluies — Pépinière S2'], 'medium'),
      mkMonth(7, ['Repiquage pluvial', 'Sans irrigation'], 'high'),
      mkMonth(8, ['Fertilisation', 'Floraison FOSNUTREN'], 'high'),
      mkMonth(9, ['Récolte S2', 'Stockage'], 'high'),
      mkMonth(10, ['Repos'], 'none'),
      mkMonth(11, [], 'none'),
      mkMonth(12, [], 'none'),
    ],
  },
};

// --- CACAO -------------------------------------------------------
const cacaoCalendar: CropCalendar = {
  crop: 'Cacao',
  emoji: '🍫',
  products: [
    { name: 'HUMIFORTE', slug: 'humiforte', usecase: 'Racinaire — début saison des pluies' },
    { name: 'FOSNUTREN', slug: 'fosnutren-20', usecase: 'Floraison — stimule cabosses' },
    { name: 'AMINOL FORTE', slug: 'aminol-20', usecase: 'Vigueur foliaire — toute l\'année' },
    { name: 'NATUR CARE', slug: 'natur-care', usecase: 'Protection — anti-pourriture brune' },
  ],
  regions: {
    Centre: [
      mkMonth(1, ['Taille légère', 'Désherbage'], 'low'),
      mkMonth(2, ['Fertilisation HUMIFORTE', 'Eveil végétatif'], 'medium'),
      mkMonth(3, ['Grande floraison', 'FOSNUTREN', 'Surveillance mirides'], 'high'),
      mkMonth(4, ['Formation cabosses', 'Traitement préventif NATUR CARE'], 'high', '⚠️ Risque pourriture brune'),
      mkMonth(5, ['Petite saison sèche — Irrigation si besoin'], 'medium'),
      mkMonth(6, ['Petite récolte', 'Fermentation, séchage'], 'high'),
      mkMonth(7, ['Post-récolte — Taille sanitaire'], 'low'),
      mkMonth(8, ['2e floraison', 'FOSNUTREN', 'AMINOL foliaire'], 'high'),
      mkMonth(9, ['Formation cabosses S2'], 'high'),
      mkMonth(10, ['Début grande récolte'], 'high'),
      mkMonth(11, ['Grande récolte', 'Fermentation'], 'high'),
      mkMonth(12, ['Fin récolte', 'Bilan + taille'], 'medium'),
    ],
    Ouest: [
      mkMonth(1, [], 'none'),
      mkMonth(2, ['Taille', 'Préparation sol'], 'low'),
      mkMonth(3, ['Floraison', 'FOSNUTREN', 'HUMIFORTE'], 'high'),
      mkMonth(4, ['Formation cabosses', 'Traitement fongique'], 'high'),
      mkMonth(5, ['Surveillance cabosses', 'Désherbage'], 'medium'),
      mkMonth(6, ['Petite récolte'], 'high'),
      mkMonth(7, ['Repos végétatif'], 'low'),
      mkMonth(8, ['2e floraison', 'AMINOL + FOSNUTREN'], 'high'),
      mkMonth(9, ['Suivi cabosses S2'], 'high'),
      mkMonth(10, ['Grande récolte S2'], 'high'),
      mkMonth(11, ['Récolte + fermentation'], 'high'),
      mkMonth(12, ['Fin récolte', 'Taille et nettoyage'], 'medium'),
    ],
  },
};

// --- MAÏS ---------------------------------------------------------
const maisCalendar: CropCalendar = {
  crop: 'Maïs',
  emoji: '🌽',
  products: [
    { name: 'HUMIFORTE', slug: 'humiforte', usecase: 'Au semis — stimulation racinaire' },
    { name: 'FOSNUTREN', slug: 'fosnutren-20', usecase: 'Épiaison — début épi' },
    { name: 'AMINOL FORTE', slug: 'aminol-20', usecase: 'Croissance foliaire J30' },
  ],
  regions: {
    Centre: [
      mkMonth(1, ['Préparation sol S1', 'Labour'], 'medium'),
      mkMonth(2, ['Semis S1', 'HUMIFORTE semis', 'Fertilisation fond'], 'high'),
      mkMonth(3, ['Desherbage J20', 'AMINOL foliaire J30'], 'high'),
      mkMonth(4, ['Épiaison FOSNUTREN', 'Buttage'], 'high'),
      mkMonth(5, ['Récolte S1', 'Séchage'], 'high'),
      mkMonth(6, ['Post-récolte', 'Compostage résidus'], 'low'),
      mkMonth(7, ['Préparation S2'], 'low'),
      mkMonth(8, ['Semis S2', 'HUMIFORTE'], 'high'),
      mkMonth(9, ['Fertilisation S2', 'Désherbage'], 'high'),
      mkMonth(10, ['Épiaison FOSNUTREN S2', 'Buttage'], 'high'),
      mkMonth(11, ['Récolte S2'], 'high'),
      mkMonth(12, ['Stockage', 'Bilan'], 'medium'),
    ],
    Nord: [
      mkMonth(1, [], 'none'),
      mkMonth(2, [], 'none'),
      mkMonth(3, [], 'none'),
      mkMonth(4, [], 'none'),
      mkMonth(5, ['Début pluies — Semis unique', 'HUMIFORTE'], 'high'),
      mkMonth(6, ['Désherbage', 'Fertilisation', 'AMINOL foliaire'], 'high'),
      mkMonth(7, ['Épiaison FOSNUTREN', 'Buttage'], 'high'),
      mkMonth(8, ['Récolte', 'Séchage'], 'high'),
      mkMonth(9, ['Stockage', 'Compostage'], 'medium'),
      mkMonth(10, [], 'none'),
      mkMonth(11, [], 'none'),
      mkMonth(12, [], 'none'),
    ],
  },
};

// --- CAFÉ ---------------------------------------------------------
const cafeCalendar: CropCalendar = {
  crop: 'Café',
  emoji: '☕',
  products: [
    { name: 'HUMIFORTE', slug: 'humiforte', usecase: 'Enracinement — après taille' },
    { name: 'FOSNUTREN', slug: 'fosnutren-20', usecase: 'Floraison — octobre' },
    { name: 'AMINOL FORTE', slug: 'aminol-20', usecase: 'Vigueur annuelle' },
  ],
  regions: {
    Ouest: [
      mkMonth(1, ['Taille principale', 'Nettoyage parcelle'], 'medium'),
      mkMonth(2, ['HUMIFORTE post-taille', 'Paillage'], 'medium'),
      mkMonth(3, ['Désherbage', 'Début végétation'], 'medium'),
      mkMonth(4, ['Fertilisation foliaire AMINOL'], 'high'),
      mkMonth(5, ['Suivi végétatif', 'Désherbage'], 'medium'),
      mkMonth(6, ['Préparation floraison'], 'medium'),
      mkMonth(7, ['Début floraison'], 'high'),
      mkMonth(8, ['Floraison max — FOSNUTREN x2'], 'high'),
      mkMonth(9, ['Formation fruit — surveillance'], 'high'),
      mkMonth(10, ['Début récolte Arabica'], 'high'),
      mkMonth(11, ['Grande récolte', 'Dépulpage, lavage, séchage'], 'high'),
      mkMonth(12, ['Fin récolte', 'Stockage', 'Certification'], 'high'),
    ],
    Centre: [
      mkMonth(1, ['Taille légère', 'Fertilisation légère'], 'low'),
      mkMonth(2, ['HUMIFORTE avril-mai', 'Début végétation'], 'medium'),
      mkMonth(3, ['Fertilisation AMINOL'], 'medium'),
      mkMonth(4, ['Floraison principale — FOSNUTREN'], 'high'),
      mkMonth(5, ['Suivi fruits', 'Traitement fongique'], 'high'),
      mkMonth(6, ['Récolte Robusta S1', 'Dépulpage'], 'high'),
      mkMonth(7, ['Post-récolte', 'Taille'], 'low'),
      mkMonth(8, ['2e floraison', 'FOSNUTREN'], 'high'),
      mkMonth(9, ['Suivi fruits S2'], 'medium'),
      mkMonth(10, ['Récolte S2'], 'high'),
      mkMonth(11, ['Fin récolte', 'Stockage'], 'high'),
      mkMonth(12, ['Bilan', 'Taille'], 'medium'),
    ],
  },
};

// --- Banane / Plantain ------------------------------------------
const bananeCalendar: CropCalendar = {
  crop: 'Banane/Plantain',
  emoji: '🍌',
  products: [
    { name: 'HUMIFORTE', slug: 'humiforte', usecase: 'Plantation nouvelle' },
    { name: 'AMINOL FORTE', slug: 'aminol-20', usecase: 'Croissance accélérée' },
    { name: 'FOSNUTREN', slug: 'fosnutren-20', usecase: 'Régime — avant émergence' },
  ],
  regions: {
    Littoral: [
      mkMonth(1, ['Plantation rejets', 'HUMIFORTE'], 'high'),
      mkMonth(2, ['Entretien', 'Désherbage, écimage rejets'], 'medium'),
      mkMonth(3, ['Fertilisation AMINOL foliaire'], 'high'),
      mkMonth(4, ['Émergence régimes — FOSNUTREN'], 'high'),
      mkMonth(5, ['Régimes visible — ensachage'], 'high'),
      mkMonth(6, ['Récolte régimes J1', 'Écimage'], 'high'),
      mkMonth(7, ['Plantation S2 ou rejets'], 'medium'),
      mkMonth(8, ['Fertilisation AMINOL'], 'high'),
      mkMonth(9, ['Suivi régimes S2'], 'high'),
      mkMonth(10, ['Récolte S2'], 'high'),
      mkMonth(11, ['Désherbage', 'Entretien drainage'], 'medium'),
      mkMonth(12, ['Prépa S3', 'Bilan'], 'medium'),
    ],
  },
};

// --- INDEX GLOBAL DES CULTURES -----------------------------------
export const CROP_CALENDARS: CropCalendar[] = [
  tomateCalendar,
  cacaoCalendar,
  maisCalendar,
  cafeCalendar,
  bananeCalendar,
];

// --- Obtenir le calendrier d'une culture pour une région ---------
export function getCropCalendar(cropName: string, region?: string): CropCalendar | null {
  const normalized = cropName.toLowerCase()
    .replace('maïs', 'maïs').replace('mais', 'maïs')
    .replace('banane', 'banane').replace('plantain', 'banane');

  const cal = CROP_CALENDARS.find(c =>
    c.crop.toLowerCase().includes(normalized) ||
    normalized.includes(c.crop.toLowerCase().split('/')[0].trim())
  );
  return cal || null;
}

// --- Obtenir les activités du mois courant -----------------------
export function getCurrentMonthActivities(
  cropName: string,
  region?: string
): { activities: string[]; intensity: CulturalMonth['intensity']; alert?: string; products: CropCalendar['products'] } | null {
  const cal = getCropCalendar(cropName, region);
  if (!cal) return null;

  const month = new Date().getMonth() + 1;
  // Cherche la région demandée, sinon prend la première disponible
  const regionKey = region
    ? Object.keys(cal.regions).find(r => r.toLowerCase().includes(region.toLowerCase()) || region.toLowerCase().includes(r.toLowerCase()))
    : Object.keys(cal.regions)[0];

  if (!regionKey) return null;
  const monthData = cal.regions[regionKey]?.find(m => m.month === month);
  if (!monthData) return null;

  return {
    activities: monthData.activities,
    intensity: monthData.intensity,
    alert: monthData.alert,
    products: cal.products,
  };
}

// --- Génère une salutation saisonnière ---------------------------
export function getSeasonalGreeting(region?: string, crops?: string[]): string | null {
  if (!region && !crops?.length) return null;

  const month = new Date().getMonth() + 1;
  const monthName = MONTHS_FR[month - 1];

  // Activités urgentes ce mois pour les cultures connues
  const urgentItems: string[] = [];
  const cropAlerts: string[] = [];

  for (const crop of (crops || []).slice(0, 3)) {
    const data = getCurrentMonthActivities(crop, region);
    if (data && data.activities.length > 0 && data.intensity !== 'none') {
      urgentItems.push(`**${crop}** : ${data.activities.slice(0, 2).join(', ')}`);
      if (data.alert) cropAlerts.push(data.alert);
    }
  }

  if (urgentItems.length === 0 && !region) return null;

  const lines = [`🗓️ **Agenda ${monthName}${region ? ` — ${region}` : ''}**`];
  urgentItems.forEach(item => lines.push(`• ${item}`));
  if (cropAlerts.length > 0) lines.push(cropAlerts[0]);

  return lines.join('\n');
}

// --- PRODUITS DÉTECTABLES dans le texte (pour bouton Acheter) ----
export const PRODUCT_BUY_PATTERNS: Array<{
  pattern: RegExp;
  name: string;
  slug: string;
  category: string;
}> = [
  { pattern: /HUMIFORTE/i,      name: 'HUMIFORTE',      slug: 'humiforte',          category: 'Biostimulant' },
  { pattern: /FOSNUTREN/i,      name: 'FOSNUTREN',       slug: 'fosnutren-20',       category: 'Biostimulant' },
  { pattern: /KADOSTIM/i,       name: 'KADOSTIM',        slug: 'kadostim-20',        category: 'Anti-stress' },
  { pattern: /AMINOL\s*(?:FORTE|20)?/i, name: 'AMINOL 20', slug: 'aminol-20',        category: 'Nutrition' },
  { pattern: /NATUR\s*CARE/i,   name: 'NATUR CARE',      slug: 'natur-care',         category: 'Protection' },
  { pattern: /SARAH\s*NPK/i,    name: 'SARAH NPK 20-10-10', slug: 'sarah-npk-20-10-10', category: 'Engrais minéral' },
  { pattern: /UR[ÉE]E\s*46/i,   name: 'URÉE 46%',       slug: 'uree-46',            category: 'Engrais minéral' },
  { pattern: /SULPHATE/i,       name: 'SULPHATE',        slug: 'sulphate',           category: 'Engrais minéral' },
  { pattern: /LADABA/i,         name: 'HERBICIDE LADABA', slug: 'herbicide-ladaba',  category: 'Herbicide' },
  { pattern: /RHIZOFIX/i,       name: 'RHIZOFIX',        slug: 'rhizofix',           category: 'Racinaire' },
  { pattern: /TRIANUM/i,        name: 'TRIANUM',         slug: 'trianum',            category: 'Biocontrôle' },
  { pattern: /CALCIFORTE/i,     name: 'CALCIFORTE',      slug: 'calciforte',         category: 'Nutrition' },
];

export function extractProductsFromText(text: string): Array<{ name: string; slug: string; category: string }> {
  const found: Array<{ name: string; slug: string; category: string }> = [];
  const raw = text.replace(/<[^>]+>/g, '');
  for (const p of PRODUCT_BUY_PATTERNS) {
    if (p.pattern.test(raw) && !found.find(f => f.slug === p.slug)) {
      found.push({ name: p.name, slug: p.slug, category: p.category });
    }
  }
  return found.slice(0, 3);
}
