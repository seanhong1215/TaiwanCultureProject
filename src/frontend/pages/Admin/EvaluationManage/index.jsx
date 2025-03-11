// 評價管理組件
import { useState, useEffect } from "react";
import { getReviewAll, getReviewPage, getActivityAll, addReviews, updateReviews, deleteReviews } from '@/frontend/utils/api';
import ActivityReviewModal from '@/frontend/components/Modal/ActivityReviewModal';
import './EvaluationManage.scss';
import Swal from 'sweetalert2';
import PageNation from "@/frontend/components/PageNation";


const EvaluationManage = () => {
  const [reviews, setReviews] = useState([]);
  const [activities, setActivities] = useState([]);
  const userName = localStorage.getItem("userName");

  const [totalPage , setTotalPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // 訂單總筆數
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

  const handleShow = async(data) => {
    try {
      const getActivity = await getActivityAll();
      setActivities(getActivity);

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
    } catch (error) {
        console.error("Error fetching activities:", error);
    }
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
      if (newReview.id) {
        await updateReviews(newReview.id, data);
        Swal.fire({ title: "編輯成功", icon: "success" });
      } else {
        await addReviews(data);
        Swal.fire({ title: "新增成功", icon: "success" });
      }
  
      handleClose();
      await AdminReviewManagement();
    } catch (error) {
      console.error("儲存評價失敗:", error);
    }
    if(id){
      await deleteReviews(id);
      Swal.fire({
        title: "刪除評價成功",
        icon: "success",
      });
      AdminReviewManagement();
    }

  };

  const handleDelete = async (id) => {
    await deleteReviews(id);
    Swal.fire({
      icon: "warning",
      title: "確定是否刪除評論",
      confirmButtonText: "確定",
    });
    await AdminReviewManagement();
  }

  const AdminReviewManagement = async() => {
    try{
      // 先獲取所有資料
      const response  = await getReviewAll();
      const totalItems = response.length; // 直接計算總筆數

      // 設定總筆數
      setTotalItems(totalItems);

      // 計算總頁數
      const totalPages = totalItems ? Math.ceil(totalItems / limit) : 1;
      setTotalPage(totalPages);

      // 獲取當前頁面的資料
      const responsePage  = await getReviewPage(page, limit);
      setReviews(responsePage); 


    } catch(error){
        console.log(error);
    }
}

  useEffect(() => {
    AdminReviewManagement();
    // 每次換頁時，讓畫面回到頂部
  window.scrollTo(0, 0);
}, [page, limit]); 



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
            setActivities = {setActivities}
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
