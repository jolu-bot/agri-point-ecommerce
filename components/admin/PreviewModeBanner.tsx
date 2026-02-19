'use client';

import { motion } from 'framer-motion';
import { Eye, Save, X, AlertTriangle } from 'lucide-react';
import { usePreviewMode } from '@/contexts/PreviewModeContext';
import toast from 'react-hot-toast';

export default function PreviewModeBanner() {
  const { isPreviewMode, savePreview, disablePreview } = usePreviewMode();

  if (!isPreviewMode) return null;

  const handleSave = async () => {
    try {
      await savePreview();
      toast.success('Configuration sauvegardée avec succès!');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDiscard = () => {
    if (confirm('Annuler les modifications? Les changements non sauvegardés seront perdus.')) {
      disablePreview();
      window.location.reload();
    }
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-lg"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 animate-pulse" />
            <div>
              <h3 className="font-semibold text-sm">Mode Prévisualisation Actif</h3>
              <p className="text-xs opacity-90">
                Les modifications ne sont pas encore sauvegardées. Vous voyez un aperçu en direct.
              </p>
            </div>
            <AlertTriangle className="h-4 w-4 ml-2 opacity-75" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm"
            >
              <X className="h-4 w-4" />
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
            >
              <Save className="h-4 w-4" />
              Enregistrer les Modifications
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
