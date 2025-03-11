import { useEffect, useState } from 'react';
import { getMemberAll, getMemberPage, updatedMembers, register } from '@/frontend/utils/api';
import './MemberManage.scss';
import MemberModal from '@/frontend/components/Modal/MemberModal';
import Swal from 'sweetalert2';
import PageNation from "@/frontend/components/PageNation";

const UserManagement = () => {
    const [members, setMembers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const [totalPage , setTotalPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0); // 訂單總筆數
    const [page, setPage] = useState(1); // 頁數狀態
    const limit = 10;

 // 開啟 Modal
 const handleShow = (user = null) => {
    setEditingUser(user);
    setShowModal(true);
  };

// 關閉 Modal
const handleClose = () => {
    setEditingUser(null);
    setShowModal(false);
};

const handleSave = async(userData) => {
    setLoading(true);
    try {
        if (editingUser) {
            await updatedMembers(editingUser.id, userData);
            Swal.fire({ title: "編輯成功", icon: "success" });
            AdminUsers();
        } else {
            await register(userData);
            Swal.fire({ title: "新增成功", icon: "success" });
            AdminUsers();
        }


    } catch(error) {
        console.error('儲存失敗:', error);
    } finally {
        setLoading(false);
    }

handleClose();
};

const AdminUsers = async() => {
    try{
    // 先獲取所有資料
    const response  = await getMemberAll();
    const totalItems = response.length; // 直接計算總筆數

    // 設定總筆數
    setTotalItems(totalItems);

    // 計算總頁數
    const totalPages = totalItems ? Math.ceil(totalItems / limit) : 1;
    setTotalPage(totalPages);

    // 獲取當前頁面的資料
    const responsePage  = await getMemberPage(page, limit);
    setMembers(responsePage); 


    } catch(error){
        console.log(error);
    }
}

useEffect(() => {
    AdminUsers();
}, [page]); 

return (
    <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="d-flex align-items-center gap-2 fw-bold fs-4 mb-0">會員管理</h2>
            <button className="btn btn-primary d-flex align-items-center shadow-sm" onClick={() => handleShow()}>新增會員</button>
        </div>

        <div className="card shadow-sm border-0">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead>
                    <tr className="bg-light border-bottom">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">姓名</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">角色</th>
                        {/* <th className="py-3 px-4 text-center">操作</th> */}
                    </tr>
                    </thead>
                    <tbody>
                    {members.map(user => (
                    <tr key={user.id}>
                        <td className="py-3 px-4">{user.id}</td>
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                        <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3">
                            {user.role === 'ADMIN' ? '管理員' : user.role === 'ACTIVITY_MANAGER' ? '活動管理者' : user.role === 'Member' ? '會員': '未指定角色'}
                        </span>
                        </td>
                        {/* <td>{user.status ? "啟用" : "停用"}</td> */}
                        <td className="py-3 px-4">
                        <div className="d-flex justify-content-center gap-2">
                            {/* <button className="btn btn-outline-primary btn-sm" onClick={() => handleShow(user)}>編輯</button>{' '} */}
                            {/* <button className={`btn btn-outline-danger btn-sm ${user.status ? "default" : "destructive"}`} onClick={() => handleToggleStatus(user)}>{user.status ? '啟用' : '停用'}</button> */}
                        </div>
                        </td>
                    </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <MemberModal 
        showModal={showModal}
        handleClose={handleClose}
        handleSave={handleSave}
        editingUser={editingUser}
        loading={loading}
      />

    <div className="row">
        <div className="col-12 mb-4">
            {/* Render Pagination only if there are results */}
            {totalPage > 0 && totalItems >= limit && <PageNation totalPage={totalPage} page={page} setPage={setPage} />}
        </div>
    </div>
    </div>
    
);
};

export default UserManagement;