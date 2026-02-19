'use client';

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Search } from 'lucide-react';
import { fieldConfigs, fieldCategories } from '@/lib/form-builder/fieldConfigs';
import type { FieldConfig } from '@/lib/form-builder/fieldConfigs';

// Composant pour un champ draggable
function DraggableField({ config }: { config: FieldConfig }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${config.type}`,
    data: {
      type: config.type,
      fromLibrary: true,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = config.icon;

  return (
    <div
      ref={setNodeRef}
      {...{ style }}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-move group"
      {...attributes}
      {...listeners}
    >
      <div className="flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">{config.label}</div>
        <div className="text-xs text-gray-500 truncate">{config.description}</div>
      </div>
      
      <div className="flex-shrink-0">
        <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-blue-400" />
      </div>
    </div>
  );
}

// Composant principal
export default function FieldLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filtrer les champs
  const filteredFields = fieldConfigs.filter(config => {
    const matchesSearch = !searchQuery || 
      config.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Grouper par catégorie si "all" est sélectionné
  const groupedFields = selectedCategory === 'all'
    ? fieldCategories
        .filter(cat => cat.value !== 'all')
        .map(cat => ({
          category: cat.value,
          label: cat.label,
          fields: filteredFields.filter(f => f.category === cat.value),
        }))
        .filter(group => group.fields.length > 0)
    : [{ category: selectedCategory, label: '', fields: filteredFields }];

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Champs disponibles
        </h2>
        
        {/* Recherche */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un champ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Tabs catégories */}
        <div className="flex flex-wrap gap-1">
          {fieldCategories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des champs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {searchQuery || selectedCategory !== 'all' ? (
          // Liste plate si recherche ou catégorie spécifique
          <div className="space-y-2">
            {filteredFields.length > 0 ? (
              filteredFields.map(config => (
                <DraggableField key={config.type} config={config} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                Aucun champ trouvé
              </div>
            )}
          </div>
        ) : (
          // Liste groupée si "all"
          <>
            {groupedFields.map(group => (
              <div key={group.category} className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {group.label}
                </h3>
                <div className="space-y-2">
                  {group.fields.map(config => (
                    <DraggableField key={config.type} config={config} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-500 text-center">
          💡 Glissez-déposez les champs sur le formulaire
        </p>
      </div>
    </div>
  );
}
