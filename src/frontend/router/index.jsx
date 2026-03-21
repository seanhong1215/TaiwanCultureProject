import { createHashRouter, Navigate } from "react-router-dom";

// 需要登入才能訪問的路由
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return children;
};

// 需要 ADMIN 或 ACTIVITY_MANAGER 才能訪問的路由
const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  const role = localStorage.getItem('admin_userRole');
  if (!token || (role !== 'ADMIN' && role !== 'ACTIVITY_MANAGER')) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

import HomePage from '@/frontend/pages/Home/HomePage';
import ActivityList from '@/frontend/pages/Home/ActivityList/ActivityListPage';
import ActivityDetailPage from '@/frontend/pages/Home/ActivityList/ActivityDetailPage';
import BookingPage1 from '@/frontend/pages/Home/ActivityList/Booking/Step1.jsx';
import BookingPage2 from '@/frontend/pages/Home/ActivityList/Booking/Step2.jsx';
import BookingPage3 from '@/frontend/pages/Home/ActivityList/Booking/Step3.jsx';
import BookingPage4 from '@/frontend/pages/Home/ActivityList/Booking/Step4.jsx';
import JournalList from '@/frontend/pages/Home/Journal/JournalListPage';
import JournalDetailPage from '@/frontend/pages/Home/Journal/JournalDetailPage';

import CollectionList from '@/frontend/pages/Home/Member/CollectionList';
import PersonalData from '@/frontend/pages/Home/Member/PersonalData';
import OrderListPage from '@/frontend/pages/Home/Member/OrderManagement/OrderListPage';
import OrderDetailPage from '@/frontend/pages/Home/Member/OrderManagement/OrderDetailPage';
import ActivityReview from '@/frontend/pages/Home/Member/ActivityReview';
import SignIn from '@/frontend/pages/Home/Member/SignIn';
import ActivityPoints from '@/frontend/pages/Home/Member/ActivityPoints';
import CustomerSupport from '@/frontend/pages/Home/Member/CustomerSupport';
import Center from '@/frontend/pages/Home/Member/Center';

import ActivityManager from '@/frontend/pages/Home/Member/ActivityManager';
import MessageManager from '@/frontend/pages/Home/Member/MessageManager';
import NotificationsPage from '@/frontend/pages/Home/Member/NotificationsPage';

import Login from '@/frontend/pages/Admin/Login';
import Dashboard from '@/frontend/pages/Admin/Dashboard';
import MemberManage from '@/frontend/pages/Admin/MemberManage';
import OrderListManage from '@/frontend/pages/Admin/OrderListManage';
import BlogManage from '@/frontend/pages/Admin/BlogManage';
import ActivityManageListPage from '@/frontend/pages/Admin/ActivityManage/ActivityManageListPage';
import ActivityManageDetailPage from '@/frontend/pages/Admin/ActivityManage/ActivityDetailPage';
import EvaluationManage from '@/frontend/pages/Admin/EvaluationManage';


import AdminLayout from '@/frontend/layouts/AdminLayout';
import FrontendLayout from '@/frontend/layouts/FrontendLayout';
import MemberCenterLayout from '@/frontend/layouts/MemberCenterLayout';

const router = createHashRouter(
  [
    {
      path: '/',
      element: <FrontendLayout />,
      children: [
        {
          path: '', 
          element: <HomePage />,
        },
        {
          path: '/activity-list',
          element: <ActivityList />,
        },
        {
          path: '/activity-list/:id',
          element: <ActivityDetailPage />,
        },
        {
          path: '/activity-list/booking1',
          element: <BookingPage1 />,
        },
        {
          path: '/activity-list/booking2',
          element: <BookingPage2 />,
        },
        {
          path: '/activity-list/booking3',
          element: <BookingPage3 />,
        },
        {
          path: '/activity-list/booking4',
          element: <BookingPage4 />,
        },
        {
          path: '/journal-list',
          element: <JournalList />,
        },
        {
          path: '/journal-list/:id',
          element: <JournalDetailPage />,
        }
      ],
    },
    {
      path: '/member-center',
      element: <RequireAuth><MemberCenterLayout /></RequireAuth>,
      children:[
        {
          path: 'personal-data',
          element: <PersonalData />,
        },
        {
          path: 'order-management/list',
          element: <OrderListPage />,
        },
        {
          path: 'order-management/detail/:id',
          element: <OrderDetailPage />,
        },
        {
          path: 'activity-review',
          element: <ActivityReview />,
        },
        {
          path: 'collection-list',
          element: <CollectionList />,
        },
        {
          path: 'sign-in',
          element: <SignIn />,
        },
        {
          path: 'activity-points',
          element: <ActivityPoints />,
        },
        {
          path: 'customer-support',
          element: <CustomerSupport />,
        },
        {
          path: 'center',
          element: <Center />,
        },
        {
          path: 'activity-manager',
          element: <ActivityManager />,
        },
        {
          path: 'message-manager',
          element: <MessageManager />,
        },
        {
          path: 'notifications',
          element: <NotificationsPage />,
        }

      ]
    },
    {
      path: '/admin',
      element: <RequireAdmin><AdminLayout /></RequireAdmin>,
      children: [
        {
          path: 'dashboard',
          element: <Dashboard />,
        },
        {
          path: 'member',
          element: <MemberManage />,
        },
        {
          path: 'order-list',
          element: <OrderListManage />,
        },
        {
          path: 'blog',
          element: <BlogManage />,
        },
        {
          path: 'activity-list',
          element: <ActivityManageListPage />,
        },
        {
          path: 'activity-list/:id',
          element: <ActivityManageDetailPage />,
        },
        {
          path: 'evaluation',
          element: <EvaluationManage />,
        }
      ]
    },
    {
      path: '/admin/login', 
      element: <Login />,
    },
  ],
)

export default router;
