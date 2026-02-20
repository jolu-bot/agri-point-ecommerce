'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, MessageCircle, ArrowUpRight, Leaf, Globe } from 'lucide-react';

const footerLinks = {
  solutions: [
    { label: 'Produire Plus', href: '/produire-plus' },
    { label: 'Gagner Plus', href: '/gagner-plus' },
    { label: 'Mieux Vivre', href: '/mieux-vivre' },
    { label: 'Agriculture Urbaine', href: '/agriculture-urbaine' },
    { label: 'Campagne Engrais', href: '/campagne-engrais' },
  ],
  boutique: [
    { label: 'Biofertilisants', href: '/produits?category=biofertilisant' },
    { label: 'Engrais Minéraux', href: '/produits?category=engrais' },
    { label: 'Kits Urbains', href: '/produits?category=kit' },
    { label: 'Services', href: '/produits?category=service' },
    { label: 'Semences', href: '/produits?category=semence' },
  ],
};

const socials = [
  { icon: Facebook, label: 'Facebook', href: '#', color: 'hover:bg-blue-600' },
  { icon: Instagram, label: 'Instagram', href: '#', color: 'hover:bg-pink-600' },
  { icon: Twitter, label: 'Twitter / X', href: '#', color: 'hover:bg-sky-500' },
  { icon: Linkedin, label: 'LinkedIn', href: '#', color: 'hover:bg-blue-700' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#0a0f0d] text-gray-400">

      {/* Texture grain subtile */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />

      {/* Lueur d'ambiance verte */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #16a34a 0%, transparent 70%)' }}
      />

      {/* PRE-FOOTER — Bande d'impact */}
      <div className="relative border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-500 font-semibold mb-1">Agriculture Connectée · Cameroun</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
              Prêt à transformer votre exploitation ?
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/produits"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-900/40 hover:-translate-y-0.5"
            >
              Découvrir nos produits
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:border-emerald-600/50 text-gray-300 hover:text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 bg-white/5 hover:bg-white/10"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>

      {/* CORPS PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand col (4/12) */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3 group mb-5">
              <div className="relative w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-emerald-500/40 bg-gray-900 p-1 transition-all">
                <Image src="/images/logo.svg" alt="AGRI POINT" fill className="object-contain" />
              </div>
              <div className="flex flex-col leading-snug">
                <div className="flex items-baseline gap-1">
                  <span className="text-[17px] font-extrabold tracking-[0.12em] text-white uppercase">AGRI</span>
                  <span className="text-[17px] font-extrabold tracking-[0.12em] text-emerald-400 uppercase">POINT</span>
                </div>
                <span className="text-[9.5px] tracking-[0.22em] text-gray-500 uppercase font-medium">Services SARL</span>
              </div>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-700/30 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-[11px] font-semibold text-emerald-300 tracking-wide whitespace-nowrap">
                Distributeur Officiel pour le Cameroun
              </span>
            </div>

            <p className="text-[13px] text-gray-500 leading-relaxed mb-6 max-w-xs">
              Le partenaire sûr de l&apos;entrepreneur agricole.
              <span className="block mt-1 font-semibold text-gray-400">
                Produire plus · Gagner plus · Mieux vivre.
              </span>
            </p>

            <div className="h-px w-full bg-gradient-to-r from-emerald-700/40 via-gray-700/20 to-transparent mb-6" />

            <div className="flex gap-2 mb-6">
              {socials.map(({ icon: Icon, label, href, color }) => (
                <a key={label} href={href} aria-label={label}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/[0.08] text-gray-500 hover:text-white transition-all duration-200 hover:scale-110 hover:border-transparent ${color}`}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/[0.08]">
                <Leaf className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span className="text-[10px] text-gray-400 font-medium tracking-wide">100% Bio</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/[0.08]">
                <Globe className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span className="text-[10px] text-gray-400 font-medium tracking-wide">www.agri-ps.com</span>
              </div>
            </div>
          </div>

          {/* Solutions col (2/12) */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-emerald-500 font-bold mb-5 flex items-center gap-2">
              <span className="w-4 h-px bg-emerald-600 inline-block" />Solutions
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.solutions.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="group text-[13px] text-gray-500 hover:text-white transition-colors duration-150 flex items-center gap-2">
                    <span className="w-0 h-px bg-emerald-500 group-hover:w-3 transition-all duration-200 flex-shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Boutique col (2/12) */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-emerald-500 font-bold mb-5 flex items-center gap-2">
              <span className="w-4 h-px bg-emerald-600 inline-block" />Boutique
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.boutique.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="group text-[13px] text-gray-500 hover:text-white transition-colors duration-150 flex items-center gap-2">
                    <span className="w-0 h-px bg-emerald-500 group-hover:w-3 transition-all duration-200 flex-shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact col (4/12) */}
          <div className="lg:col-span-4">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-emerald-500 font-bold mb-5 flex items-center gap-2">
              <span className="w-4 h-px bg-emerald-600 inline-block" />Nous Joindre
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="https://maps.google.com/?q=Quartier+Fouda+Yaoundé+Cameroun" target="_blank" rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-emerald-700/30 transition-all duration-200">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-300">Quartier Fouda</p>
                    <p className="text-[11px] text-gray-500">B.P. 5111 Yaoundé, Cameroun</p>
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <a href="tel:+237657393939" className="text-[12px] font-semibold text-gray-300 hover:text-emerald-400 transition-colors">(+237) 657 39 39 39</a>
                  <a href="tel:+237651920920" className="text-[12px] font-semibold text-gray-300 hover:text-emerald-400 transition-colors">(+237) 651 92 09 20</a>
                </div>
              </li>
              <li>
                <a href="https://wa.me/237651920920" target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-[#25D36620] border border-white/5 hover:border-[#25D366]/30 transition-all duration-200">
                  <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 group-hover:bg-[#25D366]/20 flex items-center justify-center flex-shrink-0 transition-all">
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-300 group-hover:text-[#25D366] transition-colors">WhatsApp Direct</p>
                    <p className="text-[11px] text-gray-500">651 92 09 20</p>
                  </div>
                </a>
              </li>
              <li>
                <a href="mailto:infos@agri-ps.com"
                  className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-emerald-700/30 transition-all duration-200">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[12px] font-semibold text-gray-300 group-hover:text-emerald-400 transition-colors">infos@agri-ps.com</span>
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="relative border-t border-white/[0.06]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-700/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
              <p className="text-[11px] text-gray-600 whitespace-nowrap">
                © {currentYear} <span className="text-gray-500 font-medium">AGRI POINT SERVICES SARL</span> — Tous droits réservés.
              </p>
              <span className="hidden sm:block w-px h-3 bg-gray-700" />
              <a href="https://www.joyeds.com" target="_blank" rel="noopener noreferrer"
                className="text-[11px] text-gray-600 hover:text-emerald-500 transition-colors group flex items-center gap-1">
                Crafted by <span className="font-semibold text-gray-500 group-hover:text-emerald-400 transition-colors ml-1">JoYed&apos;S</span>
                <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <div className="flex items-center gap-5">
              {[
                { label: 'Mentions légales', href: '/mentions-legales' },
                { label: 'Confidentialité', href: '/confidentialite' },
                { label: 'CGV', href: '/cgv' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} className="text-[11px] text-gray-600 hover:text-gray-300 transition-colors whitespace-nowrap">{label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
