import { useQueries } from '@tanstack/react-query';
import { getMemberAll } from '@/frontend/utils/api/member';
import { getOrderAll } from '@/frontend/utils/api/order';
import { getReviewAll } from '@/frontend/utils/api/review';
import { getActivityAll } from '@/frontend/utils/api/activity';

const EMPTY_STATS = {
  totalMembers: 0,
  activeMembers: 0,
  pendingOrders: 0,
  completedOrders: 0,
  totalRevenue: 0,
  totalActivities: 0,
  totalReviews: 0,
  avgRating: 0,
};

// 近 6 個月的月份標籤（用於會員／訂單趨勢圖的 X 軸）
const getLast6Months = () => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: `${d.getMonth() + 1}月`,
    });
  }
  return months;
};

/**
 * Dashboard 需要的四份原始資料（會員、訂單、評價、活動），
 * 加上從它們算出來的統計卡片數字與近 6 個月趨勢圖資料。
 * 原本這些計算跟四支 fetch 混在同一個 useEffect 裡，現在拆成
 * 「抓資料」（useQueries）跟「算統計」（下方的衍生值）兩層。
 */
export const useDashboardData = () => {
  const [membersQuery, ordersQuery, reviewsQuery, activitiesQuery] = useQueries({
    queries: [
      { queryKey: ['members'], queryFn: getMemberAll },
      { queryKey: ['orders'], queryFn: getOrderAll },
      { queryKey: ['reviews', 'dashboard'], queryFn: getReviewAll },
      { queryKey: ['activities'], queryFn: getActivityAll },
    ],
  });

  const loading = membersQuery.isLoading || ordersQuery.isLoading || reviewsQuery.isLoading || activitiesQuery.isLoading;
  const error = membersQuery.error || ordersQuery.error || reviewsQuery.error || activitiesQuery.error;

  if (loading || error) {
    return { stats: EMPTY_STATS, memberTrend: [], orderTrend: [], loading, error };
  }

  const members = membersQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];
  const activities = activitiesQuery.data ?? [];
  const last6Months = getLast6Months();

  // 會員趨勢（近6個月）
  const memberTrendMap = {};
  members.forEach(m => {
    if (m.createdAt) {
      const d = new Date(m.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      memberTrendMap[key] = (memberTrendMap[key] || 0) + 1;
    }
  });
  const memberTrend = last6Months.map(({ key, label }) => ({
    name: label,
    新增會員: memberTrendMap[key] || 0,
  }));

  // 訂單趨勢（近6個月）
  const orderTrendMap = {};
  orders.forEach(o => {
    if (o.createdAt) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!orderTrendMap[key]) orderTrendMap[key] = { 訂單數: 0, 營收: 0 };
      orderTrendMap[key].訂單數 += 1;
      if (o.paymentStatus === 'PAID') {
        orderTrendMap[key].營收 += (o.totalAmount || 0);
      }
    }
  });
  const orderTrend = last6Months.map(({ key, label }) => ({
    name: label,
    訂單數: orderTrendMap[key]?.訂單數 || 0,
    營收: orderTrendMap[key]?.營收 || 0,
  }));

  // 訂單統計
  const pendingOrders = orders.filter(o => o.reservedStatus === 'reserved').length;
  const completedOrders = orders.filter(o => o.reservedStatus === 'finished').length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // 評價統計
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const stats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.role === 'Member').length,
    pendingOrders,
    completedOrders,
    totalRevenue,
    totalActivities: activities.length,
    totalReviews: reviews.length,
    avgRating,
  };

  return { stats, memberTrend, orderTrend, loading, error };
};
