'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText, Plus, Search, Eye, Edit, Copy, Trash2,
  Database, CheckCircle2, FileCheck, XCircle, Archive,
  Inbox, TrendingUp, Loader2, ExternalLink, Users
} from 'lucide-react';

interface Form {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  fields: any[];
  stats: {
    totalSubmissions: number;
    views: number;
    lastSubmissionAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  published: number;
  drafts: number;
  closed: number;
  archived: number;
  totalSubmissions: number;
  totalViews: number;
}

export default function FormsListPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchForms();
  }, [searchQuery, statusFilter, sortBy, sortOrder]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      const response= await fetch(`/api/admin/forms?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Erreur de chargement');
      
      const data = await response.json();
      setForms(data.forms);
      setStats(data.stats);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer le formulaire "${name}" ?\n\nCette action est irréversible.`)) {
      return;
    }
    
    const deleteSubmissions = confirm(
      'Voulez-vous aussi supprimer toutes les soumissions associées ?'
    );
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/admin/forms?id=${id}&deleteSubmissions=${deleteSubmissions}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Erreur de suppression');
      
      fetchForms();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDuplicate = async (id: string, name: string) => {
    const newName = prompt('Nom du formulaire dupliqué:', `${name} (copie)`);
    if (!newName) return;
    
    const newSlug = newName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/forms/duplicate?id=${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newSlug, newName }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur de duplication');
      }
      
      const data = await response.json();
      router.push(`/admin/forms/${data.form._id}/edit`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      closed: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    
    const labels = {
      draft: 'Brouillon',
      published: 'Publié',
      closed: 'Fermé',
      archived: 'Archivé',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              Formulaires
            </h1>
            <p className="text-gray-600 mt-1">
              Créez et gérez vos formulaires dynamiques
            </p>
          </div>
          
          <button
            onClick={() => router.push('/admin/forms/create')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" />
            Nouveau formulaire
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, icon: Database, color: 'blue', delay: 0 },
              { label: 'Publiés', value: stats.published, icon: CheckCircle2, color: 'green', delay: 0.1 },
              { label: 'Brouillons', value: stats.drafts, icon: FileCheck, color: 'yellow', delay: 0.2 },
              { label: 'Fermés', value: stats.closed, icon: XCircle, color: 'red', delay: 0.3 },
              { label: 'Archivés', value: stats.archived, icon: Archive, color: 'gray', delay: 0.4 },
              { label: 'Soumissions', value: stats.totalSubmissions, icon: Inbox, color: 'purple', delay: 0.5 },
              { label: 'Vues totales', value: stats.totalViews, icon: TrendingUp, color: 'orange', delay: 0.6 },
            ].map((stat, index) => {
              const Icon = stat.icon;
              const colors = {
                blue: 'from-blue-500 to-blue-600',
                green: 'from-green-500 to-green-600',
                yellow: 'from-yellow-500 to-yellow-600',
                red: 'from-red-500 to-red-600',
                gray: 'from-gray-500 to-gray-600',
                purple: 'from-purple-500 to-purple-600',
                orange: 'from-orange-500 to-orange-600',
              };
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: stat.delay }}
                  className={`bg-gradient-to-br ${colors[stat.color as keyof typeof colors]} text-white rounded-xl p-4 shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 opacity-80" />
                  </div>
                  <div className="text-2xl font-bold">{formatNumber(stat.value)}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un formulaire..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filtrer par statut"
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="published">Publiés</option>
              <option value="closed">Fermés</option>
              <option value="archived">Archivés</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by);
                setSortOrder(order);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Trier les formulaires"
            >
              <option value="createdAt-desc">Plus récent</option>
              <option value="createdAt-asc">Plus ancien</option>
              <option value="name-asc">Nom (A-Z)</option>
              <option value="name-desc">Nom (Z-A)</option>
              <option value="stats.totalSubmissions-desc">Plus de soumissions</option>
              <option value="stats.views-desc">Plus de vues</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun formulaire
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par créer votre premier formulaire
            </p>
            <button
              onClick={() => router.push('/admin/forms/create')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Créer un formulaire
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formulaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Champs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Soumissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vues
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Créé le
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {forms.map((form, index) => (
                    <motion.tr
                      key={form._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{form.name}</div>
                          <div className="text-sm text-gray-500">/forms/{form.slug}</div>
                          {form.description && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                              {form.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(form.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {form.fields.length}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/admin/forms/${form._id}/submissions`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Users className="w-4 h-4" />
                          {formatNumber(form.stats.totalSubmissions)}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatNumber(form.stats.views)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(form.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {form.status === 'published' && (
                            <a
                              href={`/forms/${form.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Voir"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          
                          <button
                            onClick={() => router.push(`/admin/forms/${form._id}/edit`)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDuplicate(form._id, form.name)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Dupliquer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(form._id, form.name)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
