'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Eye,
  Undo,
  Redo,
  Settings,
  Layout as LayoutIcon,
  Smartphone,
  Tablet,
  Monitor,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { IPageBlock } from '@/models/Page';
import { blockConfigs, getDefaultBlockProps } from '@/lib/page-builder/blockConfigs';
import BlockLibrary from '@/components/page-builder/BlockLibrary';
import Canvas from '@/components/page-builder/Canvas';
import BlockEditor from '@/components/page-builder/BlockEditor';

type ViewMode = 'desktop' | 'tablet' | 'mobile';

export default function PageBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params?.id as string;

  // State
  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<IPageBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [showLibrary, setShowLibrary] = useState(true);
  const [showSettings, setShowSettings] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // History pour Undo/Redo
  const [history, setHistory] = useState<IPageBlock[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (pageId !== 'create') {
      fetchPage();
    } else {
      setLoading(false);
    }
  }, [pageId]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/pages?id=${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPage(data.page);
        setBlocks(data.page.blocks || []);
        // Initialiser l'historique
        setHistory([data.page.blocks || []]);
        setHistoryIndex(0);
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (newBlocks: IPageBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(history[historyIndex + 1]);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Si on drag depuis la library
    if (active.id.toString().startsWith('library-')) {
      const blockType = active.id.toString().replace('library-', '');
      addBlock(blockType);
      return;
    }

    // Si on réorganise les blocs existants
    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newBlocks = arrayMove(items, oldIndex, newIndex).map((block, index) => ({
          ...block,
          order: index,
        }));

        saveToHistory(newBlocks);
        return newBlocks;
      });
    }
  };

  const addBlock = (type: string, insertIndex?: number) => {
    const newBlock: IPageBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      order: insertIndex !== undefined ? insertIndex : blocks.length,
      props: getDefaultBlockProps(type),
      styles: {
        paddingTop: 'lg',
        paddingBottom: 'lg',
        containerWidth: 'container',
      },
      responsive: {},
      isVisible: true,
    };

    const newBlocks = [...blocks];
    if (insertIndex !== undefined) {
      newBlocks.splice(insertIndex, 0, newBlock);
      // Réorganiser les ordres
      newBlocks.forEach((block, index) => {
        block.order = index;
      });
    } else {
      newBlocks.push(newBlock);
    }

    setBlocks(newBlocks);
    saveToHistory(newBlocks);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (blockId: string, updates: Partial<IPageBlock>) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    setBlocks(newBlocks);
    saveToHistory(newBlocks);
  };

  const deleteBlock = (blockId: string) => {
    const newBlocks = blocks.filter((block) => block.id !== blockId);
    setBlocks(newBlocks);
    saveToHistory(newBlocks);
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const duplicateBlock = (blockId: string) => {
    const blockToDuplicate = blocks.find((block) => block.id === blockId);
    if (!blockToDuplicate) return;

    const newBlock: IPageBlock = {
      ...JSON.parse(JSON.stringify(blockToDuplicate)),
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: blockToDuplicate.order + 1,
    };

    const newBlocks = [...blocks];
    newBlocks.splice(blockToDuplicate.order + 1, 0, newBlock);
    // Réorganiser les ordres
    newBlocks.forEach((block, index) => {
      block.order = index;
    });

    setBlocks(newBlocks);
    saveToHistory(newBlocks);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');

      const payload = {
        title: page?.title || 'Nouvelle Page',
        blocks: blocks,
      };

      const url = pageId === 'create'
        ? '/api/admin/pages'
        : `/api/admin/pages?id=${pageId}`;
      
      const method = pageId === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Page sauvegardée avec succès !');
        if (pageId === 'create') {
          router.push(`/admin/pages/${data.page._id}/edit`);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Ouvrir la preview dans un nouvel onglet
    if (page?.path) {
      window.open(page.path, '_blank');
    } else {
      alert('Sauvegardez d\'abord la page pour la prévisualiser');
    }
  };

  const selectedBlock = blocks.find((block) => block.id === selectedBlockId);

  const getViewModeWidth = () => {
    switch (viewMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      default:
        return '100%';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/pages')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {page?.title || 'Nouvelle Page'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page Builder
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Annuler"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Rétablir"
          >
            <Redo className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

          {/* View Mode */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'desktop'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'tablet'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'mobile'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

          {/* Actions */}
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            Prévisualiser
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Block Library */}
        <AnimatePresence>
          {showLibrary && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
            >
              <BlockLibrary />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Library Button */}
        <button
          onClick={() => setShowLibrary(!showLibrary)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg p-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          style={{ left: showLibrary ? '320px' : '0' }}
        >
          {showLibrary ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className="mx-auto transition-all duration-300"
            style={{ width: getViewModeWidth(), minHeight: '100%' }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <Canvas
                  blocks={blocks}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={setSelectedBlockId}
                  onUpdateBlock={updateBlock}
                  onDeleteBlock={deleteBlock}
                  onDuplicateBlock={duplicateBlock}
                />
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div className="bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 rounded-lg p-4">
                    Déplacement du bloc...
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Right Sidebar - Block Settings */}
        <AnimatePresence>
          {showSettings && selectedBlock && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
            >
              <BlockEditor
                block={selectedBlock}
                onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
                onClose={() => setSelectedBlockId(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Settings Button */}
        {selectedBlock && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-lg p-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            style={{ right: showSettings ? '384px' : '0' }}
          >
            {showSettings ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
