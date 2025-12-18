'use client';

import { useState } from 'react';
import { 
  TrendingUp, ShoppingCart, Users, Eye, 
  Download 
} from 'lucide-react';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7days');

  const stats = {
    pageViews: 15420,
    uniqueVisitors: 8934,
    conversionRate: 3.2,
    averageOrderValue: 78500,
    topProducts: [
      { name: 'HUMIFORTE', sales: 145, revenue: 3625000 },
      { name: 'FOSNUTREN 20', sales: 128, revenue: 4096000 },
      { name: 'KADOSTIM 20', sales: 96, revenue: 2688000 },
    ],
    topPages: [
      { page: '/boutique', views: 4523 },
      { page: '/produits/humiforte', views: 2341 },
      { page: '/', views: 1987 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analyse des performances du site
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="period-select" className="sr-only">Sélectionner la période d&apos;analyse</label>
          <select
            id="period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            aria-label="Sélectionner la période d&apos;analyse"
          >
            <option value="24hours">24 heures</option>
            <option value="7days">7 jours</option>
            <option value="30days">30 jours</option>
            <option value="90days">90 jours</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            <Download className="w-5 h-5" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-600 text-sm font-semibold">+12.5%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.pageViews.toLocaleString('fr-FR')}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Pages vues
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-600 text-sm font-semibold">+8.3%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.uniqueVisitors.toLocaleString('fr-FR')}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Visiteurs uniques
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-600 text-sm font-semibold">+2.1%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.conversionRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Taux de conversion
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-600 text-sm font-semibold">+15.7%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.averageOrderValue.toLocaleString('fr-FR')}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Panier moyen (FCFA)
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Produits les plus vendus
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {product.sales} ventes
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {product.revenue.toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Pages les plus visitées
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.topPages.map((page, index) => {
                const widthPercentage = `${(page.views / stats.topPages[0].views) * 100}%`;
                return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {page.page}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2 relative">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all absolute top-0 left-0"
                        style={{ width: widthPercentage }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {page.views.toLocaleString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      vues
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Sources de trafic
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: 'Recherche organique', value: 45, color: 'bg-blue-500' },
              { name: 'Direct', value: 30, color: 'bg-green-500' },
              { name: 'Réseaux sociaux', value: 15, color: 'bg-purple-500' },
              { name: 'Référents', value: 10, color: 'bg-orange-500' },
            ].map((source, index) => (
              <div key={index} className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className={`w-full h-full ${source.color} rounded-full flex items-center justify-center`}>
                    <span className="text-3xl font-bold text-white">
                      {source.value}%
                    </span>
                  </div>
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {source.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
