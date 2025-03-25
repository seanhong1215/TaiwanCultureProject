import { useState, useEffect  } from 'react';
import { getReviewAll, getReviewPage, deleteReviews } from "@/frontend/utils/api.js";
import PageNation from "@/frontend/components/PageNation";
import MessageManagerModal from '@/frontend/components/Modal/MessageManagerModal';
import Swal from 'sweetalert2';

const MessageManager = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = (review) => {
    setSelectedReview(review)
    setShowModal(true)
  };
  const handleCloseModal = () => {
    setSelectedReview(null)
    setShowModal(false)
  };

  useEffect(() => {
    try {
      const fetchReviews = async () => {
        // 取得分頁資料
        const response  = await getReviewPage(page, limit);
        setReviews(response);
        setFilteredReviews(response);
  
        // 取得總數
        const totalRes =  await getReviewAll();
        setTotalItems(totalRes.length);
        setTotalPage(Math.ceil(totalRes.length / limit));
  
      }
      fetchReviews();
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
    
  }, [page]);

  // 滾動到頁面頂部
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [page]);

  useEffect(() => {
    if (showModal) {
    // 禁用背景滾動
        document.body.style.overflow = "hidden";
    } else {
    // 恢復背景滾動
        document.body.style.overflow = "auto";
    }
    // 清理函數，確保組件卸載時恢復滾動
    return () => {
        document.body.style.overflow = "auto";
    };

}, [showModal]); // 僅在 `showModal` 狀態改變時執行


  const handleSearch = (e) => {
    setSearch(e.target.value);
    filterReviews(e.target.value, filterRating);
  };

  const handleFilterRating = (e) => {
    setFilterRating(Number(e.target.value));
    filterReviews(search, Number(e.target.value));
  };

  const filterReviews = (search, rating) => {
    let filtered = reviews.filter(
      (review) =>
        (review.name.includes(search) || review.activityTitle.includes(search)) &&
        (rating === 0 || review.rating === rating)
    );
    setFilteredReviews(filtered);
  };

  const handleDelete = async (id) => {
    await deleteReviews(id);
    setReviews(reviews.filter((review) => review.id !== id));
    Swal.fire({
        title: "刪除留言成功",
        icon: "success"
    });
  };


  return (
        <div className="page-container">
          <h2>活動留言管理</h2>
          <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="搜尋使用者名稱或活動名稱"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={filterRating} onChange={handleFilterRating}>
            <option value="0">全部評價</option>
            <option value="5">★★★★★</option>
            <option value="4">★★★★</option>
            <option value="3">★★★</option>
            <option value="2">★★</option>
            <option value="1">★</option>
          </select>
        </div>
      </div>

      {filteredReviews.map((review) => (
        <div className="card mb-4" key={review.id}>
          <div className="card-body">
            <h5 className="card-title">{review.name} - {"★".repeat(review.rating)}</h5>
            <h6 className="card-subtitle mb-3 text-muted">
              {review.activityTitle}
            </h6>
            <p className="card-text">{review.reviewContent}</p>
            <div className="mb-3">
              {Array.isArray(review.imageFiles) &&
                review.imageFiles.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`review-${idx}`}
                    className="me-2"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                ))}
            </div>
            <div className="d-flex justify-content-end"> 
              <button className="btn bg-custom-outline-primary me-2" onClick={() => handleOpenModal(review)}>
                查看留言
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(review.id)}>
                刪除留言
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="row">
        {totalPage > 0 && totalItems >= limit && (
          <div className="col-12">
            <PageNation totalPage={totalPage} page={page} setPage={setPage} />
          </div>
        )}
      </div>
      {showModal && <MessageManagerModal showModal={showModal} handleCloseModal={handleCloseModal} selectedReview={selectedReview}/>}
    </div>
  )
};

export default MessageManager;