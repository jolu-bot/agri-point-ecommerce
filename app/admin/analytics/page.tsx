'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, Package, Download, RefreshCw,
  BarChart2, DollarSign, MessageSquare, Calendar, Bot, MapPin, Leaf,
  ThumbsUp, ThumbsDown, Cpu, AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';

const PERIODS = [
  { value: '24hours', label: '24 heures' },
  { value: '7days', label: '7 jours' },
  { value: '30days', label: '30 jours' },
  { value: '90days', label: '90 jours' },
];

interface AnalyticsData {
  period: string;
  kpis: {
    orders: { value: number; growth: number };
    revenue: { value: number; growth: number };
    newUsers: { value: number; growth: number };
    avgOrderValue: { value: number };
    conversionRate: number;
    contactMessages: number;
  };
  totals: { orders: number; users: number };
  topProducts: Array<{ rank: number; name: string; category: string; sales: number; revenue: number; image?: string }>;
  categorySales: Array<{ name: string; value: number }>;
  dailyOrders: Array<{ _id: string; count: number; revenue: number }>;
  statusDistribution: Record<string, number>;
}

const CAT_COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500',
];

// ─── Interface stats AgriBot ─────────────────────────────────────
interface BotStatsData {
  period: string;
  kpis: {
    totalConversations: number;
    recentConversations: number;
    totalMessages: number;
    avgMessagesPerConv: number;
    totalTokens: number;
    escalations: number;
    escalationRate: number;
    feedbackPositive: number;
    feedbackNegative: number;
    satisfactionScore: number | null;
  };
  topIntents: Array<{ intent: string; count: number }>;
  topTopics: Array<{ topic: string; count: number }>;
  topLocations: Array<{ location: string; count: number }>;
  topCrops: Array<{ crop: string; count: number }>;
  dailyConvs: Array<{ date: string; count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-400',
  processing: 'bg-blue-400',
  shipped: 'bg-violet-400',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-400',
};
const STATUS_FR: Record<string, string> = {
  pending: 'En attente',
  processing: 'En cours',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30days');
  const [activeTab, setActiveTab] = useState<'ecommerce' | 'agribot'>('ecommerce');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [botStats, setBotStats] = useState<BotStatsData | null>(null);
  const [botLoading, setBotLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAnalytics = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/admin/analytics?period=${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setData(await res.json());
        setLastRefresh(new Date());
      }
    } catch (e) { console.error('Analytics error:', e); }
    finally { setLoading(false); }
  }, []);

  const fetchBotStats = useCallback(async (p: string) => {
    setBotLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/admin/agribot-stats?period=${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setBotStats(await res.json());
    } catch (e) { console.error('Bot stats error:', e); }
    finally { setBotLoading(false); }
  }, []);

  useEffect(() => {
    fetchAnalytics(period);
    fetchBotStats(period);
  }, [period, fetchAnalytics, fetchBotStats]);

  const handleExport = () => {
    if (!data) return;
    const rows = [
      ['Métrique', 'Valeur', 'Période'],
      ['Commandes', data.kpis.orders.value, period],
      ['Revenu (FCFA)', data.kpis.revenue.value, period],
      ['Nouveaux utilisateurs', data.kpis.newUsers.value, period],
      ['Panier moyen (FCFA)', data.kpis.avgOrderValue.value, period],
      ['Taux conversion (%)', data.kpis.conversionRate, period],
      ...data.topProducts.map(p => [`Produit: ${p.name}`, p.sales + ' ventes', '']),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url;
    a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const Stat = ({ title, value, growth, icon: Icon, color }: {
    title: string; value: string; growth?: number; icon: typeof Package; color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/[0.05]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{title}</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
          {growth !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {growth >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(growth)}% vs période préc.
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-emerald-600" />
            Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Données réelles · Mis à jour : {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            title="Sélectionner la période d'analyse"
            aria-label="Sélectionner la période d'analyse"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
          >
            {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <button
            title="Rafraîchir les données"
            aria-label="Rafraîchir les données"
            onClick={() => fetchAnalytics(period)}
            className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:border-emerald-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            disabled={!data || activeTab !== 'ecommerce'}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('ecommerce')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'ecommerce' ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <ShoppingCart className="w-4 h-4" />E-Commerce
        </button>
        <button
          onClick={() => setActiveTab('agribot')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'agribot' ? 'bg-white dark:bg-gray-900 text-green-700 dark:text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Bot className="w-4 h-4" />Assistant IA
          {botStats && botStats.kpis.recentConversations > 0 && (
            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {botStats.kpis.recentConversations}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Chargement des données analytics…</p>
          </div>
        </div>
      ) : !data && activeTab === 'ecommerce' ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center text-gray-500">
          Impossible de charger les données analytics.
        </div>
      ) : activeTab === 'ecommerce' && data ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Stat title="Commandes" value={data.kpis.orders.value.toString()} growth={data.kpis.orders.growth} icon={ShoppingCart} color="from-blue-500 to-cyan-500" />
            <Stat title="Revenu" value={`${data.kpis.revenue.value.toLocaleString('fr-FR')} FCFA`} growth={data.kpis.revenue.growth} icon={DollarSign} color="from-emerald-500 to-teal-500" />
            <Stat title="Nouveaux clients" value={data.kpis.newUsers.value.toString()} growth={data.kpis.newUsers.growth} icon={Users} color="from-violet-500 to-purple-500" />
            <Stat title="Panier moyen" value={`${data.kpis.avgOrderValue.value.toLocaleString('fr-FR')} F`} icon={ShoppingCart} color="from-orange-500 to-amber-500" />
            <Stat title="Taux conversion" value={`${data.kpis.conversionRate}%`} icon={TrendingUp} color="from-rose-500 to-pink-500" />
            <Stat title="Msgs contact" value={data.kpis.contactMessages.toString()} icon={MessageSquare} color="from-teal-500 to-cyan-500" />
          </div>

          {/* Totaux globaux bannière */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white flex items-center gap-4">
              <Package className="w-10 h-10 opacity-80" />
              <div>
                <p className="text-sm font-semibold opacity-80">Total commandes (all time)</p>
                <p className="text-3xl font-black">{data.totals.orders.toLocaleString('fr-FR')}</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-5 text-white flex items-center gap-4">
              <Users className="w-10 h-10 opacity-80" />
              <div>
                <p className="text-sm font-semibold opacity-80">Total clients (all time)</p>
                <p className="text-3xl font-black">{data.totals.users.toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Produits */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-gray-900 dark:text-white">Produits les plus vendus</h2>
              </div>
              <div className="p-5 space-y-3">
                {data.topProducts.length > 0 ? data.topProducts.map((product) => (
                  <div key={product.rank} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{product.rank}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{product.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{product.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-sm text-gray-900 dark:text-white">{product.sales} ventes</p>
                      <p className="text-xs text-gray-500">{product.revenue.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-center text-gray-400 text-sm">
                    Aucune vente enregistrée · Lancez les premières commandes
                  </div>
                )}
              </div>
            </div>

            {/* Répartition par catégorie */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-gray-900 dark:text-white">Ventes par catégorie</h2>
              </div>
              <div className="p-5 space-y-4">
                {data.categorySales.length > 0 ? data.categorySales.map((cat, i) => (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{cat.name}</span>
                      <span className="font-black text-gray-900 dark:text-white">{cat.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.value}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={`h-full rounded-full ${CAT_COLORS[i % CAT_COLORS.length]}`}
                      />
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-center text-gray-400 text-sm">Aucune donnée disponible</div>
                )}
              </div>
            </div>

            {/* Activité 7 derniers jours */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-gray-900 dark:text-white">Commandes — 7 derniers jours</h2>
              </div>
              <div className="p-5">
                {data.dailyOrders.length > 0 ? (
                  <div className="space-y-3">
                    {data.dailyOrders.map((day) => {
                      const maxCount = Math.max(...data.dailyOrders.map(d => d.count), 1);
                      return (
                        <div key={day._id} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-28 flex-shrink-0">
                            {new Date(day._id).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(day.count / maxCount) * 100}%` }}
                              transition={{ duration: 0.7 }}
                              className="h-full bg-emerald-500 rounded-full"
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-900 dark:text-white w-8 text-right">{day.count}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400 text-sm">Aucune commande ces 7 derniers jours</div>
                )}
              </div>
            </div>

            {/* Répartition statuts commandes */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-gray-900 dark:text-white">Statuts des commandes</h2>
              </div>
              <div className="p-5 space-y-3">
                {Object.entries(data.statusDistribution).length > 0 ? (
                  Object.entries(data.statusDistribution).map(([status, count]) => {
                    const total = Object.values(data.statusDistribution).reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${STATUS_COLORS[status] || 'bg-gray-400'}`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                          {STATUS_FR[status] || status}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{count}</span>
                        <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-gray-400 text-sm">Aucune commande</div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'agribot' ? (
        // ─── TAB ASSISTANT IA ────────────────────────────────────
        botLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Chargement des stats Assistant IA…</p>
            </div>
          </div>
        ) : !botStats ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center text-gray-500">
            Impossible de charger les stats de l&apos;assistant.<br />
            <span className="text-xs mt-1 block">Vérifiez que la collection ChatConversation est accessible.</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards AgriBot */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Sessions récentes', value: botStats.kpis.recentConversations.toString(), icon: MessageSquare, color: 'from-green-500 to-emerald-600' },
                { label: 'Messages traités', value: botStats.kpis.totalMessages.toLocaleString('fr-FR'), icon: Bot, color: 'from-teal-500 to-cyan-600' },
                { label: 'Msgs / session', value: botStats.kpis.avgMessagesPerConv.toString(), icon: BarChart2, color: 'from-blue-500 to-indigo-600' },
                { label: 'Taux escalade', value: `${botStats.kpis.escalationRate}%`, icon: AlertTriangle, color: botStats.kpis.escalationRate > 20 ? 'from-red-500 to-rose-600' : 'from-orange-400 to-amber-500' },
              ].map(({ label, value, icon: Icon, color }) => (
                <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{label}</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                    </div>
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Satisfaction */}
            {(botStats.kpis.feedbackPositive + botStats.kpis.feedbackNegative) > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/[0.05]">
                <h2 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-600" />Satisfaction utilisateurs
                </h2>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                    <span className="text-2xl font-black text-green-700 dark:text-green-400">{botStats.kpis.feedbackPositive}</span>
                    <span className="text-xs text-gray-400">Utile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-red-500" />
                    <span className="text-2xl font-black text-red-600 dark:text-red-400">{botStats.kpis.feedbackNegative}</span>
                    <span className="text-xs text-gray-400">Inutile</span>
                  </div>
                  {botStats.kpis.satisfactionScore !== null && (
                    <div className="ml-auto">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">{botStats.kpis.satisfactionScore}%</span>
                      <span className="text-xs text-gray-400 ml-1">satisfaction</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Top Sujets */}
              {botStats.topTopics.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-green-600" />
                    <h2 className="text-base font-black text-gray-900 dark:text-white">Sujets les plus abordés</h2>
                  </div>
                  <div className="p-5 space-y-3">
                    {botStats.topTopics.map((item, i) => {
                      const maxCount = Math.max(...botStats.topTopics.map(t => t.count), 1);
                      return (
                        <div key={item.topic}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{item.topic}</span>
                            <span className="font-black text-gray-900 dark:text-white">{item.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: `${(item.count / maxCount) * 100}%` }}
                              transition={{ duration: 0.7, delay: i * 0.05 }}
                              className="h-full bg-green-500 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top Localisations */}
              {botStats.topLocations.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <h2 className="text-base font-black text-gray-900 dark:text-white">Localisations des utilisateurs</h2>
                  </div>
                  <div className="p-5 space-y-2.5">
                    {botStats.topLocations.map((item) => (
                      <div key={item.location} className="flex items-center gap-3">
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 font-medium">{item.location}</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">{item.count}</span>
                        <span className="text-[11px] text-gray-400 w-10 text-right">sessions</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Cultures */}
              {botStats.topCrops.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <h2 className="text-base font-black text-gray-900 dark:text-white">Cultures les plus consultées</h2>
                  </div>
                  <div className="p-5 space-y-2.5">
                    {botStats.topCrops.map((item, i) => {
                      const maxCount = Math.max(...botStats.topCrops.map(c => c.count), 1);
                      return (
                        <div key={item.crop}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{item.crop}</span>
                            <span className="font-black text-gray-900 dark:text-white">{item.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: `${(item.count / maxCount) * 100}%` }}
                              transition={{ duration: 0.7, delay: i * 0.05 }}
                              className="h-full bg-emerald-500 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activité quotidienne */}
              {botStats.dailyConvs.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.05] overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <h2 className="text-base font-black text-gray-900 dark:text-white">Sessions quotidiennes</h2>
                  </div>
                  <div className="p-5 space-y-3">
                    {botStats.dailyConvs.slice(-10).map((day) => {
                      const maxCount = Math.max(...botStats.dailyConvs.map(d => d.count), 1);
                      return (
                        <div key={day.date} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                            {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: `${(day.count / maxCount) * 100}%` }}
                              transition={{ duration: 0.7 }}
                              className="h-full bg-green-500 rounded-full"
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-900 dark:text-white w-8 text-right">{day.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Totaux all-time */}
            <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl p-5 text-white flex items-center gap-6">
              <Bot className="w-12 h-12 opacity-80 shrink-0" />
              <div className="grid grid-cols-3 gap-6 flex-1">
                <div>
                  <p className="text-sm font-semibold opacity-80">Sessions totales</p>
                  <p className="text-3xl font-black">{botStats.kpis.totalConversations.toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold opacity-80">Messages totaux</p>
                  <p className="text-3xl font-black">{botStats.kpis.totalMessages.toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold opacity-80">Tokens IA consommés</p>
                  <p className="text-3xl font-black">{botStats.kpis.totalTokens.toLocaleString('fr-FR')}</p>
                </div>
              </div>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}

