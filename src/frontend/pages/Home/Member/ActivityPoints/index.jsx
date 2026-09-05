import { useState, useEffect  } from 'react';
import { getActivityAll, getOrdersByUser, getMembers, updatedMembers } from "@/frontend/utils/api.js";
import { Star } from 'lucide-react';

const rewardsMap = [
  { points: 3000, reward: '免費一日遊' },
  { points: 5000, reward: '免費兩日遊' },
  { points: 8000, reward: '免費三日遊' },
  { points: 10000, reward: '免費四日遊' },
];

const ActivityPoints = () => {
  const userId = Number(localStorage.getItem("userId"));
  const [userData, setUserData] = useState({
    totalPoints: 0,
    recentActivities: [],
    nextReward: rewardsMap[0],
    noActivities: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 取得用戶資料（含已計算的訂單 IDs）和訂單、活動
        const [userResponse, userOrders, allActivities] = await Promise.all([
          getMembers(userId),
          getOrdersByUser(userId),
          getActivityAll(),
        ]);

        // 簽到累積的點數（由 SignIn 頁面寫入）
        const signInPoints = userResponse?.rewards?.signInPoints || 0;
        // 已計算過點數的訂單 IDs
        const countedOrderIds = userResponse?.rewards?.countedOrderIds || [];

        // 找出還沒計算過的新訂單
        const newOrders = userOrders.filter(o => !countedOrderIds.includes(o.id));
        const newOrderPoints = newOrders.length * 100;
        const allCountedIds = [...countedOrderIds, ...newOrders.map(o => o.id)];

        // 總點數 = 簽到點數 + 所有訂單點數
        const totalPoints = signInPoints + (userOrders.length * 100);

        // 組合活動列表（用於顯示）
        const recentActivities = userOrders.map(order => {
          const activity = allActivities.find(a => a.id === order.activityId);
          return activity ? { ...activity, points: 100 } : null;
        }).filter(Boolean);

        // 計算獎勳列表
        const updatedRewards = rewardsMap
          .filter(r => totalPoints >= r.points)
          .map(r => r.reward);

        // 下一個獎勳
        const nextReward = rewardsMap.find(r => totalPoints < r.points) || rewardsMap[rewardsMap.length - 1];

        // 只在有新訂單時才寫回 DB，避免每次進頁面都觸發寫入
        if (newOrderPoints > 0) {
          await updatedMembers(userId, {
            rewards: {
              ...userResponse?.rewards,
              reward: updatedRewards,
              points: totalPoints,
              signInPoints,
              countedOrderIds: allCountedIds,
              date: new Date().toISOString(),
            },
          });
        }

        setUserData({
          totalPoints,
          recentActivities,
          nextReward,
          noActivities: recentActivities.length === 0,
        });

      } catch (error) {
        console.error('無法獲取活動資料或訂單資料', error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);


  return (
    <div className="page-container">
    <div className="container py-4">
      {/* 點數總覽卡片 */}
      <div className="card mb-4 shadow-lg bg-custom-primary text-white border-0">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-8">
              <h3 className="mb-0">我的點數</h3>
              <h2 className="display-4 fw-bold mb-0">{userData.totalPoints}</h2>
            </div>
            <div className="col-4 text-end">
              <Star size={40} fill="currentColor" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
  
      {/* 進度條卡片 */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">距離下個獎勳</h5>
          <p className="text-muted">再 {userData.nextReward.points - userData.totalPoints} 點即可獲得 {userData.nextReward.reward}</p>
          <div className="progress">
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{
                width: `${(userData.totalPoints / userData.nextReward.points) * 100}%`
              }}
              aria-valuenow={userData.totalPoints}
              aria-valuemin="0" 
              aria-valuemax={userData.nextReward.points}
            ></div>
          </div>
        </div>
      </div>
  
      {/* 最近活動列表 */}
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">最近活動</h5>
        </div>
        <div className="list-group list-group-flush">
          {/* 顯示提示信息 */}
          {userData.noActivities ? (
            <div className="alert alert-info rounded-bottom rounded-top-0 mb-0">
              還沒參加活動，趕快去預約吧！
            </div>
          ) : (
            <div>
             {userData.recentActivities.map(activity => (
              <div key={activity.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">{activity.content.title}</h6>
                  {/* <small className="text-muted">{activity.startDate}</small> - <small className="text-muted">{activity.endDate}</small> */}
                </div>
                <span className="badge bg-success rounded-pill px-3 py-2">
                  +{activity.points}
                </span>
              </div>
            ))}
          </div>
        )}

         

        </div>
      </div>



    </div>
  </div>
  
  );
};

export default ActivityPoints;