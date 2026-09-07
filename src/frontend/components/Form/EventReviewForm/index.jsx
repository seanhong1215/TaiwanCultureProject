import { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import Swal from 'sweetalert2';
import { addReviews } from '@/frontend/utils/api/review';
import { uploadImageToCloudinary } from '@/frontend/utils/api/upload';
import { getOrders, updateOrder } from '@/frontend/utils/api/order';
import { updatedMembers, getMembers } from '@/frontend/utils/api/member';
import './EventReviewForm.scss';

const EventReviewForm = ({ order, onClose }) => {

  const userName = localStorage.getItem("userName");
  const userAvatar = localStorage.getItem("userAvatar");
  const userId = Number(localStorage.getItem("userId"));

  const [hoverRating, setHoverRating] = useState(0);
  // 初始化兩個圖片陣列 previewImages1 和 previewImages2
  const [previewImage1, setPreviewImage1] = useState(null);
  const [previewImage2, setPreviewImage2] = useState(null);
  const [imageFile1, setImageFile1] = useState([]);
  const [imageFile2, setImageFile2] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [rewards, setRewards] = useState({});

  const [reviewData, setReviewData] = useState({
    reviewContent: "",
    rating: 0,
    activityTitle: order?.activityName || "", // 避免 order 未定義時出錯
    imageFiles: [],
    avatar: userAvatar,
    name: userName,
  });

  // 更新星星評分
  const handleStarClick = (rate) => {
    setReviewData((prev) => ({ ...prev, rating: rate }));
  };

  // 更新評價內容
  const handleReviewChange = (e) => {
    setReviewData((prev) => ({ ...prev, reviewContent: e.target.value.trim() }));
  };

// 處理圖片上傳
const handleImageChange1 = (event, setPreviewImage) => {
  const file = event.target.files[0]; // 取得選中的檔案
  setImageFile1(file); // 儲存檔案到 imageFile1
  if (file) {
    const newImageUrl = URL.createObjectURL(file); // 創建圖片的臨時 URL
    setPreviewImage([newImageUrl]); // 更新state
  }
};

const handleImageChange2 = (event, setPreviewImage) => {
  const file = event.target.files[0]; // 取得選中的檔案
  setImageFile2(file); // 儲存檔案到 imageFile1
  if (file) {
    const newImageUrl = URL.createObjectURL(file); // 創建圖片的臨時 URL
    setPreviewImage([newImageUrl]); // 更新state
  }
};

// 處理刪除圖片
const handleDeleteImage = (setPreviewImage) => {
  setPreviewImage(null); // 刪除圖片
};


// 提交評價
const handleSubmit = async() => {

  // 直接從 `reviewData` 讀取數據
  const { rating, reviewContent } = reviewData;

// 檢查是否有填寫完整
  if (rating === 0 || reviewContent.length === 0) {
    alert("請確保評分和評論內容正確");
    return;
  }

    setIsUploading(true);

    // 檢查是否有圖片上傳
    const uploadedImageUrls = [];


    // 上傳圖片到 Cloudinary，取得 URL
    if (previewImage1) {
      try {
        const imageUrl1 = await uploadImageToCloudinary(imageFile1);
        uploadedImageUrls.push(imageUrl1);
      } catch (error) {
        console.error("圖片 1 上傳失敗", error);
      }
    }

  if (previewImage2) {
    try {
      const imageUrl2 = await uploadImageToCloudinary(imageFile2);
      uploadedImageUrls.push(imageUrl2);
    } catch (error) {
      console.error("圖片 2 上傳失敗", error);
    }
  }

   // 確保圖片上傳完成，並且有返回 URL
   if (uploadedImageUrls.length === 0) {
    alert("請上傳圖片！");
    setIsUploading(false);
    return;
  }

  const updatedReviewData = {
    ...reviewData,
    imageFiles: uploadedImageUrls
  };


   try {
      if(updatedReviewData.imageFiles.length > 0){

        const res = await addReviews(updatedReviewData);

        const orderId = order.id;
        if(res){
          await updateOrder(orderId, {reviewed: true});
          await getOrders(orderId);
        }
      }
        Swal.fire({ title: "評論新增成功", icon: "success" });

        const updatedTotalPoints = rewards.points + 50;

        // 更新本地狀態
        setRewards((prevRewards) => ({
          ...prevRewards,
          points: updatedTotalPoints,
        }));

        // 發送更新請求到後端
        await updatedMembers(userId, { 
          rewards: {
            points: updatedTotalPoints,
            reward: rewards.reward,  // 保持原來的 reward
            date: rewards.date,      // 保持原來的 date
        }, });


        onClose();
    } catch (error) {
        Swal.fire({ title: "圖片上傳失敗，請稍後再試！", icon: "error" });
        console.error("上傳失敗", error);
    }finally {
      setIsUploading(false);
    }


  // 清空表單
  setReviewData({
    rating: 0,
    reviewContent: "",
    imageFiles: []  // 清空已選擇的圖片
  });

  // 隱藏 Modal
  onClose(); 
};

useEffect(() => {
  const getUserData = async() => {
    const res = await getMembers(userId);
    setRewards(res.rewards);
  }
  getUserData();
}, [userId]);


// 在 Modal 顯示時禁止頁面滾動
useEffect(() => {
  // 當 Modal 顯示時，禁止頁面滾動
  document.body.style.overflow = 'hidden';

  // 當 Modal 關閉時，恢復滾動
  return () => {
    document.body.style.overflow = 'auto';
  };
}, []);

// 當 `order` 改變時，更新 `reviewData`
useEffect(() => {
  if (order) {
    setReviewData((prev) => ({
      ...prev,
      activityTitle: order.activityName || "",
      activityId: order.activityId || "",
    }));
  }
}, [order]);

return (
  <>
    <div className="modal-backdrop fade show" style={{ zIndex: 1040, backgroundColor: "rgba(0, 0, 0, 0.5)" }}></div>

    <div className="modal show d-block" tabIndex="-1" aria-hidden="true" style={{ zIndex: 1050 }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">評價活動</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body" style={{ maxHeight: "calc(100vh - 150px)", overflowY: "auto" }}>
            <div className="container">
              <div className="row">
                <div className="col-12 mb-3">
                  <h4>{order.activityName}</h4>
                  <p>目前活動點數積分: <span className="badge bg-primary">{rewards.points}</span></p>
                </div>

                <div className="col-12 mb-3">
                  <img src={order.actImage} className="img-fluid" alt="活動圖片" />
                </div>

                <div className="col-12 mb-3">
                  <h5>請評價您的體驗</h5>
                  <div id="rating-stars" className="d-flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="star"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          cursor: "pointer",
                          fontSize: "2rem",
                          transition: "color 0.2s ease-in-out",
                          color: (hoverRating || reviewData.rating) >= star ? "#f39c12" : "#bdc3c7",
                        }}
                        aria-label={`評分 ${star} 顆星`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-12 mb-3">
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="分享您的旅遊體驗，讓其他旅客參考（最少50字）"
                    value={reviewData.reviewContent}
                    onChange={handleReviewChange}
                    minLength="50"
                    style={{ resize: "none" }}
                  />
                </div>

                {/* 上傳圖片 */}
                <div className="col-12 mb-3">
        <label className="form-label">上傳照片</label>
        <div className="d-flex">
          {/* 顯示第一張圖片 */}
          <div className="position-relative me-3">
            {previewImage1 ? (
              <>
                <img
                  src={previewImage1 || ""}
                  alt="Uploaded 1"
                  style={{ width: 100, height: 100, objectFit: "cover", borderRadius: "5px" }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 end-0"
                  onClick={() => handleDeleteImage(setPreviewImage1)} // 點擊刪除圖片
                >
                  ✕
                </button>
              </>
            ) : (
              <label
                htmlFor="image-upload-1"
                className="d-flex align-items-center justify-content-center bg-light border rounded"
                style={{ width: 100, height: 100, cursor: "pointer" }}
              >
                <span className="fs-1 text-secondary position-absolute cursor-pointer">+</span>
                <input
                  type="file"
                  id="image-upload-1"
                  className="opacity-0"
                  onChange={(e) => handleImageChange1(e, setPreviewImage1)} // 處理圖片選擇
                  accept="image/*"
                />
              </label>
            )}
          </div>

          {/* 顯示第二張圖片 */}
          <div className="position-relative">
            {previewImage2 ? (
              <>
                <img
                  src={previewImage2 || ""}
                  alt="Uploaded 2"
                  style={{ width: 100, height: 100, objectFit: "cover", borderRadius: "5px" }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 end-0"
                  onClick={() => handleDeleteImage(setPreviewImage2)} // 點擊刪除圖片
                >
                  ✕
                </button>
              </>
            ) : (
              <label
                htmlFor="image-upload-2"
                className="d-flex align-items-center justify-content-center bg-light border rounded"
                style={{ width: 100, height: 100, cursor: "pointer" }}
              >
                <span className="fs-1 text-secondary position-absolute cursor-pointer">+</span>
                <input
                  type="file"
                  id="image-upload-2"
                  className="opacity-0"
                  onChange={(e) => handleImageChange2(e, setPreviewImage2)} // 處理圖片選擇
                  accept="image/*"
                />
              </label>
            )}
          </div>
        </div>
      </div>


                <div className="col-12">
                  <button className="btn btn-success w-100" onClick={handleSubmit} disabled={isUploading}>
                    {isUploading ? "上傳中…" : "提交評價並獲得50點積分"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
};

EventReviewForm.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.string.isRequired, // 活動ID
    activityId: PropTypes.number.isRequired, // 活動ID
    activityName: PropTypes.string.isRequired, // 活動名稱
    last_bookable_date: PropTypes.string.isRequired, // 活動日期
    timeSlot: PropTypes.string.isRequired, // 活動時間
    actImage: PropTypes.string.isRequired, // 活動圖片 URL
  }).isRequired,
  onClose: PropTypes.func.isRequired, // 提交評價的回調函數
};

export default EventReviewForm;
