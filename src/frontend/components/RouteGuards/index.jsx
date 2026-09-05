import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * 前台路由守衛。
 *
 * 注意：這一層只是使用者體驗（避免未登入者看到空白的會員頁），
 * 不是安全機制 —— 任何人都能改 localStorage 繞過它。
 * 真正的權限判斷在後端 src/backend/server/auth.js 的 guardCollections / requireRole。
 */
export const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return children;
};

RequireAuth.propTypes = { children: PropTypes.node };

/** 後台路由守衛，同樣僅為體驗優化，實際授權由後端把關 */
export const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  const role = localStorage.getItem('admin_userRole');
  if (!token || (role !== 'ADMIN' && role !== 'ACTIVITY_MANAGER')) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

RequireAdmin.propTypes = { children: PropTypes.node };
