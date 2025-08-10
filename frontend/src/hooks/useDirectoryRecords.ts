import { useQuery } from '@tanstack/react-query';
import { directoriesApi } from '@/api/services/directories';

interface UseDirectoryRecordsOptions {
  groupBy?: string;
  skipCompanyId?: boolean; // For super admin users who might not have company_id
  search?: string;
  filters?: Record<string, string | number | boolean>;
  sorting?: Array<{
    field: string;
    direction: 'ASC' | 'DESC';
  }>;
}

export function useDirectoryRecords(directoryId: string, companyId: string, options?: UseDirectoryRecordsOptions) {
  return useQuery({
    queryKey: ['directoryRecordsFull', directoryId, companyId, options?.groupBy, options?.search, options?.filters, options?.sorting],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.groupBy) {
        params.append('groupBy', options.groupBy);
      }
      if (options?.search) {
        params.append('search', options.search);
      }
      
      // Add filter parameters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([fieldId, value]) => {
          params.append(`filters[${fieldId}]`, String(value));
        });
      }
      
      // Add sorting parameters
      if (options?.sorting && options.sorting.length > 0) {
        options.sorting.forEach((sort, index) => {
          params.append(`sort[${index}][field]`, sort.field);
          params.append(`sort[${index}][direction]`, sort.direction);
        });
      }
      
      // If skipCompanyId is true, we'll pass 'system' instead of empty string
      const effectiveCompanyId = options?.skipCompanyId ? 'system' : companyId;
      const res = await directoriesApi.getFullDirectoryData(directoryId, effectiveCompanyId, params);
      return res.data;
    },
    enabled: !!directoryId && (!!companyId || options?.skipCompanyId),
  });
} 