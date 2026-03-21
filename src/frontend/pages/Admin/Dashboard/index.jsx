import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Users, ShoppingCart, Calendar, Star } from 'lucide-react';
import { getMemberAll, getOrderAll, getReviewAll, getActivityAll } from '@/frontend/utils/api';
import './Dashboard.scss';

const AdminDashboard = () => {
    const userRole = localStorage.getItem("admin_userRole");

    const [stats, setStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        totalActivities: 0,
        totalReviews: 0,
        avgRating: 0,
    });
    const [memberTrend, setMemberTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [members, orders, reviews, activities] = await Promise.all([
                    getMemberAll(),
                    getOrderAll(),
                    getReviewAll(),
                    getActivityAll(),
                ]);

                // 會員趨勢（依月份統計）
                const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
                const trendMap = {};
                members.forEach(m => {
                    if (m.createdAt) {
                        const month = new Date(m.createdAt).getMonth();
                        trendMap[month] = (trendMap[month] || 0) + 1;
                    }
                });
                const trend = monthNames.map((name, i) => ({
                    name,
                    value: trendMap[i] || 0,
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

                setStats({
                    totalMembers: members.length,
                    activeMembers: members.filter(m => m.role === 'Member').length,
                    pendingOrders,
                    completedOrders,
                    totalRevenue,
                    totalActivities: activities.length,
                    totalReviews: reviews.length,
                    avgRating,
                });
                setMemberTrend(trend);
            } catch (error) {
                console.error('Dashboard 資料載入失敗:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

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
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#0d6efd" />
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
                    <div className="row mb-4">
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
                    <div className="mt-4">
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