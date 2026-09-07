// 部落格管理組件
import  { useState, useEffect } from "react";
import './BlogManage.scss';
import BlogModal from '@/frontend/components/Modal/BlogModal';
import Swal from 'sweetalert2';
import PageNation from "@/frontend/components/PageNation";
import { useAdminJournalsQuery, useSaveJournalMutation, useDeleteJournalMutation } from './hooks';


const BlogManagement = () => {
  const [page, setPage] = useState(1); // 頁數狀態
  const limit = 10;

  const [showModal, setShowModal] = useState(false);

  const [currentBlog, setCurrentBlog] = useState({ id: null, title: "", date: "", content: "", images: "", status: "草稿" });

  const { blogs, totalItems, totalPage } = useAdminJournalsQuery(page, limit);
  const saveJournalMutation = useSaveJournalMutation();
  const deleteJournalMutation = useDeleteJournalMutation();

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
    try {
      await saveJournalMutation.mutateAsync(currentBlog);
      Swal.fire({ title: currentBlog.id ? "更新成功" : "新增成功", icon: "success" });
    } catch (error) {
      console.error("儲存文章失敗", error);
      Swal.fire({ title: "儲存失敗", icon: "error" });
    }
    handleClose();
  };

  const handleDelete = async(id) => {
    try {
      await deleteJournalMutation.mutateAsync(id);
      Swal.fire({ title: "刪除成功", icon: "success" });
    } catch (error) {
      console.error("刪除文章失敗", error);
      Swal.fire({ title: "刪除失敗", icon: "error" });
    }
  };

  useEffect(() => {
    // 每次換頁時，讓畫面回到頂部
    window.scrollTo(0, 0);
  }, [page]);

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
