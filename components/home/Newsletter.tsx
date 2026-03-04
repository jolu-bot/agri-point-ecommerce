'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, Leaf, CheckCircle, Gift, Megaphone } from 'lucide-react';

const perks = [
  { icon: Leaf,       text: 'Conseils agricoles exclusifs' },
  { icon: Gift,       text: 'Offres membres en avant-première' },
  { icon: Megaphone,  text: 'Nouveaux produits en primeur' },
];

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    toast.success('Merci ! Vous êtes inscrit à notre newsletter.');
    setEmail('');
    setLoading(false);
    setDone(true);
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-green-900" />
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center p-8 md:p-12">
            {/* Left */}
            <div className="text-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-300" />
                </div>
                <span className="text-emerald-300 text-sm font-semibold tracking-wider uppercase">Newsletter</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
                Cultivez votre<br />
                <span className="text-emerald-300">savoir agricole</span>
              </h2>
              <p className="text-emerald-100/80 mb-6 leading-relaxed">
                Rejoignez plus de 5 000 agriculteurs qui reçoivent nos conseils chaque semaine.
              </p>
              <ul className="space-y-2.5">
                {perks.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-emerald-100/90">
                      <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-emerald-300" strokeWidth={2.2} />
                      </div>
                      <span>{p.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right */}
            <div>
              {done ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center"
                >
                  <CheckCircle className="w-14 h-14 text-emerald-300 mx-auto mb-3" />
                  <h3 className="text-white text-xl font-bold mb-1">Bienvenue !</h3>
                  <p className="text-emerald-100/80 text-sm">Vous recevrez bientôt nos conseils.</p>
                </motion.div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8">
                  <p className="text-white font-semibold mb-4">Votre email, c&apos;est parti 🚀</p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <label htmlFor="newsletter-email" className="sr-only">Adresse email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/50 w-5 h-5" />
                      <input
                        id="newsletter-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        required
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl transition-all duration-200 disabled:opacity-60 group"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>S&apos;inscrire gratuitement</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                  <p className="text-xs text-emerald-200/60 mt-3 text-center">
                    🔒 Vos données restent confidentielles. Désinscription en 1 clic.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

