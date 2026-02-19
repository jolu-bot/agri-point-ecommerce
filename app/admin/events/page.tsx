'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar, MapPin, Users, Clock, Plus, Search, Filter,
  Edit2, Trash2, Eye, ExternalLink, CheckCircle, XCircle,
  Loader2, CalendarDays, Video, MapPinned
} from 'lucide-react';

export default function EventsAdminPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, statusFilter, typeFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(`/api/admin/events?${params}`);
      const data = await response.json();
      setEvents(data.events || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer l'événement "${title}" ?`)) return;

    try {
      await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { color: 'bg-gray-100 text-gray-700', icon: Edit2, label: 'Brouillon' },
      published: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Publié' },
      cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Annulé' },
      completed: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle, label: 'Terminé' },
    }[status] || { color: 'bg-gray-100 text-gray-700', icon: Calendar, label: status };

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    return type === 'online' ? Video : type === 'hybrid' ? CalendarDays : MapPinned;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
          <p className="text-gray-600 mt-1">Gérez vos événements et inscriptions</p>
        </div>
        <Link
          href="/admin/events/create"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          Créer un événement
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total', value: stats.total || 0, color: 'from-blue-500 to-blue-600', icon: Calendar },
          { label: 'Publiés', value: stats.published || 0, color: 'from-green-500 to-green-600', icon: CheckCircle },
          { label: 'Inscriptions', value: stats.totalRegistrations || 0, color: 'from-purple-500 to-purple-600', icon: Users },
          { label: 'Check-ins', value: stats.totalCheckIns || 0, color: 'from-orange-500 to-orange-600', icon: CheckCircle },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg`}
            >
              <Icon className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm opacity-90">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="cancelled">Annulé</option>
            <option value="completed">Terminé</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filtrer par type d'événement"
          >
            <option value="all">Tous les types</option>
            <option value="physical">Physique</option>
            <option value="online">En ligne</option>
            <option value="hybrid">Hybride</option>
          </select>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Aucun événement trouvé</p>
          <Link
            href="/admin/events/create"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Créer votre premier événement
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((event, index) => {
            const TypeIcon = getTypeIcon(event.type);
            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                      {getStatusBadge(event.status)}
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <TypeIcon className="w-4 h-4" />
                        {event.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{event.shortDescription || event.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.startDate).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {event.location.type === 'physical' && event.location.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location.city}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.stats.confirmedAttendees || 0} inscrits
                        {event.capacity && ` / ${event.capacity}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {event.status === 'published' && (
                      <a
                        href={`/evenements/${event.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                    <Link
                      href={`/admin/events/${event._id}`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(event._id, event.title)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
