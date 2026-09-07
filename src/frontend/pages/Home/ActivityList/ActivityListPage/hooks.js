import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActivityAll, getActivityPage } from '@/frontend/utils/api/activity';

/**
 * 活動列表頁的資料層。
 *
 * appliedFilters 為 null 時代表「未搜尋」，直接分頁瀏覽全部活動
 * （getActivityPage）；appliedFilters 有值時代表使用者按下搜尋，
 * 改成用完整清單（getActivityAll，只抓一次、之後從快取篩選）在
 * 前端做篩選＋分頁，不用每次篩選條件變動就重打 API。
 *
 * 篩選只在按下搜尋按鈕當下生效（由呼叫端把當時的輸入值包成
 * appliedFilters 傳進來），不是每個欄位變動就即時篩選——維持原本
 * 「輸入完再按搜尋」的互動方式。
 */
export const useActivityListPage = ({ page, limit, appliedFilters }) => {
  const isSearching = appliedFilters !== null;

  const allQuery = useQuery({
    queryKey: ['activities'],
    queryFn: getActivityAll,
  });

  const pageQuery = useQuery({
    queryKey: ['activities', 'page', page, limit],
    queryFn: () => getActivityPage(page, limit),
    enabled: !isSearching,
  });

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const { searchInput, selectedDate, selectedType, selectedCity, selectedPrice } = appliedFilters;
    const all = allQuery.data ?? [];

    return all.filter((item) => {
      const matchesTitle = searchInput
        ? item.content.title.toLowerCase().includes(searchInput.toLowerCase()) ||
          item.content.description.toLowerCase().includes(searchInput.toLowerCase()) ||
          item.city.toLowerCase().includes(searchInput.toLowerCase())
        : true;
      const matchesDate = selectedDate
        ? new Date(item.startDate) >= new Date(selectedDate || "1970-01-01") && new Date(item.startDate) <= new Date(selectedDate || "2099-12-31")
        : true;
      const matchesType = selectedType ? item.eventType === selectedType : true;
      const matchesSite = selectedCity ? item.city === selectedCity : true;
      const matchesPrice = selectedPrice ? item.price <= selectedPrice : true;

      return matchesTitle && matchesDate && matchesType && matchesSite && matchesPrice;
    });
  }, [isSearching, appliedFilters, allQuery.data]);

  const totalItems = isSearching ? searchResults.length : (allQuery.data?.length ?? 0);
  const totalPage = totalItems ? Math.ceil(totalItems / limit) : 1;

  const startIdx = (page - 1) * limit;
  const paginatedSearchResults = searchResults.slice(startIdx, startIdx + limit);

  return {
    activityData: pageQuery.data ?? [],
    searchResultsData: isSearching ? paginatedSearchResults : [],
    isSearching,
    totalItems,
    totalPage,
    loading: isSearching ? allQuery.isLoading : pageQuery.isLoading,
    error: isSearching ? allQuery.error : pageQuery.error,
    refetch: isSearching ? allQuery.refetch : pageQuery.refetch,
  };
};
