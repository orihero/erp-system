import { useQuery } from '@tanstack/react-query';
import { directoriesApi } from '@/api/services/directories';

export function useDirectoryRecords(directoryId: string, companyId: string) {
  return useQuery({
    queryKey: ['directoryRecordsFull', directoryId, companyId],
    queryFn: async () => {
      const res = await directoriesApi.getFullDirectoryData(directoryId, companyId);
      return res.data;
    },
    enabled: !!directoryId && !!companyId,
  });
} 