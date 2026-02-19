'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Eye,
  GitBranch,
  Clock,
  User,
  FileJson,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ConfigVersion {
  _id: string;
  version: number;
  config: any;
  changedBy: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  description?: string;
  tags: string[];
  createdAt: string;
  restoredFrom?: string;
}

export default function ConfigVersionsPage() {
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<ConfigVersion | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [validating, setValidating] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/config-versions?limit=50');
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des versions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (includeVersions = false) => {
    try {
      const response = await fetch(
        `/api/admin/config-import-export?format=json&includeVersions=${includeVersions}`
      );
      
      if (!response.ok) throw new Error('Erreur export');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agri-point-config-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Configuration exportée avec succès!');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
      console.error(error);
    }
  };

  const handleValidateImport = async () => {
    if (!importData.trim()) {
      toast.error('Données d\'import vides');
      return;
    }

    try {
      setValidating(true);
      const parsedData = JSON.parse(importData);
      
      const response = await fetch('/api/admin/config-import-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: parsedData.config || parsedData,
          validateOnly: true,
        }),
      });

      const result = await response.json();
      
      if (result.valid) {
        toast.success('✅ Configuration valide!');
      } else {
        toast.error(`❌ Configuration invalide: ${result.errors.join(', ')}`);
      }
    } catch (error: any) {
      toast.error(`Erreur de validation: ${error.message}`);
      console.error(error);
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async (overwrite = false) => {
    if (!importData.trim()) {
      toast.error('Données d\'import vides');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir ${overwrite ? 'remplacer' : 'fusionner'} la configuration actuelle?`)) {
      return;
    }

    try {
      const parsedData = JSON.parse(importData);
      
      const response = await fetch('/api/admin/config-import-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: parsedData.config || parsedData,
          overwrite,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur import');
      }

      toast.success('Configuration importée avec succès!');
      setShowImportModal(false);
      setImportData('');
      fetchVersions();
      
      // Recharger la page pour appliquer la nouvelle config
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      toast.error(`Erreur d'import: ${error.message}`);
      console.error(error);
    }
  };

  const handleRestore = async (versionId: string, versionNumber: number) => {
    if (!confirm(`Restaurer la version ${versionNumber}? La configuration actuelle sera sauvegardée d'abord.`)) {
      return;
    }

    try {
      setRestoring(true);
      const response = await fetch('/api/admin/config-versions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });

      if (!response.ok) throw new Error('Erreur restauration');

      const result = await response.json();
      toast.success(`Version ${result.restoredVersion} restaurée avec succès!`);
      
      fetchVersions();
      
      // Recharger la page pour appliquer la config restaurée
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error('Erreur lors de la restauration');
      console.error(error);
    } finally {
      setRestoring(false);
    }
  };

  const handleDelete = async (versionId: string) => {
    if (!confirm('Supprimer cette version définitivement?')) return;

    try {
      const response = await fetch(`/api/admin/config-versions?versionId=${versionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur suppression');

      toast.success('Version supprimée');
      fetchVersions();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'auto-save': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'manual': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'rollback': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'import': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'pre-rollback': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'pre-import': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
    };
    return colors[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des versions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <History className="w-8 h-8 text-emerald-600" />
            Historique & Versions
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gérez les versions de votre configuration avec rollback et import/export
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport(false)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter Config
          </button>
          <button
            onClick={() => handleExport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FileJson className="w-4 h-4" />
            Export + Versions
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importer
          </button>
          <button
            onClick={fetchVersions}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Versions</p>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-2">{versions.length}</p>
            </div>
            <GitBranch className="w-10 h-10 text-emerald-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Sauvegardes Auto</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                {versions.filter(v => v.tags.includes('auto-save')).length}
              </p>
            </div>
            <Clock className="w-10 h-10 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Restaurations</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
                {versions.filter(v => v.tags.includes('rollback')).length}
              </p>
            </div>
            <RotateCcw className="w-10 h-10 text-orange-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Imports</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                {versions.filter(v => v.tags.includes('import')).length}
              </p>
            </div>
            <Upload className="w-10 h-10 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Versions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Historique des Versions</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Les 50 dernières versions sont conservées automatiquement
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {versions.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Aucune version enregistrée</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Les versions seront créées automatiquement lors des modifications
              </p>
            </div>
          ) : (
            versions.map((version, index) => (
              <motion.div
                key={version._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-emerald-600">v{version.version}</span>
                      <div className="flex flex-wrap gap-2">
                        {version.tags.map(tag => (
                          <span
                            key={tag}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {version.description && (
                      <p className="text-gray-900 dark:text-white font-medium mb-2">
                        {version.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>{version.changedBy.userName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(version.createdAt)}</span>
                      </div>
                      {version.changes.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" />
                          <span>{version.changes.length} modification(s)</span>
                        </div>
                      )}
                    </div>

                    {version.changes.length > 0 && selectedVersion?._id === version._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Modifications détaillées:
                        </p>
                        <div className="space-y-2">
                          {version.changes.map((change, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {change.field}:
                              </span>
                              <span className="text-red-600 dark:text-red-400 line-through ml-2">
                                {JSON.stringify(change.oldValue)}
                              </span>
                              <span className="mx-2">→</span>
                              <span className="text-green-600 dark:text-green-400">
                                {JSON.stringify(change.newValue)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {version.changes.length > 0 && (
                      <button
                        onClick={() => setSelectedVersion(
                          selectedVersion?._id === version._id ? null : version
                        )}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Voir détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleRestore(version._id, version.version)}
                      disabled={restoring || index === 0}
                      className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={index === 0 ? "Version actuelle" : "Restaurer"}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDelete(version._id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Upload className="w-6 h-6 text-purple-600" />
                    Importer une Configuration
                  </h2>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[calc(90vh-180px)] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Collez votre fichier JSON de configuration:
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder='{"config": {...}, "version": "1.0.0"}'
                    rows={15}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">Modes d'import:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Merge:</strong> Fusionne avec la config actuelle (recommandé)</li>
                        <li><strong>Overwrite:</strong> Remplace complètement la config actuelle</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleValidateImport}
                    disabled={validating || !importData.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {validating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Validation...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Valider
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleImport(false)}
                    disabled={!importData.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    Importer (Merge)
                  </button>

                  <button
                    onClick={() => handleImport(true)}
                    disabled={!importData.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Importer (Overwrite)
                  </button>

                  <button
                    onClick={() => setShowImportModal(false)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-auto"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
