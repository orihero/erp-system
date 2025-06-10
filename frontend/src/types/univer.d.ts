interface UniverPlugin {
  name: string;
  install: (univer: Univer) => void;
}

declare module '@univerjs/core' {
  export class Univer {
    constructor(options: { theme: string; container: HTMLElement });
    registerPlugin(plugin: UniverPlugin): void;
    createUniverSheet(options: {
      id: string;
      sheets: Array<{
        id: string;
        name: string;
        cells: Record<number, Record<number, { v: string }>>;
      }>;
    }): {
      id: string;
      sheets: Array<{
        id: string;
        name: string;
        cells: Record<number, Record<number, { v: string }>>;
      }>;
    };
    dispose(): void;
  }
}

declare module '@univerjs/sheets-ui' {
  export const UniverSheetsUIPlugin: UniverPlugin;
}

declare module '@univerjs/sheets-formula' {
  export const UniverSheetsFormulaPlugin: UniverPlugin;
}

declare module '@univerjs/sheets-numfmt' {
  export const UniverSheetsNumfmtPlugin: UniverPlugin;
}

declare module '@univerjs/sheets-selection' {
  export const UniverSheetsSelectionPlugin: UniverPlugin;
}

declare module '@univerjs/sheets-render-engine' {
  export const UniverSheetsRenderEnginePlugin: UniverPlugin;
} 