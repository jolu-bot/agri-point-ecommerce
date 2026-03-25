'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface IntrantProduct {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
}

const PRODUCTS: IntrantProduct[] = [
  // ── Biofertilisants 1 litre ──────────────────────────────────
  { id: 'humiforte-1l',   name: 'HUMIFORTE 1L',      image: '/products/humiforte-20-1litre.webp',   category: 'Biofertilisant',  description: '' },
  { id: 'fosnutren-1l',   name: 'FOSNUTREN 1L',       image: '/products/fosnutren-20-1litre.webp',   category: 'Biofertilisant',  description: '' },
  { id: 'kadostim-1l',    name: 'KADOSTIM 1L',        image: '/products/kadostim-20-1litre.webp',    category: 'Biofertilisant',  description: '' },
  { id: 'aminol-1l',      name: 'AMINOL FORTE 1L',    image: '/products/aminol-20-1litre.webp',      category: 'Biofertilisant',  description: '' },
  // ── Biofertilisants 5 litres — bidons individuels ────────────
  { id: 'humiforte-5l',   name: 'HUMIFORTE 5L',       image: '/products/humiforte-20-5litres.webp',  category: 'Biofertilisant',  description: '' },
  { id: 'fosnutren-5l',   name: 'FOSNUTREN 5L',        image: '/products/fosnutren-20-5litres.webp',  category: 'Biofertilisant',  description: '' },
  { id: 'kadostim-5l',    name: 'KADOSTIM 5L',         image: '/products/kadostim-20-5litres.webp',   category: 'Biofertilisant',  description: '' },
  { id: 'aminol-5l',      name: 'AMINOL FORTE 5L',     image: '/products/aminol-20-5litres.webp',     category: 'Biofertilisant',  description: '' },
  // ── Kits multi-bidons (Fourniture Intrants uniquement) ───────
  { id: 'kit-humiforte',  name: 'KIT HUMIFORTE',       image: '/products/kit-humiforte-20.webp',      category: 'Kit Bio',         description: '' },
  { id: 'kit-fosnutren',  name: 'KIT FOSNUTREN',        image: '/products/kit-fosnutren-20.webp',      category: 'Kit Bio',         description: '' },
  { id: 'kit-kadostim',   name: 'KIT KADOSTIM',         image: '/products/kit-kadostim-20.webp',       category: 'Kit Bio',         description: '' },
  { id: 'kit-aminol',     name: 'KIT AMINOL FORTE',     image: '/products/kit-aminol-20.webp',         category: 'Kit Bio',         description: '' },
  // ── Kit complet ───────────────────────────────────────────────
  { id: 'kit-naturcare',  name: 'KIT NATURCARE 5L',     image: '/products/kit-naturcare-terra.webp',   category: 'Kit Bio',         description: '' },
  // ── Engrais minéraux SARAH ────────────────────────────────────
  { id: 'sarah-uree-50',  name: 'SARAH URÉE 46% 50kg',  image: '/products/sarah-uree-46.webp',         category: 'Engrais Minéral', description: '' },
  { id: 'sarah-20-10-10', name: 'SARAH NPK 20-10-10 50kg', image: '/products/sarah-npk-20-10-10.webp', category: 'Engrais Minéral', description: '' },
  { id: 'sarah-10-30-10', name: 'SARAH NPK 10-30-10 50kg', image: '/products/sarah-npk-10-30-10.webp', category: 'Engrais Minéral', description: '' },
  { id: 'sarah-00-00-36', name: 'SARAH NPK 00-00-36 50kg', image: '',                                  category: 'Engrais Minéral', description: '' },
  { id: 'sarah-12-14-10', name: 'SARAH NPK 12-14-10 50kg', image: '/products/sarah-npk-12-14-10.webp', category: 'Engrais Minéral', description: '' },
  { id: 'sarah-6-8-28',   name: 'SARAH NPK 6-8-28 50kg',   image: '',                                  category: 'Engrais Minéral', description: '' },
  { id: 'sarah-sulfate',  name: 'SARAH Sulfate 50kg',        image: '',                                  category: 'Engrais Minéral', description: '' },
  { id: 'sarah-uree-25',  name: 'SARAH Urée 46% 25kg',       image: '/products/sarah-uree-46-25kg.webp', category: 'Engrais Minéral', description: '' },
];

// Descriptions FR/EN injectées au render pour ne pas alourdir le bundle statique
const DESC: Record<string, [string, string]> = {
  'humiforte-1l':   ['Fertilisant organique avec L-aminoacides libres. Favorise le feuillage et la croissance végétative.',          'Organic fertilizer with free L-amino acids. Promotes foliage and vegetative growth.'],
  'fosnutren-1l':   ['Biostimulant pour la floraison et fructification. Garantit une production abondante.',                          'Biostimulant for flowering and fruiting. Guarantees abundant production.'],
  'kadostim-1l':    ['Stimulant racinaire à base de potassium. Renforce le système racinaire et la résistance au stress.',            'Potassium-based root stimulant. Strengthens the root system and stress resistance.'],
  'aminol-1l':      ["Complexe d'acides aminés et microéléments. Stimule la croissance et le métabolisme des plantes.",               'Amino acid and microelement complex. Stimulates plant growth and metabolism.'],
  'humiforte-5l':   ['Fertilisant organique aux L-aminoacides (5 L). Format économique pour grandes exploitations.',                  'Organic fertilizer with L-amino acids (5 L). Economy format for large farms.'],
  'fosnutren-5l':   ['Biostimulant floraison & fructification (5 L). Format économique pour grandes exploitations.',                  'Flowering and fruiting biostimulant (5 L). Economy format for large farms.'],
  'kadostim-5l':    ['Stimulant racinaire potassique (5 L). Format économique pour grandes exploitations.',                           'Root stimulant based on potassium (5 L). Economy format for large farms.'],
  'aminol-5l':      ["Complexe d'acides aminés et microéléments (5 L). Format économique pour grandes exploitations.",                'Amino acid complex (5 L). Economy format for large farms.'],
  'kit-humiforte':  ['Kit multi-formats HUMIFORTE. Gamme complète pour une utilisation optimale sur toutes vos cultures.',            'HUMIFORTE multi-format kit. Complete range for optimal use on all crops.'],
  'kit-fosnutren':  ['Kit multi-formats FOSNUTREN. Gamme complète de biostimulants pour la floraison et la fructification.',          'FOSNUTREN multi-format kit. Full biostimulant range for flowering and fruiting.'],
  'kit-kadostim':   ['Kit multi-formats KADOSTIM. Gamme complète de stimulants racinaires pour des cultures robustes.',               'KADOSTIM multi-format kit. Full root stimulant range for robust crops.'],
  'kit-aminol':     ["Kit multi-formats AMINOL FORTE. Gamme complète d'acides aminés pour la croissance végétale.",                   'AMINOL FORTE multi-format kit. Complete amino acid range for plant growth.'],
  'kit-naturcare':  ['Kit complet de biofertilisants (5 L). Assortiment complet pour une nutrition optimale de toutes vos cultures.', 'Complete biofertilizer kit (5 L). Full assortment for optimal crop nutrition.'],
  'sarah-uree-50':  ["Urée SARAH 46% (50 kg). Azote à libération rapide pour une croissance végétative vigoureuse.",                  'SARAH Urea 46% (50 kg). Fast-release nitrogen for rapid vegetative growth.'],
  'sarah-20-10-10': ['SARAH NPK équilibré 20-10-10 (50 kg). Nutrition complète pour des rendements élevés.',                         'SARAH balanced NPK 20-10-10 (50 kg). Complete nutrition for high yields.'],
  'sarah-10-30-10': ['SARAH NPK riche en phosphore 10-30-10 (50 kg). Stimule l\'enracinement et la floraison.',                      "SARAH high-phosphorus NPK 10-30-10 (50 kg). Stimulates rooting and flowering."],
  'sarah-00-00-36': ['Engrais potassique SARAH NPK 00-00-36 (50 kg). Renforce la résistance aux maladies.',                          'SARAH potassium fertilizer NPK 00-00-36 (50 kg). Strengthens disease resistance.'],
  'sarah-12-14-10': ['SARAH NPK complet 12-14-10 (50 kg). Riche en P et K pour la floraison et la fructification.',                  'SARAH complete NPK 12-14-10 (50 kg). Rich in P and K for flowering and fruiting.'],
  'sarah-6-8-28':   ['SARAH NPK riche en potassium 6-8-28 (50 kg). Idéal pour la maturation et la qualité des récoltes.',           'SARAH potassium-rich NPK 6-8-28 (50 kg). Ideal for ripening and harvest quality.'],
  'sarah-sulfate':  ["Sulfate d'ammonium SARAH (50 kg). Apport combiné azote + soufre pour cultures exigeantes.",                    'SARAH ammonium sulphate (50 kg). Combined nitrogen and sulphur for demanding crops.'],
  'sarah-uree-25':  ['Urée SARAH 46% (25 kg). Format réduit pour petites exploitations et maraîchage.',                              'SARAH Urea 46% (25 kg). Compact format for small farms and market gardening.'],
};

export default function IntrantsCarousel() {
  const { locale } = useLanguage();
  const en = locale === 'en';

  return (
    <section className="section-premium bg-gray-50 dark:bg-gray-800">
      <div className="container-fluid">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {en ? 'Our Fertilizers & Bio-fertilizers' : 'Nos Engrais & Bio-fertilisants'}
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {en
              ? `${PRODUCTS.length} products — certified range to boost your yields`
              : `${PRODUCTS.length} produits — gamme certifiée pour augmenter vos rendements`}
          </p>
        </motion.div>

        {/* Grille 2 cols mobile → 3 cols tablette → 4 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {PRODUCTS.map((product, index) => {
            const [descFr, descEn] = DESC[product.id] ?? ['', ''];
            const description = en ? descEn : descFr;
            const isPriority = index < 8; // 2 premières lignes desktop = chargement prioritaire

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{
                  delay: Math.min(index * 0.03, 0.24),
                  duration: 0.35,
                  ease: 'easeOut',
                }}
                className="group h-full"
              >
                <div className="h-full rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200 flex flex-col">

                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        priority={isPriority}
                        quality={80}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain p-3 sm:p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 sm:w-14 sm:h-14 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}

                    {/* Badge catégorie */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 leading-none">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    {description && (
                      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 flex-1 line-clamp-2 sm:line-clamp-3">
                        {description}
                      </p>
                    )}

                    {/* CTA */}
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-700 transition-colors mt-auto"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{en ? 'Order' : 'Commander'}</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Lien boutique */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 text-center"
        >
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-emerald-600/20"
          >
            <ShoppingCart className="w-4 h-4" />
            {en ? 'See all offers & buy online' : 'Voir toutes les offres & acheter en ligne'}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
