import { useState, useCallback } from 'react';
import { ReportConfig, DataSource, Filter } from '../types/report';
import reportService from '../services/reportService';

interface UseReportConfigProps {
  initialConfig?: Partial<ReportConfig>;
}

export const useReportConfig = ({ initialConfig }: UseReportConfigProps = {}) => {
  const [config, setConfig] = useState<ReportConfig>({
    id: initialConfig?.id || '',
    name: initialConfig?.name || '',
    type: initialConfig?.type || 'custom',
    dataSources: initialConfig?.dataSources || [],
    filters: initialConfig?.filters || [],
    structure: initialConfig?.structure || {
      spreadsheet: {
        cells: {},
        formulas: {},
      },
      charts: [],
      pivots: [],
    },
  });

  const updateConfig = useCallback((updates: Partial<ReportConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const addDataSource = useCallback(async (dataSource: DataSource) => {
    try {
      const isValid = await reportService.testDataSource(dataSource);
      if (!isValid) {
        throw new Error('Invalid data source configuration');
      }

      setConfig((prev) => ({
        ...prev,
        dataSources: [...prev.dataSources, dataSource],
      }));
    } catch (error) {
      console.error('Failed to add data source:', error);
      throw error;
    }
  }, []);

  const updateDataSource = useCallback(async (id: string, dataSource: DataSource) => {
    try {
      const isValid = await reportService.testDataSource(dataSource);
      if (!isValid) {
        throw new Error('Invalid data source configuration');
      }

      setConfig((prev) => ({
        ...prev,
        dataSources: prev.dataSources.map((ds) =>
          ds.id === id ? { ...ds, ...dataSource } : ds
        ),
      }));
    } catch (error) {
      console.error('Failed to update data source:', error);
      throw error;
    }
  }, []);

  const removeDataSource = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      dataSources: prev.dataSources.filter((ds) => ds.id !== id),
    }));
  }, []);

  const addFilter = useCallback((filter: Filter) => {
    setConfig((prev) => ({
      ...prev,
      filters: [...prev.filters, filter],
    }));
  }, []);

  const updateFilter = useCallback((id: string, filter: Filter) => {
    setConfig((prev) => ({
      ...prev,
      filters: prev.filters.map((f) => (f.id === id ? { ...f, ...filter } : f)),
    }));
  }, []);

  const removeFilter = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      filters: prev.filters.filter((f) => f.id !== id),
    }));
  }, []);

  const updateStructure = useCallback((structure: ReportConfig['structure']) => {
    setConfig((prev) => ({
      ...prev,
      structure,
    }));
  }, []);

  const saveConfig = useCallback(async () => {
    try {
      if (config.id) {
        return await reportService.updateTemplate(config.id, config);
      } else {
        return await reportService.createTemplate(config);
      }
    } catch (error) {
      console.error('Failed to save report configuration:', error);
      throw error;
    }
  }, [config]);

  const previewReport = useCallback(async () => {
    try {
      return await reportService.previewReport(config.id, config.filters);
    } catch (error) {
      console.error('Failed to preview report:', error);
      throw error;
    }
  }, [config.id, config.filters]);

  const generateReport = useCallback(async () => {
    try {
      return await reportService.generateReport(config.id, config.filters);
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }, [config.id, config.filters]);

  return {
    config,
    updateConfig,
    addDataSource,
    updateDataSource,
    removeDataSource,
    addFilter,
    updateFilter,
    removeFilter,
    updateStructure,
    saveConfig,
    previewReport,
    generateReport,
  };
};

export default useReportConfig; 