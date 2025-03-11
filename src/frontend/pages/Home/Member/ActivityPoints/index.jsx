import { useState, useEffect  } from 'react';
import {getActivityAll } from "@/frontend/utils/api.js";
import Swal from "sweetalert2";

const ActivityPoints = () => {
  const userId = Number(localStorage.getItem("userId"));

  const [userData, setUserData] = useState({
    totalPoints: 2500,
    recentActivities: [],
    nextReward: {
      points: 3000,
      reward: '免費一日遊',
    },
  });

// 計算活動點數的邏輯，這裡是根據活動名稱給予不同的點數
const calculatePoints = (activityName) => {
  switch (activityName) {
    case '台北101觀光':
      return 100;
    case '九份老街導覽':
      return 150;
    case '陽明山健行':
      return 200;
    default:
      return 50; // 預設值
  }
};

useEffect(() => {
  // 活動資料
  const fetchActivities = async () => {
    try {
      const response = await getActivityAll();
      const activities = response;

      // 在活動數據中動態計算並賦予每個活動 points
      const updatedActivities = activities.map((activity) => ({
        ...activity,
        points: calculatePoints(activity.content.title),
      }));

      // 更新用戶的最近活動資料
      setUserData((prevState) => ({
        ...prevState,
        recentActivities: updatedActivities,
      }));
    } catch (error) {
      console.error('無法獲取活動資料', error);
    }
  };

  fetchActivities();
}, []);


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
                <small className="text-muted">{activity.startDate}</small> - <small className="text-muted">{activity.endDate}</small>
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