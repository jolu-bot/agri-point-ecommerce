'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  Filter,
  Download,
  Trash2,
  User,
  Calendar,
  Activity,
  AlertTriangle,
  Info,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  tags?: string[];
  createdAt: string;
}

interface Stats {
  totalLogs: number;
  currentPage: number;
  totalPages: number;
  logsPerPage: number;
  byAction: Array<{ _id: string; count: number }>;
  bySeverity: Array<{ _id: string; count: number }>;
  topUsers: Array<{ _id: { userId: string; userName: string }; count: number }>;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    resource: '',
    severity: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [filters.page, filters.limit]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch logs');

      const data = await response.json();
      setLogs(data.logs);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'page' && key !== 'limit') {
          params.append(key, value.toString());
        }
      });

      // Export en CSV
      const response = await fetch(`/api/admin/audit-logs?${params}&limit=10000`);
      const data = await response.json();

      const csv = [
        ['Date', 'Utilisateur', 'Action', 'Resource', 'Description', 'Sévérité', 'IP'],
        ...data.logs.map((log: AuditLog) => [
          new Date(log.createdAt).toLocaleString('fr-FR'),
          log.userName,
          log.action,
          log.resource,
          log.description,
          log.severity,
          log.ipAddress || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Logs exportés avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Supprimer les logs de plus de 90 jours ? Cette action est irréversible.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/audit-logs?days=90', {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to cleanup');

      const data = await response.json();
      toast.success(`${data.deletedCount} logs supprimés`);
      fetchLogs();
    } catch (error) {
      toast.error('Erreur lors du nettoyage');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'critical': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info': return <Info className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'rollback': return 'bg-orange-100 text-orange-800';
      case 'export': return 'bg-indigo-100 text-indigo-800';
      case 'import': return 'bg-purple-100 text-purple-800';
      case 'login': return 'bg-emerald-100 text-emerald-800';
      case 'logout': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Audit Logs
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Traçabilité complète des actions administratives
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtres
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <button
                onClick={handleExport}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>

              <button
                onClick={handleCleanup}
                className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Nettoyer
              </button>

              <button
                onClick={fetchLogs}
                className="btn-primary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>

          {/* Filtres */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recherche
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Description, utilisateur..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Action
                  </label>
                  <select
                    value={filters.action}
                    onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Toutes</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="rollback">Rollback</option>
                    <option value="export">Export</option>
                    <option value="import">Import</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sévérité
                  </label>
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Toutes</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resource
                  </label>
                  <input
                    type="text"
                    value={filters.resource}
                    onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value }))}
                    placeholder="site-config, product..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date début
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date fin
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Rechercher
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Logs</p>
                  <p className="text-3xl font-bold">{stats.totalLogs}</p>
                </div>
                <Activity className="w-10 h-10 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Info</p>
                  <p className="text-3xl font-bold">
                    {stats.bySeverity.find(s => s._id === 'info')?.count || 0}
                  </p>
                </div>
                <Info className="w-10 h-10 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Warnings</p>
                  <p className="text-3xl font-bold">
                    {stats.bySeverity.find(s => s._id === 'warning')?.count || 0}
                  </p>
                </div>
                <AlertTriangle className="w-10 h-10 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Errors</p>
                  <p className="text-3xl font-bold">
                    {(stats.bySeverity.find(s => s._id === 'error')?.count || 0) + 
                     (stats.bySeverity.find(s => s._id === 'critical')?.count || 0)}
                  </p>
                </div>
                <XCircle className="w-10 h-10 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Historique des Actions
            </h2>

            {logs.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Aucun log trouvé
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)} flex items-center gap-1`}>
                            {getSeverityIcon(log.severity)}
                            {log.severity}
                          </span>
                          <span className="text-xs text-gray-500">
                            {log.resource}
                          </span>
                        </div>

                        <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">
                          {log.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.userName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(log.createdAt)}
                          </span>
                          {log.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {log.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedLog(selectedLog?._id === log._id ? null : log)}
                        className="btn-ghost p-2"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Détails expandables */}
                    <AnimatePresence>
                      {selectedLog?._id === log._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400 mb-1">Email</p>
                              <p className="text-gray-900 dark:text-white">{log.userEmail}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400 mb-1">Rôle</p>
                              <p className="text-gray-900 dark:text-white">{log.userRole || 'N/A'}</p>
                            </div>
                            {log.requestMethod && (
                              <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-1">Méthode</p>
                                <p className="text-gray-900 dark:text-white">{log.requestMethod}</p>
                              </div>
                            )}
                            {log.requestPath && (
                              <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-1">Chemin</p>
                                <p className="text-gray-900 dark:text-white text-xs font-mono">{log.requestPath}</p>
                              </div>
                            )}
                            {log.userAgent && (
                              <div className="col-span-2">
                                <p className="text-gray-600 dark:text-gray-400 mb-1">User Agent</p>
                                <p className="text-gray-900 dark:text-white text-xs">{log.userAgent}</p>
                              </div>
                            )}
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <div className="col-span-2">
                                <p className="text-gray-600 dark:text-gray-400 mb-1">Métadonnées</p>
                                <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {stats && stats.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {stats.currentPage} sur {stats.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={filters.page === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={filters.page >= stats.totalPages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
