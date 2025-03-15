import { useState, useEffect  } from 'react';
import { getActivityAll, getOrderAll, updatedMembers  } from "@/frontend/utils/api.js";
import Swal from "sweetalert2";

const ActivityPoints = () => {
  const userId = Number(localStorage.getItem("userId"));

  const [userData, setUserData] = useState({
    totalPoints: 0,
    recentActivities: [],
    nextReward: {
      points: 3000,
      reward: '免費一日遊',
    },
  });


  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 獲取所有訂單和所有活動資料
        const responseOrder = await getOrderAll(); // 所有訂單
        const responseActivity = await getActivityAll(); // 所有活動
  
        // 只篩選出屬於當前用戶的訂單
        const userFilteredOrders = responseOrder.filter(
          (order) => order.userId === userId
        );
  
        // 根據訂單中的 activityId 查找對應的活動資料，並為每個活動賦予 100 點
        const updatedActivities = userFilteredOrders.map((order) => {
          const activity = responseActivity.find(
            (act) => act.id === order.activityId
          );
  
          if (activity) {
            return {
              ...activity,
              points: 100, // 給予每個活動 100 點
            };
          }
  
          return null; // 如果找不到對應的活動，返回 null
        }).filter(activity => activity !== null); // 排除 null 值
  
        // 計算總點數，將活動的 points 累加到 totalPoints
        let updatedTotalPoints = 2000; // 預設 2000 點
        updatedActivities.forEach(activity => {
          updatedTotalPoints += activity.points;
        });

        // 根據 updatedTotalPoints 計算獎勳
        let updatedRewards = ['專屬VIP點數']; // 預設送 2000 點專屬VIP點數
  
        // 當 totalPoints >= 3000 時，加入免費一日遊
        if (updatedTotalPoints >= 3000) {
          updatedRewards.push('免費一日遊');
        }

        // 當 totalPoints >= 5000 時，加入免費兩日遊
        if (updatedTotalPoints >= 5000) {
          updatedRewards.push('免費兩日遊');
        }

        // 當 totalPoints >= 8000 時，加入免費三日遊
        if (updatedTotalPoints >= 8000) {
          updatedRewards.push('免費三日遊');
        }

        // 當 totalPoints >= 10000 時，加入免費四日遊
        if (updatedTotalPoints >= 10000) {
          updatedRewards.push('免費四日遊');
        }
  
        // 更新用戶資料
        setUserData((prevState) => ({
          ...prevState,
          totalPoints: updatedTotalPoints,
          recentActivities: updatedActivities,
          rewards: {
            reward: updatedRewards,
            points: updatedTotalPoints,
            date: new Date().toISOString(),
          },
        }));

        // 更新後端資料庫中的 totalPoints
      const updateUserPoints = async () => {
        try {

          if (userId) {
            // 每次獲得的獎勳會儲存到 user 的 rewards 陣列中
            await updatedMembers(userId, {
              rewards: {
                reward: updatedRewards,
                points: updatedTotalPoints,
                date: new Date().toISOString(),
              },
            })
            // console.log('totalPoints 更新成功');
          }

        } catch (error) {
          console.error('更新 totalPoints 時發生錯誤', error);
        }
      };

      // 呼叫更新後端 API
      updateUserPoints();

      } catch (error) {
        console.error('無法獲取活動資料或訂單資料', error);
      }
    };
  
    // 如果有 userId，則初始化 totalPoints 為 2000 點
    if (userId) {
      fetchUserData();
    }
  }, [userId]); // 只依賴 userId 更新資料
  
  


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
              <i className="bi bi-star-fill fs-1"></i>
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
      </div>
    </div>
  </div>
  
  );
};

export default ActivityPoints;