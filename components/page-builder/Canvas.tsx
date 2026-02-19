'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Copy,
  Trash2,
  GripVertical,
  Settings,
} from 'lucide-react';
import { IPageBlock } from '@/models/Page';
import { getBlockConfig } from '@/lib/page-builder/blockConfigs';

interface SortableBlockProps {
  block: IPageBlock;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<IPageBlock>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const config = getBlockConfig(block.type);

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ isVisible: !block.isVisible });
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bloc ?')) {
      onDelete();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      } ${!block.isVisible ? 'opacity-50' : ''}`}
    >
      {/* Block Header - Always visible on hover/select */}
      <div
        className={`absolute -top-10 left-0 right-0 flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg shadow-sm transition-opacity ${
          isSelected || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {config?.label || block.type}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleVisibility}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={block.isVisible ? 'Masquer' : 'Afficher'}
          >
            {block.isVisible ? (
              <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <button
            onClick={onSelect}
            className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ${
              isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
            }`}
            title="Paramètres"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Dupliquer"
          >
            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      {/* Block Content Preview */}
      <div
        onClick={onSelect}
        className="p-6 cursor-pointer bg-white dark:bg-gray-800 rounded-lg"
      >
        <BlockPreview block={block} />
      </div>
    </div>
  );
}

function BlockPreview({ block }: { block: IPageBlock }) {
  const config = getBlockConfig(block.type);
  if (!config) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Type de bloc inconnu: {block.type}
      </div>
    );
  }

  const Icon = config.icon;

  // Render simple preview based on block type
  switch (block.type) {
    case 'hero':
      return (
        <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">{block.props.title || 'Hero Title'}</h1>
              <p className="text-lg mb-4">{block.props.subtitle || 'Subtitle'}</p>
              <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium">
                {block.props.ctaText || 'Call to Action'}
              </button>
            </div>
          </div>
        </div>
      );

    case 'text':
      return (
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: block.props.content || '<p>Texte vide</p>' }}
        />
      );

    case 'features':
      return (
        <div>
          {block.props.title && (
            <h2 className="text-2xl font-bold text-center mb-2">{block.props.title}</h2>
          )}
          {block.props.subtitle && (
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">{block.props.subtitle}</p>
          )}
          <div className={`grid grid-cols-${block.props.columns || 3} gap-4`}>
            {(block.props.features || []).map((feature: any, index: number) => (
              <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-4xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className="relative p-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-center">
          <h2 className="text-3xl font-bold mb-3">{block.props.title || 'CTA Title'}</h2>
          <p className="text-lg mb-6">{block.props.description || 'Description'}</p>
          <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold">
            {block.props.buttonText || 'Button'}
          </button>
        </div>
      );

    case 'spacer':
      const heights = { sm: '2rem', md: '4rem', lg: '6rem', xl: '8rem' };
      const height = heights[block.props.height as keyof typeof heights] || '4rem';
      return (
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400"
          style={{ height }}
        >
          Espace ({block.props.height || 'md'})
        </div>
      );

    case 'divider':
      return (
        <div className="flex items-center justify-center py-4">
          <div
            className={`border-t-${block.props.thickness === 'thick' ? '4' : block.props.thickness === 'medium' ? '2' : '1'}`}
            style={{
              borderColor: block.props.color || '#e5e7eb',
              width: block.props.width === 'full' ? '100%' : block.props.width === 'half' ? '50%' : '33.333%',
            }}
          ></div>
        </div>
      );

    default:
      // Generic preview for other blocks
      return (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <Icon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
            {config.label}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {config.description}
          </p>
        </div>
      );
  }
}

interface CanvasProps {
  blocks: IPageBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<IPageBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
}

export default function Canvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
}: CanvasProps) {
  if (blocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <GripVertical className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Canvas vide
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Glissez des blocs depuis la bibliothèque pour commencer
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
            ← Utilisez la bibliothèque de blocs
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-12">
      {blocks
        .sort((a, b) => a.order - b.order)
        .map((block) => (
          <motion.div
            key={block.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SortableBlock
              block={block}
              isSelected={selectedBlockId === block.id}
              onSelect={() => onSelectBlock(block.id)}
              onUpdate={(updates) => onUpdateBlock(block.id, updates)}
              onDelete={() => onDeleteBlock(block.id)}
              onDuplicate={() => onDuplicateBlock(block.id)}
            />
          </motion.div>
        ))}
    </div>
  );
}
