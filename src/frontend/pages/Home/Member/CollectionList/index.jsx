import { getActivityAll, getFavorites } from '@/frontend/utils/api';
import { useState, useEffect } from "react";
import { ActivityCard } from '@/frontend/components/Card/ActivityCard';
import Swal from 'sweetalert2';

const CollectionList = () => {
    const userId = Number(localStorage.getItem("userId")); // 取得 userId
    const [favorites, setFavorites] = useState([]);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        handleFavorite();
    }, [userId]);


  const handleFavorite = async () => {
    try {
        const response = await getFavorites(userId);
        const favoriteIds = response.map((fav) => fav.activityId);
        const activityResponse = await getActivityAll();
        setFavorites(activityResponse.filter((activity) => favoriteIds.includes(activity.id)));
    } catch (error) {
        Swal.fire({
            title: "取消收藏失敗",
            icon: "error"
        });
    }
};

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
}

  return (
    <div className="page-container">
      <div className="main-text text-center">
            <h2 className="section-title">收藏清單</h2>
        </div>
        <div className="row main-body">
        {loading ? (
            <div className="col-12">
                <p className="text-center">載入中...</p>
            </div>
        ) : favorites.length > 0 ? (
            favorites.map((activity) => (
                <div className="col-md-6 col-lg-4" key={`${activity.id}`}>
                <ActivityCard
                    activity={activity}
                    userId={userId}
                    isCollectedPage={true}
                    onToggleFavorite={handleFavorite}
                />
                </div>
            ))
        ) : (
            <div className="col-12">
                <p className="text-center">目前沒資料</p> {/* 顯示目前沒資料 */}
            </div>
        )}
        </div>
  </div>
  );
};

export default CollectionList;