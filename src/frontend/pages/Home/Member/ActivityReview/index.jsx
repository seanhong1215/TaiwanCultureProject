import { useEffect, useState, useRef } from "react";
import { addReviews, getActivityAll, uploadImageToCloudinary } from '@/frontend/utils/api';
import Swal from 'sweetalert2';

const ActivityReview = () => {
    const [imageFiles, setImageFiles] = useState([]); // 用來儲存多張圖片
    const [previewImage, setPreviewImage] = useState(""); // 儲存單一圖片預覽

    const [selectedActivity, setSelectedActivity] = useState(""); // 獨立管理活動類型

    const fileInputRef = useRef(null); // 用來重置 file input
    const [isSubmitted, setIsSubmitted] = useState(false);

    const userName = localStorage.getItem("userName");
    const userAvator = localStorage.getItem("userAvator");

    const [activities, setActivities] = useState([]);
    const [newReview, setNewReview] = useState({
        reviewContent: "",
        rating: 5,
        activityTitle: "",
        imageFiles: [],
        avatar: userAvator,
        name: userName
    });

    useEffect(() => {
        // 取得活動資料
        const getActivies= async () => {
            const response = await getActivityAll();
            setActivities(response);
        };
        getActivies();
    }, []);

    useEffect(() => {
        if (isSubmitted) {
            setNewReview({
                reviewContent: "",
                rating: 5,
                activityTitle: "",
                imageFiles: [],
                avatar: userAvator,
                name: userName
            });

            setSelectedActivity(""); // **清空下拉選單的值**

            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // 清空 file input
            }
            setIsSubmitted(false); // **清除提交狀態，避免重複觸發**
        }
    }, [isSubmitted]);

    // 刪除圖片
    const handleDeleteImage = (index) => {
        setNewReview((prev) => ({
            ...prev,
            imageFiles: prev.imageFiles.filter((_, i) => i !== index) // 移除指定 index 的圖片
        }));
    };

    // 處理主圖片上傳
    const handleImageChange = async(e) => {
        const file = e.target.files[0];
        if (file) {
        // 顯示圖片預覽
        const reader = new FileReader();
        reader.onload = () => {
            setPreviewImage(reader.result); // 更新圖片預覽
            setImageFiles((prevFiles) => [...prevFiles, file]); // 新增圖片到圖片陣列
        };
        reader.readAsDataURL(file);
        }

        // 上傳圖片
        const imageUrl = await uploadImageToCloudinary(file);
        setNewReview((prev) => ({
            ...prev,
            imageFiles: [...prev.imageFiles, imageUrl]
        }));

    };

    const handleActivityChange = (e) => {
        const selectedActivityTitle = e.target.value;
        // 從 activities 陣列中找到選中的活動對應的物件
        const selectedActivity = activities.find(activity => activity.content.title === selectedActivityTitle);
    
        // 更新 newReview 的 activityTitle 和 selectedActivity
        setNewReview({
            ...newReview,
            activityTitle: selectedActivity ? selectedActivity.content.title : "",
            activityId: selectedActivity ? Number(selectedActivity.id) : null, // 假設你需要活動的 ID
        });
    };

    // 新增評論
    const addReview = async () => {
        if (!newReview.reviewContent || !newReview.activityId) {
            Swal.fire({ title: "請輸入評價內容並選擇活動", icon: "warning" });
            return; // 阻止提交
        }

        try {
            await addReviews(newReview);
            Swal.fire({ title: "評論新增成功", icon: "success" });

            // 觸發 useEffect 來清空表單
            setIsSubmitted(true); 

        } catch (error) {
            Swal.fire({ title: "評論新增失敗", icon: "error" });
            console.error("評論新增失敗", error);
        }
    };

    return (
        <div className="page-container">
            <div className="container">
            <h2 className="text-center">評價留言</h2>
            {/* 新增評價 */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="mb-3">
                    <label className="form-label">活動類型</label>
                    <select
                        className="form-select"
                        value={newReview.eventType}
                        onChange={(e) => setNewReview({ ...newReview, eventType: e.target.value })}
                    >
                        <option value="">請選擇類型</option>
                        {[...new Set(activities.map((a) => a.eventType))].map((type) => (
                        <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    </div>
                    
                    <div className="mb-3">
                    <label className="form-label">活動名稱</label>
                    <select
                        className="form-select"
                        value={newReview.activityTitle}
                        onChange={handleActivityChange}
                        // disabled={!newReview.eventType}
                    >
                        <option value="">請選擇活動</option>
                        {activities.map((activity) => (
                            <option key={activity.id} value={activity.content.title}>
                            {activity.content.title}
                            </option>
                        ))}
                    </select>
                    </div>

                    <div className="mb-3">
                    <label className="form-label">評價內容</label>
                        <textarea
                            className="form-control"
                            value={newReview.reviewContent}
                            onChange={(e) => setNewReview({ ...newReview, reviewContent: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="activityImage" className="form-label">活動照片</label>

                        {/* 上傳圖片 */}
                        <input 
                            type="file" 
                            className="form-control" 
                            id="activityImage" 
                            accept="image/*" 
                            ref={fileInputRef} // 綁定 ref
                            onChange={handleImageChange}
                        />

                        {/* 顯示已上傳的圖片 */}
                        <div className="mt-3 d-flex flex-wrap">
                            {newReview.imageFiles.map((imageUrl, index) => (
                                <div key={index} className="position-relative me-2 mb-2">
                                    <img
                                        src={imageUrl}
                                        alt={`Uploaded preview ${index}`}
                                        style={{ width: 150, height: 150, objectFit: 'cover' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                        onClick={() => handleDeleteImage(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3">
                    <label className="form-label">評分</label>
                    <select
                        className="form-select"
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                    >
                        {[5, 4, 3, 2, 1].map((star) => (
                        <option key={star} value={star}>{"⭐".repeat(star)}</option>
                        ))}
                    </select>
                    </div>
                    <button className="btn custom-btn" onClick={addReview}>提交評價</button>
                </div>
            </div>
            </div>
        </div>
    );
}

export default ActivityReview;