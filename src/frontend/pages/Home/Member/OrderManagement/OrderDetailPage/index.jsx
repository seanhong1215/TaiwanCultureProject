import React, { useState, useEffect } from 'react';
import '../OrderDetailPage/OrderDetail.scss';
import { useParams } from "react-router-dom";  // 取得動態路由參數

import { getOrderDetail, getActivitys } from '@/frontend/utils/api';


const OrderDetailPage = () => {
    const { id } = useParams();  // 從 URL 中提取訂單編號 id
    const [order, setOrder] = useState(null);  // 儲存訂單資料
    const [activity, setActivity] = useState(null);  // 儲存活動資料

  useEffect(() => {
    const fetchData = async () => {
        try {
            const responseOrders = await getOrderDetail(id);
            setOrder(responseOrders);  // 設置訂單資料

            const activityId = responseOrders.activityId;  // 直接從 response 取
            if (activityId) {  // 確保 activityId 存在才請求
                const responseActivitys = await getActivitys(activityId);
                setActivity(responseActivitys);  // 設置活動資料
            }
        } catch (err) {
            console.log("獲取活動資料錯誤:", err);
        } 
    };

    if (id) { // 確保 id 存在再執行
        fetchData();
    }

  }, [id]);

    // 等待資料加載中
    if (!order || !activity) {
        return <div>Loading...</div>;
      }

  return (
    <div className="order-detail-style page-container">
        <div className="order-info">
            <div className="order-info-box order-detail">
                <div className="order-detail-info">
                    <h3 className="order-title">訂單資訊</h3>
                    <div className="reservation">{order.reservedStatus === "reserved" ? "已預約" : order.reservedStatus === "in_progress" ? "進行中" : order.reservedStatus === "cancel" ? "已取消" : "未知的狀態"}</div>
                </div>
                <table>
                    <tbody>
                        <tr className="d-block mt-4 mb-3">
                            <td className="field-label-name">訂單編號</td>
                            <td className="ps-3">#{order.id}</td>
                        </tr>
                        <tr className="d-block mt-3 mb-">
                            <td className="field-label-name">訂購姓名</td>
                            <td className="ps-3">{order.contactName}</td>
                        </tr>
                        <tr className="d-block mt-3 mb-3">
                            <td className="field-label-name">電子郵件</td>
                            <td className="ps-3">{order.user.email}</td>
                        </tr>
                        <tr className="d-block mt-3 mb-3">
                            <td className="field-label-name">電話號碼</td>
                            <td className="ps-3">002-81-90-1234-5678</td>
                        </tr>
                        <tr className="d-block mt-3 mb-3">
                            <td className="field-label-name">訂購日期</td>
                            <td className="ps-3">{order.createdAt}</td>
                        </tr>
                        <tr className="d-block mt-3 mb-3">
                            <td className="field-label-name">預約日期</td>
                            <td className="ps-3">{order.last_bookable_date}</td>
                        </tr>
                        <tr className="d-block mt-3 mb-3">
                            <td className="field-label-name">活動名稱</td>
                            <td className="ps-3">{order.activityName} ｜ {activity.city}</td>
                        </tr>
                        <tr className="d-block mt-3 mb-3">
                            <td className="field-label-name">活動地點</td>
                            <td className="ps-3">{order.activityLocation}</td>
                        </tr>
                        <tr className="d-block mt-3 mb-3">
                            <td className="field-label-name">活動時長</td>
                            <td className="ps-3">{order.timeSlot}</td>
                        </tr>
                        <tr className="d-block mt-3 mb-3">
                            <td className="field-label-name">訂購人數</td>
                            <td className="ps-3">成人: {order.adultCount}, 兒童: {order.childCount}</td>
                        </tr>
                        <tr className="d-block mt-3 mb-3">
                            <td className="field-label-name">訂單金額</td>
                            <td className="ps-3">{order.totalAmount} 元</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="notes-list order-detail notes-order-detail">
                <div className="notes-info">
                    <h3 className="notes-title">預約與注意事項</h3>
                </div>
                <table>
                    <tbody>
                        <tr className="reservation-method d-block mt-3 mb-3">
                            <td className="field-label-name">預約方式</td>
                            <td className="ps-3">#{order.id}</td>
                        </tr>
                        <tr className="notice d-block mt-3 mb-3">
                            <td className="field-label-name">注意事項</td>
                            <td className="notice-list-box">
                                <li className="notice-list">活動提供所有工具及材料，參加者僅需穿著適合手作的輕便衣物</li>
                                <li className="notice-list">每場次最多容納15人，建議提前預約</li>
                                <li className="notice-list">因涉及天然染料操作，活動現場禁止攜帶外食，建議自備水壺</li>
                                <li className="notice-list">活動開始前7天可免費取消或更改場次，7天內取消將酌收50%手續費</li>
                            </td>
                        </tr>
                        <tr className="location d-block mt-3 mb-3">
                            <td className="field-label-name">活動地點</td>
                            <td className="ps-3">{order.activityLocation}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div className="activities order-detail">
            <div className="activities-info">
                <h3 className="activities-title">活動資訊</h3>
            </div>
            <table>
                <tbody>
                    <tr>
                        <td className='activities-img'>
                        <img src={activity.images} alt=""/>
                        </td>
                    </tr>
                    <tr className="d-block mt-3 mb-3">
                        <td className="field-label-name">活動名稱</td>
                        <td className="ps-3">{order.activityName} ｜ {activity.city}</td>
                    </tr>
                    <tr className="d-block mt-3 mb-3">
                        <td className="field-label-name">活動介紹</td>
                        <td className="ps-3">
                            {activity.content.description}
                        </td>
                    </tr>
                    <tr className="d-block mt-3 mb-3">
                        <td className="field-label-name">活動亮點</td>
                        <td className="activities-label-name-box">
                            <li className="activities-label-name">專業指導：由經驗豐富的染布老師帶領，深入了解靛藍染布的歷史、染料製作過程及技巧。</li>
                            <li className="activities-label-name">獨特設計：提供多種染布技法（如夾染、綁染、浸染等），自由創作個人專屬圖案。</li>
                            <li className="activities-label-name">天然材料：採用100%天然靛藍染料，環保無毒，對人體無害。</li>
                            <li className="activities-label-name">手作紀念品：完成的作品可帶回家，成為日常生活中的藝術品或送禮佳品。</li>
                        </td>
                    </tr>
                    <tr className="d-block mt-3 mb-3">
                        <td className="field-label-name">活動時長</td>
                        <td className="ps-3">{order.timeSlot}</td>
                    </tr>
                    <tr className="d-block mt-3 mb-3">
                        <td className="field-label-name">活動費用</td>
                        <td className="ps-3">{order.totalAmount} 元 / 人</td>
                    </tr>
                    <tr className="d-block mt-3 mb-3">
                        <td className="field-label-name">人數上限</td>
                        <td className="ps-3">15 人</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default OrderDetailPage;


