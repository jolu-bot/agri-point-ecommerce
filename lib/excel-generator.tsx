'use client';

import React from 'react';

interface ExcelGeneratorProps {
  data: any;
  filename?: string;
  onGenerate?: () => void;
}

/**
 * Composant de génération Excel
 * À implémenter avec SheetJS (xlsx) selon les besoins
 */
export default function ExcelGenerator({ data, filename = 'export.xlsx', onGenerate }: ExcelGeneratorProps) {
  const handleGenerate = () => {
    // TODO: Implémenter la génération Excel
    console.log('Génération Excel:', { data, filename });
    if (onGenerate) onGenerate();
  };

  return (
    <button
      onClick={handleGenerate}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Générer Excel
    </button>
  );
}
