import { useQuery } from '@tanstack/react-query';
import { getActivityAll } from '@/frontend/utils/api/activity';
import { getJournalAll } from '@/frontend/utils/api/journal';
import { getReviewAll } from '@/frontend/utils/api/review';

// 資料還沒回來前用同一個空陣列參照，而不是每次呼叫都用 `?? []` 生一個新的。
// HomePage 有 `useEffect(() => {...}, [activityData])`，資料到位前若每次
// render 拿到的空陣列都是新的參照，這個 effect 會每次 render 都觸發、
// setState、re-render、再觸發……在 API 是瞬間回應的 json-server 上幾乎
// 不會踩到，但換成真的要連網路查 Postgres、loading 時間拉長後，
// 這個迴圈會被 React 判定為 Maximum update depth exceeded。
const EMPTY_ARRAY = [];

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
    activityData: activityQuery.data ?? EMPTY_ARRAY,
    journalData: journalQuery.data ?? EMPTY_ARRAY,
    reviews: reviewQuery.data ? reviewQuery.data.slice(0, 6) : EMPTY_ARRAY, // 首頁只展示前六則
    loading: activityQuery.isLoading || journalQuery.isLoading || reviewQuery.isLoading,
    error: activityQuery.error || journalQuery.error || reviewQuery.error,
  };
};
