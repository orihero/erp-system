import { useQuery } from '@tanstack/react-query';
import { directoriesApi } from '@/api/services/directories';

interface UseDirectoryRecordsOptions {
  groupBy?: string;
}

export function useDirectoryRecords(directoryId: string, companyId: string, options?: UseDirectoryRecordsOptions) {
  return useQuery({
    queryKey: ['directoryRecordsFull', directoryId, companyId, options?.groupBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.groupBy) {
        params.append('groupBy', options.groupBy);
      }
      const res = await directoriesApi.getFullDirectoryData(directoryId, companyId, params);
      return res.data;
    },
    enabled: !!directoryId && !!companyId,
  });
} 