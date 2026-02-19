'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { ShoppingCart, User, Menu, X, Sun, Moon, Search, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex-shrink-0 transform group-hover:scale-105 transition-transform">
              <Image
                src="/images/logo.svg"
                alt="AGRI POINT Logo"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 40px, (max-width: 1024px) 48px, 56px"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="font-display text-base xs:text-lg sm:text-xl lg:text-2xl font-extrabold text-gradient-primary leading-tight whitespace-nowrap">
                AGRI POINT
              </div>
              <div className="text-xs sm:text-xs lg:text-sm text-emerald-600 dark:text-emerald-400 font-semibold leading-tight whitespace-nowrap">
                Service Agricole
              </div>
            </div>
          </Link>

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
                    className="text-fluid-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group whitespace-nowrap flex items-center gap-1"
                  >
                    {item.name}
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSubmenu === item.name ? 'rotate-180' : ''}`} />
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className={`absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${openSubmenu === item.name ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.name}
                        href={subitem.href}
                        className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        {subitem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-fluid-sm font-medium transition-colors relative group whitespace-nowrap ${
                    (item as any).highlight 
                      ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold bg-green-50/30 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  {item.name}
                  {!(item as any).highlight && (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300" />
                  )}
                </Link>
              )
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Search - caché sur très petits écrans */}
            <button className="hidden sm:flex p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" aria-label="Rechercher">
              <Search className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>

            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
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
              className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              aria-label="Panier"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </Link>

            {/* User - visible sur tablette+ */}
            <Link
              href="/compte"
              className="hidden md:flex p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
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
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-fadeInUp">
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
