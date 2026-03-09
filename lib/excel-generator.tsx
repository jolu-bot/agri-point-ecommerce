'use client';

import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

interface ExcelGeneratorProps {
  data: any[];
  filename?: string;
  sheetName?: string;
  title?: string;
  subtitle?: string;
  onGenerate?: () => void;
  showStats?: boolean;
  autoFilter?: boolean;
  freezeHeader?: boolean;
}

/**
 * PREMIUM Excel Generator - Production Ready
 * Features: Auto-styling, filters, stats, branding, multi-format support
 */
export default function ExcelGenerator({ 
  data, 
  filename = 'export.xlsx',
  sheetName = 'Données',
  title,
  subtitle,
  onGenerate,
  showStats = true,
  autoFilter = true,
  freezeHeader = true,
}: ExcelGeneratorProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerate = async () => {
    if (!data || data.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    setIsGenerating(true);
    
    try {
      const ExcelJS = (await import('exceljs')).default;
      
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'AGRIPOINT SERVICES';
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.lastPrinted = new Date();
      workbook.properties.date1904 = false;
      
      const worksheet = workbook.addWorksheet(sheetName, {
        properties: { tabColor: { argb: 'FF1B5E20' } },
        views: [{ state: 'normal', showGridLines: true }]
      });

      let startRow = 1;

      // **HEADER SECTION** - Branding & Title
      if (title) {
        worksheet.mergeCells(`A${startRow}:${String.fromCharCode(64 + Object.keys(data[0]).length)}${startRow}`);
        const titleCell = worksheet.getCell(`A${startRow}`);
        titleCell.value = title;
        titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF1B5E20' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(startRow).height = 30;
        startRow++;

        if (subtitle) {
          worksheet.mergeCells(`A${startRow}:${String.fromCharCode(64 + Object.keys(data[0]).length)}${startRow}`);
          const subtitleCell = worksheet.getCell(`A${startRow}`);
          subtitleCell.value = subtitle;
          subtitleCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF666666' } };
          subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
          startRow++;
        }
        startRow++; // Empty row
      }

      // **COLUMNS DEFINITION** - Auto-detect with intelligent widths
      const headers = Object.keys(data[0]);
      const columnStartRow = startRow;
      
      worksheet.columns = headers.map(header => {
        // Calculate optimal width based on header and data
        const maxLength = Math.max(
          header.length,
          ...data.slice(0, 100).map(row => 
            String(row[header] ?? '').length
          )
        );
        return {
          header: header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1').trim(),
          key: header,
          width: Math.min(Math.max(maxLength + 2, 12), 50),
        };
      });

      // **HEADER ROW STYLING** - Premium look
      const headerRow = worksheet.getRow(columnStartRow);
      headerRow.font = { 
        name: 'Calibri', 
        size: 11, 
        bold: true, 
        color: { argb: 'FFFFFFFF' } 
      };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1B5E20' }, // AGRIPOINT SERVICES green
      };
      headerRow.alignment = { 
        vertical: 'middle', 
        horizontal: 'center',
        wrapText: true 
      };
      headerRow.height = 25;
      headerRow.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
      };

      // **DATA ROWS** - Alternating colors for readability
      data.forEach((row, index) => {
        const excelRow = worksheet.addRow(row);
        excelRow.alignment = { vertical: 'middle' };
        
        // Zebra striping
        if (index % 2 === 0) {
          excelRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' },
          };
        }

        // Auto-format numbers and dates
        excelRow.eachCell((cell, colNumber) => {
          const value = cell.value;
          if (typeof value === 'number') {
            cell.numFmt = value % 1 === 0 ? '#,##0' : '#,##0.00';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          } else if (value instanceof Date) {
            cell.numFmt = 'dd/mm/yyyy hh:mm';
          }
          
          // All cells border
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          };
        });
      });

      // **AUTO-FILTER** - Enable for easy data exploration
      if (autoFilter) {
        worksheet.autoFilter = {
          from: { row: columnStartRow, column: 1 },
          to: { row: columnStartRow + data.length, column: headers.length },
        };
      }

      // **FREEZE PANES** - Keep header visible while scrolling
      if (freezeHeader) {
        worksheet.views = [{
          state: 'frozen',
          xSplit: 0,
          ySplit: columnStartRow,
          activeCell: `A${columnStartRow + 1}`,
        }];
      }

      // **STATS FOOTER** - Summary row with formulas
      if (showStats) {
        const statsRow = columnStartRow + data.length + 2;
        worksheet.getCell(`A${statsRow}`).value = 'TOTAL LIGNES:';
        worksheet.getCell(`A${statsRow}`).font = { bold: true };
        worksheet.getCell(`B${statsRow}`).value = data.length;
        worksheet.getCell(`B${statsRow}`).font = { bold: true, color: { argb: 'FF1B5E20' } };
      }

      // **DOWNLOAD** - Generate and trigger download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      if (onGenerate) onGenerate();
    } catch (error) {
      console.error('❌ Erreur génération Excel:', error);
      alert('Erreur lors de la génération du fichier Excel. Veuillez réessayer.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating || !data || data.length === 0}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
      title={!data || data.length === 0 ? 'Aucune donnée à exporter' : 'Générer et télécharger Excel'}
    >
      {isGenerating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          <span>Génération...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exporter Excel</span>
          <Download className="w-3.5 h-3.5" />
        </>
      )}
    </button>
  );
}

