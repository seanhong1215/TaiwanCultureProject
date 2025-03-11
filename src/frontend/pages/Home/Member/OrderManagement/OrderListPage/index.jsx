import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrderAll, getOrderPage, getActivityAll, updateOrder } from '@/frontend/utils/api';
import './OderListPage.scss';
import Swal from 'sweetalert2';
import PageNation from "@/frontend/components/PageNation";

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [userOrders, setUserOrders] = useState([]); // 用來存儲過濾後的使用者訂單

  const [totalPage , setTotalPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // 訂單總筆數
  const [page, setPage] = useState(1); // 頁數狀態
  const limit = 5;

  const currentUserId = Number(localStorage.getItem("userId"));



   // 標籤狀態
  const [activeTab, setActiveTab] = useState('已預約');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const isOngoing = (activityPeriod, timeSlot) => {
    const now = new Date();
    const dateTime = `${activityPeriod.startDate} ${timeSlot}`;
    return now >= dateTime;
  };


  // 根據標籤篩選訂單
  const filterOrdersByTab = (orders) => {
    return orders.map(order =>
      isOngoing(order.activityPeriod, order.timeSlot)
        ? { ...order, reservedStatus: "in_progress" }
        : order
    ).filter(order => {
      switch (activeTab) {
        case "已預約":
          return order.reservedStatus === "reserved";
        case "進行中":
          return order.reservedStatus === "in_progress";
        case "已取消":
          return order.reservedStatus === "cancel";
        case "已結束":
          return order.reservedStatus === "ended";
        default:
          return true;
      }
    });
  };

    // 時間格式化
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW');
  };

  const isEnded = (activityPeriod, timeSlot) => {
    const [_, endTime] = timeSlot.split("-");
    const now = new Date();
    const endDateTime = new Date(`${activityPeriod.endDate}T${endTime}`);
    return now > endDateTime;
  };

  // const updateOrder = async (orderId, data) => {
  //   try {
  //     await updateOrder(orderId, data);
  //   } catch (error) {
  //     console.error("更新訂單狀態失敗", error);
  //   }
  // };

  const handleCancel = async(orderId) => {
    await updateOrder(orderId, {reservedStatus: "cancel"});
    Swal.fire({
        title: "取消訂單成功",
        icon: "success"
      })
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, reservedStatus: "cancel" } : order
      )
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 獲取分頁訂單資料，並取得 totalItems
      const responseOrder = await getOrderAll();
      const totalItems = responseOrder.length; // 計算總筆數

      // 設定總筆數
      setTotalItems(totalItems);
      
      // 計算總頁數
      const totalPages = totalItems ? Math.ceil(totalItems / limit) : 1;
      setTotalPage(totalPages);
      
      // 獲取所有活動資料
      const responseActivity = await getActivityAll();
      const responseOrderPage = await getOrderPage(page, limit);


      // 將活動資料和圖片合併到訂單資料
      const updatedOrders = responseOrderPage.map(order => {
        const activity = responseActivity.find(
          activity => activity.id === order.activityId
        );
        return { ...order, activity };
      });

      setOrders(updatedOrders);

      // 根據 userId 過濾訂單
      const userOrders = responseOrder.filter(order => order.userId === currentUserId);
      // 設定過濾後的使用者訂單
      setUserOrders(userOrders);

      } catch (err) {
      console.log("獲取活動資料錯誤:", err);
      } 
  };

  fetchData();
  }, []);

  // useEffect(() => {
  //   const updateOrderStatus = async() => {
  //     await fetchData(); // 取得最新訂單
  //     setOrders((prevOrders) =>
  //       prevOrders.map((order) => {
  //         if (isOngoing(order.activityPeriod, order.timeSlot)) {
  //           return { ...order, reservedStatus: "in_progress" };
  //         } else if (isEnded(order.activityPeriod, order.timeSlot)) {
  //           updateOrder(order.id, { reservedStatus: "ended" });
  //           return { ...order, reservedStatus: "ended" };
  //         }
  //         return order;
  //       })
  //     );
  //   };
    
  //   updateOrderStatus();
  //   const interval = setInterval(updateOrderStatus, 60000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="page-container order-list-page">
        <div className="container">
      <h2 className="mb-4 text-center">我的訂單</h2>
      
      {/* 標籤導航 */}
      <ul className="nav nav-tabs mb-4">
        {['已預約', '進行中', '已取消'].map(tab => (
          <li className="nav-item" key={tab}>
            <button 
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>
      
      {/* 訂單列表 */}
      <div className="row">
        {filterOrdersByTab(userOrders).length > 0 ? (
          filterOrdersByTab(userOrders).map(order => (
            <div className="col-lg-12 mb-4" key={order.id}>
              <div className="card h-100 shadow-sm">
                <div className="row g-0">
                  <div className="col-lg-5">
                    <div className="h-100 d-flex align-items-center justify-content-center">
                      <img
                        src={order.actImage}
                        // alt={order.activity.name}
                        className="card-img order-img"
                      />
                    </div>
                  </div>
                  <div className="col-lg-7">
                    <div className="card-body d-flex flex-column h-100">
                      <h5 className="card-title">{order.activityName}</h5>
                      <p className="card-text mb-1">預約時間: {order.activityPeriod.startDate} {order.timeSlot}</p>
                      <p className="card-text mb-2">訂單編號: {order.id}</p>
                      <div className="mt-auto text-center text-md-end">
                        <Link to={`/member-center/order-management/detail/${order.id}`} className="btn btn-sm custom-btn">查看詳情</Link>
                        {order.reservedStatus !== "cancel" && (
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
            <p className="text-muted">目前沒有{activeTab}的訂單</p>
          </div>
        )}
      </div>
      <div className="row">
        <div className="col-12">
          {/* Render Pagination only if there are results */}
          {totalPage > 0 && userOrders.length >= limit && <PageNation totalPage={totalPage} page={page} setPage={setPage} />}
        </div>
      </div>
    </div>
    </div>
    
  );
};

export default OrderListPage;


