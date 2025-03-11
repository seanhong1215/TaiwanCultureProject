import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Edit, Eye, Trash2, Users, ShoppingCart, Calendar, Star } from 'lucide-react';
import './Dashboard.scss';
// import { useContext } from "react";
// import ApiContext from "@/frontend/components/UserContext/Users";

// 模擬數據
const memberTrend = [
{ name: '1月', value: 400 },
{ name: '2月', value: 500 },
{ name: '3月', value: 600 },
{ name: '4月', value: 680 },
{ name: '5月', value: 750 },
{ name: '6月', value: 800 },
];

const AdminDashboard = () => {
// const { data } = useContext(ApiContext);

    const userRole = localStorage.getItem("userRole");

    const ROLES = {
        ADMIN: 'ADMIN',
        ACTIVITY_MANAGER: 'ACTIVITY_MANAGER',
        Member: 'Member'
        // 可以添加其他角色
    };

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
                    <small className="text-muted">更新於 2分鐘前</small>
                    </div>
                    <div className="card-body">
                    <div className="row mb-4">
                        <div className="col-6">
                        <p className="text-muted mb-1">總會員數</p>
                        <h3>2,345</h3>
                        </div>
                        <div className="col-6">
                        <p className="text-muted mb-1">活躍會員</p>
                        <h3>1,234</h3>
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
                    <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <ShoppingCart className="me-2" />
                        訂單管理
                    </h5>
                    <small className="text-muted">更新於 5分鐘前</small>
                    </div>
                    <div className="card-body">
                    <div className="row mb-4">
                        <div className="col-4">
                        <p className="text-muted mb-1">待處理</p>
                        <h3>25</h3>
                        </div>
                        <div className="col-4">
                        <p className="text-muted mb-1">已完成</p>
                        <h3>138</h3>
                        </div>
                        <div className="col-4">
                        <p className="text-muted mb-1">總銷售額</p>
                        <h3>$12.5K</h3>
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
                <div className="mb-3">
                    <div className="p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                        <h6 className="mb-1">春季特賣活動</h6>
                        <small className="text-muted">進行中 - 還剩 5 天</small>
                        </div>
                        <button className="btn btn-outline-secondary btn-sm">查看詳情</button>
                    </div>
                    </div>
                </div>
                <div className="mb-3">
                    <div className="p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                        <h6 className="mb-1">會員回饋活動</h6>
                        <small className="text-muted">即將開始 - 3 天後</small>
                        </div>
                        <button className="btn btn-outline-secondary btn-sm">查看詳情</button>
                    </div>
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
                    <h3>4.8</h3>
                    </div>
                    <div className="col-6">
                    <p className="text-muted mb-1">本月評價</p>
                    <h3>256</h3>
                    </div>
                </div>
                <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                    <span className="me-2" style={{width: '50px'}}>5星</span>
                    <div className="progress flex-grow-1">
                        <div className="progress-bar bg-warning" role="progressbar" style={{width: '70%'}} 
                            aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <span className="ms-2">70%</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                    <span className="me-2" style={{width: '50px'}}>4星</span>
                    <div className="progress flex-grow-1">
                        <div className="progress-bar bg-warning" role="progressbar" style={{width: '20%'}} 
                            aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <span className="ms-2">20%</span>
                    </div>
                    <div className="d-flex align-items-center">
                    <span className="me-2" style={{width: '50px'}}>3星</span>
                    <div className="progress flex-grow-1">
                        <div className="progress-bar bg-warning" role="progressbar" style={{width: '10%'}} 
                            aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <span className="ms-2">10%</span>
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