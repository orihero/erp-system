import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { createUniver, defaultTheme } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US';
import { CellDefinition, FormulaDefinition } from '../../../types/report';
import { merge } from 'lodash';
import { Univer } from '@univerjs/core';

import '@univerjs/presets/lib/styles/preset-sheets-core.css';
import '../../../styles/univer.css';

interface UniverSheetProps {
  structure: {
    cells: Record<string, CellDefinition>;
    formulas: Record<string, FormulaDefinition>;
  };
  onUpdate: (structure: {
    cells: Record<string, CellDefinition>;
    formulas: Record<string, FormulaDefinition>;
  }) => void;
}

const UniverSheet: React.FC<UniverSheetProps> = ({ structure, onUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const univerRef = useRef<Univer | null>(null);
  const univerAPIRef = useRef<ReturnType<typeof createUniver>['univerAPI'] | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Univer instance with presets
    const { univer, univerAPI } = createUniver({
      locale: 'en-US',
      locales: {
        'en-US': merge(
          {},
          UniverPresetSheetsCoreEnUS,
        ),
      },
      theme: defaultTheme,
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
        }),
      ],
    });

    univerRef.current = univer;
    univerAPIRef.current = univerAPI;

    // Create workbook
    const workbook = univerAPI.createWorkbook({
      name: 'Report',
      sheets: [
        {
          id: 'sheet1',
          name: 'Sheet1',
          cells: structure.cells,
        },
      ],
    });

    // Set up event listeners
    univer.on('cell-change', (cellId: string, value: string | number) => {
      onUpdate({
        ...structure,
        cells: {
          ...structure.cells,
          [cellId]: {
            ...structure.cells[cellId],
            value,
          },
        },
      });
    });

    univer.on('formula-change', (formulaId: string, formula: string) => {
      onUpdate({
        ...structure,
        formulas: {
          ...structure.formulas,
          [formulaId]: {
            ...structure.formulas[formulaId],
            formula,
          },
        },
      });
    });

    return () => {
      univer.dispose();
    };
  }, []);

  // Update sheet when structure changes
  useEffect(() => {
    if (!univerAPIRef.current) return;

    const workbook = univerAPIRef.current.getWorkbook('sheet1');
    if (!workbook) return;

    const sheets = workbook.getSheets();
    const sheet = sheets[0];
    if (!sheet) return;

    // Update cells
    Object.entries(structure.cells).forEach(([cellId, cell]) => {
      const [row, col] = cellId.split(':').map(Number);
      sheet.setCellValue(row, col, cell.value);
      if (cell.style) {
        sheet.setCellStyle(row, col, cell.style);
      }
    });

    // Update formulas
    Object.entries(structure.formulas).forEach(([formulaId, formula]) => {
      const [row, col] = formulaId.split(':').map(Number);
      sheet.setCellFormula(row, col, formula.formula);
    });
  }, [structure]);

  return (
    <Box
      ref={containerRef}
      className="univer-container"
      sx={{
        width: '100%',
        height: '600px',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
      }}
    />
  );
};

export default UniverSheet; 