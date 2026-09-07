import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMemberAll, getMemberPage, updatedMembers } from '@/frontend/utils/api/member';
import { register } from '@/frontend/utils/api/auth';

export const useAdminMembersQuery = (page, limit) => {
  const allQuery = useQuery({ queryKey: ['members'], queryFn: getMemberAll });
  const pageQuery = useQuery({ queryKey: ['members', 'page', page, limit], queryFn: () => getMemberPage(page, limit) });

  const totalItems = allQuery.data?.length ?? 0;
  const totalPage = totalItems ? Math.ceil(totalItems / limit) : 1;

  return {
    members: pageQuery.data ?? [],
    totalItems,
    totalPage,
    // Dashboard 用同一個 ['members'] key，這裡的 loading 只看自己這頁需要的兩支查詢
    loading: allQuery.isLoading || pageQuery.isLoading,
  };
};

export const useSaveMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ editingUser, userData }) =>
      editingUser ? updatedMembers(editingUser.id, userData) : register(userData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  });
};
