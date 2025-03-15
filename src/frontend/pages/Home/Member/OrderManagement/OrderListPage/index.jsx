import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrderAll, getActivityAll, updateOrder } from '@/frontend/utils/api';
import './OderListPage.scss';
import Swal from 'sweetalert2';
import PageNation from "@/frontend/components/PageNation";
import dayjs from "dayjs";

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [userOrders, setUserOrders] = useState([]); // 用來存儲過濾後的使用者訂單
  const [totalItems, setTotalItems] = useState(0); // 訂單總筆數
  const [totalPage , setTotalPage] = useState(1);
  const [activeTab, setActiveTab] = useState('已預約');
  const [page, setPage] = useState(1); // 頁數狀態
  const limit = 5;
  const currentUserId = Number(localStorage.getItem("userId"));

  // ✅ 更新訂單狀態的函式
  const getOrderStatus = (last_bookable_date, timeSlot, reservedStatus) => {
    const now = dayjs();
    // 從 timeSlot 取出開始時間（如 "18:00"）
    const startTime = timeSlot.split("-")[0];

    // 轉換成完整日期時間格式
    const orderDateTime = dayjs(`${last_bookable_date} ${startTime}`, "YYYY-MM-DD HH:mm");

    // console.log("🚀 訂單狀態檢查:");
    // console.log("🔹 last_bookable_date:", last_bookable_date);
    // console.log("🔹 timeSlot:", timeSlot);
    // console.log("🔹 解析出的開始時間:", startTime);
    // console.log("🔹 計算出的訂單時間:", orderDateTime.format("YYYY-MM-DD HH:mm"));
    // console.log("🔹 現在時間:", now.format("YYYY-MM-DD HH:mm"));

    // 判斷是否應該變更狀態
    if (orderDateTime.isBefore(now, "day")) { // 若訂單時間在今天以前
      console.log("✅ 訂單狀態變更為: ended (已結束)");
      return "ended"; // 已結束
    }
  
    if (reservedStatus === "reserved" && orderDateTime.isBefore(now)) {
      // console.log("✅ 訂單狀態變更為: in_progress (進行中)");
      return "in_progress"; // 變更為進行中
    }

    // console.log("🚫 訂單狀態保持不變:", reservedStatus);
    return reservedStatus;

  };

  const handleCancel = async(orderId) => {
      try {
        await updateOrder(orderId, {reservedStatus: "cancel"});
        Swal.fire({
            title: "取消訂單成功",
            icon: "success"
          })

        // 更新 orders 狀態
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, reservedStatus: "cancel" } : order
          )
        );

        // 重新篩選 userOrders，確保畫面即時更新
        setUserOrders((prevUserOrders) =>
          prevUserOrders.filter((order) => order.id !== orderId)
        );
    } catch (error) {
        console.error("取消訂單失敗:", error);
        Swal.fire({
          title: "取消訂單失敗",
          icon: "error",
        });
    }
  }

  // ✅ 獲取訂單資料（包含篩選 & 狀態更新）
  const fetchData = async () => {
    try {
      
      const responseOrder = await getOrderAll(); // 所有訂單
      const responseActivity = await getActivityAll(); // 所有活動

      if (!responseOrder || !responseActivity) {
        Swal.fire({
          title: "資料獲取失敗",
          text: "無法獲取訂單或活動資料",
          icon: "error",
        });
        return;
      }

      // 🔥 只篩選 `currentUserId` 的訂單
      const userFilteredOrders = responseOrder.filter(
        (order) => order.userId === currentUserId
      );


      // 根據 `activityId` 更新每個訂單的活動資料
      const updatedOrders = userFilteredOrders.map((order) => {
        const activity = responseActivity.find((act) => act.id === order.activityId) || {};
        return { ...order, activity, previousReservedStatus: order.reservedStatus }; // 儲存原始狀態
      });

      // ✅ 自動更新狀態
      const updatedOrdersWithStatus = updatedOrders.map((order) => {
        const newStatus = getOrderStatus(order.last_bookable_date, order.timeSlot, order.reservedStatus);
        // console.log(`📌 訂單 ID: ${order.id}，狀態更新為: ${newStatus}`);
        return { ...order, reservedStatus: newStatus };
      });

      // 根據 `activeTab` 篩選狀態
      const filteredByTab = updatedOrdersWithStatus.filter((order) => {
        if (activeTab === "已預約") return order.reservedStatus === "reserved";
        if (activeTab === "進行中") return order.reservedStatus === "in_progress";
        if (activeTab === "已取消") return order.reservedStatus === "cancel";
        if (activeTab === "已結束") return order.reservedStatus === "ended";
        return true;
      });

      // console.log("🔍 篩選後的訂單數量:", filteredByTab.length);

       // ✅ 儲存更新狀態到資料庫
       const saveUpdatedStatusToDatabase = async (updatedOrdersWithStatus) => {
        await Promise.all(updatedOrdersWithStatus.map(async (order) => {
          // 檢查訂單的狀態是否有變動
          if (order.reservedStatus !== order.previousReservedStatus) {
            // 如果狀態有變動，執行 API 更新
            try {
              await updateOrder(order.id, { reservedStatus: order.reservedStatus });
              console.log(`訂單 ${order.id} 狀態已更新為: ${order.reservedStatus}`);
            } catch (error) {
              console.error(`更新訂單 ${order.id} 狀態失敗:`, error);
            }
          }
        }));
      };


      // 設定狀態
      setOrders(filteredByTab);
      setTotalItems(filteredByTab.length);
      setTotalPage(filteredByTab.length ? Math.ceil(filteredByTab.length / limit) : 1);

      // 分頁
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      setUserOrders(filteredByTab.slice(startIndex, endIndex));

    // console.log("✅ 訂單資料已更新");

    // 呼叫儲存資料庫的函數
    saveUpdatedStatusToDatabase(updatedOrdersWithStatus);

    } catch (err) {
      console.error("獲取活動資料錯誤:", err);
      Swal.fire({
        title: "資料獲取錯誤",
        text: "無法獲取訂單或活動資料",
        icon: "error",
      });
    }
  };

  // ✅ `useEffect` 初始化時獲取資料
  useEffect(() => {
    if (currentUserId) {
      fetchData();
    }
  }, [page, currentUserId, activeTab]); // 當 `activeTab` 或 `page` 變更時，重新獲取資料

  // ✅ `setInterval` 定期檢查並更新狀態
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          const startTime = order.timeSlot.split("-")[0];
          const orderDateTime = dayjs(`${order.last_bookable_date} ${startTime}`, "YYYY-MM-DD HH:mm");
          // console.log("📌 訂單 ID:", order.id);
          // console.log("🔹 訂單時間:", orderDateTime.format("YYYY-MM-DD HH:mm"));
          // console.log("🔹 現在時間:", dayjs().format("YYYY-MM-DD HH:mm"));


          if (order.reservedStatus === "reserved" && orderDateTime.isBefore(dayjs())) {
            // console.log("✅ 訂單狀態變更為: in_progress");
            return { ...order, reservedStatus: "in_progress" };
          }

          // console.log("🚫 訂單狀態未變更:", order.reservedStatus);
          return order;
        })
      );
    }, 30000); // 每 30 秒檢查一次

    return () => clearInterval(interval);
  }, [orders]); // 依賴 `orders`，確保最新的資料被檢查

  return (
    <div className="page-container order-list-page">
      <div className="container">
        <h2 className="mb-4 text-center">我的訂單</h2>
        
        {/* 標籤導航 */}
        <ul className="nav nav-tabs mb-4">
          {['已預約', '進行中', '已結束', '已取消'].map(tab => (
            <li className="nav-item" key={tab}>
              <button 
                className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)} // 控制選擇的標籤
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
        
        {/* 訂單列表 */}
        <div className="row">
          {/* 根據 activeTab 篩選並顯示對應狀態的訂單 */}
          {userOrders.length > 0 ? (
            userOrders.map(order => (
              <div className="col-lg-12 mb-4" key={order.id}>
                <div className="card h-100 shadow-sm">
                  <div className="row g-0">
                    <div className="col-lg-5">
                      <div className="h-100 d-flex align-items-center justify-content-center">
                        <img
                          src={order.actImage}
                          alt={order.activityName}
                          className="card-img order-img"
                        />
                      </div>
                    </div>
                    <div className="col-lg-7">
                      <div className="card-body d-flex flex-column h-100">
                        <h5 className="card-title">{order.activityName}</h5>
                        <p className="card-text mb-1">
                          預約時間: {order.last_bookable_date} {order.timeSlot}
                        </p>
                        <p className="card-text mb-2">訂單編號: {order.id}</p>
                        <div className="mt-auto text-center text-md-end">
                          <Link
                            to={`/member-center/order-management/detail/${order.id}`}
                            className="btn btn-sm custom-btn"
                          >
                            查看詳情
                          </Link>
                         {order.reservedStatus === "reserved" && (
                            <button className="btn btn-danger" onClick={() => handleCancel(order.id)}>取消訂單</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <p className="text-muted">目前沒有 {activeTab} 的訂單</p>
            </div>
          )}
        </div>
  
        <div className="row">
          <div className="col-12">
            {/* 如果有多頁，顯示分頁 */}
            {totalPage > 1 && <PageNation totalPage={totalPage} page={page} setPage={setPage} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderListPage;
