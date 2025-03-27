import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getMembers, updatedMembers } from "@/frontend/utils/api.js";
import './Signin.scss';
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";


const SignIn = () => {
  dayjs.extend(isSameOrAfter);
  const REWARD_DAYS = 7; // 每 7 天獲得獎勵
  const REWARD_POINTS = 50;

  const [user, setUser] = useState(null);
  const [hasSignedInToday, setHasSignedInToday] = useState(false);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({
    currentStreak: 0,
    points: 0,
  });
  
  // 計算當月的年份、月份和今天的日期
  const today = dayjs().format("YYYY-MM-DD");
  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1;  // 注意：month() 返回的是 0 - 11，所以要加 1
  const firstDayOfMonth = dayjs(`${currentYear}-${String(currentMonth).padStart(2, "0")}-01`).day(); // 當月第一天的星期
  const daysInMonth = dayjs(`${currentYear}-${String(currentMonth).padStart(2, "0")}`).daysInMonth(); // 當月的天數
  
  // 計算應該顯示的格子數量：需要 (當月的天數 + 首日星期數)，然後除以 7 來確定需要幾行
  const totalCells = daysInMonth + firstDayOfMonth; // 當月天數 + 首日星期數
  const totalRows = Math.ceil(totalCells / 7); // 總共有幾行
  const userId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await getMembers(userId);
  
      if (!data) {
        console.error("獲取的資料為空: data 是 undefined 或 null");
        return;  // 如果 data 為 undefined 或 null，終止函數執行
      }
  
      setUser(data);
  
      const today = dayjs().format("YYYY-MM-DD");

      // 確保 signInHistory 是陣列，如果不是則初始化為空陣列
      const signInHistory = Array.isArray(data.signInHistory) ? data.signInHistory : [];
  
      // 確認今天是否已簽到
      const signedInToday = signInHistory.includes(today);
      setHasSignedInToday(signedInToday);
  
      // 計算連續簽到天數，並檢查 signInHistory 是否存在
      const streakCount = Array.isArray(data.signInHistory) ? calculateStreak(data.signInHistory) : 0;
      setStreak(streakCount);
  
      // 更新 stats，檢查 rewards 是否存在且有效
      if (data?.rewards) {
      } else {
        console.warn("用戶未包含 rewards 資料");
      }
  
      setStats({
        currentStreak: streakCount,
        points: data?.rewards?.points || 0,  // 檢查 rewards 是否存在
      });
  
    } catch (error) {
      console.error("獲取用戶數據失敗", error);
    }
  };
  
  

  const handleSignIn = async () => {
    if (hasSignedInToday) return;
  
    // 確保 signInHistory 是陣列
    const signInHistory = Array.isArray(user?.signInHistory) ? user.signInHistory : [];
  
    const updatedHistory = [...signInHistory, today];
  
    // 計算連續簽到天數
    const streakCount = calculateStreak(updatedHistory);
  
    // 計算累積獎勳點數
    let updatedPoints = user?.rewards?.points || 0;
    updatedPoints += 10; // 每次簽到 +10 點
    if (streakCount % 7 === 0) {
      updatedPoints += 50; // 連續 7 天額外 +50 點
    }

  
  // 更新用戶資料
  const updatedUser = {
    ...user,
    signInHistory: updatedHistory,
    rewards: {
      ...user.rewards, // 保留 rewards 內的其他屬性
      points: updatedPoints, // 更新 points
      date: new Date().toISOString(), // 更新簽到時間
    },
    currentStreak: streakCount,
  };
  
    try {
      // 更新資料
      await updatedMembers(userId, updatedUser);
  
      // 更新 UI
      setUser(updatedUser);
      setHasSignedInToday(true);
      setStreak(streakCount);
  
      // 更新 stats
      setStats({
        currentStreak: streakCount,
        points: updatedUser.rewards.points,
      });
  
    } catch (error) {
      console.error("更新簽到狀態失敗", error);
    }
  };
  
  // 計算連續簽到天數
  const calculateStreak = (history) => {
    let streak = 0;
    let prevDate = dayjs().format("YYYY-MM-DD");
  
    // 從今天開始往回推，計算連續簽到
    while (history.includes(prevDate)) {
      streak++;
      prevDate = dayjs(prevDate).subtract(1, "day").format("YYYY-MM-DD");
    }
  
    return streak;
  };
  

  return (
    <div className="page-container">
      <h2 className="text-center">每日簽到</h2>
      <div className="text-center my-3">
        <button
          className={`btn ${hasSignedInToday ? "btn-secondary" : "btn-custom-primary"}`}
          onClick={handleSignIn}
          disabled={hasSignedInToday}
        >
          {hasSignedInToday ? "今日已簽到" : "立即簽到"}
        </button>
      </div>
      <div className="text-center">
        {stats && <p>連續簽到：{stats.currentStreak} 天</p>}
        <div className="progress" style={{ height: "25px" }}>
          <div
            className="progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar"
            style={{ width: `${(stats?.currentStreak % 7) * 14.28}%` }}
          >
            {stats?.currentStreak % 7} / 7
          </div>
        </div>
        {stats?.currentStreak % 7 === 0 && stats?.currentStreak !== 0 && (
          <p className="text-success mt-2">🎉 恭喜獲得獎勳！</p>
        )}
      </div>
      <h4 className="mt-4 text-center">
        {currentYear} 年 {currentMonth} 月 簽到記錄
      </h4>
      <div className="table-responsive">
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              <th>日</th>
              <th>一</th>
              <th>二</th>
              <th>三</th>
              <th>四</th>
              <th>五</th>
              <th>六</th>
            </tr>
          </thead>
          <tbody>
  {[...Array(totalRows)].map((_, weekIndex) => (
    <tr key={weekIndex}>
      {[...Array(7)].map((_, dayIndex) => {
        const dayNum = weekIndex * 7 + dayIndex - firstDayOfMonth + 1; // 計算當前週的日期
        const currentDate = dayjs().year(currentYear).month(currentMonth - 1).date(dayNum); // 用 day.js 建立日期
        const dateStr = currentDate.format("YYYY-MM-DD"); // 轉換為 "YYYY-MM-DD" 格式的字串
        const isSignedIn = Array.isArray(user?.signInHistory) && user.signInHistory.includes(dateStr); // 檢查該日期是否已簽到

        return dayNum > 0 && dayNum <= daysInMonth ? (
          <td
            key={dayIndex}
            className={dateStr === today ? "bg-custom-primary text-white" : ""}
          >
            {dayNum}
          </td>
        ) : (
          <td key={dayIndex} className="bg-light"></td>
        );
      })}
    </tr>
  ))}
</tbody>

        </table>
      </div>
    </div>
  );
};

export default SignIn;
