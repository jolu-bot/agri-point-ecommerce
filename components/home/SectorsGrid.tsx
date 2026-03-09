'use client';

import { motion } from 'framer-motion';
import { Wheat, Fish, TreePine, ArrowLeftRight, Landmark, ShieldCheck, Megaphone, ShoppingCart } from 'lucide-react';

const sectors = [
  {
    Icon: Wheat,
    title: 'Production Agricole',
    description: 'Cultures vivrières, maraîchage et agriculture de rente',
    color: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    Icon: Fish,
    title: 'Élevage & Pisciculture',
    description: 'Systèmes d\'élevage, aquaculture et production animale',
    color: 'from-teal-500 to-cyan-600',
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    iconColor: 'text-teal-700 dark:text-teal-300',
  },
  {
    Icon: TreePine,
    title: 'Sylviculture & Bois',
    description: 'Exploitation forestière durable et transformation du bois',
    color: 'from-green-600 to-emerald-700',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-700 dark:text-green-300',
  },
  {
    Icon: ArrowLeftRight,
    title: 'Import-Export',
    description: 'Facilitation des échanges commerciaux nationaux et internationaux',
    color: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-700 dark:text-blue-300',
  },
  {
    Icon: Landmark,
    title: 'Micro Crédit',
    description: 'Accès au financement et accompagnement des porteurs de projets',
    color: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-700 dark:text-amber-300',
  },
  {
    Icon: ShieldCheck,
    title: 'Assurances',
    description: 'Protection des exploitants et sécurisation des activités',
    color: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-700 dark:text-violet-300',
  },
  {
    Icon: Megaphone,
    title: 'Communication',
    description: 'Visibilité, mise en réseau et promotion des acteurs',
    color: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconColor: 'text-rose-700 dark:text-rose-300',
  },
  {
    Icon: ShoppingCart,
    title: 'Commercialisation',
    description: 'Débouchés, négociation des prix et accès aux marchés',
    color: 'from-orange-500 to-red-600',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconColor: 'text-orange-700 dark:text-orange-300',
  },
];

export default function SectorsGrid() {
  return (
    <section className="section-premium bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/25 bg-white/15 backdrop-blur-md text-sm font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Nos filières d&apos;intervention
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Un accompagnement <span className="text-emerald-300">multisectoriel</span>
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            AGRIPOINT SERVICES intervient comme facilitateur dans l&apos;ensemble des filières agropastorales et connexes.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {sectors.map((sector, index) => {
            const Icon = sector.Icon;
            return (
              <motion.div
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
