// 評價管理組件
import { useState, useEffect } from "react";
import ActivityReviewModal from '@/frontend/components/Modal/ActivityReviewModal';
import './EvaluationManage.scss';
import Swal from 'sweetalert2';
import PageNation from "@/frontend/components/PageNation";
import { useAdminReviewsQuery, useActivitiesForModalQuery, useSaveReviewMutation, useDeleteReviewMutation } from './hooks';


const EvaluationManage = () => {
  const userName = localStorage.getItem("admin_userName");

  const [page, setPage] = useState(1); // 頁數狀態
  const limit = 10;

  const initialReviewState = {
    reviewContent: "",
    rating: 5,
    activityTitle: "",
    avatar: "https://raw.githubusercontent.com/codebreakers2025/taiwan-culture-project/refs/heads/dev-ben/public/img/avatar/default.png",
    name: userName
  };

  const [newReview, setNewReview] = useState(initialReviewState);

  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    status: "進行中",
  });

  const { reviews, totalItems, totalPage } = useAdminReviewsQuery(page, limit);
  const { data: activities = [] } = useActivitiesForModalQuery();
  const saveReviewMutation = useSaveReviewMutation();
  const deleteReviewMutation = useDeleteReviewMutation();

  const handleShow = (data) => {
    if (data) {
      setNewReview({
          ...data,
          rating: data.rating ?? 5,  // 預設 rating 為 5（避免 undefined）
      });
    } else {
      setNewReview({
          ...initialReviewState,
          rating: 5,  // 預設 rating
      });
    }

    setShowModal(true);
  };

  const handleClose = () => {
    setNewReview({ reviewContent: "", activityTitle: "", rating: 0 });
    setShowModal(false);
  };

  const handleSave = async () => {

    if (!newReview.reviewContent || !newReview.activityTitle) {
      Swal.fire({
        icon: "warning",
        title: "請輸入評價內容並選擇活動",
        confirmButtonText: "確定",
      });
      return;
    }

    const data = {
      reviewContent: newReview.reviewContent,
      activityTitle: newReview.activityTitle,
      rating: newReview.rating,
      avatar: "https://raw.githubusercontent.com/codebreakers2025/taiwan-culture-project/refs/heads/dev-ben/public/img/avatar/default.png",
      name: userName,
    };

    try {
      await saveReviewMutation.mutateAsync({ id: newReview.id, data });
      Swal.fire({ title: newReview.id ? "編輯成功" : "新增成功", icon: "success" });
      handleClose();
    } catch (error) {
      console.error("儲存評價失敗:", error);
      Swal.fire({ title: "儲存失敗", icon: "error" });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "確定要刪除這則評論嗎？",
      text: "此操作無法恢復",
      showCancelButton: true,
      confirmButtonText: "刪除",
      cancelButtonText: "取消",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteReviewMutation.mutateAsync(id);
      Swal.fire({ title: "刪除成功", icon: "success" });
    } catch (error) {
      console.error("刪除評價失敗:", error);
      Swal.fire({ title: "刪除失敗", icon: "error" });
    }
  }

  useEffect(() => {
    // 每次換頁時，讓畫面回到頂部
    window.scrollTo(0, 0);
  }, [page]);



  return (
    <div className="admin-review-management container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="d-flex align-items-center gap-2 fw-bold fs-4 mb-0">評價管理</h2>
        <button className="btn btn-primary d-flex align-items-center shadow-sm" onClick={() => handleShow()}>新增評價</button>
      </div>
      <div className="card shadow-sm border-0">
      <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr className="bg-light border-bottom">
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">使用者名稱</th>
            <th className="py-3 px-4">活動名稱</th>
            <th className="py-3 px-4 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(review => (
              <tr key={review.id}>
                <td className="py-3 px-4">{review.id}</td>
                <td className="py-3 px-4 d-flex align-items-center">
                    <div className="avatar-container me-1">
                      <img src={review.avatar} alt="User Avatar" className="avatar-img" />
                    </div>
                    <span className="fw-bold text-dark">{review.name}</span>    
                </td>
                <td className="py-3 px-4">{review.activityTitle}</td>
                <td className="py-3 px-4">
                  <div className="d-flex justify-content-center gap-2">
                  <button className="btn btn-outline-primary btn-sm" onClick={() => handleShow(review)}>查看</button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(review.id)}>刪除</button>
                  </div>
                </td>
              </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>
          <ActivityReviewModal 
            showModal={showModal}
            handleClose={handleClose}
            handleSave={handleSave}
            currentEvent={currentEvent}
            setCurrentEvent={setCurrentEvent}
            newReview={newReview}
            setNewReview={setNewReview}
            activities= {activities}
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

export default EvaluationManage;
