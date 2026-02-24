'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Truck,
  Eye,
  BarChart2,
  Sprout,
  Settings,
  MessageSquare,
  Calendar,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  productsGrowth: number;
  usersGrowth: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  date: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending:    { label: 'En attente',  color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',    icon: Clock },
  processing: { label: 'En cours',   color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',         icon: RefreshCw },
  shipped:    { label: 'ExpÃ©diÃ©e',   color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400', icon: Truck },
  delivered:  { label: 'LivrÃ©e',     color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400', icon: CheckCircle2 },
  cancelled:  { label: 'AnnulÃ©e',    color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',             icon: XCircle },
};

const QUICK_ACTIONS = [
  { icon: Package,       label: 'Commandes',         href: '/admin/orders',           color: 'from-blue-500 to-cyan-500',     bg: 'bg-blue-50 dark:bg-blue-900/20',     text: 'text-blue-700 dark:text-blue-300' },
  { icon: ShoppingBag,   label: 'Produits',           href: '/admin/products',         color: 'from-emerald-500 to-teal-500',  bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300' },
  { icon: Users,         label: 'Utilisateurs',       href: '/admin/users',           color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-900/20',  text: 'text-violet-700 dark:text-violet-300' },
  { icon: BarChart2,     label: 'Analytics',          href: '/admin/analytics',       color: 'from-orange-500 to-amber-500',  bg: 'bg-orange-50 dark:bg-orange-900/20',  text: 'text-orange-700 dark:text-orange-300' },
  { icon: MessageSquare, label: 'Messages',           href: '/admin/messages',        color: 'from-pink-500 to-rose-500',     bg: 'bg-pink-50 dark:bg-pink-900/20',      text: 'text-pink-700 dark:text-pink-300' },
  { icon: Megaphone,     label: 'Promotions',         href: '/admin/promotions',      color: 'from-amber-500 to-yellow-500',  bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-700 dark:text-amber-300' },
  { icon: Settings,      label: 'Config Site',        href: '/admin/site-config',     color: 'from-gray-500 to-slate-500',   bg: 'bg-gray-50 dark:bg-gray-800',         text: 'text-gray-700 dark:text-gray-300' },
  { icon: ShieldCheck,   label: 'Paiements Campost',  href: '/admin/campost-payments', color: 'from-teal-500 to-green-500',   bg: 'bg-teal-50 dark:bg-teal-900/20',     text: 'text-teal-700 dark:text-teal-300' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0,
    revenueGrowth: 0, ordersGrowth: 0, productsGrowth: 0, usersGrowth: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/orders/recent', { headers }),
      ]);

      if (statsRes.ok)  setStats(await statsRes.json());
      if (ordersRes.ok) { const d = await ordersRes.json(); setRecentOrders(d.orders || []); }
      setLastRefresh(new Date());
    } catch (e) { console.error('Dashboard error:', e); }
    finally { setLoading(false); }
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Bonjour' : now.getHours() < 18 ? 'Bon aprÃ¨s-midi' : 'Bonsoir';
  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const statCards = [
    { title: 'Revenu Total',   value: `${stats.totalRevenue.toLocaleString('fr-FR')} FCFA`, icon: DollarSign, growth: stats.revenueGrowth,  color: 'from-emerald-500 to-teal-500',  ring: 'ring-emerald-500/20' },
    { title: 'Commandes',      value: stats.totalOrders.toString(),                         icon: Package,    growth: stats.ordersGrowth,   color: 'from-blue-500 to-cyan-500',     ring: 'ring-blue-500/20' },
    { title: 'Produits',       value: stats.totalProducts.toString(),                       icon: ShoppingBag, growth: stats.productsGrowth, color: 'from-violet-500 to-purple-500', ring: 'ring-violet-500/20' },
    { title: 'Utilisateurs',   value: stats.totalUsers.toString(),                          icon: Users,      growth: stats.usersGrowth,    color: 'from-orange-500 to-amber-500',  ring: 'ring-orange-500/20' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Chargement du tableau de bordâ€¦</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">

      {/* â”€â”€ En-tÃªte dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            {greeting} ðŸ‘‹
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400 text-sm capitalize">{dateLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">
            Mis Ã  jour : {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold hover:border-emerald-400 hover:text-emerald-600 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <Link href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-emerald-600/20">
            + Nouveau produit
          </Link>
        </div>
      </div>

      {/* â”€â”€ KPI Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          const isUp = stat.growth >= 0;
          return (
            <motion.div key={stat.title}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm ring-1 ${stat.ring} ring-inset border border-gray-100 dark:border-white/[0.05]`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 truncate">{stat.title}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white leading-none truncate">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {Math.abs(stat.growth)}% ce mois
                  </div>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* â”€â”€ Barre de progression campagne â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-1">Campagne Engrais 2026</p>
              <h3 className="text-lg font-black">Programme actif â€” Se termine le 31 mars 2026</h3>
            </div>
          </div>
          <Link href="/campagne-engrais" target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold rounded-xl text-sm transition-colors whitespace-nowrap self-start sm:self-auto">
            Voir la page <Eye className="w-4 h-4" />
          </Link>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-xs text-emerald-300/70 mb-2">
            <span>Inscriptions reÃ§ues</span>
            <span className="font-bold text-white">67 / 200 objectif</span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
              initial={{ width: 0 }} animate={{ width: '33.5%' }} transition={{ duration: 1.2, delay: 0.5 }} />
          </div>
          <p className="text-xs text-emerald-300/60 mt-2">33% de l&apos;objectif atteint Â· 35 jours restants</p>
        </div>
      </motion.div>

      {/* â”€â”€ Grille principale â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Commandes rÃ©centes â€” 2/3 largeur */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-black text-gray-900 dark:text-white">Commandes rÃ©centes</h2>
            </div>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Tout voir <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
            {recentOrders.length > 0 ? recentOrders.map((order) => {
              const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = sc.icon;
              return (
                <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${sc.color.split(' ').slice(1).join(' ')}`}>
                    <StatusIcon className={`w-4 h-4 ${sc.color.split(' ')[0]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.customerName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-sm text-gray-900 dark:text-white">{order.total.toLocaleString('fr-FR')} FCFA</p>
                    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="font-semibold text-gray-500 dark:text-gray-400">Aucune commande rÃ©cente</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Les nouvelles commandes apparaÃ®tront ici</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Alertes stock â€” 1/3 largeur */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black text-gray-900 dark:text-white">Alertes stock</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { name: 'NPK 20-10-10', qty: 3, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
              { name: 'Biofert. Liquide', qty: 7, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
              { name: 'UrÃ©e 46%', qty: 5, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
              { name: 'Kit Urbain Starter', qty: 12, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
            ].map(item => (
              <div key={item.name} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Stock restant</p>
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg flex-shrink-0 ${item.color}`}>
                  {item.qty} unitÃ©s
                </span>
              </div>
            ))}
            <Link href="/admin/products"
              className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors">
              GÃ©rer les stocks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* â”€â”€ Actions rapides â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4">AccÃ¨s rapides</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}
                className={`group flex flex-col items-center gap-2.5 p-4 ${action.bg} rounded-2xl border border-transparent hover:border-current hover:shadow-md transition-all duration-150 ${action.text}`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-center leading-tight">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}
