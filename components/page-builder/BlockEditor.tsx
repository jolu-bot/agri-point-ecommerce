'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { IPageBlock } from '@/models/Page';
import { getBlockConfig, BlockField } from '@/lib/page-builder/blockConfigs';
import RichTextEditor from '@/components/RichTextEditor';

interface BlockEditorProps {
  block: IPageBlock;
  onUpdate: (updates: Partial<IPageBlock>) => void;
  onClose: () => void;
}

export default function BlockEditor({ block, onUpdate, onClose }: BlockEditorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    padding: true,
    margin: false,
    background: false,
    border: false,
    responsive: false,
    animation: false,
  });

  const config = getBlockConfig(block.type);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateProps = (key: string, value: any) => {
    onUpdate({
      props: {
        ...block.props,
        [key]: value,
      },
    });
  };

  const updateStyle = (key: string, value: any) => {
    onUpdate({
      styles: {
        ...block.styles,
        [key]: value,
      },
    });
  };

  const updateResponsive = (key: string, value: any) => {
    onUpdate({
      responsive: {
        ...block.responsive,
        [key]: value,
      },
    });
  };

  const renderField = (field: BlockField) => {
    const value = block.props[field.name] || field.defaultValue;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateProps(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => updateProps(field.name, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'richtext':
        return (
          <RichTextEditor
            value={value || ''}
            onChange={(content) => updateProps(field.name, content)}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || 0}
            onChange={(e) => updateProps(field.name, parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => updateProps(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'color':
        return (
          <div className="flex gap-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => updateProps(field.name, e.target.value)}
              className="h-10 w-20 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value || '#000000'}
              onChange={(e) => updateProps(field.name, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'toggle':
        return (
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => updateProps(field.name, e.target.checked)}
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${
                value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                value ? 'transform translate-x-6' : ''
              }`}></div>
            </div>
          </label>
        );

      case 'repeater':
        const items = value || [];
        return (
          <div className="space-y-2">
            {items.map((item: any, index: number) => (
              <div key={index} className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg space-y-2">
                {field.fields?.map(subField => (
                  <div key={subField.name}>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {subField.label}
                    </label>
                    {subField.type === 'text' && (
                      <input
                        type="text"
                        value={item[subField.name] || ''}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index] = { ...newItems[index], [subField.name]: e.target.value };
                          updateProps(field.name, newItems);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    )}
                    {subField.type === 'textarea' && (
                      <textarea
                        value={item[subField.name] || ''}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index] = { ...newItems[index], [subField.name]: e.target.value };
                          updateProps(field.name, newItems);
                        }}
                        rows={2}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    )}
                    {subField.type === 'number' && (
                      <input
                        type="number"
                        value={item[subField.name] || 0}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index] = { ...newItems[index], [subField.name]: parseInt(e.target.value) };
                          updateProps(field.name, newItems);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newItems = items.filter((_: any, i: number) => i !== index);
                    updateProps(field.name, newItems);
                  }}
                  className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newItem: any = {};
                field.fields?.forEach(f => {
                  newItem[f.name] = f.defaultValue || '';
                });
                updateProps(field.name, [...items, newItem]);
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              + Ajouter
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const CollapsibleSection = ({ title, sectionKey, children }: any) => {
    const isExpanded = expandedSections[sectionKey];
    return (
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <span className="font-medium text-sm text-gray-900 dark:text-white">{title}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="px-4 py-3 space-y-3">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {config?.label || 'Configuration'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'content'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Contenu
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'style'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Style
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'advanced'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Avancé
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'content' && (
          <div className="p-4 space-y-4">
            {config?.fields.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field.label}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'style' && (
          <div>
            <CollapsibleSection title="Padding" sectionKey="padding">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Haut</label>
                  <select
                    value={block.styles.paddingTop || 'lg'}
                    onChange={(e) => updateStyle('paddingTop', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  >
                    <option value="0">Aucun</option>
<option value="sm">Petit</option>
                    <option value="md">Moyen</option>
                    <option value="lg">Grand</option>
                    <option value="xl">Très grand</option>
                    <option value="2xl">Énorme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Bas</label>
                  <select
                    value={block.styles.paddingBottom || 'lg'}
                    onChange={(e) => updateStyle('paddingBottom', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  >
                    <option value="0">Aucun</option>
                    <option value="sm">Petit</option>
                    <option value="md">Moyen</option>
                    <option value="lg">Grand</option>
                    <option value="xl">Très grand</option>
                    <option value="2xl">Énorme</option>
                  </select>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Background" sectionKey="background">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Couleur</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={block.styles.backgroundColor || '#ffffff'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={block.styles.backgroundColor || ''}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Container" sectionKey="container">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Largeur</label>
                <select
                  value={block.styles.containerWidth || 'container'}
                  onChange={(e) => updateStyle('containerWidth', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                >
                  <option value="full">Pleine largeur</option>
                  <option value="container">Container</option>
                  <option value="lg">Large</option>
                  <option value="md">Moyen</option>
                  <option value="sm">Petit</option>
                </select>
              </div>
            </CollapsibleSection>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div>
            <CollapsibleSection title="Responsive" sectionKey="responsive">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={block.responsive.hideOnMobile || false}
                    onChange={(e) => updateResponsive('hideOnMobile', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Masquer sur mobile</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={block.responsive.hideOnTablet || false}
                    onChange={(e) => updateResponsive('hideOnTablet', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Masquer sur tablette</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={block.responsive.hideOnDesktop || false}
                    onChange={(e) => updateResponsive('hideOnDesktop', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Masquer sur desktop</span>
                </label>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Visibilité" sectionKey="visibility">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={block.isVisible}
                  onChange={(e) => onUpdate({ isVisible: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Bloc visible</span>
              </label>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
}
