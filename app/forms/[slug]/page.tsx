'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Loader2, CheckCircle, AlertCircle, Star, Send,
  Upload, Calendar, Clock, Palette
} from 'lucide-react';
import type { IForm, IFormField } from '@/models/Form';

export default function PublicFormPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [startTime] = useState(Date.now());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchForm();
  }, [slug]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/forms/${slug}`);
      
      if (!response.ok) {
        throw new Error('Formulaire non trouvé');
      }
      
      const data = await response.json();
      setForm(data.form);
      
      // Initialiser les valeurs par défaut
      const initialData: Record<string, any> = {};
      data.form.fields.forEach((field: IFormField) => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        }
      });
      setFormData(initialData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: IFormField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return 'Ce champ est requis';
    }
    
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Email invalide';
      }
    }
    
    if (field.type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        return 'URL invalide';
      }
    }
    
    if (field.type === 'number' && value !== undefined && value !== '') {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return 'Nombre invalide';
      }
      if (field.min !== undefined && num < field.min) {
        return `Minimum: ${field.min}`;
      }
      if (field.max !== undefined && num > field.max) {
        return `Maximum: ${field.max}`;
      }
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    form.fields.forEach((field: IFormField) => {
      if (field.type === 'section' || field.type === 'html') return;
      
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    try {
      setSubmitting(true);
      
      const completionTime = Math.round((Date.now() - startTime) / 1000);
      
      const response = await fetch(`/api/public/forms/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: formData,
          completionTime,
          captchaToken: null, // TODO: Implémenter reCAPTCHA
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur de soumission');
      }
      
      const data = await response.json();
      
      setSubmitted(true);
      
      // Redirect si configuré
      if (data.redirectUrl) {
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: IFormField, value: any) => {
    setFormData(prev => ({ ...prev, [field.name]: value }));
    
    // Clear error when user starts editing
    if (errors[field.name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field.name];
        return newErrors;
      });
    }
  };

  const renderField = (field: IFormField) => {
    const value = formData[field.name];
    const error = errors[field.name];
    const widthClass = {
      full: 'col-span-12',
      half: 'col-span-12 md:col-span-6',
      third: 'col-span-12 md:col-span-4',
      quarter: 'col-span-12 md:col-span-3',
    }[field.width || 'full'];

    // Section
    if (field.type === 'section') {
      return (
        <div key={field.id} className="col-span-12 border-b-2 border-gray-300 pb-4 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{field.label}</h2>
          {field.description && (
            <p className="text-gray-600 mt-2">{field.description}</p>
          )}
        </div>
      );
    }

    // HTML
    if (field.type === 'html') {
      return (
        <div
          key={field.id}
          className="col-span-12"
          dangerouslySetInnerHTML={{ __html: field.defaultValue || '' }}
        />
      );
    }

    // Hidden
    if (field.type === 'hidden') {
      return (
        <input
          key={field.id}
          type="hidden"
          name={field.name}
          value={field.defaultValue || ''}
        />
      );
    }

    return (
      <div key={field.id} className={widthClass}>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {field.description && (
          <p className="text-sm text-gray-600 mb-2">{field.description}</p>
        )}

        {/* Text, Email, Tel, URL, Number */}
        {['text', 'email', 'tel', 'url', 'number'].includes(field.type) && (
          <input
            type={field.type}
            name={field.name}
            value={value || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            min={field.min}
            max={field.max}
            step={field.step}
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        )}

        {/* Textarea */}
        {field.type === 'textarea' && (
          <textarea
            name={field.name}
            value={value || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={field.rows || 4}
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        )}

        {/* Select */}
        {field.type === 'select' && (
          <select
            name={field.name}
            value={value || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            required={field.required}
            multiple={field.multiple}
            aria-label={field.label || 'Sélection'}
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{field.placeholder || 'Sélectionnez...'}</option>
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
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => handleChange(field, e.target.value)}
                  required={field.required}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">{opt.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Checkbox */}
        {field.type === 'checkbox' && (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={(value || []).includes(opt.value)}
                  onChange={(e) => {
                    const newValue = value || [];
                    if (e.target.checked) {
                      handleChange(field, [...newValue, opt.value]);
                    } else {
                      handleChange(field, newValue.filter((v: string) => v !== opt.value));
                    }
                  }}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">{opt.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Single Checkbox */}
        {field.type === 'single-checkbox' && (
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name={field.name}
              checked={value || false}
              onChange={(e) => handleChange(field, e.target.checked)}
              required={field.required}
              className="w-5 h-5 mt-0.5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-900">{field.label}</span>
          </label>
        )}

        {/* Date, Time, Datetime */}
        {['date', 'time', 'datetime'].includes(field.type) && (
          <input
            type={field.type === 'datetime' ? 'datetime-local' : field.type}
            name={field.name}
            value={value || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            required={field.required}
            min={field.min}
            max={field.max}
            aria-label={field.label || field.type}
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        )}

        {/* Rating */}
        {field.type === 'rating' && (
          <div className="flex gap-2">
            {Array.from({ length: field.max || 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleChange(field, i + 1)}
                aria-label={`Note ${i + 1} sur ${field.max || 5}`}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    value >= i + 1
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Slider */}
        {field.type === 'slider' && (
          <div>
            <input
              type="range"
              name={field.name}
              value={value || field.min || 0}
              onChange={(e) => handleChange(field, parseFloat(e.target.value))}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              aria-label={field.label || 'Curseur'}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{field.min || 0}</span>
              <span className="font-medium text-blue-600">{value || field.min || 0}</span>
              <span>{field.max || 100}</span>
            </div>
          </div>
        )}

        {/* Color */}
        {field.type === 'color' && (
          <div className="flex items-center gap-3">
            <input
              type="color"
              name={field.name}
              value={value || '#000000'}
              onChange={(e) => handleChange(field, e.target.value)}
              aria-label={`${field.label || 'Couleur'} - sélecteur`}
              className="w-14 h-14 rounded border-2 border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={value || '#000000'}
              onChange={(e) => handleChange(field, e.target.value)}
              aria-label={`${field.label || 'Couleur'} - code hexadécimal`}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono"
            />
          </div>
        )}

        {/* File */}
        {field.type === 'file' && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <input
              type="file"
              name={field.name}
              onChange={(e) => handleChange(field, e.target.files)}
              accept={field.accept?.join(',')}
              multiple={field.multiple}
              required={field.required}
              aria-label={field.label || 'Télécharger un fichier'}
              className="text-sm text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-2">
              {field.maxFileSize && `Max: ${field.maxFileSize / 1024 / 1024}MB`}
            </p>
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Merci !</h1>
          <p className="text-lg text-gray-600">
            {form.settings.successMessage || 'Votre formulaire a été envoyé avec succès.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-12 px-4 ${
        form.settings.theme?.layout === 'card'
          ? 'bg-gradient-to-br from-blue-50 to-purple-50'
          : 'bg-gray-50'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div
            className="p-8 text-white"
            {...{
              style: {
                background: form.settings.theme?.primaryColor
                  ? `linear-gradient(135deg, ${form.settings.theme.primaryColor}, ${form.settings.theme.primaryColor}dd)`
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              },
            }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{form.name}</h1>
            {form.description && (
              <p className="text-lg opacity-90">{form.description}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-12 gap-6">
              {form.fields
                .filter((f: IFormField) => {
                  // TODO: Gérer les conditions
                  return true;
                })
                .map((field: IFormField) => renderField(field))}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {form.settings.submitButtonText || 'Envoyer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
