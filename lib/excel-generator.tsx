'use client';

import React from 'react';

interface ExcelGeneratorProps {
  data: any[];
  filename?: string;
  onGenerate?: () => void;
}

/**
 * Composant de génération Excel avec ExcelJS (moderne et sécurisé)
 */
export default function ExcelGenerator({ data, filename = 'export.xlsx', onGenerate }: ExcelGeneratorProps) {
  const handleGenerate = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default;
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Données');

      // Si data a des clés, créer les colonnes automatiquement
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        worksheet.columns = headers.map(header => ({
          header: header.toUpperCase(),
          key: header,
          width: 20,
        }));

        // Ajouter les données
        data.forEach(row => worksheet.addRow(row));

        // Style du header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1B5E20' },
        };
        worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }

      // Télécharger le fichier
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      if (onGenerate) onGenerate();
    } catch (error) {
      console.error('Erreur génération Excel:', error);
      alert('Erreur lors de la génération du fichier Excel');
    }
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
