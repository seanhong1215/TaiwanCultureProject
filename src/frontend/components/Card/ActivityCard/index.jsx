import PropTypes from 'prop-types';
import './Activity.scss';
import { addFavorites, getFavorites, deleteFavorites } from '@/frontend/utils/api/favorite';
import toast from '@/frontend/utils/toast';
import { useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import { cloudinaryOptimize } from '@/frontend/utils/cloudinary';


export const ActivityCard = ({ activity, isCollectedPage, onToggleFavorite, userId }) => {
const navigate = useNavigate();
const token = localStorage.getItem('token');
const [isFavorite, setIsFavorite] = useState(activity.isFavorited);
const [loading, setLoading] = useState(false);

const handleFavoriteClickAdd = async() => {
    if (loading) return; // 防止重複點擊

    // 登入檢查要在打 API 之前：原本先呼叫 getFavorites 才檢查 token，
    // 未登入的使用者也會白白送出一次請求
    if (!userId || token === null) {
        toast.warning("請先登入會員才能收藏");
        return;
    }

    try{
        setLoading(true);
        // 先檢查是否已經在收藏中
        const favResponse = await getFavorites(userId);
        const repeat = favResponse.some((fav) => fav.activityId === activity.id);

        if (repeat) {
            setIsFavorite(true); // 資料庫已有紀錄，讓畫面與實際狀態一致
            toast.info("這個活動已經在你的收藏裡了");
            return;
        }

        if (!isFavorite){
            const favoriteData = {
                activityId: activity.id,
                userId: userId,
                isFavorited: true
            };
            await addFavorites(favoriteData);
            setIsFavorite(true);
            toast.success("已加入收藏");
        }


    } catch(error) {
        console.error("加入收藏失敗:", error);
        toast.error("收藏失敗，請稍後再試");
    } finally {
        setLoading(false);
    }

}

const handleFavoriteClickRemove = async() => {
    if (loading) return; // 防止重複點擊

    try{
        setLoading(true);
        const response = await getFavorites(userId);
        const favorite = response.find(fav => fav.activityId === activity.id);
        if (favorite) {
            await deleteFavorites(favorite.id);
            setIsFavorite(false);
            toast.success("已移除收藏");
        }
        if (isCollectedPage && onToggleFavorite) {
            onToggleFavorite();
        }

    } catch(error) {
        console.error("移除收藏失敗:", error);
        toast.error("移除失敗，請稍後再試");
    } finally {
        setLoading(false);
    }
    
}

return (
        <div className="activity-card card mb-3" key={activity.id} 
        onClick={(e) => {
            if (!e.target.closest(".favorite-icon")) {
              // 只有當點擊的不是收藏按鈕時，才導航到內頁
              navigate(`/activity-list/${activity.id}`);
              window.scrollTo({ top: 0, behavior: "smooth" }); // 滑動到最上方
            }
          }}>
            <img src={cloudinaryOptimize(activity.images, 600)} className="card-img-top" alt={activity.content.title} loading="lazy" />
            <div className="activity-card-body card-body">
                <div className="d-flex justify-content-between align-items-center">
                <p className="card-text">{activity.eventType}</p>
                <span className="rating">★ {activity.rating}</span>
                </div>
                <h3 className="card-title">{activity.city}: {activity.content.title}</h3>
                <p className="card-text">{activity.content.description}</p>
                <span className='card-price'>{activity.price}</span>    
            
            {isCollectedPage ? (
                <span className={`material-icons favorite-icon ${isFavorite ? "favorite_border" : "favorite"}`} onClick={handleFavoriteClickRemove}>
                {isFavorite ? 'favorite_border' : 'favorite'}
                </span>
            ) : (
                <span className={`material-icons favorite-icon ${isFavorite ? "favorite" : "favorite_border"}`} onClick={handleFavoriteClickAdd}>
                {isFavorite ? 'favorite' : 'favorite_border'}   
                </span>
            )}
            </div>
        </div>
    );
};


// PropTypes for validation
ActivityCard.propTypes = {
    userId: PropTypes.number.isRequired,
    activity: PropTypes.object.isRequired,
    onToggleFavorite: PropTypes.func.isRequired,
    isCollectedPage: PropTypes.bool.isRequired,
};