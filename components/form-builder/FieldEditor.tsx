'use client';

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { getFieldConfig } from '@/lib/form-builder/fieldConfigs';
import type { IFormField, FieldOption } from '@/models/Form';

interface FieldEditorProps {
  field: IFormField;
  onUpdate: (updates: Partial<IFormField>) => void;
  onClose: () => void;
}

export default function FieldEditor({ field, onUpdate, onClose }: FieldEditorProps) {
  const [activeTab, setActiveTab] = useState<'field' | 'validation'>('field');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    options: true,
    validation: false,
    display: false,
    conditional: false,
  });

  const config = getFieldConfig(field.type);

  // Toggle section
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Update handlers
  const updateProp = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  const updateValidation = (rules: any[]) => {
    onUpdate({ validation: rules });
  };

  // Render field input based on type
  const renderConfigInput = (configField: any) => {
    const value = (field as any)[configField.name];

    switch (configField.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateProp(configField.name, e.target.value)}
            aria-label={configField.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => updateProp(configField.name, e.target.value ? parseFloat(e.target.value) : undefined)}
            aria-label={configField.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => updateProp(configField.name, e.target.value)}
            rows={3}
            aria-label={configField.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        );

      case 'toggle':
        return (
          <button
            onClick={() => updateProp(configField.name, !value)}
            aria-label={`${configField.label}: ${value ? 'activé' : 'désactivé'}`}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => updateProp(configField.name, e.target.value)}
            aria-label={configField.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {configField.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'repeater':
        // Pour les options (select, radio, checkbox)
        return (
          <div className="space-y-2">
            {(value || []).map((option: FieldOption, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Label"
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...(value || [])];
                    newOptions[index] = { ...option, label: e.target.value };
                    updateProp('options', newOptions);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Valeur"
                  value={option.value}
                  onChange={(e) => {
                    const newOptions = [...(value || [])];
                    newOptions[index] = { ...option, value: e.target.value };
                    updateProp('options', newOptions);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const newOptions = (value || []).filter((_: any, i: number) => i !== index);
                    updateProp('options', newOptions);
                  }}
                  aria-label={`Supprimer l'option ${option.label}`}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newOptions = [
                  ...(value || []),
                  { label: `Option ${(value || []).length + 1}`, value: `option${(value || []).length + 1}` },
                ];
                updateProp('options', newOptions);
              }}
              className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4 inline-block mr-1" />
              Ajouter une option
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {config?.label || 'Configuration'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer l'éditeur"
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('field')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'field'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Champ
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'validation'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Validation
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'field' && (
          <div className="space-y-6">
            {/* Configuration basique */}
            <CollapsibleSection
              title="Configuration basique"
              isExpanded={expandedSections.basic}
              onToggle={() => toggleSection('basic')}
            >
              <div className="space-y-4">
                {config?.configFields.map((configField) => (
                  <div key={configField.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {configField.label}
                    </label>
                    {renderConfigInput(configField)}
                    {configField.description && (
                      <p className="mt-1 text-xs text-gray-500">{configField.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Options (pour select, radio, checkbox) */}
            {['select', 'radio', 'checkbox'].includes(field.type) && (
              <CollapsibleSection
                title="Options de choix"
                isExpanded={expandedSections.options}
                onToggle={() => toggleSection('options')}
              >
                <div className="space-y-2">
                  {(field.options || []).map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Label"
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...(field.options || [])];
                          newOptions[index] = { ...option, label: e.target.value };
                          updateProp('options', newOptions);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Valeur"
                        value={option.value}
                        onChange={(e) => {
                          const newOptions = [...(field.options || [])];
                          newOptions[index] = { ...option, value: e.target.value };
                          updateProp('options', newOptions);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => {
                          const newOptions = (field.options || []).filter((_, i) => i !== index);
                          updateProp('options', newOptions);
                        }}
                        aria-label={`Supprimer l'option ${option.label}`}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOptions = [
                        ...(field.options || []),
                        {
                          label: `Option ${(field.options || []).length + 1}`,
                          value: `option${(field.options || []).length + 1}`,
                        },
                      ];
                      updateProp('options', newOptions);
                    }}
                    className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600"
                  >
                    <Plus className="w-4 h-4 inline-block mr-1" />
                    Ajouter une option
                  </button>
                </div>
              </CollapsibleSection>
            )}

            {/* Affichage */}
            <CollapsibleSection
              title="Affichage"
              isExpanded={expandedSections.display}
              onToggle={() => toggleSection('display')}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Largeur
                  </label>
                  <select
                    value={field.width || 'full'}
                    onChange={(e) => updateProp('width', e.target.value)}
                    aria-label="Largeur du champ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="full">Pleine largeur</option>
                    <option value="half">Moitié</option>
                    <option value="third">Tiers</option>
                    <option value="quarter">Quart</option>
                  </select>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="space-y-6">
            <CollapsibleSection
              title="Règles de validation"
              isExpanded={expandedSections.validation}
              onToggle={() => toggleSection('validation')}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Champ requis
                  </label>
                  <button
                    onClick={() => updateProp('required', !field.required)}
                    aria-label={`Champ requis: ${field.required ? 'oui' : 'non'}`}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      field.required ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        field.required ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Min/Max pour number et text */}
                {['number', 'slider'].includes(field.type) && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Valeur minimum
                      </label>
                      <input
                        type="number"
                        value={field.min || ''}
                        onChange={(e) => updateProp('min', e.target.value ? parseFloat(e.target.value) : undefined)}
                        aria-label="Valeur minimum"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Valeur maximum
                      </label>
                      <input
                        type="number"
                        value={field.max || ''}
                        onChange={(e) => updateProp('max', e.target.value ? parseFloat(e.target.value) : undefined)}
                        aria-label="Valeur maximum"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Longueur pour text */}
                {field.type === 'text' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Longueur minimum
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 3"
                        aria-label="Longueur minimum"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Longueur maximum
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Pattern pour text */}
                {field.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Pattern (regex)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: [A-Z]{3}-[0-9]{3}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Expression régulière pour validation personnalisée
                    </p>
                  </div>
                )}

                {/* Max file size */}
                {field.type === 'file' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Taille max (MB)
                      </label>
                      <input
                        type="number"
                        value={field.maxFileSize ? field.maxFileSize / 1024 / 1024 : 5}
                        onChange={(e) => updateProp('maxFileSize', parseFloat(e.target.value) * 1024 * 1024)}
                        aria-label="Taille maximum du fichier en MB"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Fichiers multiples
                      </label>
                      <button
                        onClick={() => updateProp('multiple', !field.multiple)}
                        aria-label={`Fichiers multiples: ${field.multiple ? 'oui' : 'non'}`}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          field.multiple ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            field.multiple ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant pour section pliable
function CollapsibleSection({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-sm font-medium text-gray-900 transition-colors"
      >
        <span>{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
