'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, MapPin, Users, Clock, Mail, User, Phone, Loader2, CheckCircle } from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    numberOfAttendees: 1,
  });

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/public/events/${slug}`);
      const data = await response.json();
      setEvent(data.event);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/public/events/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      alert('Erreur lors de l\'inscription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Événement non trouvé</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Inscription confirmée !</h1>
          <p className="text-lg text-gray-600 mb-6">
            Vous recevrez un email de confirmation avec tous les détails.
          </p>
          <a href="/evenements" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Retour aux événements
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {event.featuredImage && (
          <div className="h-96 rounded-xl overflow-hidden mb-8">
            <img
              src={event.featuredImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {new Date(event.startDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              {new Date(event.startDate).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            {event.location.type === 'physical' && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {event.location.name || event.location.city}
              </div>
            )}
            {event.capacity && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {event.currentAttendees} / {event.capacity} inscrits
              </div>
            )}
          </div>

          <div
            className="prose max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />

          {event.pricing.isFree ? (
            <p className="text-2xl font-bold text-green-600 mt-6">Gratuit</p>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-6">
              {event.pricing.price} {event.pricing.currency}
            </p>
          )}
        </div>

        {/* Formulaire d'inscription */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">S'inscrire</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {event.registrationOptions.collectPhoneNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de places
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.numberOfAttendees}
                onChange={(e) => setFormData({ ...formData, numberOfAttendees: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                <>
                  Confirmer l'inscription
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
