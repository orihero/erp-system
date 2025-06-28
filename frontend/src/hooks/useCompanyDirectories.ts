import { useQuery } from '@tanstack/react-query';
import { companyDirectoriesApi } from '@/api/services/companyDirectories';

export function useCompanyDirectories(companyId?: string) {
  return useQuery({
    queryKey: ['companyDirectories', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const res = await companyDirectoriesApi.getAll(companyId);
      return res.data;
    },
    enabled: !!companyId,
  });
} 