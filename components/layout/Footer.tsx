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
          {/* À propos */}
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-20 h-20">
                <Image
                  src="/images/logo.svg"
                  alt="AGRI POINT Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">AGRI POINT</div>
                <div className="text-base text-emerald-400 font-semibold">Service Agricole</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Le partenaire sûr de l&apos;entrepreneur agricole. Produire plus, Gagner plus, Mieux vivre.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
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
                <a href="tel:+237657393939" className="text-sm hover:text-primary-400 transition-colors">
                  +237 657 39 39 39
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <a href="https://wa.me/237676026601" className="text-sm hover:text-primary-400 transition-colors">
                  676 02 66 01
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
                © {currentYear} AGRI POINT. Tous droits réservés.
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
