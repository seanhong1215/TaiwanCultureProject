// 活動管理組件
import { useState, useEffect } from "react";
import './ActivityDetailPage.scss';
import ActivityModal from '@/frontend/components/Modal/ActivityModal';
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";
import PageNation from "@/frontend/components/PageNation";
import { useAdminActivitiesQuery, useSaveActivityMutation, useDeleteActivityMutation } from './hooks';


const EventManagement = () => {

  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  const [page, setPage] = useState(1); // 頁數狀態
  const limit = 10;

  const { events, totalItems, totalPage } = useAdminActivitiesQuery(page, limit);
  const saveActivityMutation = useSaveActivityMutation();
  const deleteActivityMutation = useDeleteActivityMutation();

  const handleShow = (event = null) => {
    setCurrentEvent(event);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrentEvent(null);
  };

  const handleSave = async(currentEvent) => {
    try {
      await saveActivityMutation.mutateAsync(currentEvent);
      Swal.fire({ title: currentEvent.id ? "編輯成功" : "新增成功", icon: "success" });
    } catch(error) {
      console.error("Error adding event", error);
      Swal.fire({ title: "儲存失敗", icon: "error" });
    }
    handleClose();
  };

  const handleDelete = async(id) => {
    const result = await Swal.fire({
      title: "確定要刪除此活動嗎？",
      text: "此操作無法恢復",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "刪除",
      cancelButtonText: "取消",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteActivityMutation.mutateAsync(id);
      Swal.fire({ title: "刪除成功", icon: "success" });
    } catch (error) {
      console.error("Error deleting event", error);
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
        <h2 className="d-flex align-items-center gap-2 fw-bold fs-4 mb-0">活動管理</h2>
        <button className="btn btn-primary d-flex align-items-center shadow-sm" onClick={() => handleShow()}>新增活動</button>
      </div>

      <div className="card shadow-sm border-0">
      <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr className="bg-light border-bottom">
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">名稱</th>
            <th className="py-3 px-4">開始日期</th>
            <th className="py-3 px-4">結束日期</th>
            <th className="py-3 px-4">城市</th>
            <th className="py-3 px-4 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event.id}>
              <td className="py-3 px-4">{event.id}</td>
              <td className="py-3 px-4">{event.content?.title}</td>
              <td className="py-3 px-4">{event.startDate}</td>
              <td className="py-3 px-4">{event.endDate}</td>
              <td className="py-3 px-4">{event.city}</td>
              <td className="py-3 px-4">
              <div className="d-flex justify-content-center gap-2">
                <button className="btn btn-outline-primary btn-sm" onClick={() => handleShow(event)}>編輯內容</button>{' '}
                <Link to={`${event.id}`} className="btn btn-outline-primary btn-sm">查看詳情</Link>{' '}
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(event.id)}>刪除</button>
              </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>
      <ActivityModal 
        showModal={showModal}
        handleClose={handleClose}
        handleSave={handleSave}
        currentEvent={currentEvent}
        setCurrentEvent={setCurrentEvent}
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

export default EventManagement;
