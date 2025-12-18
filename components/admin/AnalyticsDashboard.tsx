'use client';

import React from 'react';

interface AnalyticsDashboardProps {
  data?: any;
}

/**
 * Dashboard d'analytics
 * À connecter avec des vraies données analytics
 */
export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Visiteurs</h3>
          <p className="text-3xl font-bold mt-2">12,345</p>
          <p className="text-green-600 text-sm mt-1">+12.5%</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Ventes</h3>
          <p className="text-3xl font-bold mt-2">8,456 €</p>
          <p className="text-green-600 text-sm mt-1">+8.2%</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Taux de conversion</h3>
          <p className="text-3xl font-bold mt-2">3.24%</p>
          <p className="text-red-600 text-sm mt-1">-1.2%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Graphique des ventes</h3>
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
          Graphique à intégrer (Chart.js / Recharts)
        </div>
      </div>
    </div>
  );
}
