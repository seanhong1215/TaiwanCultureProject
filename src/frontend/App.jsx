import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import router from "@/frontend/router";
import { UserProvider } from "@/frontend/components/UserContext/Users";

// 集中管理所有頁面的資料抓取快取／重試策略，取代各頁面各自維護
// useEffect + useState 的手動 loading/error 處理。
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 分鐘內視為新鮮資料，不重複打 API
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </QueryClientProvider>
  )
};

export default App;
