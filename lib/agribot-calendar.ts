// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CALENDRIER CULTURAL CAMEROUN â€” DonnÃ©es par culture et rÃ©gion
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export interface CulturalMonth {
  month: number;       // 1-12
  label: string;       // "Jan", "FÃ©v"...
  activities: string[];// ["Semis", "Fertilisation", "RÃ©colte"...]
  intensity: 'none' | 'low' | 'medium' | 'high'; // niveau activitÃ©
  alert?: string;      // Alerte spÃ©cifique si besoin
}

export interface CropCalendar {
  crop: string;
  emoji: string;
  regions: {
    [region: string]: CulturalMonth[];
  };
  products: Array<{ name: string; slug: string; usecase: string }>;
}

const MONTHS_FR = ['Jan','FÃ©v','Mar','Avr','Mai','Jun','Jul','AoÃ»','Sep','Oct','Nov','DÃ©c'];

function mkMonth(month: number, activities: string[], intensity: CulturalMonth['intensity'], alert?: string): CulturalMonth {
  return { month, label: MONTHS_FR[month - 1], activities, intensity, alert };
}

// â”€â”€â”€ TOMATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const tomateCalendar: CropCalendar = {
  crop: 'Tomate',
  emoji: 'ðŸ…',
  products: [
    { name: 'HUMIFORTE', slug: 'humiforte', usecase: 'Stimulant racinaire â€” au repiquage' },
    { name: 'FOSNUTREN', slug: 'fosnutren-20', usecase: 'Fructification â€” Ã  la floraison' },
    { name: 'KADOSTIM', slug: 'kadostim-20', usecase: 'Anti-stress â€” en saison sÃ¨che' },
    { name: 'NATUR CARE', slug: 'natur-care', usecase: 'Protection foliaire â€” prÃ©ventif' },
  ],
  regions: {
    Centre: [
      mkMonth(1, ['PÃ©piniÃ¨re S1', 'Arrosage rÃ©gulier'], 'medium'),
      mkMonth(2, ['PÃ©piniÃ¨re S2', 'Enrichissement sol'], 'medium'),
      mkMonth(3, ['Repiquage', 'HUMIFORTE J0', 'Tuteurage'], 'high'),
      mkMonth(4, ['Fertilisation FOSNUTREN', 'Traitement prÃ©ventif', 'Irrigation'], 'high'),
      mkMonth(5, ['Floraison â€” FOSNUTREN x2', 'Surveillance maladies'], 'high', 'ðŸŒ§ï¸ Pluies fortes â†’ mildiou'),
      mkMonth(6, ['RÃ©colte S1', 'Compostage post-rÃ©colte'], 'high'),
      mkMonth(7, ['Repos ou prÃ©pa S2'], 'low'),
      mkMonth(8, ['PrÃ©paration sol S2'], 'low'),
      mkMonth(9, ['PÃ©piniÃ¨re S2', 'Paillage'], 'medium'),
      mkMonth(10, ['Repiquage S2', 'HUMIFORTE', 'Fertilisation'], 'high'),
      mkMonth(11, ['Floraison â€” FOSNUTREN', 'Traitement fongique'], 'high', 'ðŸŒ§ï¸ Fin pluies â†’ pourriture'),
      mkMonth(12, ['RÃ©colte S2', 'Bilan + planification'], 'high'),
    ],
    Littoral: [
      mkMonth(1, ['Saison sÃ¨che â€” Arrosage intensif', 'PÃ©piniÃ¨re'], 'medium'),
      mkMonth(2, ['Repiquage', 'HUMIFORTE', 'Mulching indispensable'], 'high'),
      mkMonth(3, ['Fertilisation intensive', 'Floraison'], 'high'),
      mkMonth(4, ['RÃ©colte', 'PrÃ©vention mildiou'], 'high', 'â˜” DÃ©but pluies â†’ drainage'),
      mkMonth(5, ['Pluies fortes â€” Drainage', 'Anti-fongique'], 'medium', 'âš ï¸ Risque mildiou Ã©levÃ©'),
      mkMonth(6, ['Repos'], 'none'),
      mkMonth(7, ['PÃ©piniÃ¨re S2'], 'medium'),
      mkMonth(8, ['Repiquage S2', 'HUMIFORTE'], 'high'),
      mkMonth(9, ['Fertilisation', 'Floraison FOSNUTREN'], 'high'),
      mkMonth(10, ['RÃ©colte S2'], 'high'),
      mkMonth(11, ['Post-rÃ©colte'], 'low'),
      mkMonth(12, ['PrÃ©paration S1'], 'low'),
    ],
    Ouest: [
      mkMonth(1, [], 'none'),
      mkMonth(2, [], 'none'),
      mkMonth(3, ['DÃ©but saison â€” PÃ©piniÃ¨re', 'PrÃ©paration sol'], 'medium'),
      mkMonth(4, ['Repiquage', 'HUMIFORTE', 'Irrigation complÃ©mentaire'], 'high'),
      mkMonth(5, ['Fertilisation', 'FOSNUTREN floraison'], 'high'),
      mkMonth(6, ['RÃ©colte S1'], 'high'),
      mkMonth(7, ['Post-rÃ©colte', 'Engrais vert'], 'low'),
      mkMonth(8, ['PrÃ©paration sol S2'], 'medium'),
      mkMonth(9, ['PÃ©piniÃ¨re S2', 'Compostage'], 'medium'),
      mkMonth(10, ['Repiquage S2', 'HUMIFORTE'], 'high'),
      mkMonth(11, ['Floraison FOSNUTREN', 'Buttage'], 'high'),
      mkMonth(12, ['RÃ©colte S2', 'Bilan'], 'high'),
    ],
    Nord: [
      mkMonth(1, ['Irrigation obligatoire', 'Mulching'], 'medium'),
      mkMonth(2, ['PÃ©piniÃ¨re sous ombrage', 'Arrosage matin'], 'medium'),
      mkMonth(3, ['Repiquage matinal', 'HUMIFORTE + KADOSTIM'], 'high', 'ðŸŒ¡ï¸ Chaleur max â†’ KADOSTIM anti-stress'),
      mkMonth(4, ['Fertilisation intensive', 'Ombrage partiel'], 'high'),
      mkMonth(5, ['RÃ©colte S1', 'Compostage'], 'high'),
      mkMonth(6, ['DÃ©but pluies â€” PÃ©piniÃ¨re S2'], 'medium'),
      mkMonth(7, ['Repiquage pluvial', 'Sans irrigation'], 'high'),
      mkMonth(8, ['Fertilisation', 'Floraison FOSNUTREN'], 'high'),
      mkMonth(9, ['RÃ©colte S2', 'Stockage'], 'high'),
      mkMonth(10, ['Repos'], 'none'),
      mkMonth(11, [], 'none'),
      mkMonth(12, [], 'none'),
    ],
  },
};

// â”€â”€â”€ CACAO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const cacaoCalendar: CropCalendar = {
  crop: 'Cacao',
  emoji: 'ðŸ«',
  products: [
    { name: 'HUMIFORTE', slug: 'humiforte', usecase: 'Racinaire â€” dÃ©but saison des pluies' },
    { name: 'FOSNUTREN', slug: 'fosnutren-20', usecase: 'Floraison â€” stimule cabosses' },
    { name: 'AMINOL FORTE', slug: 'aminol-20', usecase: 'Vigueur foliaire â€” toute l\'annÃ©e' },
    { name: 'NATUR CARE', slug: 'natur-care', usecase: 'Protection â€” anti-pourriture brune' },
  ],
  regions: {
    Centre: [
      mkMonth(1, ['Taille lÃ©gÃ¨re', 'DÃ©sherbage'], 'low'),
      mkMonth(2, ['Fertilisation HUMIFORTE', 'Eveil vÃ©gÃ©tatif'], 'medium'),
      mkMonth(3, ['Grande floraison', 'FOSNUTREN', 'Surveillance mirides'], 'high'),
      mkMonth(4, ['Formation cabosses', 'Traitement prÃ©ventif NATUR CARE'], 'high', 'ðŸŒ‘ Risque pourriture brune'),
      mkMonth(5, ['Petite saison sÃ¨che â€” Irrigation si besoin'], 'medium'),
      mkMonth(6, ['Petite rÃ©colte', 'Fermentation, sÃ©chage'], 'high'),
      mkMonth(7, ['Post-rÃ©colte â€” Taille sanitaire'], 'low'),
      mkMonth(8, ['2e floraison', 'FOSNUTREN', 'AMINOL foliaire'], 'high'),
      mkMonth(9, ['Formation cabosses S2'], 'high'),
      mkMonth(10, ['DÃ©but grande rÃ©colte'], 'high'),
      mkMonth(11, ['Grande rÃ©colte', 'Fermentation'], 'high'),
      mkMonth(12, ['Fin rÃ©colte', 'Bilan + taille'], 'medium'),
    ],
    Ouest: [
      mkMonth(1, [], 'none'),
      mkMonth(2, ['Taille', 'PrÃ©paration sol'], 'low'),
      mkMonth(3, ['Floraison', 'FOSNUTREN', 'HUMIFORTE'], 'high'),
      mkMonth(4, ['Formation cabosses', 'Traitement fongique'], 'high'),
      mkMonth(5, ['Surveillance cabosses', 'DÃ©sherbage'], 'medium'),
      mkMonth(6, ['Petite rÃ©colte'], 'high'),
      mkMonth(7, ['Repos vÃ©gÃ©tatif'], 'low'),
      mkMonth(8, ['2e floraison', 'AMINOL + FOSNUTREN'], 'high'),
      mkMonth(9, ['Suivi cabosses S2'], 'high'),
      mkMonth(10, ['Grande rÃ©colte S2'], 'high'),
      mkMonth(11, ['RÃ©colte + fermentation'], 'high'),
      mkMonth(12, ['Fin rÃ©colte', 'Taille et nettoyage'], 'medium'),
    ],
  },
};

// â”€â”€â”€ MAÃS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const maisCalendar: CropCalendar = {
  crop: 'MaÃ¯s',
  emoji: 'ðŸŒ½',
  products: [
    { name: 'HUMIFORTE', slug: 'humiforte', usecase: 'Au semis â€” stimulation racinaire' },
    { name: 'FOSNUTREN', slug: 'fosnutren-20', usecase: 'Ã‰piaison â€” dÃ©but Ã©pi' },
    { name: 'AMINOL FORTE', slug: 'aminol-20', usecase: 'Croissance foliaire J30' },
  ],
  regions: {
    Centre: [
      mkMonth(1, ['PrÃ©paration sol S1', 'Labour'], 'medium'),
      mkMonth(2, ['Semis S1', 'HUMIFORTE semis', 'Fertilisation fond'], 'high'),
      mkMonth(3, ['Desherbage J20', 'AMINOL foliaire J30'], 'high'),
      mkMonth(4, ['Ã‰piaison FOSNUTREN', 'Buttage'], 'high'),
      mkMonth(5, ['RÃ©colte S1', 'SÃ©chage'], 'high'),
      mkMonth(6, ['Post-rÃ©colte', 'Compostage rÃ©sidus'], 'low'),
      mkMonth(7, ['PrÃ©paration S2'], 'low'),
      mkMonth(8, ['Semis S2', 'HUMIFORTE'], 'high'),
      mkMonth(9, ['Fertilisation S2', 'DÃ©sherbage'], 'high'),
      mkMonth(10, ['Ã‰piaison FOSNUTREN S2', 'Buttage'], 'high'),
      mkMonth(11, ['RÃ©colte S2'], 'high'),
      mkMonth(12, ['Stockage', 'Bilan'], 'medium'),
    ],
    Nord: [
      mkMonth(1, [], 'none'),
      mkMonth(2, [], 'none'),
      mkMonth(3, [], 'none'),
      mkMonth(4, [], 'none'),
      mkMonth(5, ['DÃ©but pluies â€” Semis unique', 'HUMIFORTE'], 'high'),
      mkMonth(6, ['DÃ©sherbage', 'Fertilisation', 'AMINOL foliaire'], 'high'),
      mkMonth(7, ['Ã‰piaison FOSNUTREN', 'Buttage'], 'high'),
      mkMonth(8, ['RÃ©colte', 'SÃ©chage'], 'high'),
      mkMonth(9, ['Stockage', 'Compostage'], 'medium'),
      mkMonth(10, [], 'none'),
      mkMonth(11, [], 'none'),
      mkMonth(12, [], 'none'),
    ],
  },
};

// â”€â”€â”€ CAFÃ‰ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const cafeCalendar: CropCalendar = {
  crop: 'CafÃ©',
  emoji: 'â˜•',
  products: [
    { name: 'HUMIFORTE', slug: 'humiforte', usecase: 'Enracinement â€” aprÃ¨s taille' },
    { name: 'FOSNUTREN', slug: 'fosnutren-20', usecase: 'Floraison â€” octobre' },
    { name: 'AMINOL FORTE', slug: 'aminol-20', usecase: 'Vigueur annuelle' },
  ],
  regions: {
    Ouest: [
      mkMonth(1, ['Taille principale', 'Nettoyage parcelle'], 'medium'),
      mkMonth(2, ['HUMIFORTE post-taille', 'Paillage'], 'medium'),
      mkMonth(3, ['DÃ©sherbage', 'DÃ©but vÃ©gÃ©tation'], 'medium'),
      mkMonth(4, ['Fertilisation foliaire AMINOL'], 'high'),
      mkMonth(5, ['Suivi vÃ©gÃ©tatif', 'DÃ©sherbage'], 'medium'),
      mkMonth(6, ['PrÃ©paration floraison'], 'medium'),
      mkMonth(7, ['DÃ©but floraison'], 'high'),
      mkMonth(8, ['Floraison max â€” FOSNUTREN x2'], 'high'),
      mkMonth(9, ['Formation fruit â€” surveillance'], 'high'),
      mkMonth(10, ['DÃ©but rÃ©colte Arabica'], 'high'),
      mkMonth(11, ['Grande rÃ©colte', 'DÃ©pulpage, lavage, sÃ©chage'], 'high'),
      mkMonth(12, ['Fin rÃ©colte', 'Stockage', 'Certification'], 'high'),
    ],
    Centre: [
      mkMonth(1, ['Taille lÃ©gÃ¨re', 'Fertilisation lÃ©gÃ¨re'], 'low'),
      mkMonth(2, ['HUMIFORTE avril-mai', 'DÃ©but vÃ©gÃ©tation'], 'medium'),
      mkMonth(3, ['Fertilisation AMINOL'], 'medium'),
      mkMonth(4, ['Floraison principale â€” FOSNUTREN'], 'high'),
      mkMonth(5, ['Suivi fruits', 'Traitement fongique'], 'high'),
      mkMonth(6, ['RÃ©colte Robusta S1', 'DÃ©pulpage'], 'high'),
      mkMonth(7, ['Post-rÃ©colte', 'Taille'], 'low'),
      mkMonth(8, ['2e floraison', 'FOSNUTREN'], 'high'),
      mkMonth(9, ['Suivi fruits S2'], 'medium'),
      mkMonth(10, ['RÃ©colte S2'], 'high'),
      mkMonth(11, ['Fin rÃ©colte', 'Stockage'], 'high'),
      mkMonth(12, ['Bilan', 'Taille'], 'medium'),
    ],
  },
};

// â”€â”€â”€ Banane / Plantain â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const bananeCalendar: CropCalendar = {
  crop: 'Banane/Plantain',
  emoji: 'ðŸŒ',
  products: [
    { name: 'HUMIFORTE', slug: 'humiforte', usecase: 'Plantation nouvelle' },
    { name: 'AMINOL FORTE', slug: 'aminol-20', usecase: 'Croissance accÃ©lÃ©rÃ©e' },
    { name: 'FOSNUTREN', slug: 'fosnutren-20', usecase: 'RÃ©gime â€” avant Ã©mergence' },
  ],
  regions: {
    Littoral: [
      mkMonth(1, ['Plantation rejets', 'HUMIFORTE'], 'high'),
      mkMonth(2, ['Entretien', 'DÃ©sherbage, Ã©cimage rejets'], 'medium'),
      mkMonth(3, ['Fertilisation AMINOL foliaire'], 'high'),
      mkMonth(4, ['Ã‰mergence rÃ©gimes â€” FOSNUTREN'], 'high'),
      mkMonth(5, ['RÃ©gimes visible â€” ensachage'], 'high'),
      mkMonth(6, ['RÃ©colte rÃ©gimes J1', 'Ã‰cimage'], 'high'),
      mkMonth(7, ['Plantation S2 ou rejets'], 'medium'),
      mkMonth(8, ['Fertilisation AMINOL'], 'high'),
      mkMonth(9, ['Suivi rÃ©gimes S2'], 'high'),
      mkMonth(10, ['RÃ©colte S2'], 'high'),
      mkMonth(11, ['DÃ©sherbage', 'Entretien drainage'], 'medium'),
      mkMonth(12, ['PrÃ©pa S3', 'Bilan'], 'medium'),
    ],
  },
};

// â”€â”€â”€ INDEX GLOBAL DES CULTURES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const CROP_CALENDARS: CropCalendar[] = [
  tomateCalendar,
  cacaoCalendar,
  maisCalendar,
  cafeCalendar,
  bananeCalendar,
];

// â”€â”€â”€ Obtenir le calendrier d'une culture pour une rÃ©gion â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getCropCalendar(cropName: string, region?: string): CropCalendar | null {
  const normalized = cropName.toLowerCase()
    .replace('maÃ¯s', 'maÃ¯s').replace('mais', 'maÃ¯s')
    .replace('banane', 'banane').replace('plantain', 'banane');

  const cal = CROP_CALENDARS.find(c =>
    c.crop.toLowerCase().includes(normalized) ||
    normalized.includes(c.crop.toLowerCase().split('/')[0].trim())
  );
  return cal || null;
}

// â”€â”€â”€ Obtenir les activitÃ©s du mois courant â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getCurrentMonthActivities(
  cropName: string,
  region?: string
): { activities: string[]; intensity: CulturalMonth['intensity']; alert?: string; products: CropCalendar['products'] } | null {
  const cal = getCropCalendar(cropName, region);
  if (!cal) return null;

  const month = new Date().getMonth() + 1;
  // Cherche la rÃ©gion demandÃ©e, sinon prend la premiÃ¨re disponible
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

// â”€â”€â”€ GÃ©nÃ¨re une salutation saisonniÃ¨re â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getSeasonalGreeting(region?: string, crops?: string[]): string | null {
  if (!region && !crops?.length) return null;

  const month = new Date().getMonth() + 1;
  const monthName = MONTHS_FR[month - 1];

  // ActivitÃ©s urgentes ce mois pour les cultures connues
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

  const lines = [`ðŸ—“ï¸ **Agenda ${monthName}${region ? ` â€” ${region}` : ''}**`];
  urgentItems.forEach(item => lines.push(`â€¢ ${item}`));
  if (cropAlerts.length > 0) lines.push(cropAlerts[0]);

  return lines.join('\n');
}

// â”€â”€â”€ PRODUITS DÃ‰TECTABLES dans le texte (pour bouton Acheter) â”€â”€â”€â”€
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
  { pattern: /SARAH\s*NPK/i,    name: 'SARAH NPK 20-10-10', slug: 'sarah-npk-20-10-10', category: 'Engrais minÃ©ral' },
  { pattern: /UR[Ã‰E]E\s*46/i,   name: 'URÃ‰E 46%',       slug: 'uree-46',            category: 'Engrais minÃ©ral' },
  { pattern: /SULPHATE/i,       name: 'SULPHATE',        slug: 'sulphate',           category: 'Engrais minÃ©ral' },
  { pattern: /LADABA/i,         name: 'HERBICIDE LADABA', slug: 'herbicide-ladaba',  category: 'Herbicide' },
  { pattern: /RHIZOFIX/i,       name: 'RHIZOFIX',        slug: 'rhizofix',           category: 'Racinaire' },
  { pattern: /TRIANUM/i,        name: 'TRIANUM',         slug: 'trianum',            category: 'BiocontrÃ´le' },
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
