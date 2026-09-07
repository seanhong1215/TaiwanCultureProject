import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Eye, Users, ShoppingCart, Calendar, Star } from 'lucide-react';
import { useDashboardData } from './hooks';
import './Dashboard.scss';

const AdminDashboard = () => {
    const userRole = localStorage.getItem("admin_userRole");
    const { stats, memberTrend, orderTrend, loading } = useDashboardData();

    const ROLES = {
        ADMIN: 'ADMIN',
        ACTIVITY_MANAGER: 'ACTIVITY_MANAGER',
        Member: 'Member'
    };

if (loading) {
    return (
        <div className="container-fluid py-4 text-center">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );
}

return (
    <div className="container-fluid py-4">
        <h1 className="display-3 mb-4">Overview</h1>

        <div className="row g-4">
            {/* 會員管理卡片 */}
            {userRole !== ROLES.ACTIVITY_MANAGER && (
                <div className="col-md-6">
                <div className="card h-100">
                    <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <Users className="me-2" />
                        會員管理
                    </h5>
                    </div>
                    <div className="card-body">
                    <div className="row mb-4">
                        <div className="col-6">
                        <p className="text-muted mb-1">總會員數</p>
                        <h3>{stats.totalMembers.toLocaleString()}</h3>
                        </div>
                        <div className="col-6">
                        <p className="text-muted mb-1">一般會員</p>
                        <h3>{stats.activeMembers.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={memberTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="新增會員" stroke="#0d6efd" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4">
                        <Link to="/admin/member" className="btn btn-primary me-2">
                        <Eye className="me-1" size={16} /> 查看會員
                        </Link>
                    </div>
                    </div>
                </div>
                </div>
            )}

            {/* 訂單管理卡片 */}
            {userRole !== ROLES.ACTIVITY_MANAGER && (
                <div className="col-md-6">
                <div className="card h-100">
                    <div className="card-header">
                    <h5 className="card-title mb-0">
                        <ShoppingCart className="me-2" />
                        訂單管理
                    </h5>
                    </div>
                    <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-4">
                        <p className="text-muted mb-1">待處理</p>
                        <h3>{stats.pendingOrders}</h3>
                        </div>
                        <div className="col-4">
                        <p className="text-muted mb-1">已完成</p>
                        <h3>{stats.completedOrders}</h3>
                        </div>
                        <div className="col-4">
                        <p className="text-muted mb-1">總銷售額</p>
                        <h3>${(stats.totalRevenue / 1000).toFixed(1)}K</h3>
                        </div>
                    </div>
                    <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={orderTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="訂單數" fill="#0d6efd" />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-3">
                        <Link to="/admin/order-list" className="btn btn-primary me-2">
                        <Eye className="me-1" size={16} /> 查看訂單
                        </Link>
                    </div>
                    </div>
                </div>
                </div>
            )}

            {/* 活動管理卡片 */}
            <div className="col-md-6">
            <div className="card h-100">
                <div className="card-header">
                <h5 className="card-title mb-0">
                    <Calendar className="me-2" />
                    活動管理
                </h5>
                </div>
                <div className="card-body">
                <div className="row mb-4">
                    <div className="col-6">
                    <p className="text-muted mb-1">活動總數</p>
                    <h3>{stats.totalActivities}</h3>
                    </div>
                </div>
                <div className="mt-4">
                    <Link to="/admin/activity-list" className="btn btn-primary">
                    <Eye className="me-1" size={16} /> 查看活動
                    </Link>
                </div>
                </div>
            </div>
            </div>

            {/* 評價管理卡片 */}
            <div className="col-md-6">
            <div className="card h-100">
                <div className="card-header">
                <h5 className="card-title mb-0">
                    <Star className="me-2" />
                    評價管理
                </h5>
                </div>
                <div className="card-body">
                <div className="row mb-4">
                    <div className="col-6">
                    <p className="text-muted mb-1">平均評分</p>
                    <h3>{stats.avgRating} ★</h3>
                    </div>
                    <div className="col-6">
                    <p className="text-muted mb-1">評價總數</p>
                    <h3>{stats.totalReviews}</h3>
                    </div>
                </div>
                <div className="mt-4">
                    <Link to="/admin/evaluation" className="btn btn-primary">
                    <Eye className="me-1" size={16} /> 查看評價
                    </Link>
                </div>
                </div>
            </div>
            </div>
        </div>
    </div>
);
};

export default AdminDashboard;