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

export default function IntrantsCarousel() {
  const { locale } = useLanguage();
  const en = locale === 'en';

  const products: IntrantProduct[] = [
    // ── Biofertilisants 1 litre ──────────────────────────────────
    {
      id: 'humiforte-1l',
      name: 'HUMIFORTE 1L',
      image: '/products/humiforte-20-%201%20litre.png',
      description: en
        ? 'Organic fertilizer with free L-amino acids. Promotes foliage and vegetative growth.'
        : 'Fertilisant organique avec L-aminoacides libres. Favorise le feuillage et la croissance végétative.',
      category: 'Biofertilisant',
    },
    {
      id: 'fosnutren-1l',
      name: 'FOSNUTREN 1L',
      image: '/products/fosnutren-20-1%20litre.png',
      description: en
        ? 'Biostimulant for flowering and fruiting. Guarantees abundant production.'
        : 'Biostimulant pour la floraison et fructification. Garantit une production abondante.',
      category: 'Biofertilisant',
    },
    {
      id: 'kadostim-1l',
      name: 'KADOSTIM 1L',
      image: '/products/kadostim-20-1%20litre.png',
      description: en
        ? 'Potassium-based root stimulant. Strengthens the root system and stress resistance.'
        : 'Stimulant racinaire à base de potassium. Renforce le système racinaire et la résistance au stress.',
      category: 'Biofertilisant',
    },
    {
      id: 'aminol-1l',
      name: 'AMINOL FORTE 1L',
      image: '/products/aminol-20-1%20litre.png',
      description: en
        ? 'Amino acid and microelement complex. Stimulates plant growth and metabolism.'
        : 'Complexe d\'acides aminés et microéléments. Stimule la croissance et le métabolisme des plantes.',
      category: 'Biofertilisant',
    },
    // ── Biofertilisants 5 litres — bidons individuels ────────────
    {
      id: 'humiforte-5l',
      name: 'HUMIFORTE 5L',
      image: '/products/humiforte-20-5litres.png',
      description: en
        ? 'Organic fertilizer with L-amino acids (5 L). Economy format for large farms.'
        : 'Fertilisant organique avec L-aminoacides libres (5 L). Format économique pour grandes exploitations.',
      category: 'Biofertilisant',
    },
    {
      id: 'fosnutren-5l',
      name: 'FOSNUTREN 5L',
      image: '/products/fosnutren-20-5litres.png',
      description: en
        ? 'Flowering and fruiting biostimulant (5 L). Economy format for large farms.'
        : 'Biostimulant pour la floraison et fructification (5 L). Format économique pour grandes exploitations.',
      category: 'Biofertilisant',
    },
    {
      id: 'kadostim-5l',
      name: 'KADOSTIM 5L',
      image: '/products/kadostim-20-5litres.png',
      description: en
        ? 'Root stimulant based on potassium (5 L). Economy format for large farms.'
        : 'Stimulant racinaire à base de potassium (5 L). Format économique pour grandes exploitations.',
      category: 'Biofertilisant',
    },
    {
      id: 'aminol-5l',
      name: 'AMINOL FORTE 5L',
      image: '/products/aminol-20-5litres.png',
      description: en
        ? 'Amino acid complex (5 L). Economy format for large farms.'
        : 'Complexe d\'acides aminés et microéléments (5 L). Format économique pour grandes exploitations.',
      category: 'Biofertilisant',
    },
    // ── Kits multi-bidons (affichage Nos Services uniquement) ────
    {
      id: 'kit-humiforte',
      name: 'KIT HUMIFORTE',
      image: '/products/kit-humiforte-20.png',
      description: en
        ? 'HUMIFORTE multi-format kit. Complete range for optimal use on all crops.'
        : 'Kit multi-formats HUMIFORTE. Gamme complète pour une utilisation optimale sur toutes vos cultures.',
      category: 'Kit Bio',
    },
    {
      id: 'kit-fosnutren',
      name: 'KIT FOSNUTREN',
      image: '/products/kit-fosnutren-20.png',
      description: en
        ? 'FOSNUTREN multi-format kit. Full biostimulant range for flowering and fruiting.'
        : 'Kit multi-formats FOSNUTREN. Gamme complète de biostimulants pour la floraison et la fructification.',
      category: 'Kit Bio',
    },
    {
      id: 'kit-kadostim',
      name: 'KIT KADOSTIM',
      image: '/products/kit-kadostim-20.png',
      description: en
        ? 'KADOSTIM multi-format kit. Full root stimulant range for robust crops.'
        : 'Kit multi-formats KADOSTIM. Gamme complète de stimulants racinaires pour des cultures robustes.',
      category: 'Kit Bio',
    },
    {
      id: 'kit-aminol',
      name: 'KIT AMINOL FORTE',
      image: '/products/kit-aminol-20.png',
      description: en
        ? 'AMINOL FORTE multi-format kit. Complete amino acid range for plant growth.'
        : 'Kit multi-formats AMINOL FORTE. Gamme complète d\'acides aminés pour la croissance végétale.',
      category: 'Kit Bio',
    },
    // ── Kit complet ───────────────────────────────────────────────
    {
      id: 'kit-naturcare',
      name: 'KIT NATURCARE 5L',
      image: '/products/kit-naturcare-terra.webp',
      description: en
        ? 'Complete biofertilizer kit (5 L). Full assortment for optimal crop nutrition.'
        : 'Kit complet de biofertilisants (5 L). Assortiment complet pour une nutrition optimale de toutes vos cultures.',
      category: 'Kit Bio',
    },
    // ── Engrais minéraux SARAH ────────────────────────────────────
    {
      id: 'sarah-uree-50kg',
      name: 'SARAH URÉE 46% 50kg',
      image: '/products/sarah-uree-46.webp',
      description: en
        ? 'SARAH Urea 46% (50 kg). Fast-release nitrogen for rapid vegetative growth.'
        : 'Urée SARAH 46% (50 kg). Azote à libération rapide pour une croissance végétative vigoureuse.',
      category: 'Engrais Minéral',
    },
    {
      id: 'sarah-npk-20-10-10',
      name: 'SARAH NPK 20-10-10 50kg',
      image: '/products/sarah-npk-20-10-10.jpeg',
      description: en
        ? 'SARAH balanced NPK 20-10-10 (50 kg). Complete nutrition for high yields.'
        : 'SARAH NPK équilibré 20-10-10 (50 kg). Nutrition complète pour des rendements élevés.',
      category: 'Engrais Minéral',
    },
    {
      id: 'sarah-npk-10-30-10',
      name: 'SARAH NPK 10-30-10 50kg',
      image: '/products/sarah-npk-10-30-10.webp',
      description: en
        ? 'SARAH high-phosphorus NPK 10-30-10 (50 kg). Stimulates rooting and flowering.'
        : 'SARAH NPK riche en phosphore 10-30-10 (50 kg). Stimule l\'enracinement et la floraison.',
      category: 'Engrais Minéral',
    },
    {
      id: 'sarah-npk-00-00-36',
      name: 'SARAH NPK 00-00-36 50kg',
      image: '',
      description: en
        ? 'SARAH potassium fertilizer NPK 00-00-36 (50 kg). Strengthens disease resistance.'
        : 'Engrais potassique SARAH NPK 00-00-36 (50 kg). Renforce la résistance aux maladies.',
      category: 'Engrais Minéral',
    },
    {
      id: 'sarah-npk-12-14-10',
      name: 'SARAH NPK 12-14-10 50kg',
      image: '/products/sarah-npk-12-14-10.webp',
      description: en
        ? 'SARAH complete NPK 12-14-10 (50 kg). Rich in P and K for flowering and fruiting.'
        : 'SARAH NPK complet 12-14-10 (50 kg). Riche en P et K pour la floraison et la fructification.',
      category: 'Engrais Minéral',
    },
    {
      id: 'sarah-npk-6-8-28',
      name: 'SARAH NPK 6-8-28 50kg',
      image: '',
      description: en
        ? 'SARAH potassium-rich NPK 6-8-28 (50 kg). Ideal for ripening and harvest quality.'
        : 'SARAH NPK riche en potassium 6-8-28 (50 kg). Idéal pour la maturation et la qualité des récoltes.',
      category: 'Engrais Minéral',
    },
    {
      id: 'sarah-sulfate',
      name: 'SARAH Sulfate 50kg',
      image: '',
      description: en
        ? 'SARAH ammonium sulphate (50 kg). Combined nitrogen and sulphur for demanding crops.'
        : 'Sulfate d\'ammonium SARAH (50 kg). Apport combiné azote + soufre pour cultures exigeantes.',
      category: 'Engrais Minéral',
    },
    {
      id: 'sarah-uree-25kg',
      name: 'SARAH Urée 46% 25kg',
      image: '/products/sarah-uree-46-25kg.png',
      description: en
        ? 'SARAH Urea 46% (25 kg). Compact format for small farms and market gardening.'
        : 'Urée SARAH 46% (25 kg). Format réduit pour petites exploitations et maraîchage.',
      category: 'Engrais Minéral',
    },
  ];

  return (
    <section className="section-premium bg-gray-50 dark:bg-gray-800">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {en ? 'Our Fertilizers & Bio-fertilizers' : 'Nos Engrais & Bio-fertilisants'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {en
              ? `${products.length} products — premium selection of certified products to increase your yields`
              : `${products.length} produits — sélection premium de produits certifiés pour augmenter vos rendements`}
          </p>
        </motion.div>

        {/* Grille complète — tous les produits visibles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                delay: Math.min(index * 0.05, 0.4),
                type: 'spring',
                stiffness: 280,
                damping: 24,
              }}
              className="group h-full"
            >
              <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 flex flex-col">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      quality={85}
                      className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-14 h-14 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 backdrop-blur-sm">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-3">
                    {product.description}
                  </p>

                  {/* CTA Button */}
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {en ? 'Order' : 'Commander'}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lien vers la boutique */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-600/20"
          >
            <ShoppingCart className="w-4 h-4" />
            {en ? 'See all offers & buy online' : 'Voir toutes les offres & acheter en ligne'}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
