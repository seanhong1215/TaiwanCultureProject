import React, { useState, useEffect  } from 'react';
import { getOrdersByUser, getMembers, updatedMembers} from '@/frontend/utils/api';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Center.scss';
import dayjs from 'dayjs';  // 引入 day.js

// 獎勵條件設定
const rewardConditions = [
  { points: 10000, name: "免費四日遊", daysOffset: 0 },
  { points: 8000, name: "免費三日遊", daysOffset: 0 },
  { points: 5000, name: "免費二日遊", daysOffset: 0 },
  { points: 3000, name: "免費一日遊", daysOffset: 0 },
];

// 取得今天日期（格式 YYYY-MM-DD）
const getFormattedDate = (daysOffset = 0, rewardPoints = 0) => {
  let today = dayjs();

  // 如果是 3000 點數，使用1個月期限
  if (rewardPoints === 3000) {
    today = today.add(1, 'month');  // 一個月
  } else {
    today = today.add(3, 'month');  // 預設其他積分加三個月
  }

  // 返回格式化日期 (YYYY-MM-DD)
  return today.format('YYYY-MM-DD');
};


const Center = () => {

  const userId = Number(localStorage.getItem("userId")); // 取得使用者ID

  const [trips, setTrips] = useState([]);

  const [rewards, setRewards] = useState({
    reward: [],
    points: 2000,
  });

  const [tickets, setTickets] = useState([]);

  const fetchTripData = async () => {
    try {
      if (!userId) {
        console.error('未找到使用者ID');
        return;
      }
  
      // 直接取得該用戶的訂單資料
      const userOrders = await getOrdersByUser(userId);
      setTrips(userOrders);
    } catch (error) {
      console.error('無法獲取訂單資料', error);
    }
  };

  const fetchMemberData = async () => {
    try {
      // 獲取會員資料，同時包含 rewards 和 tickets
      const response = await getMembers(userId);

      // 從響應中提取 rewards 和 tickets
      const { rewards, tickets } = response;
  
      // 更新 rewards 資料
      setRewards(rewards);

      // 更新 tickets 資料
      setTickets(tickets);
    } catch (error) {
      console.error('無法獲取會員資料或票據資料', error);
    }
  };

// 發送票券（根據當天積分）
const checkAndRewardTicket = async (rewardsData) => {
  if (!rewardsData) return;

  let newTickets = Array.isArray(tickets) ? [...tickets] : []; // 確保 tickets 是陣列
  let rewardMessage = "";
  let rewardSent = false;
  let updatedRewardsData = { ...rewardsData };

  // 確保 updatedRewardsData.reward_alert_sent 存在
  if (!updatedRewardsData.reward_alert_sent) {
    updatedRewardsData.reward_alert_sent = [];
  }

  // 檢查用戶積分並發送對應獎勵
rewardConditions.forEach((reward) => {
  const ticketExists = newTickets.some(ticket => ticket.name === reward.name);

  if (
    rewardsData.points >= reward.points && 
    !updatedRewardsData.reward_alert_sent.includes(Number(reward.points)) &&
    !ticketExists // 這裡確保不會重複新增
  ) {
    const ticketDate = getFormattedDate(0, reward.points);  // 設定票券日期

    newTickets.push({
      id: newTickets.length + 1,
      name: reward.name,
      date: ticketDate,
      status: "尚未使用",
    });

    rewardMessage = `恭喜您達成 ${reward.points} 積分，已獲得 ${reward.name}！`;
    updatedRewardsData.reward_alert_sent.push(reward.points);
    rewardSent = true;
  }
});

// 如果有發送獎勵，更新 UI 並顯示通知
if (rewardSent) {
  setTickets(newTickets);

  // 確保 alert 只會在新增獎勵時出現
  if (!sessionStorage.getItem("rewardAlertShown")) {
    Swal.fire({
      title: "獲得新獎勵！",
      text: rewardMessage,
      icon: "success",
      confirmButtonText: "確認",
    });
  
    sessionStorage.setItem("rewardAlertShown", "true");
  }

  // 更新後端用戶資料
  await updatedMembers(userId, {
    tickets: newTickets,
    rewards: {
      ...rewardsData,
      reward_alert_sent: updatedRewardsData.reward_alert_sent,
    },
  });
}
};

  useEffect(() => {
    fetchTripData();
    fetchMemberData();
  }, []);

  // 監聽 rewards 變化，檢查是否要發送票券
  useEffect(() => {
    if (rewards) {
      checkAndRewardTicket(rewards);
    }
  }, [rewards]);


  return (
    <div className="page-container">
      <div className="member-center container row">
        <div className="col-12">
          {/* 我的行程 */}
          <div className="card shadow-sm mb-4">
          <h5 className="card-title text-lg-center pb-lg-2">我的行程</h5>
            <div className="card-body">
              <table className="table table-bordered table-responsive">
                <thead>
                  <tr>
                    <th>行程名稱</th>
                    <th>日期</th>
                    <th>狀態</th>
                    <th>操作</th>
                  </tr>
                </thead>
                {/* 檢查是否有行程資料 */}
                <tbody>
                {trips && trips.length > 0 ? (
                    <>
                    {trips.map((trip) => (
                      <tr key={trip.id}>
                        <td>{trip.activityName}</td>
                        <td>{trip.last_bookable_date}</td>
                        <td>{trip.reservedStatus === "reserved" ? "已預約" : trip.reservedStatus === "in_progress" ? "進行中" : trip.reservedStatus === "cancel" ? "已取消" : "已完成"}</td>
                        <td>
                          <Link to={`/member-center/order-management/detail/${trip.id}`} className="btn btn-custom-primary btn-sm">查看詳情</Link>
                        </td>
                      </tr>
                    ))}
                    </>
                  ) : (
                    <tr><td colSpan="4" className="text-center">目前沒有預約行程。</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 我的票券 */}
          <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title">我的票券</h5>
                <table className="table table-bordered table-responsive">
                <thead>
                  <tr>
                    <th>行程名稱</th>
                    <th>使用期限</th>
                    <th>狀態</th>
                  </tr>
                </thead>
                {/* 檢查是否有票券資料 */}
                <tbody>
                {tickets && tickets.length > 0 ? (
                  
                  <>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.name}</td>
                      <td>{ticket.date}</td>
                      <td>{ticket.status}</td>
                    </tr>
                  ))}
                  </>
                ) : (
                  <tr><td colSpan="3" className="text-center">目前沒有票券。</td></tr>
                )}
                </tbody>
              </table>

         
            </div>
          </div>

          {/* 積分與獎勳 */}
          {rewards && (
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title">我的獎勳</h5>
                {/* 積分顯示 */}
                <div className="d-flex align-items-center mb-4">
                  <div className="me-3 w-100">
                    <p className="mb-1">當前點數：{rewards.points} 點</p>
                    <div className="progress" style={{ height: "10px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${(rewards.points / 5000) * 100}%` }}
                        aria-valuenow={rewards.points}
                        aria-valuemin="0"
                        aria-valuemax="5000"
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 獎勳列表 */}
                <h6>已獲得的獎勳</h6>
                {rewards.reward && rewards.reward.length > 0 ? (
                  <div className="d-flex flex-wrap">
                    {rewards.reward.map((achievement, index) => (
                      <span key={index} className="badge badge-custom bg-custom-primary m-1">
                        {achievement}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>目前尚未獲得任何獎勳</p> // 若無獎勳顯示的提示訊息
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Center;
