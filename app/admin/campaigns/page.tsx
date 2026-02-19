'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Download, Eye, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

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

  useEffect(() => {
    fetchCampaignStats();
  }, []);

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
