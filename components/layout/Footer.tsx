'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            {/* Logo + Nom */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden ring-2 ring-emerald-500/30 bg-gray-800 p-1">
                <Image
                  src="/images/logo.svg"
                  alt="AGRI POINT Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold tracking-widest text-white uppercase">AGRI</span>
                  <span className="text-lg font-extrabold tracking-widest text-emerald-400 uppercase">POINT</span>
                </div>
                <span className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-medium">Services SARL</span>
              </div>
            </div>

            {/* Badge Distributeur */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/40 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
              <span className="text-[11px] font-semibold text-emerald-300 tracking-wide whitespace-nowrap">
                Distributeur Officiel pour le Cameroun
              </span>
            </div>

            {/* Séparateur dégradé */}
            <div className="h-px w-full bg-gradient-to-r from-emerald-600/50 via-gray-600/30 to-transparent mb-4" />

            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Le partenaire sûr de l&apos;entrepreneur agricole.<br />
              <span className="text-emerald-500 font-medium">Produire plus · Gagner plus · Mieux vivre.</span>
            </p>

            {/* Réseaux sociaux */}
            <div className="flex gap-2">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-emerald-600 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 border border-gray-700/50 hover:border-emerald-500"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/produits" className="text-sm hover:text-primary-400 transition-colors">
                  Boutique
                </Link>
              </li>
              <li>
                <Link href="/produire-plus" className="text-sm hover:text-primary-400 transition-colors">
                  Produire Plus
                </Link>
              </li>
              <li>
                <Link href="/gagner-plus" className="text-sm hover:text-primary-400 transition-colors">
                  Gagner Plus
                </Link>
              </li>
              <li>
                <Link href="/mieux-vivre" className="text-sm hover:text-primary-400 transition-colors">
                  Mieux Vivre
                </Link>
              </li>
              <li>
                <Link href="/agriculture-urbaine" className="text-sm hover:text-primary-400 transition-colors">
                  Agriculture Urbaine
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-sm hover:text-primary-400 transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Catégories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/produits?category=biofertilisant" className="text-sm hover:text-primary-400 transition-colors">
                  Biofertilisants
                </Link>
              </li>
              <li>
                <Link href="/produits?category=engrais" className="text-sm hover:text-primary-400 transition-colors">
                  Engrais Minéraux
                </Link>
              </li>
              <li>
                <Link href="/produits?category=kit" className="text-sm hover:text-primary-400 transition-colors">
                  Kits Urbains
                </Link>
              </li>
              <li>
                <Link href="/produits?category=service" className="text-sm hover:text-primary-400 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/produits?category=semence" className="text-sm hover:text-primary-400 transition-colors">
                  Semences
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  B.P. 5111 Yaoundé<br />
                  Quartier Fouda, Cameroun
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <a href="tel:+237657393939" className="text-sm hover:text-primary-400 transition-colors">
                    (+237) 657 39 39 39
                  </a>
                  <a href="tel:+237651920920" className="text-sm hover:text-primary-400 transition-colors">
                    (+237) 651 92 09 20
                  </a>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <a href="https://wa.me/237651920920" className="text-sm hover:text-primary-400 transition-colors">
                  WhatsApp: 651 92 09 20
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <a href="mailto:infos@agri-ps.com" className="text-sm hover:text-primary-400 transition-colors">
                  infos@agri-ps.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-sm text-gray-400">
                © {currentYear} AGRI POINT SERVICES SARL. Tous droits réservés.
              </p>
              <a 
                href="https://www.joyeds.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-primary-400 transition-colors"
              >
                Powered By JoYed&apos;S
              </a>
            </div>
            <div className="flex space-x-6">
              <Link href="/mentions-legales" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                Mentions légales
              </Link>
              <Link href="/confidentialite" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                Confidentialité
              </Link>
              <Link href="/cgv" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                CGV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
