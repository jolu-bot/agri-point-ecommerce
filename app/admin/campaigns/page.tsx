'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Download, Eye, AlertCircle, CheckCircle2, Clock, Send, Bell, AlertTriangle } from 'lucide-react';

interface ReminderSummary {
  total: number;
  overdue: number;
  urgent: number;
  pending: number;
  totalAmount: number;
}

interface ReminderOrder {
  _id: string;
  orderNumber: string;
  contactName: string;
  contactPhone: string;
  secondAmount: number;
  daysUntilDue: number;
  isOverdue: boolean;
  isUrgent: boolean;
  status: string;
}

interface CampaignStats {
  _id: string;
  name: string;
  totalOrders: number;
  totalQuantity: number;
  totalRevenue: number;
  orders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    isCampaignOrder: boolean;
    installmentPayment?: {
      enabled: boolean;
      firstAmount: number;
      secondAmount: number;
      firstPaymentStatus: string;
      secondPaymentStatus: string;
    };
    createdAt: string;
  }>;
}

export default function CampaignsDashboard() {
  const [campaigns, setCampaigns] = useState<CampaignStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [reminderSummary, setReminderSummary] = useState<ReminderSummary | null>(null);
  const [reminderOrders, setReminderOrders] = useState<ReminderOrder[]>([]);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [reminderResult, setReminderResult] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaignStats();
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await fetch('/api/admin/campaigns/reminders');
      if (res.ok) {
        const data = await res.json() as { summary: ReminderSummary; orders: ReminderOrder[] };
        setReminderSummary(data.summary);
        setReminderOrders(data.orders);
      }
    } catch {
      /* silencieux - les rappels ne bloquent pas le dashboard */
    }
  };

  const handleSendReminders = async () => {
    const pendingIds = reminderOrders.map((o) => o._id);
    if (pendingIds.length === 0) return;
    setSendingReminders(true);
    setReminderResult(null);
    try {
      const res = await fetch('/api/admin/campaigns/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: pendingIds, channel: 'sms' }),
      });
      const data = await res.json() as { sent?: number; failed?: number; error?: string };
      if (res.ok) {
        setReminderResult(`✅ ${data.sent} rappel(s) SMS envoyé(s). ${data.failed ? `${data.failed} échec(s).` : ''}`);
      } else {
        setReminderResult(`❌ ${data.error ?? 'Erreur inconnue'}`);
      }
    } catch {
      setReminderResult('❌ Erreur réseau');
    } finally {
      setSendingReminders(false);
    }
  };

  const fetchCampaignStats = async () => {
    try {
      const response = await fetch('/api/admin/campaigns/stats');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
        if (data.length > 0) {
          setSelectedCampaign(data[0]._id);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentCampaign = campaigns.find(c => c._id === selectedCampaign);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Dashboard Campagnes</h1>
          <p className="text-gray-600">Suivi en temps réel des commandes et revenus</p>
        </div>

        {/* Sélection campagne */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">Sélectionner une campagne</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.map(campaign => (
              <button
                key={campaign._id}
                onClick={() => setSelectedCampaign(campaign._id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedCampaign === campaign._id
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                <p className="text-sm text-gray-600">📦 {campaign.totalOrders} commandes</p>
              </button>
            ))}
          </div>
        </div>

        {currentCampaign && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Commandes</p>
                    <p className="text-4xl font-bold">{currentCampaign.totalOrders}</p>
                  </div>
                  <div className="text-5xl opacity-30">📦</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Quantité Totale</p>
                    <p className="text-4xl font-bold">{currentCampaign.totalQuantity}</p>
                  </div>
                  <div className="text-5xl opacity-30">🌾</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Revenu Total</p>
                    <p className="text-3xl font-bold">{(currentCampaign.totalRevenue / 1000000).toFixed(1)}M FCFA</p>
                  </div>
                  <div className="text-5xl opacity-30">💰</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Revenu Moyen</p>
                    <p className="text-3xl font-bold">{(currentCampaign.totalRevenue / currentCampaign.totalOrders / 1000).toFixed(0)}K FCFA</p>
                  </div>
                  <div className="text-5xl opacity-30">📈</div>
                </div>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Statut des commandes */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Statut des Commandes</h2>
                <div className="space-y-3">
                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map(status => {
                    const count = currentCampaign.orders.filter(o => o.status === status).length;
                    const percentage = (count / currentCampaign.totalOrders * 100).toFixed(1);
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 capitalize">{status}</span>
                          <span className="font-semibold">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            {...{ style: { width: `${percentage}%` } }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Paiements échelonnés */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Paiements Échelonnés (70/30)</h2>
                <div className="space-y-4">
                  {currentCampaign.orders.filter(o => o.installmentPayment?.enabled).length > 0 ? (
                    <>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="font-semibold">1ère Tranche Payée</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                          {currentCampaign.orders.filter(o => o.installmentPayment?.firstPaymentStatus === 'paid').length}
                        </p>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <span className="font-semibold">2ème Tranche En Attente</span>
                        </div>
                        <p className="text-3xl font-bold text-yellow-600">
                          {currentCampaign.orders.filter(o => o.installmentPayment?.secondPaymentStatus === 'pending').length}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">Aucun paiement échelonné</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Timeline Communications ── */}
            {(() => {
              const now = new Date();
              const events: { date: Date; label: string; type: string; icon: string; detail: string }[] = [
                { date: new Date('2026-02-28'), label: 'Lancement campagne', type: 'sent', icon: '🚀', detail: 'SMS annonce diffusé à toutes les coopératives enregistrées' },
                { date: new Date('2026-03-02'), label: 'Rappel inscriptions J+3', type: 'sent', icon: '📱', detail: 'SMS de relance 3 jours après le lancement' },
                { date: new Date('2026-03-15'), label: 'Relance mi-campagne', type: now >= new Date('2026-03-15') ? 'sent' : 'scheduled', icon: '📣', detail: 'SMS + email aux coopératives non inscrites' },
                { date: new Date('2026-03-25'), label: 'Dernier appel avant clôture', type: now >= new Date('2026-03-25') ? 'sent' : 'scheduled', icon: '⚠️', detail: 'SMS d\'urgence + email : 6 jours restants' },
                { date: new Date('2026-03-31'), label: 'Clôture campagne', type: now >= new Date('2026-03-31') ? 'sent' : 'upcoming', icon: '🏁', detail: 'Fin des inscriptions à minuit' },
                { date: new Date('2026-04-13'), label: 'Rappel 2ème tranche', type: now >= new Date('2026-04-13') ? 'sent' : 'critical', icon: '💳', detail: 'SMS rappel paiement des 30% restants (J-17 avant limite)' },
                { date: new Date('2026-04-30'), label: 'Date limite 2ème tranche', type: now >= new Date('2026-04-30') ? 'sent' : 'critical', icon: '🔔', detail: 'Dernier délai pour le règlement des 30% restants' },
              ];
              const typeColors: Record<string, string> = {
                sent: 'border-green-500 bg-green-50',
                scheduled: 'border-blue-400 bg-blue-50',
                upcoming: 'border-yellow-400 bg-yellow-50',
                critical: 'border-red-400 bg-red-50',
              };
              const typeLabels: Record<string, string> = {
                sent: '✅ Envoyé',
                scheduled: '📅 Planifié',
                upcoming: '⏳ À venir',
                critical: '🔴 Critique',
              };
              return (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">📅 Timeline de Communication</h2>
                  <p className="text-gray-500 text-sm mb-6">Planning SMS/email officiel de la campagne engrais 2026</p>
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                    <div className="space-y-5 pl-14">
                      {events.map((ev, i) => (
                        <div key={i} className={`relative p-4 rounded-xl border-2 ${typeColors[ev.type]}`}>
                          <div className="absolute -left-11 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-lg shadow-sm">
                            {ev.icon}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{ev.label}</p>
                              <p className="text-gray-500 text-xs mt-0.5">{ev.detail}</p>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-1 flex-shrink-0">
                              <span className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded-lg">
                                {ev.date.toLocaleDateString('fr-CM', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                              <span className="text-xs font-semibold">{typeLabels[ev.type]}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Rappels 2ème tranche ── */}
            {reminderSummary && (
              <div className={`rounded-lg shadow p-6 mb-8 border-2 ${
                reminderSummary.overdue > 0 ? 'bg-red-50 border-red-300' :
                reminderSummary.urgent > 0  ? 'bg-amber-50 border-amber-300' :
                'bg-white border-gray-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-500" />
                      Rappels 2ème Tranche (30%)
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Date limite : <strong>30 avril 2026</strong> — Rappel automatique : 13 avril 2026
                    </p>
                  </div>
                  <button
                    onClick={handleSendReminders}
                    disabled={sendingReminders || reminderSummary.total === 0}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                  >
                    {sendingReminders ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Envoyer rappels SMS ({reminderSummary.total})
                  </button>
                </div>

                {reminderResult && (
                  <div className="mb-4 p-3 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700">
                    {reminderResult}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  {[
                    { label: 'Total en attente', val: reminderSummary.total, color: 'text-gray-900' },
                    { label: 'En retard', val: reminderSummary.overdue, color: 'text-red-600' },
                    { label: 'Urgent (≤ 17 j)', val: reminderSummary.urgent, color: 'text-amber-600' },
                    { label: 'Montant total dû', val: `${(reminderSummary.totalAmount / 1000).toFixed(0)}K FCFA`, color: 'text-emerald-600' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className={`text-xl font-black ${color}`}>{val}</p>
                    </div>
                  ))}
                </div>

                {reminderOrders.length > 0 && (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Commande</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Contact</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Téléphone</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Montant dû</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Jours restants</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {reminderOrders.slice(0, 10).map(o => (
                          <tr key={o._id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-mono font-semibold">{o.orderNumber}</td>
                            <td className="px-4 py-2">{o.contactName}</td>
                            <td className="px-4 py-2 font-mono">{o.contactPhone}</td>
                            <td className="px-4 py-2 font-semibold text-emerald-700">{o.secondAmount.toLocaleString()} FCFA</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                o.isOverdue ? 'bg-red-100 text-red-700' :
                                o.isUrgent  ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {o.isOverdue ? '⚠️ En retard' : `J-${o.daysUntilDue}`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {reminderOrders.length > 10 && (
                      <p className="px-4 py-3 text-xs text-gray-500 border-t border-gray-200 text-center">
                        + {reminderOrders.length - 10} autres commandes — exportez depuis l&apos;API
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tableau des commandes */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Commandes Détaillées</h2>
                  <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    <Download className="w-4 h-4" />
                    Exporter CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">#Commande</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Montant</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Statut</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Paiement</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Échelonné</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentCampaign.orders.slice(0, 20).map(order => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-gray-900 font-semibold">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-gray-900 font-semibold">{(order.total / 1000).toFixed(0)}K FCFA</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'delivered' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                            {order.status === 'delivered' ? 'Payé' : 'En attente'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {order.installmentPayment?.enabled ? (
                            <div className="text-sm">
                              <p className="font-semibold text-gray-900">70/30</p>
                              <p className="text-gray-600">1: {order.installmentPayment.firstPaymentStatus === 'paid' ? '✓' : '◯'}</p>
                              <p className="text-gray-600">2: {order.installmentPayment.secondPaymentStatus === 'paid' ? '✓' : '◯'}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">Non</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-xs">
                          {new Date(order.createdAt).toLocaleDateString('fr-CM')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {currentCampaign.orders.length > 20 && (
                <div className="px-6 py-4 text-center border-t border-gray-200 text-gray-600 text-sm">
                  Affichage de 20 sur {currentCampaign.orders.length} commandes
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
