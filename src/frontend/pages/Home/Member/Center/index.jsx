import React, { useState, useEffect  } from 'react';
import { getOrderAll, getMembers, updatedMembers} from '@/frontend/utils/api';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Center.scss';

const Center = () => {
  const userId = Number(localStorage.getItem("userId")); // 取得使用者ID

  const [trips, setTrips] = useState([]);

  const [rewards, setRewards] = useState(null);

  const [tickets, setTickets] = useState([]);

  const fetchTripData = async () => {
    try {
      if (!userId) {
        console.error('未找到使用者ID');
        return;
      }
  
      // 獲取所有訂單資料
      const responseOrder = await getOrderAll(); 

      // 篩選出屬於該用戶的訂單資料
      const userOrders = responseOrder.filter(
        (order) => order.userId === userId
      );
  
      // 更新狀態，將篩選後的訂單資料設置進 trips
      setTrips(userOrders);
    } catch (error) {
      console.error('無法獲取訂單資料', error);
    }
  };

  const fetchRewardsData = async () => {
    try {
      // 獲取會員資料
     const responseRewards = await getMembers(userId);

      // 更新rewards資料
      const userRewards = responseRewards.rewards; 
      setRewards(userRewards); 
      checkAndRewardTicket(userRewards);  // 檢查是否達標
    } catch (error) {
      console.error('無法獲取會員資料', error);
    }
  }

  const fetchTicketsData = async () => {
    try {
      // 獲取會員資料
     const responseTickets = await getMembers(userId);

      // 更新rewards資料
      const userTickets = responseTickets.tickets; 
      setTickets(userTickets); 
    } catch (error) {
      console.error('無法獲取會員資料', error);
    }
  }


  // 檢查積分是否達標，並自動發送票券
  const checkAndRewardTicket = async (rewardsData) => {
    let newTickets = [...tickets]; // 假設tickets是當前已經擁有的票券陣列
    let rewardMessage = "";
    let rewardSent = false; // 用來標記是否發送過通知
    let updatedRewardsData = { ...rewardsData }; // 複製用戶資料，後續會更新

      // 確保 reward_alert_sent 屬性存在，若不存在則初始化為空陣列
      if (!updatedRewardsData.reward_alert_sent) {
        updatedRewardsData.reward_alert_sent = [];
      }

  
  // 根據積分發送對應的獎勳和票券
  if (rewardsData.points >= 10000 && !updatedRewardsData.reward_alert_sent.includes(10000)) {
    newTickets.push({
      id: newTickets.length + 1,
      name: "免費四日遊",
      date: "2025-03-20",
      status: "尚未使用",
    });
    rewardMessage = "恭喜您達成10000積分，已獲得免費四日遊！";
    updatedRewardsData.reward_alert_sent.push(10000); // 更新已發送過的通知 
    rewardSent = true;
  } else if (rewardsData.points >= 8000 && !updatedRewardsData.reward_alert_sent.includes(8000)) {
    newTickets.push({
      id: newTickets.length + 1,
      name: "免費三日遊",
      date: "2025-03-18",
      status: "尚未使用",
    });
    rewardMessage = "恭喜您達成8000積分，已獲得免費三日遊！";
    updatedRewardsData.reward_alert_sent.push(8000); // 更新已發送過的通知 
    rewardSent = true;
  } else if (rewardsData.points >= 5000 && !updatedRewardsData.reward_alert_sent.includes(5000)) {
    newTickets.push({
      id: newTickets.length + 1,
      name: "免費二日遊",
      date: "2025-03-15",
      status: "尚未使用",
    });
    rewardMessage = "恭喜您達成5000積分，已獲得免費二日遊！";
    updatedRewardsData.reward_alert_sent.push(5000); // 更新已發送過的通知 
    rewardSent = true;
  } else if (rewardsData.points >= 3000 && !updatedRewardsData.reward_alert_sent.includes(3000)) {
    newTickets.push({
      id: newTickets.length + 1,
      name: "免費一日遊",
      date: "2025-03-10",
      status: "尚未使用",
    });
    rewardMessage = "恭喜您達成3000積分，已獲得免費一日遊！";
    updatedRewardsData.reward_alert_sent.push(3000); // 更新已發送過的通知 
    rewardSent = true;
  } else if (rewardsData.points >= 2000 && !updatedRewardsData.reward_alert_sent.includes(2000)) {
    newTickets.push({
      id: newTickets.length + 1,
      name: "專屬VIP點數",
      date: "2025-03-05",
      status: "已贈送",
    });
    rewardMessage = "恭喜您達成2000積分，已獲得專屬VIP點數！";
    updatedRewardsData.reward_alert_sent.push(2000); // 更新已發送過的通知 
    rewardSent = true;
  }

    // 更新票券資料
    setTickets(newTickets); // 在這裡更新新的票券資料
  
    // 顯示成功提示訊息，確保只顯示一次
    if (rewardSent && rewardMessage) {
      Swal.fire({
        title: "獲得新獎勳！",
        text: rewardMessage,
        icon: "success",
        confirmButtonText: "確認"
      });
    }
  
    // 更新用戶資料，更新票券
    await updatedMembers(userId, {
      tickets: newTickets,
      rewards: {  // 更新獎勳資料，並且只更新 reward_alert_sent
        ...rewardsData,  // 保留其他獎勳資料
        reward_alert_sent: updatedRewardsData.reward_alert_sent  // 只更新已發送通知的資料
      }
    });

  };
    
  useEffect(() => {
    fetchTripData();
    fetchRewardsData();
    fetchTicketsData();
  }, []);


  return (
    <div className="page-container">
      <div className="member-center container row">
        <div className="col-12">
          {/* 我的行程 */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h2 className="card-title text-lg-center pb-lg-2">我的行程</h2>
              <table className="table table-bordered table-responsive">
                <thead>
                  <tr>
                    <th>行程名稱</th>
                    <th>日期</th>
                    <th>狀態</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
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
                    <div className="d-flex flex-wrap">
                      {rewards.reward.map((achievement, index) => (
                        <span key={index} className="badge badge-custom bg-custom-primary m-1">{achievement}</span>
                      ))}
                    </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Center;
