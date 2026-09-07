import { useQuery } from '@tanstack/react-query';
import { getActivityAll } from '@/frontend/utils/api/activity';
import { getFavorites } from '@/frontend/utils/api/favorite';

/**
 * 收藏清單：先取得該會員收藏的活動 ID，再從全部活動中篩出對應項目。
 * ActivityCard 移除收藏後會呼叫 onToggleFavorite()（不帶參數）通知
 * 「請重新整理列表」，直接對應 useQuery 的 refetch。
 */
export const useCollectionList = (userId) => {
  const query = useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      const favoriteResponse = await getFavorites(userId);
      const favoriteIds = favoriteResponse.map((fav) => fav.activityId);
      const activityResponse = await getActivityAll();
      return activityResponse.filter((activity) => favoriteIds.includes(activity.id));
    },
    enabled: !!userId,
  });

  return {
    favorites: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
