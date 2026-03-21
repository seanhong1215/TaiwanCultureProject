import { Link, useLocation } from 'react-router-dom';
import {Menu, Users, Home, Calendar, Star, Package, FileText,} from 'lucide-react';
import './Menu.scss';
import { useContext } from 'react';
import { AdminContext } from '@/frontend/layouts/AdminLayout';

const AdminMenu = () => {
    const { sidebarOpen, mobileNavOpen } = useContext(AdminContext);
    const location = useLocation();
    const userRole = localStorage.getItem("admin_userRole");

    const ROLES = {
        ADMIN: 'ADMIN',
        ACTIVITY_MANAGER: 'ACTIVITY_MANAGER',
        Member: 'Member'
    };

    return (
        <>
            {/* 手機版遮罩 */}
            {mobileNavOpen && (
                <div
                    className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1039 }}
                    onClick={toggleMobileNav}
                />
            )}
            {/* Sidebar */}
            <div className={`bg-dark text-white position-fixed h-100
                ${mobileNavOpen ? 'admin-sidebar-show' : 'd-none d-lg-block'}`}
                style={{
                    transition: 'width 0.3s ease-in-out',
                    width: sidebarOpen ? '240px' : '70px',
                    zIndex: 1040,
                    overflowY: 'auto'
                }}>
                <div className="d-flex flex-column h-100">

                {/* Logo */}
                <div className="p-3 border-bottom border-secondary logo">
                    <div className="d-flex align-items-center">
                    <Package size={24} className="text-primary" />
                    {sidebarOpen && <Link to="/admin/dashboard" className="ms-2 fw-bold fs-5 title">管理系統</Link>}
                    </div>
                </div>

                {/* Menu Items */}
                <div className="p-3">
                    <ul className="nav flex-column">
                        {userRole !== ROLES.ACTIVITY_MANAGER && (
                            <li className="nav-item mb-2">
                                <Link to="/admin/member" className={`nav-link text-white d-flex align-items-center ${location.pathname === '/admin/member' ? 'active bg-primary rounded' : ''}`}>
                                <Home size={18} />
                                {sidebarOpen && <span className="ms-2">用戶管理</span>}
                                </Link>
                            </li>
                        )}
                        {userRole !== ROLES.ACTIVITY_MANAGER && (
                            <li className="nav-item mb-2">
                                <Link to="/admin/order-list" className={`nav-link text-white d-flex align-items-center ${location.pathname === '/admin/order-list' ? 'active bg-primary rounded' : ''}`}>

                                
                                <Users size={18} />
                                {sidebarOpen && <span className="ms-2">訂單管理</span>}
                                
                                </Link>
                            </li>
                        )}
                        {userRole !== ROLES.ACTIVITY_MANAGER && (
                            <li className="nav-item mb-2">
                                <Link to="/admin/blog" className={`nav-link text-white d-flex align-items-center ${location.pathname === '/admin/blog' ? 'active bg-primary rounded' : ''}`}>

                            
                                <FileText size={18} />
                                {sidebarOpen && <span className="ms-2">部落格管理</span>}
                            
                                </Link>
                            </li>
                        )}
                        
                        <li className="nav-item mb-2">
                            <Link to="/admin/activity-list" className={`nav-link text-white d-flex align-items-center ${location.pathname === '/admin/activity-list' ? 'active bg-primary rounded' : ''}`}>
                            <Calendar size={18} />
                            {sidebarOpen && <span className="ms-2">活動管理</span>}
                            </Link>
                        </li>
                        
                        <li className="nav-item mb-2">
                            <Link to="/admin/evaluation" className={`nav-link text-white d-flex align-items-center ${location.pathname === '/admin/evaluation' ? 'active bg-primary rounded' : ''}`}>
                            <Star size={18} />
                            {sidebarOpen && <span className="ms-2">評價管理</span>}
                            </Link>
                        </li>
                    </ul>
                </div>
                </div>
            </div>
        </>
    );
};

export default AdminMenu;
