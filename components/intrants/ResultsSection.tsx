'use client';

import AnimatedCounter from '@/components/shared/AnimatedCounter';

export default function ResultsSection() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Résultats Mesurables</h3>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border-l-4 border-emerald-600 bg-gray-50 dark:bg-gray-800">
          <p className="text-4xl font-bold text-emerald-600 mb-2">
            <AnimatedCounter 
              to={30} 
              duration={2.5} 
              prefix="+" 
              suffix="%" 
              format={(v) => Math.round(v).toString()}
            />
          </p>
          <p className="text-gray-600 dark:text-gray-300">Augmentation moyenne des rendements</p>
        </div>
        <div className="p-6 rounded-xl border-l-4 border-emerald-600 bg-gray-50 dark:bg-gray-800">
          <p className="text-4xl font-bold text-emerald-600 mb-2">
            <AnimatedCounter 
              to={100} 
              duration={2} 
              suffix="%" 
              format={(v) => Math.round(v).toString()}
            />
          </p>
          <p className="text-gray-600 dark:text-gray-300">Produits bio-certifiés</p>
        </div>
      </div>
    </div>
  );
}
