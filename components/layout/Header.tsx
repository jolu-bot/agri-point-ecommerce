'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { ShoppingCart, User, Menu, X, Sun, Moon, Search, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import DynamicHeaderBranding from './DynamicHeaderBranding';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { items } = useCartStore();

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Boutique', href: '/produits' },
    { 
      name: 'Nos Solutions', 
      href: '#',
      submenu: [
        { name: 'Produire Plus', href: '/produire-plus' },
        { name: 'Gagner Plus', href: '/gagner-plus' },
        { name: 'Mieux Vivre', href: '/mieux-vivre' },
      ]
    },
    { name: '🌱 Campagne Engrais', href: '/campagne-engrais', highlight: true },
    { name: 'Agriculture Urbaine', href: '/agriculture-urbaine' },
    { name: 'À propos', href: '/a-propos' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/96 dark:bg-gray-950/96 backdrop-blur-xl shadow-[0_4px_32px_-8px_rgba(0,0,0,0.14)] dark:shadow-[0_4px_32px_-8px_rgba(0,0,0,0.5)] border-b border-gray-100/80 dark:border-white/[0.04]'
          : 'bg-white dark:bg-gray-950 border-b border-transparent'
      }`}
    >
      {/* Ligne accent émeraude — fil conducteur de marque */}
      <div
        className={`header-accent-line absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-500 pointer-events-none ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-18">
          {/* Logo - Dynamique depuis CMS */}
          <DynamicHeaderBranding />


          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 2xl:space-x-8">
            {navigation.map((item) => (
              item.submenu ? (
                <div 
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() => setOpenSubmenu(item.name)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <button
                    className="text-fluid-sm text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors duration-200 relative group whitespace-nowrap flex items-center gap-1 py-1 px-0.5"
                  >
                    {item.name}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSubmenu === item.name ? 'rotate-180 text-emerald-600' : ''}`} />
                    {/* Dot indicator premium */}
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-0 group-hover:scale-100" />
                  </button>
                  
                  {/* Dropdown Menu — glassmorphism premium */}
                  <div className={`absolute top-full left-0 mt-3 w-52 bg-white/97 dark:bg-gray-950/97 backdrop-blur-xl rounded-xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)] border border-gray-100/80 dark:border-white/[0.06] overflow-hidden transition-all duration-200 ${
                    openSubmenu === item.name ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                  }`}>
                    {/* Accent lateral */}
                    <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-transparent via-emerald-500/60 to-transparent" />
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.name}
                        href={subitem.href}
                        className="group flex items-center gap-2.5 pl-5 pr-4 py-3 text-[13px] text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50/70 dark:hover:bg-emerald-900/15 transition-all duration-150 border-b border-gray-50 dark:border-white/[0.04] last:border-0 font-medium"
                      >
                        <span className="w-1 h-1 rounded-full bg-emerald-500/50 group-hover:bg-emerald-500 group-hover:scale-125 transition-all duration-150 flex-shrink-0" />
                        {subitem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-fluid-sm font-medium transition-all duration-200 relative group whitespace-nowrap py-1 px-0.5 ${
                    (item as any).highlight 
                      ? 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold bg-emerald-50/50 dark:bg-emerald-900/25 px-3 py-1.5 rounded-lg border border-emerald-200/70 dark:border-emerald-700/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:-translate-y-0.5 shadow-sm hover:shadow-emerald-100 dark:hover:shadow-emerald-900/30' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400'
                  }`}
                >
                  {item.name}
                  {!(item as any).highlight && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-200" />
                  )}
                </Link>
              )
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Search - caché sur très petits écrans */}
            <button className="hidden sm:flex p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/25 transition-all duration-150" aria-label="Rechercher">
              <Search className="w-5 h-5 lg:w-5 lg:h-5" />
            </button>

            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/25 transition-all duration-150"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 lg:w-6 lg:h-6" />
                ) : (
                  <Moon className="w-5 h-5 lg:w-6 lg:h-6" />
                )}
              </button>
            )}

            {/* Cart */}
            <Link
              href="/panier"
              className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/25 transition-all duration-150 hover:-translate-y-0.5"
              aria-label="Panier"
            >
              <ShoppingCart className="w-5 h-5 sm:w-5 sm:h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full min-w-[1.1rem] h-[1.1rem] px-0.5 flex items-center justify-center ring-2 ring-white dark:ring-gray-950 shadow-md">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </Link>

            {/* User - visible sur tablette+ */}
            <Link
              href="/compte"
              className="hidden md:flex p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/25 transition-all duration-150"
              aria-label="Mon compte"
            >
              <User className="w-5 h-5 lg:w-6 lg:h-6" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700 dark:text-gray-300"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100/80 dark:border-white/[0.06] animate-fadeInUp bg-white/98 dark:bg-gray-950/98 backdrop-blur-xl">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                item.submenu ? (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === item.name ? null : item.name)}
                      className="w-full text-left text-fluid-base text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between"
                    >
                      {item.name}
                      <ChevronDown className={`w-4 h-4 transition-transform ${openSubmenu === item.name ? 'rotate-180' : ''}`} />
                    </button>
                    {openSubmenu === item.name && (
                      <div className="ml-4 space-y-1 animate-fadeInUp">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.name}
                            href={subitem.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            {subitem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-fluid-base font-medium transition-colors px-3 py-2 rounded-lg ${
                      (item as any).highlight 
                        ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              <Link
                href="/compte"
                onClick={() => setIsMenuOpen(false)}
                className="text-fluid-base text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center md:hidden"
              >
                <User className="w-5 h-5 mr-2" />
                Mon Compte
              </Link>
              {/* Search mobile */}
              <button className="sm:hidden text-fluid-base text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center" aria-label="Rechercher">
                <Search className="w-5 h-5 mr-2" />
                Rechercher
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
