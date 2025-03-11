import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {getUserStats, signIn } from "@/frontend/utils/api.js";
import './Signin.scss';

const SignIn = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = Number(localStorage.getItem("userId"));

  const today = new Date().toISOString().split("T")[0];
  const hasSignedInToday = stats?.lastSignInDate === today;

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userStats = await getUserStats(userId);
        if (userStats) {
          setStats(userStats);
        } else {
          console.warn("首次簽到，初始化 stats...");
          setStats({
            availableRewards: 0,
            claimedRewards: 0,
            currentStreak: 0,
            lastSignInDate: null,
            longestStreak: 0,
            totalSignIns: 0,
            userId: userId,
          });
        }
      } catch (error) {
        console.error("無法獲取簽到數據", error);
      }
      setLoading(false);
    };
    fetchStats();
  }, [userId]);

  const handleSignIn = async () => {
    if (!stats) return;
    
    const today = new Date().toISOString().split("T")[0];
    const lastSignIn = stats.lastSignInDate ? new Date(stats.lastSignInDate) : null;
    const diffDays = lastSignIn ? Math.floor((Date.parse(today) - lastSignIn.getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    const newStreak = diffDays === 1 ? stats.currentStreak + 1 : 1;
    const newTotalSignIns = stats.totalSignIns + 1;
    const newLongestStreak = Math.max(stats.longestStreak, newStreak);

    const updatedStats = {
      currentStreak: newStreak,
      totalSignIns: newTotalSignIns,
      longestStreak: newLongestStreak,
      lastSignInDate: today,
    };

    try {
      // await signIn(userId, updatedStats);
      setStats((prevStats) => ({ ...prevStats, ...updatedStats }));

      Swal.fire({
        icon: "success",
        title: "簽到成功！",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "簽到失敗，請稍後再試！",
      });
      console.error(error.message);
    }
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
            {[...Array(totalCells / 7)].map((_, weekIndex) => (
              <tr key={weekIndex}>
                {[...Array(7)].map((_, dayIndex) => {
                  const dayNum = weekIndex * 7 + dayIndex - firstDayOfMonth + 1;
                  const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
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
