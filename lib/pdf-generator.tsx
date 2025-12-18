'use client';

import React from 'react';

interface PDFGeneratorProps {
  data: any;
  filename?: string;
  onGenerate?: () => void;
}

/**
 * Composant de génération PDF
 * À implémenter avec jsPDF ou react-pdf selon les besoins
 */
export default function PDFGenerator({ data, filename = 'export.pdf', onGenerate }: PDFGeneratorProps) {
  const handleGenerate = () => {
    // TODO: Implémenter la génération PDF
    console.log('Génération PDF:', { data, filename });
    if (onGenerate) onGenerate();
  };

  return (
    <button
      onClick={handleGenerate}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Générer PDF
    </button>
  );
}
