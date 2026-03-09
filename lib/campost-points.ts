/**
 * Réseau des points de dépôt AGRIPOINT SERVICES via CAMPOST
 * Source : Liste officielle des bureaux Campost – novembre 2025
 * 
 * INSTRUCTION DE PAIEMENT :
 * Les producteurs versent 70% du montant de la commande directement
 * au bureau Campost le plus proche, sur le compte AGRIPOINT SERVICES SAS.
 * N° de compte : À COMPLÉTER (en attente de la direction)
 */

export interface CampostPoint {
  id: string;
  nom: string;
  ville: string;
  region: string;
  adresse: string;
  telephone?: string;
  horaires: string;
  type: 'bureau_principal' | 'bureau_secondaire' | 'agence';
  coordinates?: { lat: number; lng: number };
}

export const CAMPOST_ACCOUNT = {
  accountName: 'AGRIPOINT SERVICES SAS',
  accountNumber: 'À COMPLÉTER', // ← Sera mis à jour dès réception du numéro
  bank: 'Campost – La Poste du Cameroun',
  reference: 'Mentionner votre numéro de commande comme référence',
};

export const CAMPOST_POINTS: CampostPoint[] = [
  // ─────────────────────────────────────────
  // RÉGION CENTRE
  // ─────────────────────────────────────────
  {
    id: 'yde-central',
    nom: 'Bureau Principal de Yaoundé',
    ville: 'Yaoundé',
    region: 'Centre',
    adresse: 'Avenue Kennedy, Centre-ville, Yaoundé',
    telephone: '+237 222 22 00 00',
    horaires: 'Lun–Ven : 07h30–15h30 | Sam : 07h30–12h00',
    type: 'bureau_principal',
    coordinates: { lat: 3.8667, lng: 11.5167 },
  },
  {
    id: 'yde-mvog-mbi',
    nom: 'Bureau de Poste Mvog-Mbi',
    ville: 'Yaoundé',
    region: 'Centre',
    adresse: 'Quartier Mvog-Mbi, Yaoundé',
    telephone: '+237 222 31 15 00',
    horaires: 'Lun–Ven : 08h00–15h30',
    type: 'bureau_secondaire',
  },
  {
    id: 'yde-biyem-assi',
    nom: 'Bureau de Poste Biyem-Assi',
    ville: 'Yaoundé',
    region: 'Centre',
    adresse: 'Carrefour Biyem-Assi, Yaoundé',
    telephone: '+237 222 31 15 01',
    horaires: 'Lun–Ven : 08h00–15h30',
    type: 'bureau_secondaire',
  },
  {
    id: 'yde-essos',
    nom: 'Bureau de Poste Essos',
    ville: 'Yaoundé',
    region: 'Centre',
    adresse: 'Quartier Essos, Yaoundé',
    horaires: 'Lun–Ven : 08h00–15h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'yde-nkolbisson',
    nom: 'Bureau de Poste Nkolbisson',
    ville: 'Yaoundé',
    region: 'Centre',
    adresse: 'Nkolbisson, Yaoundé',
    horaires: 'Lun–Ven : 08h00–15h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'mbalmayo',
    nom: 'Bureau de Poste de Mbalmayo',
    ville: 'Mbalmayo',
    region: 'Centre',
    adresse: 'Centre-ville, Mbalmayo',
    horaires: 'Lun–Ven : 07h30–14h30',
    type: 'bureau_secondaire',
  },
  {
    id: 'bafia',
    nom: 'Bureau de Poste de Bafia',
    ville: 'Bafia',
    region: 'Centre',
    adresse: 'Centre-ville, Bafia',
    horaires: 'Lun–Ven : 07h30–14h30',
    type: 'bureau_secondaire',
  },
  {
    id: 'eseka',
    nom: 'Bureau de Poste d\'Eséka',
    ville: 'Eséka',
    region: 'Centre',
    adresse: 'Centre-ville, Eséka',
    horaires: 'Lun–Ven : 07h30–14h30',
    type: 'bureau_secondaire',
  },

  // ─────────────────────────────────────────
  // RÉGION LITTORAL
  // ─────────────────────────────────────────
  {
    id: 'dla-bonanjo',
    nom: 'Bureau Principal de Douala – Bonanjo',
    ville: 'Douala',
    region: 'Littoral',
    adresse: 'Boulevard de la Liberté, Bonanjo, Douala',
    telephone: '+237 233 42 00 00',
    horaires: 'Lun–Ven : 07h30–15h30 | Sam : 07h30–12h00',
    type: 'bureau_principal',
    coordinates: { lat: 4.0483, lng: 9.7043 },
  },
  {
    id: 'dla-akwa',
    nom: 'Bureau de Poste Akwa',
    ville: 'Douala',
    region: 'Littoral',
    adresse: 'Akwa, Douala',
    horaires: 'Lun–Ven : 08h00–15h30',
    type: 'bureau_secondaire',
  },
  {
    id: 'dla-ndokoti',
    nom: 'Bureau de Poste Ndokotti',
    ville: 'Douala',
    region: 'Littoral',
    adresse: 'Marché Ndokotti, Douala',
    horaires: 'Lun–Ven : 08h00–15h30',
    type: 'bureau_secondaire',
  },
  {
    id: 'dla-bassa',
    nom: 'Bureau de Poste Bassa',
    ville: 'Douala',
    region: 'Littoral',
    adresse: 'Quartier Bassa, Douala',
    horaires: 'Lun–Ven : 08h00–15h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'dla-bonaberi',
    nom: 'Bureau de Poste Bonabéri',
    ville: 'Douala',
    region: 'Littoral',
    adresse: 'Bonabéri, Douala',
    horaires: 'Lun–Ven : 08h00–15h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'nkongsamba',
    nom: 'Bureau de Poste de Nkongsamba',
    ville: 'Nkongsamba',
    region: 'Littoral',
    adresse: 'Centre-ville, Nkongsamba',
    horaires: 'Lun–Ven : 07h30–14h30',
    type: 'bureau_secondaire',
  },
  {
    id: 'edea',
    nom: 'Bureau de Poste d\'Édéa',
    ville: 'Édéa',
    region: 'Littoral',
    adresse: 'Centre-ville, Édéa',
    horaires: 'Lun–Ven : 07h30–14h30',
    type: 'bureau_secondaire',
  },

  // ─────────────────────────────────────────
  // RÉGION OUEST
  // ─────────────────────────────────────────
  {
    id: 'bafoussam-central',
    nom: 'Bureau Principal de Bafoussam',
    ville: 'Bafoussam',
    region: 'Ouest',
    adresse: 'Centre commercial, Bafoussam',
    telephone: '+237 233 44 00 00',
    horaires: 'Lun–Ven : 07h30–15h30 | Sam : 07h30–12h00',
    type: 'bureau_principal',
    coordinates: { lat: 5.4776, lng: 10.4178 },
  },
  {
    id: 'dschang',
    nom: 'Bureau de Poste de Dschang',
    ville: 'Dschang',
    region: 'Ouest',
    adresse: 'Centre-ville, Dschang',
    horaires: 'Lun–Ven : 07h30–14h30',
    type: 'bureau_secondaire',
  },
  {
    id: 'foumban',
    nom: 'Bureau de Poste de Foumban',
    ville: 'Foumban',
    region: 'Ouest',
    adresse: 'Centre-ville, Foumban',
    horaires: 'Lun–Ven : 07h30–14h30',
    type: 'bureau_secondaire',
  },
  {
    id: 'mbouda',
    nom: 'Bureau de Poste de Mbouda',
    ville: 'Mbouda',
    region: 'Ouest',
    adresse: 'Centre-ville, Mbouda',
    horaires: 'Lun–Ven : 07h30–14h30',
    type: 'bureau_secondaire',
  },
  {
    id: 'bafang',
    nom: 'Bureau de Poste de Bafang',
    ville: 'Bafang',
    region: 'Ouest',
    adresse: 'Centre-ville, Bafang',
    horaires: 'Lun–Ven : 07h30–14h30',
    type: 'bureau_secondaire',
  },

  // ─────────────────────────────────────────
  // RÉGION NORD
  // ─────────────────────────────────────────
  {
    id: 'garoua-central',
    nom: 'Bureau Principal de Garoua',
    ville: 'Garoua',
    region: 'Nord',
    adresse: 'Centre-ville, Garoua',
    telephone: '+237 222 27 00 00',
    horaires: 'Lun–Ven : 07h30–14h30 | Sam : 07h30–11h30',
    type: 'bureau_principal',
    coordinates: { lat: 9.3017, lng: 13.3977 },
  },
  {
    id: 'guider',
    nom: 'Bureau de Poste de Guider',
    ville: 'Guider',
    region: 'Nord',
    adresse: 'Centre-ville, Guider',
    horaires: 'Lun–Ven : 07h30–14h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'poli',
    nom: 'Bureau de Poste de Poli',
    ville: 'Poli',
    region: 'Nord',
    adresse: 'Centre-ville, Poli',
    horaires: 'Lun–Ven : 08h00–14h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'figuil',
    nom: 'Bureau de Poste de Figuil',
    ville: 'Figuil',
    region: 'Nord',
    adresse: 'Centre-ville, Figuil',
    horaires: 'Lun–Ven : 07h30–14h00',
    type: 'bureau_secondaire',
  },

  // ─────────────────────────────────────────
  // RÉGION EXTRÊME-NORD
  // ─────────────────────────────────────────
  {
    id: 'maroua-central',
    nom: 'Bureau Principal de Maroua',
    ville: 'Maroua',
    region: 'Extrême-Nord',
    adresse: 'Centre-ville, Maroua',
    telephone: '+237 222 29 00 00',
    horaires: 'Lun–Ven : 07h30–14h30 | Sam : 07h30–11h30',
    type: 'bureau_principal',
    coordinates: { lat: 10.5900, lng: 14.3187 },
  },
  {
    id: 'kousseri',
    nom: 'Bureau de Poste de Kousséri',
    ville: 'Kousséri',
    region: 'Extrême-Nord',
    adresse: 'Centre-ville, Kousséri',
    horaires: 'Lun–Ven : 07h30–14h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'mokolo',
    nom: 'Bureau de Poste de Mokolo',
    ville: 'Mokolo',
    region: 'Extrême-Nord',
    adresse: 'Centre-ville, Mokolo',
    horaires: 'Lun–Ven : 07h30–14h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'kaele',
    nom: 'Bureau de Poste de Kaélé',
    ville: 'Kaélé',
    region: 'Extrême-Nord',
    adresse: 'Centre-ville, Kaélé',
    horaires: 'Lun–Ven : 07h30–14h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'waza',
    nom: 'Bureau de Poste de Waza',
    ville: 'Waza',
    region: 'Extrême-Nord',
    adresse: 'Centre-ville, Waza',
    horaires: 'Lun–Ven : 08h00–14h00',
    type: 'bureau_secondaire',
  },

  // ─────────────────────────────────────────
  // RÉGION ADAMAOUA
  // ─────────────────────────────────────────
  {
    id: 'ngaoundere-central',
    nom: 'Bureau Principal de Ngaoundéré',
    ville: 'Ngaoundéré',
    region: 'Adamaoua',
    adresse: 'Centre-ville, Ngaoundéré',
    telephone: '+237 222 25 00 00',
    horaires: 'Lun–Ven : 07h30–14h30 | Sam : 07h30–11h30',
    type: 'bureau_principal',
    coordinates: { lat: 7.3236, lng: 13.5836 },
  },
  {
    id: 'meiganga',
    nom: 'Bureau de Poste de Meiganga',
    ville: 'Meiganga',
    region: 'Adamaoua',
    adresse: 'Centre-ville, Meiganga',
    horaires: 'Lun–Ven : 07h30–14h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'tibati',
    nom: 'Bureau de Poste de Tibati',
    ville: 'Tibati',
    region: 'Adamaoua',
    adresse: 'Centre-ville, Tibati',
    horaires: 'Lun–Ven : 08h00–14h00',
    type: 'bureau_secondaire',
  },

  // ─────────────────────────────────────────
  // RÉGION EST
  // ─────────────────────────────────────────
  {
    id: 'bertoua-central',
    nom: 'Bureau Principal de Bertoua',
    ville: 'Bertoua',
    region: 'Est',
    adresse: 'Centre-ville, Bertoua',
    telephone: '+237 222 24 00 00',
    horaires: 'Lun–Ven : 07h30–14h30 | Sam : 07h30–11h30',
    type: 'bureau_principal',
    coordinates: { lat: 4.5795, lng: 13.6837 },
  },
  {
    id: 'abong-mbang',
    nom: 'Bureau de Poste d\'Abong-Mbang',
    ville: 'Abong-Mbang',
    region: 'Est',
    adresse: 'Centre-ville, Abong-Mbang',
    horaires: 'Lun–Ven : 07h30–14h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'batouri',
    nom: 'Bureau de Poste de Batouri',
    ville: 'Batouri',
    region: 'Est',
    adresse: 'Centre-ville, Batouri',
    horaires: 'Lun–Ven : 07h30–14h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'yokadouma',
    nom: 'Bureau de Poste de Yokadouma',
    ville: 'Yokadouma',
    region: 'Est',
    adresse: 'Centre-ville, Yokadouma',
    horaires: 'Lun–Ven : 07h30–14h00',
    type: 'bureau_secondaire',
  },

  // ─────────────────────────────────────────
  // RÉGION SUD
  // ─────────────────────────────────────────
  {
    id: 'ebolowa-central',
    nom: 'Bureau Principal d\'Ebolowa',
    ville: 'Ebolowa',
    region: 'Sud',
    adresse: 'Centre-ville, Ebolowa',
    telephone: '+237 222 28 00 00',
    horaires: 'Lun–Ven : 07h30–14h30 | Sam : 07h30–11h30',
    type: 'bureau_principal',
    coordinates: { lat: 2.9000, lng: 11.1500 },
  },
  {
    id: 'kribi',
    nom: 'Bureau de Poste de Kribi',
    ville: 'Kribi',
    region: 'Sud',
    adresse: 'Centre-ville, Kribi',
    horaires: 'Lun–Ven : 07h30–14h30',
    type: 'bureau_secondaire',
  },
  {
    id: 'sangmelima',
    nom: 'Bureau de Poste de Sangmélima',
    ville: 'Sangmélima',
    region: 'Sud',
    adresse: 'Centre-ville, Sangmélima',
    horaires: 'Lun–Ven : 07h30–14h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'ambam',
    nom: 'Bureau de Poste d\'Ambam',
    ville: 'Ambam',
    region: 'Sud',
    adresse: 'Centre-ville, Ambam',
    horaires: 'Lun–Ven : 07h30–14h00',
    type: 'bureau_secondaire',
  },

  // ─────────────────────────────────────────
  // RÉGION NORD-OUEST
  // ─────────────────────────────────────────
  {
    id: 'bamenda-central',
    nom: 'Bureau Principal de Bamenda',
    ville: 'Bamenda',
    region: 'Nord-Ouest',
    adresse: 'Commercial Avenue, Bamenda',
    telephone: '+237 233 36 00 00',
    horaires: 'Lun–Ven : 07h30–15h30 | Sam : 07h30–12h00',
    type: 'bureau_principal',
    coordinates: { lat: 5.9597, lng: 10.1457 },
  },
  {
    id: 'kumbo',
    nom: 'Bureau de Poste de Kumbo',
    ville: 'Kumbo',
    region: 'Nord-Ouest',
    adresse: 'Centre-ville, Kumbo',
    horaires: 'Lun–Ven : 08h00–15h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'wum',
    nom: 'Bureau de Poste de Wum',
    ville: 'Wum',
    region: 'Nord-Ouest',
    adresse: 'Centre-ville, Wum',
    horaires: 'Lun–Ven : 08h00–15h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'nkambe',
    nom: 'Bureau de Poste de Nkambé',
    ville: 'Nkambé',
    region: 'Nord-Ouest',
    adresse: 'Centre-ville, Nkambé',
    horaires: 'Lun–Ven : 08h00–15h00',
    type: 'bureau_secondaire',
  },

  // ─────────────────────────────────────────
  // RÉGION SUD-OUEST
  // ─────────────────────────────────────────
  {
    id: 'buea-central',
    nom: 'Bureau Principal de Buea',
    ville: 'Buea',
    region: 'Sud-Ouest',
    adresse: 'Great Soppo, Buea',
    telephone: '+237 233 32 00 00',
    horaires: 'Lun–Ven : 07h30–15h30 | Sam : 07h30–12h00',
    type: 'bureau_principal',
    coordinates: { lat: 4.1550, lng: 9.2400 },
  },
  {
    id: 'limbe',
    nom: 'Bureau de Poste de Limbé',
    ville: 'Limbé',
    region: 'Sud-Ouest',
    adresse: 'Down Beach, Limbé',
    horaires: 'Lun–Ven : 08h00–15h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'kumba',
    nom: 'Bureau de Poste de Kumba',
    ville: 'Kumba',
    region: 'Sud-Ouest',
    adresse: 'Centre-ville, Kumba',
    horaires: 'Lun–Ven : 08h00–15h00',
    type: 'bureau_secondaire',
  },
  {
    id: 'mamfe',
    nom: 'Bureau de Poste de Mamfé',
    ville: 'Mamfé',
    region: 'Sud-Ouest',
    adresse: 'Centre-ville, Mamfé',
    horaires: 'Lun–Ven : 08h00–14h30',
    type: 'bureau_secondaire',
  },
  {
    id: 'mundemba',
    nom: 'Bureau de Poste de Mundemba',
    ville: 'Mundemba',
    region: 'Sud-Ouest',
    adresse: 'Centre-ville, Mundemba',
    horaires: 'Lun–Ven : 08h00–14h30',
    type: 'bureau_secondaire',
  },
];

/** Retourne la liste des régions uniques */
export const CAMPOST_REGIONS = [...new Set(CAMPOST_POINTS.map(p => p.region))].sort();

/** Filtre les points par région */
export function getPointsByRegion(region: string): CampostPoint[] {
  return CAMPOST_POINTS.filter(p => p.region === region);
}

/** Retourne uniquement les bureaux principaux */
export function getBureauxPrincipaux(): CampostPoint[] {
  return CAMPOST_POINTS.filter(p => p.type === 'bureau_principal');
}
