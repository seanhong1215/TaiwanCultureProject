import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviewAll, getReviewPage, addReviews, updateReviews, deleteReviews } from '@/frontend/utils/api/review';
import { getActivityAll } from '@/frontend/utils/api/activity';

export const useAdminReviewsQuery = (page, limit) => {
  const allQuery = useQuery({ queryKey: ['reviews', 'admin'], queryFn: getReviewAll });
  const pageQuery = useQuery({ queryKey: ['reviews', 'admin', 'page', page, limit], queryFn: () => getReviewPage(page, limit) });

  const totalItems = allQuery.data?.length ?? 0;
  const totalPage = totalItems ? Math.ceil(totalItems / limit) : 1;

  return {
    reviews: pageQuery.data ?? [],
    totalItems,
    totalPage,
    loading: allQuery.isLoading || pageQuery.isLoading,
    error: allQuery.error || pageQuery.error,
  };
};

// 新增/編輯評價的下拉選單要用到活動清單；跟其他頁面共用
// ['activities'] 快取，通常一開始就已經抓過，不需要等到打開 Modal
// 才臨時去抓。
export const useActivitiesForModalQuery = () =>
  useQuery({ queryKey: ['activities'], queryFn: getActivityAll });

// reviews 的 queryKey 跟前台（HomePage、ActivityDetailPage）、後台
// Dashboard 共用 ['reviews'] 前綴，異動後一併讓那些頁面失效。
const invalidateReviews = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['reviews'] });
};

export const useSaveReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => (id ? updateReviews(id, data) : addReviews(data)),
    onSuccess: () => invalidateReviews(queryClient),
  });
};

export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteReviews(id),
    onSuccess: () => invalidateReviews(queryClient),
  });
};
