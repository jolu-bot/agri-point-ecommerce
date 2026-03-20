'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator } from 'lucide-react';

interface ProductForCalc {
  name: string;
  category: string;
  price: number;
  promoPrice?: number;
  weight?: number;
  features?: {
    dosage?: string;
    cultures?: string[];
  };
}

interface Props {
  product: ProductForCalc;
  en?: boolean;
}

interface CalcResult {
  productNeeded: number;
  unitsNeeded: number;
  totalCost: number;
  unitSize: number;
  unit: string;
}

function getUnitSize(product: ProductForCalc): { size: number; unit: string } {
  const n = product.name.toLowerCase();
  if (n.includes('5l'))   return { size: 5,  unit: 'L' };
  if (n.includes('1l'))   return { size: 1,  unit: 'L' };
  if (n.includes('50kg')) return { size: 50, unit: 'kg' };
  if (n.includes('25kg')) return { size: 25, unit: 'kg' };
  if (product.weight) {
    return product.category === 'biofertilisant'
      ? { size: product.weight, unit: 'L' }
      : { size: product.weight, unit: 'kg' };
  }
  return product.category === 'biofertilisant' ? { size: 1, unit: 'L' } : { size: 50, unit: 'kg' };
}

function parseDosageRate(dosage: string, category: string): number {
  if (category === 'biofertilisant') {
    // "2-3 mL/L, 200-400 L/ha" pattern
    const full = dosage.match(/(\d+)[-–](\d+)\s*mL\/L.*?(\d+)[-–](\d+)\s*L\/ha/i);
    if (full) {
      const conc = (parseInt(full[1]) + parseInt(full[2])) / 2;
      const vol  = (parseInt(full[3]) + parseInt(full[4])) / 2;
      return (conc / 1000) * vol;
    }
    // "1-2 L/ha" simple pattern
    const range = dosage.match(/(\d+(?:\.\d+)?)[-–](\d+(?:\.\d+)?)\s*L\/ha/i);
    if (range) return (parseFloat(range[1]) + parseFloat(range[2])) / 2;
    const single = dosage.match(/(\d+(?:\.\d+)?)\s*L\/ha/i);
    if (single) return parseFloat(single[1]);
    return 1; // fallback
  } else {
    const range = dosage.match(/(\d+)[-–](\d+)\s*kg\/ha/i);
    if (range) return (parseInt(range[1]) + parseInt(range[2])) / 2;
    const single = dosage.match(/(\d+)\s*kg\/ha/i);
    if (single) return parseInt(single[1]);
    return 150; // fallback
  }
}

export default function DoseCalculator({ product, en = false }: Props) {
  const [surface, setSurface]       = useState('1');
  const [surfaceUnit, setSurfaceUnit] = useState<'ha' | 'm2'>('ha');
  const [result, setResult]         = useState<CalcResult | null>(null);

  const { size: unitSize, unit: productUnit } = getUnitSize(product);

  const calculate = useCallback(() => {
    const raw = parseFloat(surface);
    if (!raw || raw <= 0) return;
    const surfaceHa = surfaceUnit === 'm2' ? raw / 10_000 : raw;
    const dosage    = product.features?.dosage ?? '';
    const ratePerHa = parseDosageRate(dosage, product.category);
    const productNeeded = surfaceHa * ratePerHa;
    const unitsNeeded   = Math.max(1, Math.ceil(productNeeded / unitSize));
    const totalCost     = unitsNeeded * (product.promoPrice ?? product.price);
    setResult({ productNeeded, unitsNeeded, totalCost, unitSize, unit: productUnit });
  }, [surface, surfaceUnit, product, unitSize, productUnit]);

  return (
    <div className="border border-emerald-200 dark:border-emerald-800/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40">
        <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
          {en ? 'Dose Calculator' : 'Calculatrice de dose'}
        </h3>
      </div>

      <div className="p-5 space-y-4 bg-white dark:bg-gray-900/50">
        {/* Surface input */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            {en ? 'Surface area' : 'Surface à traiter'}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={surface}
              onChange={e => setSurface(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
              {(['ha', 'm2'] as const).map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setSurfaceUnit(u)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    surfaceUnit === u
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {u === 'm2' ? 'm²' : 'ha'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={calculate}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors"
        >
          {en ? 'Calculate' : 'Calculer'}
        </button>

        <AnimatePresence>
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="grid grid-cols-3 gap-3 pt-1"
            >
              <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase mb-1">
                  {en ? 'Quantity' : 'Quantité'}
                </p>
                <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
                  {result.productNeeded < 1
                    ? `${Math.round(result.productNeeded * 1000)} mL`
                    : `${result.productNeeded.toFixed(1)} ${result.unit}`}
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <p className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold uppercase mb-1">
                  {en ? 'Units' : 'Unités'}
                </p>
                <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
                  {result.unitsNeeded}
                  <span className="text-xs font-semibold ml-0.5 text-blue-600 dark:text-blue-400">
                    ×{result.unitSize}{result.unit}
                  </span>
                </p>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/40">
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase mb-1">
                  {en ? 'Est. Cost' : 'Coût estimé'}
                </p>
                <p className="text-sm font-black text-gray-900 dark:text-white leading-none">
                  {result.totalCost.toLocaleString('fr-FR')}
                  <span className="text-[10px] ml-0.5 text-amber-600 dark:text-amber-400"> FCFA</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-snug">
          {en
            ? '* Estimate based on recommended dosage. Contact our team for personalised advice.'
            : '* Estimation basée sur la dose recommandée. Contactez notre équipe pour un conseil personnalisé.'}
        </p>
      </div>
    </div>
  );
}
