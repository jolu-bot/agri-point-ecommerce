/**
 * Premium Loading State - Orders Management
 */

export default function OrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-96" />
        </div>
        <div className="h-10 bg-blue-100 rounded w-48" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Total', 'En attente', 'Livrées', 'Annulées'].map((label, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="w-10 h-10 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-8 bg-gray-300 rounded w-20 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded w-32" />
          <div className="h-10 bg-gray-100 rounded w-40" />
          <div className="h-10 bg-gray-100 rounded w-32" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-7 gap-4">
            {['N° Commande', 'Client', 'Date', 'Montant', 'Statut', 'Paiement', 'Actions'].map((header, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="p-4 hover:bg-gray-50">
              <div className="grid grid-cols-7 gap-4 items-center">
                <div className="h-4 bg-gray-100 rounded w-28" />
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-100 rounded w-40" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-5 bg-gray-200 rounded w-24" />
                <div className="h-6 bg-yellow-100 rounded w-20" />
                <div className="h-6 bg-green-100 rounded w-16" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-100 rounded" />
                  <div className="h-8 w-8 bg-gray-100 rounded" />
                  <div className="h-8 w-8 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-48" />
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 w-8 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
