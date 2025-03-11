// 部落格管理組件
import  { useState, useEffect } from "react";
import { getJournalAll, getJournalPage, createdJournal, updatedJournal, deletedJournal } from '@/frontend/utils/api';
import './BlogManage.scss';
import BlogModal from '@/frontend/components/Modal/BlogModal';
import Swal from 'sweetalert2';
import PageNation from "@/frontend/components/PageNation";


const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);

  const [totalPage , setTotalPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0); // 訂單總筆數
  const [page, setPage] = useState(1); // 頁數狀態
  const limit = 10;

  const [showModal, setShowModal] = useState(false);

  const [currentBlog, setCurrentBlog] = useState({ id: null, title: "", date: "", content: "", images: "", status: "草稿" });

  const handleShow = (blog = { id: null, title: "", date: "", content: "", images: "", status: "" }) => {
    setCurrentBlog(blog);
    setShowModal(true);
  };

  const handleClose = () => {
    if(!currentBlog.id) {
      currentBlog.title = "",
      currentBlog.date = "",
      currentBlog.content = "",
      currentBlog.images = ""
    }
    setShowModal(false);
  };

  const handleSave = async(currentBlog) => {
    const { id, title, date, content, images, status } = currentBlog;
    if (id) {
      await updatedJournal(id, { title, date, content, images, status });
      Swal.fire({ title: "更新成功", icon: "success" });
    } else {
      await createdJournal({ title, date, content, images, status });
      Swal.fire({ title: "新增成功", icon: "success" });
    }
    AdminBlogManagement();
    handleClose();
  };

  const handleDelete = async(id) => {
    await deletedJournal(id);
    Swal.fire({ title: "刪除成功", icon: "success" });

    AdminBlogManagement();
  };

  const AdminBlogManagement = async() => {
    try{
      // 先獲取所有資料
      const response  = await getJournalAll();
      const totalItems = response.length; // 直接計算總筆數

      // 設定總筆數
      setTotalItems(totalItems);

      // 計算總頁數
      const totalPages = totalItems ? Math.ceil(totalItems / limit) : 1;
      setTotalPage(totalPages);

      // 獲取當前頁面的資料
      const responsePage  = await getJournalPage(page, limit)
      setBlogs(responsePage); 


    } catch(error){
        console.log(error);
    }
}

  useEffect(() => {
    AdminBlogManagement();
    // 每次換頁時，讓畫面回到頂部
    window.scrollTo(0, 0);
}, [page, limit]); 

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="d-flex align-items-center gap-2 fw-bold fs-4 mb-0">部落格管理</h2>
        <button className="btn btn-primary d-flex align-items-center shadow-sm" onClick={() => handleShow()}>新增文章</button>
      </div>
      <div className="card shadow-sm border-0">
      <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr className="bg-light border-bottom">
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">標題</th>
            <th className="py-3 px-4">日期</th>
            <th className="py-3 px-4 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map(blog => (
            <tr key={blog.id}>
              <td className="py-3 px-4">{blog.id}</td>
              <td className="py-3 px-4">{blog.title}</td>
              <td className="py-3 px-4">{blog.date}</td>
              <td className="py-3 px-4">
                <div className="d-flex justify-content-center gap-2">
                  <button className="btn btn-outline-primary btn-sm" onClick={() => handleShow(blog)}>編輯</button>{' '}
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(blog.id)}>刪除</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>

      <BlogModal 
        showModal={showModal}
        handleClose={handleClose}
        handleSave={handleSave}
        currentBlog={currentBlog}
        setCurrentBlog={setCurrentBlog}
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

export default BlogManagement;
