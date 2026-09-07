import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getOrdersByUser, updateOrder } from '@/frontend/utils/api/order';
import { getActivityAll } from '@/frontend/utils/api/activity';

const ORDERS_QUERY_KEY = (userId) => ['orders', 'byUser', userId, 'withActivity'];

// 依訂單的預約時間，判斷這筆訂單「現在」實際該是什麼狀態
const getOrderStatus = (last_bookable_date, timeSlot, reservedStatus) => {
  const now = dayjs();
  const startTime = timeSlot.split("-")[0];
  const orderDateTime = dayjs(`${last_bookable_date} ${startTime}`, "YYYY-MM-DD HH:mm");

  if (orderDateTime.isBefore(now, "day")) return "finished";
  if (reservedStatus === "reserved" && orderDateTime.isBefore(now)) return "in_progress";
  return reservedStatus;
};

/**
 * 該會員的全部訂單（帶入對應活動資料、狀態即時校正）。
 * 每次抓資料都會依當下時間重新算一次每筆訂單「應該」是什麼狀態
 * （例如預約時間已過的自動變成已完成），跟資料庫記錄的不一致時
 * 背景同步回後端，不等它完成、不擋畫面顯示。
 *
 * refetchInterval 讓這個查詢每 30 秒自動重新整理一次，取代原本用
 * setInterval 手動輪詢、只在本地端更新狀態的做法——現在每次刷新
 * 都是真的重新從後端拿資料再校正一次，行為更正確。
 */
export const useUserOrdersQuery = (userId) =>
  useQuery({
    queryKey: ORDERS_QUERY_KEY(userId),
    queryFn: async () => {
      const [userOrders, activities] = await Promise.all([
        getOrdersByUser(userId),
        getActivityAll(),
      ]);

      const ordersWithStatus = userOrders.map((order) => {
        const activity = activities.find((act) => act.id === order.activityId) || {};
        const newStatus = getOrderStatus(order.last_bookable_date, order.timeSlot, order.reservedStatus);
        return { ...order, activity, reservedStatus: newStatus, statusChanged: newStatus !== order.reservedStatus };
      });

      // 狀態有變動的訂單背景同步回後端，不擋畫面顯示
      ordersWithStatus
        .filter((order) => order.statusChanged)
        .forEach((order) => {
          updateOrder(order.id, { reservedStatus: order.reservedStatus }).catch((error) => {
            console.error(`更新訂單 ${order.id} 狀態失敗:`, error);
          });
        });

      return ordersWithStatus.map(({ statusChanged: _statusChanged, ...order }) => order);
    },
    enabled: !!userId,
    refetchInterval: 30 * 1000,
  });

export const useCancelOrderMutation = (userId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => updateOrder(orderId, { reservedStatus: "cancel" }),
    onSuccess: (_response, orderId) => {
      queryClient.setQueryData(ORDERS_QUERY_KEY(userId), (old) =>
        (old ?? []).map((order) => (order.id === orderId ? { ...order, reservedStatus: "cancel" } : order))
      );
    },
  });
};
