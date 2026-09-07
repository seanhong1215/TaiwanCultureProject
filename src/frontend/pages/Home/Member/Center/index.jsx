import { Link } from 'react-router-dom';
import './Center.scss';
import { useMemberQuery, useUpdateMemberMutation } from '@/frontend/hooks/useMember';
import { useOrdersByUserQuery, useAutoRewardTickets } from './hooks';

const Center = () => {

  const userId = Number(localStorage.getItem("userId")); // 取得使用者ID

  const { data: trips = [] } = useOrdersByUserQuery(userId);
  const { data: member } = useMemberQuery(userId);
  const updateMemberMutation = useUpdateMemberMutation(userId);

  useAutoRewardTickets(member, updateMemberMutation);

  const rewards = member?.rewards ?? { reward: [], points: 0 };
  const tickets = member?.tickets ?? [];

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
