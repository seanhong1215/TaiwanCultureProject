import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJournalAll, getJournalPage, createdJournal, updatedJournal, deletedJournal } from '@/frontend/utils/api/journal';

export const useAdminJournalsQuery = (page, limit) => {
  const allQuery = useQuery({ queryKey: ['journals'], queryFn: getJournalAll });
  const pageQuery = useQuery({ queryKey: ['journals', 'page', page, limit], queryFn: () => getJournalPage(page, limit) });

  const totalItems = allQuery.data?.length ?? 0;
  const totalPage = totalItems ? Math.ceil(totalItems / limit) : 1;

  return {
    blogs: pageQuery.data ?? [],
    totalItems,
    totalPage,
    loading: allQuery.isLoading || pageQuery.isLoading,
    error: allQuery.error || pageQuery.error,
  };
};

// journals 的 queryKey 跟前台的 HomePage、JournalListPage 共用
// ['journals'] 前綴，新增／編輯／刪除成功後一併讓那些頁面失效。
const invalidateJournals = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['journals'] });
};

export const useSaveJournalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title, date, content, images, status }) =>
      id
        ? updatedJournal(id, { title, date, content, images, status })
        : createdJournal({ title, date, content, images, status }),
    onSuccess: () => invalidateJournals(queryClient),
  });
};

export const useDeleteJournalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deletedJournal(id),
    onSuccess: () => invalidateJournals(queryClient),
  });
};
