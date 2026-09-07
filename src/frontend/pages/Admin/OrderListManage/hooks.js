import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderAll, getOrderPage, createOrder, updateOrder, deleteOrder } from '@/frontend/utils/api/order';

export const useAdminOrdersQuery = (page, limit) => {
  const allQuery = useQuery({ queryKey: ['orders'], queryFn: getOrderAll });
  const pageQuery = useQuery({ queryKey: ['orders', 'page', page, limit], queryFn: () => getOrderPage(page, limit) });

  const totalItems = allQuery.data?.length ?? 0;
  const totalPage = totalItems ? Math.ceil(totalItems / limit) : 1;

  return {
    orders: pageQuery.data ?? [],
    totalItems,
    totalPage,
    loading: allQuery.isLoading || pageQuery.isLoading,
  };
};

// orders 的 queryKey 跟後台 Dashboard、前台會員訂單頁共用 ['orders']
// 前綴，新增／編輯／刪除成功後一併讓那些頁面失效。
const invalidateOrders = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['orders'] });
};

export const useSaveOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (order) => (order.id ? updateOrder(order.id, order) : createOrder(order)),
    onSuccess: () => invalidateOrders(queryClient),
  });
};

export const useDeleteOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => deleteOrder(orderId),
    onSuccess: () => invalidateOrders(queryClient),
  });
};
