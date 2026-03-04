'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ComponentType } from 'react';
import { Sprout, Leaf, Flower2, FlaskConical, Scale, Globe, Zap, Sparkles, Wheat, Building2 } from 'lucide-react';

interface ProductInfo {
  name: string;
  benefit: string;
  Icon: ComponentType<{ className?: string }>;
}

const PRODUCT_CATALOG: ProductInfo[] = [
  { name: 'SARAH NPK 20-10-10', benefit: 'Production de fruits', Icon: Sprout },
  { name: 'AMINOL-20', benefit: 'Développement racinaire', Icon: Leaf },
  { name: 'SARAH NPK 10-30-10', benefit: 'Floraison optimale', Icon: Flower2 },
  { name: 'FOSNUTREN-20', benefit: 'Croissance végétale', Icon: FlaskConical },
  { name: 'SARAH NPK 12-14-10', benefit: 'Rendement équilibré', Icon: Scale },
  { name: 'HUMIFORTE-20', benefit: 'Fertilité du sol', Icon: Globe },
  { name: 'SARAH URÉE-46', benefit: 'Azote concentré', Icon: Zap },
  { name: 'KADOSTIM-20', benefit: 'Stimulation racinaire', Icon: Sparkles },
  { name: 'KIT NATURCARE TERRA', benefit: 'Agriculture biologique', Icon: Wheat },
  { name: 'KIT URBAIN DÉBUTANT', benefit: 'Culture citadine', Icon: Building2 },
];

interface DynamicProductCardProps {
  currentIndex: number;
  position?: 'bottom-left' | 'top-right';
}

export default function DynamicProductCard({
  currentIndex,
  position = 'bottom-left',
}: DynamicProductCardProps) {
  const product = PRODUCT_CATALOG[currentIndex % PRODUCT_CATALOG.length];
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, [currentIndex]);

  const positionClasses = {
    'bottom-left': 'bottom-6 left-6 lg:bottom-8 lg:left-8',
    'top-right': 'top-6 right-6 lg:top-8 lg:right-8',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
      transition={{ duration: 0.3 }}
      className={`absolute ${positionClasses[position]} z-20 hidden md:block`}
    >
      <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-4 lg:p-5 max-w-[240px] lg:max-w-[280px] hover-lift group">
        {/* Icon + Name */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <product.Icon className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm lg:text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </div>
        </div>

        {/* Benefit */}
        <p className="text-xs lg:text-sm text-emerald-300/90 flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
          {product.benefit}
        </p>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-emerald-500/20 via-transparent to-transparent" />
      </div>
    </motion.div>
  );
}
