import { useQuery } from '@tanstack/react-query';
import { getUserDetail } from '@/frontend/utils/api/profile';

export const useUserDetailQuery = (userId) =>
  useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserDetail(userId),
    enabled: !!userId,
  });
