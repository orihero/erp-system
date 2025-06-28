import { useQuery } from '@tanstack/react-query';
import { directoriesApi } from '@/api/services/directories';

export function useDirectories() {
  return useQuery({
    queryKey: ['directories'],
    queryFn: async () => {
      const res = await directoriesApi.getAll();
      return res.data;
    },
  });
} 