/**
 * /campagne-engrais — PAGE DÉSACTIVÉE TEMPORAIREMENT
 *
 * La campagne est en attente. Cette route retourne 404.
 * Le contenu complet de la page est préservé dans _CampagnePage.tsx
 * dans ce même dossier — prêt à être réactivé.
 *
 * Pour réactiver :
 *   1. Supprimer ce fichier (page.tsx)
 *   2. Renommer _CampagnePage.tsx → page.tsx
 */
import { notFound } from 'next/navigation';

export default function CampagnePage() {
  notFound();
}
