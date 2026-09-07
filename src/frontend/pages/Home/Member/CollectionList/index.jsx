import { useEffect } from "react";
import { ActivityCard } from '@/frontend/components/Card/ActivityCard';
import Swal from 'sweetalert2';
import { useCollectionList } from './hooks';

const CollectionList = () => {
    const userId = Number(localStorage.getItem("userId")); // 取得 userId
    const { favorites, loading, error, refetch } = useCollectionList(userId);

    useEffect(() => {
        if (error) {
            console.error("載入收藏清單失敗", error);
            Swal.fire({
                title: "載入收藏清單失敗",
                icon: "error"
            });
        }
    }, [error]);

  if (error) {
    return <div className="alert alert-danger">載入收藏清單失敗</div>;
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
                    onToggleFavorite={refetch}
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
