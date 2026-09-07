import { useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getActivitys } from '@/frontend/utils/api/activity';
import { getReservations, addReservations } from '@/frontend/utils/api/reservation';
import { getReviewsActivityId, getReviewsActivityIdPage } from '@/frontend/utils/api/review';

// 活動詳細資料
export const useActivityQuery = (id) =>
  useQuery({
    queryKey: ['activity', id],
    queryFn: () => getActivitys(id),
    enabled: !!id,
  });

// 該活動目前的可預約日期／價格表（key 為 YYYY-MM-DD）
export const useReservationDataQuery = (id) =>
  useQuery({
    queryKey: ['reservationData', id],
    queryFn: () => getReservations(id),
    enabled: !!id,
  });

// 分頁評論。placeholderData 讓換頁時畫面保留前一頁的內容，
// 而不是先閃一次空白再顯示新資料。
export const useReviewsPageQuery = (id, page, limit) =>
  useQuery({
    queryKey: ['reviews', id, page, limit],
    queryFn: () => getReviewsActivityIdPage(id, page, limit),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });

// 該活動全部評論（用於平均星等、總則數，不分頁）
export const useReviewsAllQuery = (id) =>
  useQuery({
    queryKey: ['reviewsAll', id],
    queryFn: () => getReviewsActivityId(id),
    enabled: !!id,
  });

/**
 * 確保該活動的可預約日期／價格資料已存在於後端；沒有的話依活動的
 * 起訖日期建立一份。這是「資料初始化」而非「讀取顯示用資料」，
 * 原本混在抓活動資料的 effect 裡，獨立成一個 hook 讓意圖更清楚。
 */
export const useEnsureReservationData = (activityData) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!activityData?.id) return;
    let cancelled = false;

    const ensureReservationData = async () => {
      const result = { id: activityData.id };
      const startDate = new Date(activityData.startDate);
      const endDate = new Date(activityData.endDate);
      const price = Number(activityData.price);
      const formatDate = (date) => date.toISOString().split('T')[0];

      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        result[formatDate(currentDate)] = { price };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      try {
        const existing = await getReservations(activityData.id);
        if (existing && Object.keys(existing).length === 0) {
          await addReservations(result);
          // 建立完成後讓可預約日期的查詢重新抓取，畫面才會顯示剛建立的資料
          if (!cancelled) {
            queryClient.invalidateQueries({ queryKey: ['reservationData', activityData.id] });
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.warn('Reservations not found:', error);
        } else {
          console.error('Error processing reservation:', error);
        }
      }
    };

    ensureReservationData();
    return () => {
      cancelled = true;
    };
  }, [activityData?.id, activityData?.startDate, activityData?.endDate, activityData?.price, queryClient]);
};

/**
 * 組合活動詳情頁需要的所有資料查詢與衍生狀態。
 * 元件只需要呼叫這一個 hook，不必自己管理 loading/error 與多個 useEffect。
 */
export const useActivityDetailPage = (id, page, limit) => {
  const activityQuery = useActivityQuery(id);
  const reservationDataQuery = useReservationDataQuery(id);
  const reviewsPageQuery = useReviewsPageQuery(id, page, limit);
  const reviewsAllQuery = useReviewsAllQuery(id);

  useEnsureReservationData(activityQuery.data);

  const activityData = activityQuery.data ?? {};
  const activityDetailData = activityData.activityDetails ?? [];
  const activityDetailDataSection = activityDetailData[0]?.sections ?? [];
  const showMainImage = activityDetailData[0]?.images?.length > 0
    ? activityDetailData[0].images[0].url
    : 'Loading';

  const reviewData = reviewsPageQuery.data ?? [];
  const RatingstarAll = reviewsAllQuery.data ?? [];
  const totalPage = Math.ceil(RatingstarAll.length / limit);

  const Ratingstar = reviewData.length === 0
    ? 0
    : reviewData.reduce((sum, item) => sum + item.rating, 0) / reviewData.length;

  const avgRatingstar = RatingstarAll.length === 0
    ? 0
    : (RatingstarAll.reduce((sum, item) => sum + item.rating, 0) / RatingstarAll.length).toFixed(1);

  return {
    activityData,
    activityDetailData,
    activityDetailDataSection,
    showMainImage,
    getReservationData: reservationDataQuery.data ?? {},
    reviewData,
    RatingstarAll,
    Ratingstar,
    avgRatingstar,
    totalPage,
    loading: activityQuery.isLoading,
    error: activityQuery.error || reviewsPageQuery.error || reservationDataQuery.error || reviewsAllQuery.error,
  };
};
