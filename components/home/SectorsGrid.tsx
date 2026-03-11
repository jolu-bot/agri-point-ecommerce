'use client';

import { m } from 'framer-motion';
import { Wheat, Fish, TreePine, ArrowLeftRight, Landmark, ShieldCheck, Megaphone, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SECTOR_ICONS = [Wheat, Fish, TreePine, ArrowLeftRight, Landmark, ShieldCheck, Megaphone, ShoppingCart];

export default function SectorsGrid() {
  const { T } = useLanguage();
  const sectors = SECTOR_ICONS.map((Icon, i) => ({
    Icon,
    title: (T.sectors as Record<string, string>)[`s${i + 1}Title`],
    description: (T.sectors as Record<string, string>)[`s${i + 1}Desc`],
  }));
  return (
    <section className="section-premium bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white">
      <div className="container-fluid">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/25 bg-white/15 backdrop-blur-md text-sm font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            {T.sectors.tag}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            {T.sectors.title} <span className="text-emerald-300">{T.sectors.titleHighlight}</span>
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {T.sectors.subtitle}
          </p>
          </m.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {sectors.map((sector, index) => {
            const Icon = sector.Icon;
            return (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 24 }}
                className="group bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-base mb-1.5">{sector.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{sector.description}</p>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
