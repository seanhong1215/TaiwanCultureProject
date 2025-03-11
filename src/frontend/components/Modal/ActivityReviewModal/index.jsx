import PropTypes from "prop-types";
import { Button, Table, Modal, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { uploadImageToCloudinary } from '@/frontend/utils/api.js';

const EventModal = ({ showModal, handleClose, handleSave, currentEvent, setCurrentEvent, newReview, setNewReview, activities }) => {
  const { register,  handleSubmit, formState: { errors }, reset } = useForm();

  const [previewImages, setPreviewImages] = useState([]);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [savedImage, setSavedImage] = useState([]); // 儲存從資料庫抓取的圖片

    // 處理主圖片上傳
    const handleMainImageChange = async(e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setMainImageFile(file);
  
        // 預覽圖片
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviewImages([event.target.result]);
        };
        reader.readAsDataURL(file);
        
        // 上傳圖片
        const imageUrl = await uploadImageToCloudinary(file);
        setNewReview((prev) => ({
          ...prev,
          images: imageUrl,
        }));
        // setValue("images", imageUrl);
      }
    };

  useEffect(() => {
    reset(newReview); // 每當 newReview 改變時，同步更新表單
}, [newReview, reset]);

useEffect(() => {
  if (newReview.id) {
      setSavedImage(newReview.imageFiles); 
    }
}, [newReview.id]);

// 更新活動 Id
const handleActivityChange = (e) => {
  const selectedActivity = activities.find(activity => activity.content.title === e.target.value);
  setNewReview((prev) => ({
    ...prev,
    activityTitle: e.target.value,
    activityId: selectedActivity ? selectedActivity.id : null, // 儲存活動Id
  }));
};

  return (
    <Modal show={showModal} onHide={handleClose}>
          <Form onSubmit={handleSubmit(handleSave)}>
        <Modal.Header closeButton>
          <Modal.Title>{newReview.id ? "查看評價" : "新增評價"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>活動名稱</Form.Label>
              <Form.Select
                {...register("activityTitle", { required: "請選擇活動" })}
                value={newReview.activityTitle}
                onChange={handleActivityChange}
              >
                <option value="">請選擇活動</option>
                    {activities.map((activity) => (
                        <option key={activity.id} value={activity.content.title}>
                        { activity.content.title}
                        </option>
                    ))}
              </Form.Select>
              {errors.activityTitle && <p className="text-danger">{errors.activityTitle.message}</p>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>評價內容</Form.Label>
              <Form.Control 
                as="textarea" rows={3}
                {...register("reviewContent", { required: "請輸入評價內容" })}
                value={newReview.reviewContent}
                onChange={(e) => setNewReview({ ...newReview, reviewContent: e.target.value })}
                // disabled={newReview.reviewContent}
              >
                
              </Form.Control>
              {errors.reviewContent && <p className="text-danger">{errors.reviewContent.message}</p>}
            </Form.Group>

            <Form.Group className="mb-3">
            <Form.Label>活動圖片</Form.Label>
            {!newReview.id ? (
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
              />
            ) : (
              savedImage.length > 0 && (
                <div className="d-flex gap-2">
                  {savedImage.map((img, index) => (
                    <img
                      key={index}
                      src={img} 
                      alt={`活動圖片 ${index + 1}`}
                      className="mt-3"
                      style={{ width: "50%", objectFit: "cover" }}
                    />
                ))}
                </div>
              )
            )}

            {/* 預覽上傳的圖片 (適用於新增模式) */}
            {!newReview.id && previewImages.length > 0 && (
                <div className="mt-3 d-flex flex-wrap">
                {previewImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`預覽圖片 ${index + 1}`}
                    className="m-2"
                    style={{ width: "30%", objectFit: "cover" }}
                  />
                ))}
              </div>
              )}
             {errors.images && (
               <p className="text-danger">{errors.images.message}</p>
             )}
          </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>評分</Form.Label>
              <Form.Select
                {...register("rating", { required: "請選擇評分" })}
                value={newReview.rating || ""}
                onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                // disabled={newReview.rating}
              >
                {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map((star) => (
                  <option key={star} value={star}>{"⭐".repeat(star)}</option>
                ))}
              </Form.Select>
              {errors.rating && <p className="text-danger">{errors.rating.message}</p>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>活動狀態</Form.Label>
              <Form.Select
                value={currentEvent.status}
                onChange={(e) => setCurrentEvent({ ...currentEvent, status: e.target.value })}
              >
                <option value="進行中">進行中</option>
                <option value="已結束">已結束</option>
              </Form.Select>
            </Form.Group>
        </Modal.Body>

        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>取消</Button>
            {/* <Button variant="primary" type="submit">儲存</Button> */}
        </Modal.Footer>
          </Form>
    </Modal>
  );
};


EventModal.propTypes = {
  showModal: PropTypes.bool.isRequired, // 是否顯示 Modal
  handleClose: PropTypes.func.isRequired, // 關閉 Modal 的函數
  handleSave: PropTypes.func.isRequired, // 儲存資料的函數
  currentEvent: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // 活動 ID
    status: PropTypes.oneOf(["進行中", "已結束"]).isRequired, // 活動狀態
  }).isRequired,
  setCurrentEvent: PropTypes.func.isRequired, // 設定活動資料的函數
  newReview: PropTypes.object.isRequired,
  setNewReview: PropTypes.func.isRequired, // 設定活動資料的函數
  activities: PropTypes.array.isRequired,
  setActivities: PropTypes.func.isRequired, // 設定活動資料的函數
};

export default EventModal;
