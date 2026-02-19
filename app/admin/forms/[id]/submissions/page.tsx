'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Download, Trash2, Eye, EyeOff, Star, Search,
  Filter, Calendar, Loader2, CheckCircle, XCircle, Archive,
  Inbox, AlertTriangle, FileText
} from 'lucide-react';

interface Submission {
  _id: string;
  data: Record<string, any>;
  metadata: {
    ip?: string;
    device?: string;
    browser?: string;
    locale?: string;
    completionTime?: number;
  };
  status: 'pending' | 'processed' | 'archived' | 'spam';
  isRead: boolean;
  isStarred: boolean;
  score?: number;
  createdAt: string;
  notes?: string;
  tags?: string[];
}

interface Stats {
  total: number;
  pending: number;
  processed: number;
  spam: number;
  unread: number;
  avgCompletionTime: number;
}

export default function FormSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params?.id as string;

  const [formName, setFormName] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  // Filtres
  const [statusFilter, setStatusFilter] = useState('');
  const [isReadFilter, setIsReadFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [formId, statusFilter, isReadFilter, searchQuery]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      params.append('formId', formId);
      if (statusFilter) params.append('status', statusFilter);
      if (isReadFilter) params.append('isRead', isReadFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/admin/form-submissions?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Erreur de chargement');
      
      const data = await response.json();
      setSubmissions(data.submissions);
      setStats(data.stats);
      
      // Récupérer le nom du formulaire (si pas déjà fait)
      if (!formName && data.submissions.length > 0) {
        setFormName(data.submissions[0].formName);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `/api/admin/form-submissions?formId=${formId}&export=csv`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Erreur d\'export');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submissions-${formId}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'export');
    }
  };

  const handleUpdateSubmission = async (
    submissionId: string,
    updates: Partial<Submission>
  ) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/form-submissions?id=${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Erreur de mise à jour');
      
      fetchSubmissions();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Supprimer cette soumission ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/form-submissions?id=${submissionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Erreur de suppression');
      
      fetchSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Inbox },
      processed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Archive },
      spam: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
    };
    
    const labels = {
      pending: 'En attente',
      processed: 'Traité',
      archived: 'Archivé',
      spam: 'Spam',
    };
    
    const style = styles[status as keyof typeof styles];
    const Icon = style.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/forms')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Retour aux formulaires"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Soumissions {formName && `- ${formName}`}
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez et exportez les réponses
              </p>
            </div>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Download className="w-5 h-5" />
            Exporter CSV
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, color: 'blue', icon: FileText },
              { label: 'En attente', value: stats.pending, color: 'yellow', icon: Inbox },
              { label: 'Traités', value: stats.processed, color: 'green', icon: CheckCircle },
              { label: 'Spam', value: stats.spam, color: 'red', icon: AlertTriangle },
              { label: 'Non lus', value: stats.unread, color: 'purple', icon: Eye },
              {
                label: 'Temps moyen',
                value: stats.avgCompletionTime ? formatTime(stats.avgCompletionTime) : '-',
                color: 'orange',
                icon: Calendar,
                isString: true,
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              const colors = {
                blue: 'from-blue-500 to-blue-600',
                yellow: 'from-yellow-500 to-yellow-600',
                green: 'from-green-500 to-green-600',
                red: 'from-red-500 to-red-600',
                purple: 'from-purple-500 to-purple-600',
                orange: 'from-orange-500 to-orange-600',
              };
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br ${colors[stat.color as keyof typeof colors]} text-white rounded-xl p-4 shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 opacity-80" />
                  </div>
                  <div className="text-2xl font-bold">
                    {stat.isString ? stat.value : new Intl.NumberFormat('fr-FR').format(stat.value as number)}
                  </div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              aria-label="Filtrer par statut"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processed">Traités</option>
              <option value="archived">Archivés</option>
              <option value="spam">Spam</option>
            </select>

            <select
              value={isReadFilter}
              onChange={(e) => setIsReadFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              aria-label="Filtrer par état de lecture"
            >
              <option value="">Tous</option>
              <option value="false">Non lus</option>
              <option value="true">Lus</option>
            </select>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune soumission
            </h3>
            <p className="text-gray-600">
              Les soumissions apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liste */}
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <motion.div
                  key={submission._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setSelectedSubmission(submission);
                    if (!submission.isRead) {
                      handleUpdateSubmission(submission._id, { isRead: true });
                    }
                  }}
                  className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedSubmission?._id === submission._id
                      ? 'ring-2 ring-blue-500 border-blue-500'
                      : 'border-gray-200'
                  } ${!submission.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(submission.status)}
                      {!submission.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                      {submission.isStarred && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(submission.createdAt)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {Object.entries(submission.data).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium text-gray-700">{key}:</span>{' '}
                        <span className="text-gray-600 line-clamp-1">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span>{submission.metadata.device}</span>
                    <span>{submission.metadata.browser}</span>
                    {submission.metadata.completionTime && (
                      <span>{formatTime(submission.metadata.completionTime)}</span>
                    )}
                    {submission.score !== undefined && submission.score > 50 && (
                      <span className="text-red-500 font-medium">
                        Score: {submission.score}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Détail */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              {selectedSubmission ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Détails de la soumission</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateSubmission(selectedSubmission._id, {
                          isStarred: !selectedSubmission.isStarred
                        })}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        aria-label={selectedSubmission.isStarred ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <Star className={`w-5 h-5 ${selectedSubmission.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(selectedSubmission._id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                        aria-label="Supprimer la soumission"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Données */}
                  <div className="space-y-4 mb-6">
                    {Object.entries(selectedSubmission.data).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-100 pb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">{key}</div>
                        <div className="text-sm text-gray-900">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <select
                      value={selectedSubmission.status}
                      onChange={(e) => handleUpdateSubmission(selectedSubmission._id, {
                        status: e.target.value as any
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      aria-label="Changer le statut"
                    >
                      <option value="pending">En attente</option>
                      <option value="processed">Traité</option>
                      <option value="archived">Archivé</option>
                      <option value="spam">Spam</option>
                    </select>

                    <textarea
                      placeholder="Notes internes..."
                      value={selectedSubmission.notes || ''}
                      onChange={(e) => handleUpdateSubmission(selectedSubmission._id, {
                        notes: e.target.value
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                    />
                  </div>

                  {/* Métadonnées */}
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-xs text-gray-600">
                    <div><strong>IP:</strong> {selectedSubmission.metadata.ip}</div>
                    <div><strong>Appareil:</strong> {selectedSubmission.metadata.device}</div>
                    <div><strong>Navigateur:</strong> {selectedSubmission.metadata.browser}</div>
                    <div><strong>Locale:</strong> {selectedSubmission.metadata.locale}</div>
                    {selectedSubmission.metadata.completionTime && (
                      <div><strong>Temps:</strong> {formatTime(selectedSubmission.metadata.completionTime)}</div>
                    )}
                    {selectedSubmission.score !== undefined && (
                      <div><strong>Score spam:</strong> {selectedSubmission.score}/100</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Sélectionnez une soumission pour voir les détails
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
