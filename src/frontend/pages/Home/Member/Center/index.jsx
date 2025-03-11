import React, { useState, useEffect  } from 'react';
import { getOrderAll, getVouchers, getRewards, updatedVouchers, updatedRewards} from '@/frontend/utils/api';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Center.scss';

const Center = () => {
  const userId = Number(localStorage.getItem("userId"));

  const [settings, setSettings] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const [trips, setTrips] = useState([]);
  const [rewards, setRewards] = useState({
    points: 2500,
    achievements: [],
  });

  const [tickets, setTickets] = useState([]);

  useEffect(() => {

    const fetchTripData = async () => {
      const response = await getOrderAll();
      setTrips(response);
    }

    const fetchTicketsData = async () => {
      const response = await getVouchers();
      setTickets(response);  
    }

    const fetchRewardsData = async () => {
      const response = await getRewards();
      setRewards(response);
      checkAndRewardTicket(response);  // 檢查是否達標
    }

    fetchTripData();
    fetchTicketsData();
    fetchRewardsData();
  }, []);


  // 檢查積分是否達標，並自動發送票券
  const checkAndRewardTicket = async(rewardsData) => {
    let newAchievements = [...rewardsData.achievements];
    let newTickets = [...tickets];
    let rewardMessage = "";

    // 檢查是否達到3000或5000積分
    if (rewardsData.points >= 3000 && !newAchievements.includes("達成3000積分，獲得免費票券")) {
      newAchievements.push("達成3000積分，獲得免費票券");
      newTickets.push({
        id: newTickets.length + 1,
        name: "台北一日遊票券",
        date: "2025-03-10",
        status: "尚未使用",
      });
      rewardMessage = "恭喜您達成3000積分，已獲得免費票券！";
    }
    
    if (rewardsData.points >= 5000 && !newAchievements.includes("達成5000積分，獲得免費票券")) {
      newAchievements.push("達成5000積分，獲得免費票券");
      newTickets.push({
        id: newTickets.length + 1,
        name: "九份老街美食之旅票券",
        date: "2025-03-15",
        status: "尚未使用",
      });
      rewardMessage = "恭喜您達成5000積分，已獲得免費票券！";
    }

    // 更新積分與獎勳
    setRewards({ ...rewardsData, achievements: newAchievements });
    setTickets(newTickets);

    // 顯示成功提示訊息
    if (rewardMessage) {
      Swal.fire({
        title: "獲得新獎勳！",
        text: rewardMessage,
        icon: "success",
        confirmButtonText: "確認"
      });
    }

    // 更新後端資料
    await updatedRewards({ points: rewards.points, achievements: newAchievements });

    newTickets.forEach(ticket => {
      updatedVouchers(ticket.id, ticket);
    });
  }
  


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
                      <td>{trip.reservedStatus === "reserved" ? "已預約" : trip.reservedStatus === "in_progress" ? "進行中" : trip.reservedStatus === "cancel" ? "已取消" : "未知的狀態"}</td>
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
          {rewards.achievements.length > 0 && (
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
                {rewards.achievements.length > 0 && (
                  <>
                    <h6>已獲得的獎勳</h6>
                    <div className="d-flex flex-wrap">
                      {rewards.achievements.map((achievement, index) => (
                        <span key={index} className="badge badge-custom bg-custom-primary m-1">{achievement}</span>
                      ))}
                    </div>
                  </>
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
