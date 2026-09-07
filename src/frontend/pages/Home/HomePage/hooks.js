import { useQuery } from '@tanstack/react-query';
import { getActivityAll } from '@/frontend/utils/api/activity';
import { getJournalAll } from '@/frontend/utils/api/journal';
import { getReviewAll } from '@/frontend/utils/api/review';

/**
 * 首頁需要的三份資料（活動、日誌、評價）。
 * 原本三支各自的 fetch 函式只有部分有在 finally 裡收 loading，
 * 導致 loading 狀態實際上取決於誰最後執行完，並不可靠；
 * 這裡改成從三個查詢各自的 isLoading 匯總，行為才是真正對的。
 */
export const useHomePageData = () => {
  const activityQuery = useQuery({
    queryKey: ['activities'],
    queryFn: getActivityAll,
  });
  const journalQuery = useQuery({
    queryKey: ['journals'],
    queryFn: getJournalAll,
  });
  const reviewQuery = useQuery({
    queryKey: ['reviews', 'home'],
    queryFn: getReviewAll,
  });

  return {
    activityData: activityQuery.data ?? [],
    journalData: journalQuery.data ?? [],
    reviews: (reviewQuery.data ?? []).slice(0, 6), // 首頁只展示前六則
    loading: activityQuery.isLoading || journalQuery.isLoading || reviewQuery.isLoading,
    error: activityQuery.error || journalQuery.error || reviewQuery.error,
  };
};
