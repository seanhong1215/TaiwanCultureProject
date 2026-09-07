import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import { getOrdersByUser } from '@/frontend/utils/api/order';

export const useOrdersByUserQuery = (userId) =>
  useQuery({
    queryKey: ['orders', 'byUser', userId],
    queryFn: () => getOrdersByUser(userId),
    enabled: !!userId,
  });

// 獎勵條件設定
const rewardConditions = [
  { points: 10000, name: "免費四日遊" },
  { points: 8000, name: "免費三日遊" },
  { points: 5000, name: "免費二日遊" },
  { points: 3000, name: "免費一日遊" },
];

// 取得票券使用期限（格式 YYYY-MM-DD）
const getTicketExpiryDate = (rewardPoints) => {
  // 3000 點的票券使用期限只有 1 個月，其餘一律 3 個月
  const today = rewardPoints === 3000 ? dayjs().add(1, 'month') : dayjs().add(3, 'month');
  return today.format('YYYY-MM-DD');
};

/**
 * 依會員目前累積點數，自動發放尚未領取的獎勵票券。
 * 用 sessionStorage 記錄「這次瀏覽已經彈過提示」，避免重複彈窗；
 * 發放成功後把完整的會員資料（含新票券／reward_alert_sent）寫回，
 * 觸發 member 的 queryKey 更新，UI 立即反映最新票券清單。
 */
export const useAutoRewardTickets = (member, updateMemberMutation) => {
  useEffect(() => {
    if (!member?.rewards) return;

    const rewardsData = member.rewards;
    const newTickets = Array.isArray(member.tickets) ? [...member.tickets] : [];
    const alertSent = Array.isArray(rewardsData.reward_alert_sent) ? [...rewardsData.reward_alert_sent] : [];
    let rewardMessage = "";
    let rewardSent = false;

    rewardConditions.forEach((reward) => {
      const ticketExists = newTickets.some(ticket => ticket.name === reward.name);
      if (
        rewardsData.points >= reward.points &&
        !alertSent.includes(Number(reward.points)) &&
        !ticketExists
      ) {
        newTickets.push({
          id: newTickets.length + 1,
          name: reward.name,
          date: getTicketExpiryDate(reward.points),
          status: "尚未使用",
        });
        rewardMessage = `恭喜您達成 ${reward.points} 積分，已獲得 ${reward.name}！`;
        alertSent.push(reward.points);
        rewardSent = true;
      }
    });

    if (!rewardSent) return;

    if (!sessionStorage.getItem("rewardAlertShown")) {
      Swal.fire({
        title: "獲得新獎勵！",
        text: rewardMessage,
        icon: "success",
        confirmButtonText: "確認",
      });
      sessionStorage.setItem("rewardAlertShown", "true");
    }

    updateMemberMutation.mutate({
      ...member,
      tickets: newTickets,
      rewards: { ...rewardsData, reward_alert_sent: alertSent },
    });
    // updateMemberMutation 的識別在同一個 mutation 實例下是穩定的，
    // 只依 member 變化即可；member 更新成功後這個 effect 會再跑一次，
    // 但這時獎勵已經記錄在 reward_alert_sent／票券已存在，不會重複發放。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);
};
