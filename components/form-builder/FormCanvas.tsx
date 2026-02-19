'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Eye, EyeOff, Settings, Copy, Trash2,
  Type, Mail, Phone, Hash, AlignLeft, List, CheckSquare,
  Calendar, Clock, Upload, Link2, Star, Sliders, Palette,
  EyeOff as Hidden, Code, Square, Minus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getFieldConfig } from '@/lib/form-builder/fieldConfigs';
import type { IFormField } from '@/models/Form';

// Map des icônes par type
const fieldIcons: Record<string, any> = {
  text: Type,
  email: Mail,
  tel: Phone,
  number: Hash,
  textarea: AlignLeft,
  select: List,
  radio: CheckSquare,
  checkbox: CheckSquare,
  'single-checkbox': Square,
  date: Calendar,
  time: Clock,
  datetime: Calendar,
  file: Upload,
  url: Link2,
  rating: Star,
  slider: Sliders,
  color: Palette,
  hidden: Hidden,
  section: Minus,
  html: Code,
};

// Composant pour un champ sortable
function SortableField({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  field: IFormField;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<IFormField>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const config = getFieldConfig(field.type);
  const FieldIcon = fieldIcons[field.type] || Type;

  return (
    <div
      ref={setNodeRef}
      {...{ style: style }}
      className={`relative group ${
        isSelected ? 'ring-2 ring-blue-500' : 'border border-gray-200'
      } rounded-lg bg-white hover:shadow-lg transition-all ${
        !field.required ? 'opacity-75' : ''
      }`}
      onClick={onSelect}
    >
      {/* Header avec actions - visible au hover ou si sélectionné */}
      <div
        className={`absolute -top-10 left-0 right-0 flex items-center gap-1 bg-white border border-gray-200 rounded-t-lg px-2 py-1 shadow-sm transition-opacity ${
          isSelected || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <div
          className="cursor-move p-1 hover:bg-gray-100 rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        
        <div className="flex-1 text-xs font-medium text-gray-600 truncate">
          {config?.label || field.type}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ required: !field.required });
          }}
          className="p-1 hover:bg-gray-100 rounded"
          title={field.required ? 'Optionnel' : 'Requis'}
        >
          {field.required ? (
            <Eye className="w-4 h-4 text-blue-500" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="p-1 hover:bg-gray-100 rounded"
          title="Configurer"
        >
          <Settings className="w-4 h-4 text-gray-600" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 hover:bg-gray-100 rounded"
          title="Dupliquer"
        >
          <Copy className="w-4 h-4 text-gray-600" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Supprimer ce champ ?')) {
              onDelete();
            }
          }}
          className="p-1 hover:bg-red-100 rounded"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {/* Contenu du champ */}
      <div className="p-4 cursor-pointer">
        <FieldPreview field={field} />
      </div>
    </div>
  );
}

// Preview d'un champ
function FieldPreview({ field }: { field: IFormField }) {
  const FieldIcon = fieldIcons[field.type] || Type;

  // Section / HTML
  if (field.type === 'section') {
    return (
      <div className="border-b-2 border-gray-300 pb-2">
        <h3 className="text-lg font-semibold text-gray-900">{field.label}</h3>
        {field.description && (
          <p className="text-sm text-gray-600 mt-1">{field.description}</p>
        )}
      </div>
    );
  }

  if (field.type === 'html') {
    return (
      <div className="bg-gray-50 p-3 rounded border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Code className="w-4 h-4" />
          <span>Contenu HTML personnalisé</span>
        </div>
        <div
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: field.defaultValue || '<p>HTML ici</p>' }}
        />
      </div>
    );
  }

  // Hidden
  if (field.type === 'hidden') {
    return (
      <div className="bg-gray-100 p-3 rounded border border-dashed border-gray-300">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Hidden className="w-4 h-4" />
          <span className="font-mono">{field.name}</span>
          <span>=</span>
          <span className="font-medium">{field.defaultValue}</span>
        </div>
      </div>
    );
  }

  // Champs standards
  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
        <FieldIcon className="w-4 h-4 text-gray-500" />
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>

      {/* Description */}
      {field.description && (
        <p className="text-xs text-gray-600">{field.description}</p>
      )}

      {/* Input preview */}
      <div className="pointer-events-none">
        {/* Text, Email, Tel, URL, Number */}
        {['text', 'email', 'tel', 'url', 'number'].includes(field.type) && (
          <input
            type={field.type}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
            disabled
          />
        )}

        {/* Textarea */}
        {field.type === 'textarea' && (
          <textarea
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 resize-none"
            disabled
          />
        )}

        {/* Select */}
        {field.type === 'select' && (
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
            disabled
            aria-label={field.label}
          >
            <option>{field.placeholder || 'Sélectionnez...'}</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Radio */}
        {field.type === 'radio' && (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm">
                <input type="radio" name={field.name} className="text-blue-600" disabled />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Checkbox */}
        {field.type === 'checkbox' && (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded text-blue-600" disabled />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Single Checkbox */}
        {field.type === 'single-checkbox' && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded text-blue-600" disabled />
            <span>{field.label}</span>
          </label>
        )}

        {/* Date, Time, Datetime */}
        {['date', 'time', 'datetime'].includes(field.type) && (
          <input
            type={field.type === 'datetime' ? 'datetime-local' : field.type}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
            disabled
            aria-label={field.label}
          />
        )}

        {/* File */}
        {field.type === 'file' && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Cliquez ou glissez un fichier
            </p>
          </div>
        )}

        {/* Rating */}
        {field.type === 'rating' && (
          <div className="flex gap-1">
            {Array.from({ length: field.max || 5 }).map((_, i) => (
              <Star key={i} className="w-6 h-6 text-gray-300" />
            ))}
          </div>
        )}

        {/* Slider */}
        {field.type === 'slider' && (
          <div className="space-y-2">
            <input
              type="range"
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              className="w-full"
              disabled
              aria-label={field.label}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{field.min || 0}</span>
              <span>{field.max || 100}</span>
            </div>
          </div>
        )}

        {/* Color */}
        {field.type === 'color' && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              defaultValue={field.defaultValue || '#000000'}
              className="w-12 h-10 rounded border border-gray-300"
              disabled
              aria-label={field.label}
            />
            <span className="text-sm text-gray-600 font-mono">
              {field.defaultValue || '#000000'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant Canvas principal
interface FormCanvasProps {
  fields: IFormField[];
  selectedFieldId: string | null;
  onSelectField: (fieldId: string | null) => void;
  onUpdateField: (fieldId: string, updates: Partial<IFormField>) => void;
  onDeleteField: (fieldId: string) => void;
  onDuplicateField: (fieldId: string) => void;
}

export default function FormCanvas({
  fields,
  selectedFieldId,
  onSelectField,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
}: FormCanvasProps) {
  // Trier par ordre
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[600px]">
        {sortedFields.length === 0 ? (
          // État vide
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <GripVertical className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Formulaire vide
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              Glissez-déposez des champs depuis la bibliothèque pour commencer à construire votre formulaire.
            </p>
          </div>
        ) : (
          // Champs
          <div className="space-y-6 pt-12">
            {sortedFields.map((field) => (
              <motion.div
                key={field.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <SortableField
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => onSelectField(field.id)}
                  onUpdate={(updates) => onUpdateField(field.id, updates)}
                  onDelete={() => onDeleteField(field.id)}
                  onDuplicate={() => onDuplicateField(field.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
