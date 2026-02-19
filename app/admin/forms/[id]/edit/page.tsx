'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, Save, Eye, Undo2, Redo2, Settings,
  Loader2, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen
} from 'lucide-react';
import FieldLibrary from '@/components/form-builder/FieldLibrary';
import FormCanvas from '@/components/form-builder/FormCanvas';
import FieldEditor from '@/components/form-builder/FieldEditor';
import { getDefaultFieldProps } from '@/lib/form-builder/fieldConfigs';
import type { IFormField } from '@/models/Form';

export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params?.id as string;

  // State
  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<IFormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // History pour undo/redo
  const [history, setHistory] = useState<IFormField[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Charger le formulaire
  useEffect(() => {
    if (formId !== 'create') {
      fetchForm();
    } else {
      setLoading(false);
      setFields([]);
      saveToHistory([]);
    }
  }, [formId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/forms?id=${formId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Erreur de chargement');
      
      const data = await response.json();
      setForm(data.form);
      setFields(data.form.fields || []);
      saveToHistory(data.form.fields || []);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de chargement du formulaire');
    } finally {
      setLoading(false);
    }
  };

  // History management
  const saveToHistory = (newFields: IFormField[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newFields)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFields(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFields(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    setActiveId(null);
    
    if (!over) return;
    
    // Si on glisse depuis la bibliothèque (nouveau champ)
    if (active.id.startsWith('library-')) {
      const fieldType = active.id.replace('library-', '');
      addField(fieldType);
      return;
    }
    
    // Si on réorganise les champs existants
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex(f => f.id === active.id);
      const newIndex = fields.findIndex(f => f.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = arrayMove(fields, oldIndex, newIndex);
        
        // Mettre à jour les ordres
        newFields.forEach((field, index) => {
          field.order = index;
        });
        
        setFields(newFields);
        saveToHistory(newFields);
      }
    }
  };

  // CRUD champs
  const addField = (type: string, insertIndex?: number) => {
    const defaultProps = getDefaultFieldProps(type as any);
    
    const newField: IFormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      name: `field_${Date.now()}`,
      label: defaultProps.label || 'Nouveau champ',
      order: insertIndex !== undefined ? insertIndex : fields.length,
      required: false,
      ...defaultProps,
    };
    
    let newFields = [...fields];
    
    if (insertIndex !== undefined) {
      newFields.splice(insertIndex, 0, newField);
      // Réorganiser les ordres
      newFields.forEach((field, index) => {
        field.order = index;
      });
    } else {
      newFields.push(newField);
    }
    
    setFields(newFields);
    saveToHistory(newFields);
    setSelectedFieldId(newField.id);
    setShowSettings(true);
  };

  const updateField = (fieldId: string, updates: Partial<IFormField>) => {
    const newFields = fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    setFields(newFields);
    saveToHistory(newFields);
  };

  const deleteField = (fieldId: string) => {
    const newFields = fields.filter(field => field.id !== fieldId);
    // Réorganiser les ordres
    newFields.forEach((field, index) => {
      field.order = index;
    });
    setFields(newFields);
    saveToHistory(newFields);
    
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const duplicateField = (fieldId: string) => {
    const fieldToDuplicate = fields.find(f => f.id === fieldId);
    if (!fieldToDuplicate) return;
    
    const duplicated: IFormField = {
      ...JSON.parse(JSON.stringify(fieldToDuplicate)),
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${fieldToDuplicate.name}_copy`,
      order: fieldToDuplicate.order + 1,
    };
    
    const newFields = [...fields];
    const insertIndex = fields.findIndex(f => f.id === fieldId) + 1;
    newFields.splice(insertIndex, 0, duplicated);
    
    // Réorganiser les ordres
    newFields.forEach((field, index) => {
      field.order = index;
    });
    
    setFields(newFields);
    saveToHistory(newFields);
  };

  // Sauvegarde
  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        ...form,
        fields,
      };
      
      let response;
      
      if (formId === 'create') {
        // Créer un nouveau formulaire
        if (!payload.name) {
          alert('Veuillez entrer un nom de formulaire');
          return;
        }
        
        response = await fetch('/api/admin/forms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Mettre à jour
        response = await fetch(`/api/admin/forms?id=${formId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }
      
      if (!response.ok) throw new Error('Erreur de sauvegarde');
      
      const data = await response.json();
      
      if (formId === 'create') {
        // Rediriger vers la page d'édition
        router.push(`/admin/forms/${data.form._id}/edit`);
      } else {
        setForm(data.form);
        alert('✅ Formulaire sauvegardé !');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Preview
  const handlePreview = () => {
    if (!form || formId === 'create') {
      alert('Veuillez sauvegarder le formulaire avant de prévisualiser');
      return;
    }
    
    window.open(`/forms/${form.slug}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/forms')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          {formId === 'create' ? (
            <input
              type="text"
              placeholder="Nom du formulaire..."
              value={form?.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
            />
          ) : (
            <h1 className="text-lg font-semibold text-gray-900">{form?.name}</h1>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Annuler"
          >
            <Undo2 className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Rétablir"
          >
            <Redo2 className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          {/* Preview */}
          <button
            onClick={handlePreview}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Prévisualiser
          </button>
          
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Enregistrer
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toggle Library */}
        <button
          onClick={() => setShowLibrary(!showLibrary)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-r-lg p-2 hover:bg-gray-50 transition-colors shadow-lg"
          style={{
            left: showLibrary ? '320px' : '0',
          }}
        >
          {showLibrary ? (
            <PanelLeftClose className="w-4 h-4 text-gray-600" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Library */}
        <AnimatePresence>
          {showLibrary && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <FieldLibrary />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map(f => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <FormCanvas
              fields={fields}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              onUpdateField={updateField}
              onDeleteField={deleteField}
              onDuplicateField={duplicateField}
            />
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-xl opacity-80">
                Déplacement du champ...
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Toggle Settings */}
        <button
          onClick={() => {
            if (selectedField) {
              setShowSettings(!showSettings);
            }
          }}
          disabled={!selectedField}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-l-lg p-2 hover:bg-gray-50 transition-colors shadow-lg disabled:opacity-30"
          style={{
            right: showSettings && selectedField ? '384px' : '0',
          }}
        >
          {showSettings ? (
            <PanelRightClose className="w-4 h-4 text-gray-600" />
          ) : (
            <PanelRightOpen className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Settings */}
        <AnimatePresence>
          {showSettings && selectedField && (
            <motion.div
              initial={{ x: 384 }}
              animate={{ x: 0 }}
              exit={{ x: 384 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <FieldEditor
                field={selectedField}
                onUpdate={(updates) => updateField(selectedField.id, updates)}
                onClose={() => setShowSettings(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
