import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getOrdersByUser, getActivityAll, updateOrder } from '@/frontend/utils/api';
import './OderListPage.scss';
import Swal from 'sweetalert2';
import PageNation from "@/frontend/components/PageNation";
import EventReviewForm from '@/frontend/components/form/EventReviewForm';
import dayjs from "dayjs";

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [userOrders, setUserOrders] = useState([]); // 用來存儲過濾後的使用者訂單
  const [totalItems, setTotalItems] = useState(0); // 訂單總筆數
  const [totalPage , setTotalPage] = useState(1);
  const [activeTab, setActiveTab] = useState('全部訂單');
  const [page, setPage] = useState(1); // 頁數狀態
  const limit = 5;
  const currentUserId = Number(localStorage.getItem("userId"));

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 搜尋功能
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]); // 篩選後的訂單

  // 篩選出符合條件的訂單
  const ordersToRender = filteredOrders.length > 0 ? filteredOrders : userOrders;
  const showNoResults = filteredOrders.length === 0 && searchTerm !== "";

  // 排序功能
  const [sortOption, setSortOption] = useState("排序: 最近日期");

    // 處理搜尋
    const handleSearch = () => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    
      const result = userOrders.filter(order => {
        const activityName = order.activityName?.toLowerCase() || "";
        const orderNumber = order.id?.toString().toLowerCase() || "";
    
        return activityName.includes(lowerCaseSearchTerm) || orderNumber.includes(lowerCaseSearchTerm);
      });
    
      setFilteredOrders(result);
    };

    const handleSearchInputChange = (event) => {
      setSearchTerm(event.target.value); // 更新搜索框的值
    };

    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        handleSearch(); // 按下 Enter 键时触发搜索
      }
    };
  

    // 處理排序選項變化
    const handleSortChange = (event) => {
      const selectedOption = event.target.value;
      setSortOption(selectedOption); // 更新排序选项
    };

  // 控制評價Modal顯示
  const handleReview = (order) => {
      setSelectedOrder(order); // 確保傳遞當前點擊的 order
      setShowModal(true); // 顯示評價 Modal
  };

  // 關閉 Modal
  const handleClose = () => {
    setShowModal(false);
    setSelectedOrder(null); // 清除已選擇的 order 避免干擾
  };

  // ✅ 更新訂單狀態的函式
  const getOrderStatus = (last_bookable_date, timeSlot, reservedStatus) => {
    const now = dayjs();
    // 從 timeSlot 取出開始時間
    const startTime = timeSlot.split("-")[0];

    // 轉換成完整日期時間格式
    const orderDateTime = dayjs(`${last_bookable_date} ${startTime}`, "YYYY-MM-DD HH:mm");

    // 判斷是否應該變更狀態
    if (orderDateTime.isBefore(now, "day")) { // 若訂單時間在今天以前
      return "finished"; // 已完成
    }
  
    if (reservedStatus === "reserved" && orderDateTime.isBefore(now)) {
      return "in_progress"; // 變更為進行中
    }

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
      
      const [userFilteredOrders, responseActivity] = await Promise.all([
        getOrdersByUser(currentUserId),
        getActivityAll(),
      ]);

      if (!userFilteredOrders || !responseActivity) {
        Swal.fire({
          title: "資料獲取失敗",
          text: "無法獲取訂單或活動資料",
          icon: "error",
        });
        return;
      }

      // 根據 `activityId` 更新每個訂單的活動資料
      const updatedOrders = userFilteredOrders.map((order) => {
        const activity = responseActivity.find((act) => act.id === order.activityId) || {};
        return { ...order, activity, previousReservedStatus: order.reservedStatus }; // 儲存原始狀態
      });

      // ✅ 自動更新狀態
      const updatedOrdersWithStatus = updatedOrders.map((order) => {
        const newStatus = getOrderStatus(order.last_bookable_date, order.timeSlot, order.reservedStatus);
        return { ...order, reservedStatus: newStatus };
      });

      // 根據 `activeTab` 篩選狀態
      const filteredByTab = updatedOrdersWithStatus.filter((order) => {
        if (activeTab === "已預約") return order.reservedStatus === "reserved";
        if (activeTab === "進行中") return order.reservedStatus === "in_progress";
        if (activeTab === "已取消") return order.reservedStatus === "cancel";
        if (activeTab === "已完成") return order.reservedStatus === "finished";
        return true;
      });

       // ✅ 儲存更新狀態到資料庫
       const saveUpdatedStatusToDatabase = async (updatedOrdersWithStatus) => {
        await Promise.all(updatedOrdersWithStatus.map(async (order) => {
          // 檢查訂單的狀態是否有變動
          if (order.reservedStatus !== order.previousReservedStatus) {
            // 如果狀態有變動，執行 API 更新
            try {
              await updateOrder(order.id, { reservedStatus: order.reservedStatus });
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

  // 在排序选项变化时执行排序
  useEffect(() => {
    const sortedOrders = [...userOrders]; // 复制一份当前的订单数据

    if (userOrders.length === 0) return; // 如果没有订单数据，直接返回

    // 按照預約時間排序
    if (sortOption === "排序: 最近日期") {
      sortedOrders.sort((a, b) => new Date(b.last_bookable_date) - new Date(a.last_bookable_date)); // 按日期降序
    } else if (sortOption === "排序: 最早日期") {
      sortedOrders.sort((a, b) => new Date(a.last_bookable_date) - new Date(b.last_bookable_date)); // 按日期升序
    }

    setUserOrders(sortedOrders); // 更新排序后的订单列表
  }, [sortOption]); // 依赖于 sortOption

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

          if (order.reservedStatus === "reserved" && orderDateTime.isBefore(dayjs())) {
            return { ...order, reservedStatus: "in_progress" };
          }

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
          {['全部訂單','已預約', '進行中', '已完成', '已取消'].map(tab => (
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

        {/* 篩選和搜尋 */}
      <div className="d-flex justify-content-between mb-4 flex-lg-row flex-column gap-3">
      <select 
          className="form-select w-auto"
          value={sortOption}
          onChange={handleSortChange}
        >
          <option>排序: 最近日期</option>
          <option>排序: 最早日期</option>
        </select>

        <div className="input-group w-auto">
          <input 
            type="text" 
            className="form-control" 
            placeholder="搜尋訂單編號或活動名稱"
            value={searchTerm}
            onChange={handleSearchInputChange} // 設置搜尋條件
            onKeyDown={handleKeyDown}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            <span className="material-icons">search</span>
          </button>
        </div>
      </div>
        
        {/* 訂單列表 */}
        <div className="row">

        {/* 顯示沒有搜尋結果的訊息 */}
        {showNoResults && (
          <div className="col-12 text-center py-5">
            <p className="text-muted">沒有符合 "{searchTerm}" 的結果</p>
          </div>
        )}

        {/* 顯示沒有資料的訊息 */}
        {orders.length === 0 && !showNoResults && (
          <div className="col-12 text-center py-5">
            <p className="text-muted">目前沒有 {activeTab} 的訂單</p>
          </div>
        )}

        {/* 有資料時顯示訂單 */}
        {orders.length > 0 && !showNoResults && ordersToRender.map((order) => (
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
                        {/* 只有完成狀態且未評價的訂單才顯示評價獎勵提示 */}
                        {order.reservedStatus === 'finished' && !order.reviewed && (
                        <div className="text-warning mb-2 small fw-bold">
                          ✨ 評價此活動可獲得 50 點會員積分
                        </div>
                      )}
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
                        {order.reservedStatus === "finished" && !order.reviewed && (
                          <button className="btn btn-success text-white" onClick={() => handleReview(order)}>活動評價</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* 顯示評價 Modal */}
                {showModal && selectedOrder && <EventReviewForm order={selectedOrder} onClose={handleClose} />}
              </div>
            </div>
        ))}
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
