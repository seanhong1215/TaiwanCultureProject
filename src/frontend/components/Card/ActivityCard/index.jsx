import PropTypes from 'prop-types';
import './Activity.scss';
import { addFavorites, getFavorites, deleteFavorites } from '@/frontend/utils/api';
import Swal from 'sweetalert2';
import { useState } from 'react';
import { useNavigate  } from 'react-router-dom';


export const ActivityCard = ({ activity, isCollectedPage, onToggleFavorite, userId }) => {
const navigate = useNavigate();
const token = localStorage.getItem('token');
const [isFavorite, setIsFavorite] = useState(activity.isFavorited);
const [loading, setLoading] = useState(false);

const handleFavoriteClickAdd = async() => {
    if (loading) return; // 防止重複點擊

    if (!userId) {
        Swal.fire({
            title: "請先註冊成為會員!",
            icon: "warning"
        });
            return;
        }

    try{
        setLoading(true);
        // 先檢查是否已經在收藏中
        const favResponse = await getFavorites(userId);
        const repeat = favResponse.some((fav) => fav.activityId === activity.id);

        if(token===null){
            Swal.fire({
                title: "請先登入會員，才能進行收藏!",
                icon: "warning"
            })
            return
        }

        if (repeat) {
            // 如果已經收藏過，顯示警告
            Swal.fire({
                title: "請勿重複加入收藏!",
                icon: "warning"
            });
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
            Swal.fire({
                title: "新增成功! 已加入我的收藏",
                icon: "success"
            });
        } 
    

    } catch(error) {
        Swal.fire({
            title: "收藏操作失敗",
            icon: "error"
        });
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
            Swal.fire({
                title: "移除成功! 已移除我的收藏",
                icon: "success"
            });
        }
        if (isCollectedPage && onToggleFavorite) {
            onToggleFavorite();
        }
        
    } catch(error) {
        Swal.fire({
            title: "收藏操作失敗",
            icon: "error"
        });
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
            <img src={activity.images} className="card-img-top" />
            <div className="activity-card-body card-body">
                <div className="d-flex justify-content-between align-items-center">
                <p className="card-text">{activity.eventType}</p>
                <span className="rating">★ {activity.rating}</span>
                </div>
                <h5 className="card-title">{activity.city}: {activity.content.title}</h5>
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