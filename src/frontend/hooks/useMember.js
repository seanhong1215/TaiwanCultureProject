import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMembers, updatedMembers } from '@/frontend/utils/api/member';

// 共用的會員資料查詢：SignIn（簽到）、Center（會員中心）都需要同一份
// 會員資料（rewards、tickets、signInHistory…），用同一個 queryKey 讓
// 兩個頁面共享快取，同一次瀏覽不會重複打 API。
export const useMemberQuery = (userId) =>
  useQuery({
    queryKey: ['member', userId],
    queryFn: () => getMembers(userId),
    enabled: !!userId,
  });

/**
 * 寫回整份已更新好的 user 物件，成功後直接把這份資料寫進快取，
 * 不需要再重新 GET 一次確認。
 */
export const useUpdateMemberMutation = (userId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedUser) => updatedMembers(userId, updatedUser),
    onSuccess: (_response, updatedUser) => {
      queryClient.setQueryData(['member', userId], updatedUser);
    },
  });
};
