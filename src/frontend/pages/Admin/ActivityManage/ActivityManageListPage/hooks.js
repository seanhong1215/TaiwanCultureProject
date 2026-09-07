import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActivityAll, getActivityPage, addActivitys, updatedActivitys, deleteActivitys } from '@/frontend/utils/api/activity';

export const useAdminActivitiesQuery = (page, limit) => {
  const allQuery = useQuery({ queryKey: ['activities'], queryFn: getActivityAll });
  const pageQuery = useQuery({ queryKey: ['activities', 'page', page, limit], queryFn: () => getActivityPage(page, limit) });

  const totalItems = allQuery.data?.length ?? 0;
  const totalPage = totalItems ? Math.ceil(totalItems / limit) : 1;

  return {
    events: pageQuery.data ?? [],
    totalItems,
    totalPage,
    loading: allQuery.isLoading || pageQuery.isLoading,
    error: allQuery.error || pageQuery.error,
  };
};

// 活動的 queryKey 跟前台頁面（HomePage、ActivityListPage、
// ActivityDetailPage）共用同一個 ['activities'] 前綴，這裡的新增／
// 編輯／刪除成功後一併讓那些頁面的快取失效，下次造訪會拿到最新資料。
const invalidateActivities = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['activities'] });
};

export const useSaveActivityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (event) => (event.id ? updatedActivitys(event.id, event) : addActivitys(event)),
    onSuccess: () => invalidateActivities(queryClient),
  });
};

export const useDeleteActivityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteActivitys(id),
    onSuccess: () => invalidateActivities(queryClient),
  });
};
