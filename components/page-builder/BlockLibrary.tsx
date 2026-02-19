'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { blockConfigs, BlockConfig } from '@/lib/page-builder/blockConfigs';
import { Search, GripVertical } from 'lucide-react';

function DraggableBlock({ config }: { config: BlockConfig }) {
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
      {...listeners}
      {...attributes}
      className="group relative flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-800 rounded-lg">
        <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
          {config.label}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {config.description}
        </div>
      </div>

      <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
    </div>
  );
}

export default function BlockLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'Tous' },
    { value: 'content', label: 'Contenu' },
    { value: 'media', label: 'Média' },
    { value: 'commerce', label: 'E-commerce' },
    { value: 'interactive', label: 'Interactif' },
    { value: 'layout', label: 'Layout' },
  ];

  const filteredBlocks = blockConfigs.filter(config => {
    const matchesSearch = 
      config.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const groupedBlocks = categories
    .filter(cat => cat.value !== 'all')
    .map(cat => ({
      category: cat.value,
      label: cat.label,
      blocks: filteredBlocks.filter(b => b.category === cat.value),
    }))
    .filter(group => group.blocks.length > 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Bibliothèque de Blocs
        </h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un bloc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blocks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {searchQuery || selectedCategory !== 'all' ? (
          // Flat list when filtering
          <div className="space-y-2">
            {filteredBlocks.length === 0 ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                Aucun bloc trouvé
              </p>
            ) : (
              filteredBlocks.map(config => (
                <DraggableBlock key={config.type} config={config} />
              ))
            )}
          </div>
        ) : (
          // Grouped by category when showing all
          groupedBlocks.map(group => (
            <div key={group.category}>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.blocks.map(config => (
                  <DraggableBlock key={config.type} config={config} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Hint */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Glissez-déposez les blocs sur le canvas
        </p>
      </div>
    </div>
  );
}
