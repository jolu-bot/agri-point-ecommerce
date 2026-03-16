'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Users, Calendar, MapPin, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface EventData {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'published' | 'cancelled';
  maxAttendees?: number;
  price?: number;
  isFree?: boolean;
  slug?: string;
  currentAttendees?: number;
  stats?: { totalRegistrations?: number; confirmedAttendees?: number; checkIns?: number };
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', shortDescription: '', location: '',
    startDate: '', endDate: '', status: 'draft' as EventData['status'],
    maxAttendees: '', price: '', isFree: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/admin/events?id=${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const e: EventData = data.event;
          setEvent(e);
          setFormData({
            title: e.title || '',
            description: e.description || '',
            shortDescription: e.shortDescription || '',
            location: e.location || '',
            startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 16) : '',
            endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 16) : '',
            status: e.status || 'draft',
            maxAttendees: e.maxAttendees?.toString() || '',
            price: e.price?.toString() || '',
            isFree: e.isFree ?? true,
          });
        } else {
          toast.error('Événement introuvable');
          router.push('/admin/events');
        }
      } catch {
        toast.error('Erreur de chargement');
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [eventId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        status: formData.status,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        price: formData.isFree ? 0 : (formData.price ? parseFloat(formData.price) : 0),
        isFree: formData.isFree,
      };
      const res = await fetch(`/api/admin/events?id=${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Événement mis à jour');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch {
      toast.error('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/events" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{event?.title || 'Événement'}</h1>
            {event?.slug && (
              <Link href={`/evenements/${event.slug}`} target="_blank"
                className="text-sm text-primary-600 hover:underline flex items-center gap-1 mt-0.5">
                Voir la page publique <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
        <Link href={`/admin/registrations?eventId=${eventId}`}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 transition-colors text-sm">
          <Users className="w-4 h-4" />
          Inscriptions ({event?.stats?.totalRegistrations ?? 0})
        </Link>
      </div>

      {/* Stats rapides */}
      {event?.stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Inscriptions', value: event.stats.totalRegistrations ?? 0, icon: Users },
            { label: 'Confirmés', value: event.stats.confirmedAttendees ?? 0, icon: Calendar },
            { label: 'Check-ins', value: event.stats.checkIns ?? 0, icon: MapPin },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-3">
              <Icon className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informations générales</h2>
          {(['title', 'shortDescription', 'location'] as const).map((id) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                {id === 'shortDescription' ? 'Résumé court' : id === 'location' ? 'Lieu' : 'Titre'}{id === 'title' || id === 'location' ? ' *' : ''}
              </label>
              <input id={id} type="text" required={id === 'title' || id === 'location'}
                value={formData[id]}
                onChange={(e) => setFormData(prev => ({ ...prev, [id]: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          ))}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea id="description" required rows={5} value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dates &amp; Paramètres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['startDate', 'endDate'] as const).map(id => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {id === 'startDate' ? 'Date de début *' : 'Date de fin'}
                </label>
                <input id={id} type="datetime-local" required={id === 'startDate'} value={formData[id]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [id]: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            ))}
            <div>
              <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacité maximale</label>
              <input id="maxAttendees" type="number" min="0" value={formData.maxAttendees}
                onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
              <select id="status" value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as EventData['status'] }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500">
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input id="isFree" type="checkbox" checked={formData.isFree}
              onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label htmlFor="isFree" className="text-sm text-gray-700 dark:text-gray-300">Événement gratuit</label>
          </div>
          {!formData.isFree && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix (FCFA)</label>
              <input id="price" type="number" min="0" value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/events" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Retour
          </Link>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-lg transition-colors">
            <Save className="w-4 h-4" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
