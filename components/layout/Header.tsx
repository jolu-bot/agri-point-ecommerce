'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ShoppingCart, User, Menu, X, Sun, Moon, Search, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import DynamicHeaderBranding from './DynamicHeaderBranding';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { items } = useCartStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus l'input de recherche à l'ouverture
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [isSearchOpen]);

  // Soumission de la recherche → redirect vers /produits?search=...
  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produits?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, router]);

  // Détection de l'onglet actif
  const isNavActive = useCallback((item: { href: string; submenu?: { name: string; href: string }[] }) => {
    if (item.href === '/') return pathname === '/';
    if (item.submenu) return item.submenu.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'));
    return pathname === item.href || pathname.startsWith(item.href + '/');
  }, [pathname]);

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
                    className={`text-fluid-sm font-medium transition-colors duration-200 relative group whitespace-nowrap flex items-center gap-1 py-1 px-0.5 ${
                      isNavActive(item)
                        ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400'
                    }`}
                  >
                    {item.name}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSubmenu === item.name ? 'rotate-180 text-emerald-600' : ''}`} />
                    {/* Indicateur actif / hover */}
                    <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-emerald-500 transition-all duration-200 ${
                      isNavActive(item) ? 'w-4/5 opacity-100' : 'w-0 opacity-0 group-hover:w-4/5 group-hover:opacity-100'
                    }`} />
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
                      ? `text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold px-3 py-1.5 rounded-lg border hover:-translate-y-0.5 shadow-sm ${
                          isNavActive(item)
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 dark:border-emerald-600'
                            : 'bg-emerald-50/50 dark:bg-emerald-900/25 border-emerald-200/70 dark:border-emerald-700/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
                        }`
                      : isNavActive(item)
                        ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400'
                  }`}
                >
                  {item.name}
                  {!(item as any).highlight && (
                    <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-emerald-500 transition-all duration-200 ${
                      isNavActive(item) ? 'w-4/5 opacity-100' : 'w-0 opacity-0 group-hover:w-4/5 group-hover:opacity-100'
                    }`} />
                  )}
                </Link>
              )
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Search expandable — caché sur très petits écrans */}
            <div className="hidden sm:flex items-center">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-1 animate-fadeInUp">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Escape') { setIsSearchOpen(false); setSearchQuery(''); } }}
                    placeholder="Rechercher un produit…"
                    className="w-44 lg:w-56 px-3 py-1.5 text-sm rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200"
                  />
                  <button type="submit" className="p-2 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/25 transition-all duration-150" aria-label="Lancer la recherche">
                    <Search className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150" aria-label="Fermer la recherche">
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/25 transition-all duration-150"
                  aria-label="Rechercher"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

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
                    className={`text-fluid-base font-medium transition-colors px-3 py-2 rounded-lg flex items-center justify-between ${
                      (item as any).highlight 
                        ? 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                        : isNavActive(item)
                          ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/70 dark:bg-emerald-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.name}
                    {isNavActive(item) && !(item as any).highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
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
              {/* Search mobile fonctionnel */}
              <form
                onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2"
              >
                <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un produit…"
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                  />
                </div>
                <button type="submit" className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                  OK
                </button>
              </form>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
