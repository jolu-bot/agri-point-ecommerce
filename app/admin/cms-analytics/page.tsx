'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  AlertTriangle,
  GitBranch,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Calendar,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Analytics {
  overview: {
    totalLogs: number;
    totalVersions: number;
    activeUsers: number;
    criticalActions: number;
    comparison: {
      logsChange: number;
      usersChange: number;
      criticalChange: number;
    };
  };
  actionBreakdown: Array<{ _id: string; count: number }>;
  resourceBreakdown: Array<{ _id: string; count: number }>;
  topUsers: Array<{
    _id: { userId: string; userName: string; userEmail: string };
    actions: number;
    lastActivity: string;
  }>;
  activityTimeline: Array<{
    _id: { year: number; month: number; day: number };
    count: number;
    criticalCount: number;
  }>;
  peakHours: Array<{ _id: number; count: number }>;
  configSections: Array<{ _id: string; count: number }>;
  versioningTrends: Array<{
    _id: { year: number; month: number; day: number };
    versions: number;
    autoSaves: number;
    manualSaves: number;
    rollbacks: number;
  }>;
  severityDistribution: Array<{ _id: string; count: number }>;
  topTags: Array<{ _id: string; count: number }>;
  timeRange: number;
}

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#A855F7',
  indigo: '#6366F1',
  pink: '#EC4899',
  teal: '#14B8A6',
};

const PIE_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.purple, COLORS.indigo];

export default function CMSAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/cms-analytics?timeRange=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateObj: { year: number; month: number; day: number }) => {
    return `${dateObj.day}/${dateObj.month}`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  CMS Analytics
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Métriques et statistiques d'utilisation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                aria-label="Sélectionner la période de temps"
              >
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">90 derniers jours</option>
              </select>

              <button
                onClick={fetchAnalytics}
                className="btn-primary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 opacity-80" />
              {getTrendIcon(analytics.overview.comparison.logsChange)}
            </div>
            <p className="text-3xl font-bold mb-1">{analytics.overview.totalLogs}</p>
            <p className="text-blue-100 text-sm mb-2">Total Actions</p>
            <div className={`text-xs font-medium ${getTrendColor(analytics.overview.comparison.logsChange)}`}>
              {analytics.overview.comparison.logsChange > 0 ? '+' : ''}
              {analytics.overview.comparison.logsChange}% vs période précédente
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
              {getTrendIcon(analytics.overview.comparison.usersChange)}
            </div>
            <p className="text-3xl font-bold mb-1">{analytics.overview.activeUsers}</p>
            <p className="text-emerald-100 text-sm mb-2">Utilisateurs Actifs</p>
            <div className={`text-xs font-medium ${getTrendColor(analytics.overview.comparison.usersChange)}`}>
              {analytics.overview.comparison.usersChange > 0 ? '+' : ''}
              {analytics.overview.comparison.usersChange}% vs période précédente
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              {getTrendIcon(analytics.overview.comparison.criticalChange)}
            </div>
            <p className="text-3xl font-bold mb-1">{analytics.overview.criticalActions}</p>
            <p className="text-orange-100 text-sm mb-2">Actions Critiques</p>
            <div className={`text-xs font-medium ${getTrendColor(analytics.overview.comparison.criticalChange)}`}>
              {analytics.overview.comparison.criticalChange > 0 ? '+' : ''}
              {analytics.overview.comparison.criticalChange}% vs période précédente
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <GitBranch className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold mb-1">{analytics.overview.totalVersions}</p>
            <p className="text-purple-100 text-sm mb-2">Versions Config</p>
            <p className="text-xs text-purple-100 opacity-75">Historique complet</p>
          </motion.div>
        </div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Activité Temporelle
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.activityTimeline.map(d => ({
              date: formatDate(d._id),
              Total: d.count,
              Critique: d.criticalCount
            }))}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCritique" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="Total" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorTotal)" />
              <Area type="monotone" dataKey="Critique" stroke={COLORS.danger} fillOpacity={1} fill="url(#colorCritique)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Actions Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Répartition par Action
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.actionBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry._id}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.actionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Peak Hours */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Heures de Pointe
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.peakHours.map(h => ({
                heure: `${h._id}h`,
                activité: h.count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="heure" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activité" fill={COLORS.indigo} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* More Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Config Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Sections Config Modifiées
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.configSections.map(s => ({
                section: s._id || 'N/A',
                modifications: s.count
              }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="section" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="modifications" fill={COLORS.success} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Contributeurs
            </h2>
            <div className="space-y-3">
              {analytics.topUsers.slice(0, 5).map((user, index) => (
                <div
                  key={user._id.userId}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user._id.userName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user._id.userEmail}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {user.actions}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      actions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Versioning Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Tendances de Versioning
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.versioningTrends.map(t => ({
              date: formatDate(t._id),
              'Auto-save': t.autoSaves,
              'Manuel': t.manualSaves,
              'Rollback': t.rollbacks
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Auto-save" stroke={COLORS.primary} strokeWidth={2} />
              <Line type="monotone" dataKey="Manuel" stroke={COLORS.success} strokeWidth={2} />
              <Line type="monotone" dataKey="Rollback" stroke={COLORS.warning} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
