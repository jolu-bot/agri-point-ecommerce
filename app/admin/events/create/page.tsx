'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'draft' as 'draft' | 'published',
    maxAttendees: '',
    price: '',
    isFree: true,
    tags: '',
  });

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
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Événement créé');
        router.push('/admin/events');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch {
      toast.error('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const field = (id: keyof typeof formData, label: string, type = 'text', required = false) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}{required && ' *'}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={formData[id] as string}
        onChange={(e) => setFormData(prev => ({ ...prev, [id]: e.target.value }))}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/events" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Créer un événement</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Remplissez les informations ci-dessous</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informations générales</h2>
          {field('title', 'Titre', 'text', true)}
          <div>
            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Résumé court
            </label>
            <input
              id="shortDescription"
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          {field('location', 'Lieu', 'text', true)}
          {field('tags', 'Tags (séparés par virgule)')}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dates &amp; Paramètres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('startDate', 'Date de début *', 'datetime-local', true)}
            {field('endDate', 'Date de fin', 'datetime-local')}
            {field('maxAttendees', 'Capacité maximale', 'number')}
          </div>
          <div className="flex items-center gap-3">
            <input
              id="isFree"
              type="checkbox"
              checked={formData.isFree}
              onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label htmlFor="isFree" className="text-sm text-gray-700 dark:text-gray-300">Événement gratuit</label>
          </div>
          {!formData.isFree && field('price', 'Prix (FCFA)', 'number')}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/events" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Création...' : 'Créer l\'événement'}
          </button>
        </div>
      </form>
    </div>
  );
}
