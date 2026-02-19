'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

interface ValidationResultsProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationError[];
  valid: boolean;
}

export default function ValidationResults({
  errors,
  warnings,
  suggestions,
  valid
}: ValidationResultsProps) {
  const hasIssues = errors.length > 0 || warnings.length > 0 || suggestions.length > 0;

  if (!hasIssues && valid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3"
      >
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-900 dark:text-green-100">
            Configuration Valide ✓
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Votre configuration respecte toutes les règles de validation.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  {errors.length} Erreur{errors.length > 1 ? 's' : ''} Critique{errors.length > 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Ces erreurs doivent être corrigées avant de sauvegarder.
                </p>
              </div>
            </div>
            <div className="space-y-2 ml-8">
              {errors.map((error, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded p-3 shadow-sm"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    <span className="text-red-600 dark:text-red-400">{error.field}</span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {error.message}
                  </p>
                  {error.suggestion && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                      💡 {error.suggestion}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warnings */}
      <AnimatePresence>
        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {warnings.length} Avertissement{warnings.length > 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Ces problèmes potentiels méritent attention.
                </p>
              </div>
            </div>
            <div className="space-y-2 ml-8">
              {warnings.map((warning, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded p-3 shadow-sm"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    <span className="text-yellow-600 dark:text-yellow-400">{warning.field}</span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {warning.message}
                  </p>
                  {warning.suggestion && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                      💡 {warning.suggestion}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  {suggestions.length} Suggestion{suggestions.length > 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Améliorations recommandées pour optimiser votre configuration.
                </p>
              </div>
            </div>
            <div className="space-y-2 ml-8">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded p-3 shadow-sm"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    <span className="text-blue-600 dark:text-blue-400">{suggestion.field}</span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {suggestion.message}
                  </p>
                  {suggestion.suggestion && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                      💡 {suggestion.suggestion}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
