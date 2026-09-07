import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AdminContext } from '@/frontend/layouts/AdminLayout/context';
import Swal from 'sweetalert2';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import './AdminHeader.scss';

const AdminHeader = () => {
  const { toggleSidebar, toggleMobileNav } = useContext(AdminContext);
  const navigate = useNavigate();
  const userName = localStorage.getItem("admin_userName");
  const userAvatar = localStorage.getItem("admin_userAvatar");

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "確定要登出嗎？",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "登出",
      cancelButtonText: "取消",
    });
    if (!result.isConfirmed) return;

    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_userId");
    localStorage.removeItem("admin_userName");
    localStorage.removeItem("admin_userRole");
    localStorage.removeItem("admin_userAvatar");
    localStorage.removeItem("admin_userEmail");

    Swal.fire({ title: "登出成功！", icon: "success", timer: 1500, showConfirmButton: false });
    navigate("/admin/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top">
      <div className="container-fluid">
        {/* 桌機版收合側邊欄 */}
        <button className="btn btn-link text-dark d-none d-lg-block" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        {/* 手機版漢堡選單 */}
        <button className="navbar-toggler border-0 d-lg-none" type="button" onClick={toggleMobileNav}>
          <Menu size={20} />
        </button>

        <div className="ms-auto d-flex align-items-center">
          <div className="dropdown">
            <button className="btn btn-link text-dark d-flex align-items-center gap-2 text-decoration-none" data-bs-toggle="dropdown">
              <img
                src={userAvatar || "https://mockmind-api.uifaces.co/content/human/212.jpg"}
                alt="User"
                className="rounded-circle"
                width="36"
                height="36"
                style={{ objectFit: 'cover' }}
                onError={(e) => { e.target.src = "https://mockmind-api.uifaces.co/content/human/212.jpg"; }}
              />
              <span className="d-none d-md-inline">{userName}</span>
              <ChevronDown size={16} />
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                  <LogOut size={16} /> 登出
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminHeader;
