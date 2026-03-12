'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { Wheat, Fish, TreePine, ArrowLeftRight, Landmark, ShieldCheck, Megaphone, ShoppingCart, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Each sector: unique gradient + glow shadow + target route
const SECTOR_DATA = [
  { Icon: Wheat,           gradient: 'from-emerald-400 to-green-600',   shadow: 'group-hover:shadow-emerald-500/40',  href: '/produire-plus'       },
  { Icon: Fish,            gradient: 'from-cyan-400    to-blue-600',     shadow: 'group-hover:shadow-cyan-500/40',     href: '/produire-plus'       },
  { Icon: TreePine,        gradient: 'from-teal-400    to-emerald-700',  shadow: 'group-hover:shadow-teal-500/40',     href: '/fourniture-intrants' },
  { Icon: ArrowLeftRight,  gradient: 'from-amber-400   to-orange-500',   shadow: 'group-hover:shadow-amber-500/40',    href: '/gagner-plus'         },
  { Icon: Landmark,        gradient: 'from-violet-400  to-purple-600',   shadow: 'group-hover:shadow-violet-500/40',   href: '/mieux-vivre'         },
  { Icon: ShieldCheck,     gradient: 'from-blue-400    to-indigo-600',   shadow: 'group-hover:shadow-blue-500/40',     href: '/mieux-vivre'         },
  { Icon: Megaphone,       gradient: 'from-rose-400    to-red-600',      shadow: 'group-hover:shadow-rose-500/40',     href: '/contact'             },
  { Icon: ShoppingCart,    gradient: 'from-lime-400    to-green-600',    shadow: 'group-hover:shadow-lime-500/40',     href: '/produits'            },
] as const;

export default function SectorsGrid() {
  const { T } = useLanguage();
  const sectors = SECTOR_DATA.map((data, i) => ({
    ...data,
    title:       (T.sectors as Record<string, string>)[`s${i + 1}Title`],
    description: (T.sectors as Record<string, string>)[`s${i + 1}Desc`],
  }));

  return (
    <section className="section-premium bg-gradient-to-br from-[#1B5E20] via-[#1e6622] to-[#2E7D32] text-white relative overflow-hidden">
      {/* ── Decorative ambient lights ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-white/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-black/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(255,255,255,0.05)_0%,transparent_60%)]" />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
      </div>

      <div className="container-fluid relative">
        {/* ── Section header ── */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/25 bg-white/[0.12] backdrop-blur-md text-sm font-semibold mb-6 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" aria-hidden />
            {T.sectors.tag}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            {T.sectors.title}{' '}
            <span className="text-red-400">{T.sectors.titleHighlight}</span>
          </h2>
          <p className="text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            {T.sectors.subtitle}
          </p>
        </m.div>

        {/* ── Sector cards grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {sectors.map((sector, index) => {
            const Icon = sector.Icon;
            return (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: index * 0.055, type: 'spring', stiffness: 260, damping: 24 }}
              >
                <Link
                  href={sector.href}
                  className={`group flex flex-col h-full rounded-2xl p-5 border transition-all duration-300
                    bg-white/[0.08] hover:bg-white/[0.15]
                    border-white/[0.12] hover:border-white/30
                    hover:-translate-y-2 hover:shadow-2xl ${sector.shadow}
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                  `}
                >
                  {/* Icon — unique gradient bubble */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4
                      bg-gradient-to-br ${sector.gradient}
                      shadow-lg group-hover:scale-110 group-hover:rotate-[-4deg]
                      transition-transform duration-300
                    `}
                  >
                    <Icon className="w-5.5 h-5.5 text-white drop-shadow-sm" strokeWidth={2.1} aria-hidden />
                  </div>

                  {/* Text */}
                  <h3 className="font-bold text-[14px] sm:text-[15px] mb-1.5 text-red-300 group-hover:text-red-200 transition-colors leading-snug">
                    {sector.title}
                  </h3>
                  <p className="text-[12px] sm:text-sm text-white/60 group-hover:text-white/80 leading-relaxed transition-colors flex-1">
                    {sector.description}
                  </p>

                  {/* Discover CTA */}
                  <div className="mt-4 flex items-center gap-1.5 text-white/40 group-hover:text-white/90 transition-all duration-200 text-xs font-semibold">
                    <span>Découvrir</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1.5 transition-transform duration-200" aria-hidden />
                  </div>
                </Link>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
