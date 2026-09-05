import { lazy, Suspense } from 'react';
import { createHashRouter } from 'react-router-dom';

import { RequireAuth, RequireAdmin } from '@/frontend/components/RouteGuards';
import PageLoader from '@/frontend/components/PageLoader';
import ErrorPage from '@/frontend/components/ErrorPage';

// 版面與首頁在首次載入就會用到，維持同步載入避免首屏閃動
import FrontendLayout from '@/frontend/layouts/FrontendLayout';
import HomePage from '@/frontend/pages/Home/HomePage';

/*
 * 路由層 code splitting。
 * 拆分前整站打包成單一 2MB 的 JS，訪客光看首頁就得下載整個後台。
 * 這裡讓每個路由各自成為一個 chunk，瀏覽器只在進入該頁時才下載。
 */

// --- 前台 ---
const ActivityList = lazy(() => import('@/frontend/pages/Home/ActivityList/ActivityListPage'));
const ActivityDetailPage = lazy(() => import('@/frontend/pages/Home/ActivityList/ActivityDetailPage'));
const BookingPage1 = lazy(() => import('@/frontend/pages/Home/ActivityList/Booking/Step1.jsx'));
const BookingPage2 = lazy(() => import('@/frontend/pages/Home/ActivityList/Booking/Step2.jsx'));
const BookingPage3 = lazy(() => import('@/frontend/pages/Home/ActivityList/Booking/Step3.jsx'));
const BookingPage4 = lazy(() => import('@/frontend/pages/Home/ActivityList/Booking/Step4.jsx'));
const JournalList = lazy(() => import('@/frontend/pages/Home/Journal/JournalListPage'));
const JournalDetailPage = lazy(() => import('@/frontend/pages/Home/Journal/JournalDetailPage'));

// --- 會員中心 ---
const MemberCenterLayout = lazy(() => import('@/frontend/layouts/MemberCenterLayout'));
const PersonalData = lazy(() => import('@/frontend/pages/Home/Member/PersonalData'));
const OrderListPage = lazy(() => import('@/frontend/pages/Home/Member/OrderManagement/OrderListPage'));
const OrderDetailPage = lazy(() => import('@/frontend/pages/Home/Member/OrderManagement/OrderDetailPage'));
const ActivityReview = lazy(() => import('@/frontend/pages/Home/Member/ActivityReview'));
const CollectionList = lazy(() => import('@/frontend/pages/Home/Member/CollectionList'));
const SignIn = lazy(() => import('@/frontend/pages/Home/Member/SignIn'));
const ActivityPoints = lazy(() => import('@/frontend/pages/Home/Member/ActivityPoints'));
const CustomerSupport = lazy(() => import('@/frontend/pages/Home/Member/CustomerSupport'));
const Center = lazy(() => import('@/frontend/pages/Home/Member/Center'));
const ActivityManager = lazy(() => import('@/frontend/pages/Home/Member/ActivityManager'));
const MessageManager = lazy(() => import('@/frontend/pages/Home/Member/MessageManager'));
const NotificationsPage = lazy(() => import('@/frontend/pages/Home/Member/NotificationsPage'));

// --- 後台 ---
const AdminLayout = lazy(() => import('@/frontend/layouts/AdminLayout'));
const Login = lazy(() => import('@/frontend/pages/Admin/Login'));
const Dashboard = lazy(() => import('@/frontend/pages/Admin/Dashboard'));
const MemberManage = lazy(() => import('@/frontend/pages/Admin/MemberManage'));
const OrderListManage = lazy(() => import('@/frontend/pages/Admin/OrderListManage'));
const BlogManage = lazy(() => import('@/frontend/pages/Admin/BlogManage'));
const ActivityManageListPage = lazy(() => import('@/frontend/pages/Admin/ActivityManage/ActivityManageListPage'));
const ActivityManageDetailPage = lazy(() => import('@/frontend/pages/Admin/ActivityManage/ActivityDetailPage'));
const EvaluationManage = lazy(() => import('@/frontend/pages/Admin/EvaluationManage'));

/** 包上 Suspense，載入 chunk 期間顯示 loading */
const withSuspense = (element) => <Suspense fallback={<PageLoader />}>{element}</Suspense>;

const router = createHashRouter([
  {
    path: '/',
    element: <FrontendLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'activity-list', element: withSuspense(<ActivityList />) },
      { path: 'activity-list/booking1', element: withSuspense(<BookingPage1 />) },
      { path: 'activity-list/booking2', element: withSuspense(<BookingPage2 />) },
      { path: 'activity-list/booking3', element: withSuspense(<BookingPage3 />) },
      { path: 'activity-list/booking4', element: withSuspense(<BookingPage4 />) },
      { path: 'activity-list/:id', element: withSuspense(<ActivityDetailPage />) },
      { path: 'journal-list', element: withSuspense(<JournalList />) },
      { path: 'journal-list/:id', element: withSuspense(<JournalDetailPage />) },
    ],
  },
  {
    path: '/member-center',
    element: <RequireAuth>{withSuspense(<MemberCenterLayout />)}</RequireAuth>,
    errorElement: <ErrorPage />,
    children: [
      { path: 'personal-data', element: withSuspense(<PersonalData />) },
      { path: 'order-management/list', element: withSuspense(<OrderListPage />) },
      { path: 'order-management/detail/:id', element: withSuspense(<OrderDetailPage />) },
      { path: 'activity-review', element: withSuspense(<ActivityReview />) },
      { path: 'collection-list', element: withSuspense(<CollectionList />) },
      { path: 'sign-in', element: withSuspense(<SignIn />) },
      { path: 'activity-points', element: withSuspense(<ActivityPoints />) },
      { path: 'customer-support', element: withSuspense(<CustomerSupport />) },
      { path: 'center', element: withSuspense(<Center />) },
      { path: 'activity-manager', element: withSuspense(<ActivityManager />) },
      { path: 'message-manager', element: withSuspense(<MessageManager />) },
      { path: 'notifications', element: withSuspense(<NotificationsPage />) },
    ],
  },
  {
    path: '/admin',
    element: <RequireAdmin>{withSuspense(<AdminLayout />)}</RequireAdmin>,
    errorElement: <ErrorPage />,
    children: [
      { path: 'dashboard', element: withSuspense(<Dashboard />) },
      { path: 'member', element: withSuspense(<MemberManage />) },
      { path: 'order-list', element: withSuspense(<OrderListManage />) },
      { path: 'blog', element: withSuspense(<BlogManage />) },
      { path: 'activity-list', element: withSuspense(<ActivityManageListPage />) },
      { path: 'activity-list/:id', element: withSuspense(<ActivityManageDetailPage />) },
      { path: 'evaluation', element: withSuspense(<EvaluationManage />) },
    ],
  },
  {
    path: '/admin/login',
    element: withSuspense(<Login />),
    errorElement: <ErrorPage />,
  },
  // 沒有對應的網址一律顯示 404（此路由不會拋錯，需明確標示 notFound）
  { path: '*', element: <ErrorPage notFound /> },
]);

export default router;
