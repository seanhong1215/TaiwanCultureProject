import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './OderListPage.scss';
import Swal from 'sweetalert2';
import PageNation from "@/frontend/components/PageNation";
import EventReviewForm from '@/frontend/components/Form/EventReviewForm';
import Skeleton from "@/frontend/components/Skeleton";
import EmptyState from "@/frontend/components/EmptyState";
import { useUserOrdersQuery, useCancelOrderMutation } from './hooks';

const OrderListPage = () => {
  const [activeTab, setActiveTab] = useState('全部訂單');
  const [page, setPage] = useState(1); // 頁數狀態
  const limit = 5;
  const currentUserId = Number(localStorage.getItem("userId"));

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 搜尋功能：searchTerm 是輸入框即時值，appliedSearchTerm 只在按下
  // 搜尋／Enter 時才更新——維持原本「輸入完再搜尋」的互動方式
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');

  // 排序功能
  const [sortOption, setSortOption] = useState("排序: 最近日期");

  const { data: allOrders = [], isLoading: loading, error } = useUserOrdersQuery(currentUserId);
  const cancelOrderMutation = useCancelOrderMutation(currentUserId);

  useEffect(() => {
    if (error) {
      console.error("獲取活動資料錯誤:", error);
      Swal.fire({
        title: "資料獲取錯誤",
        text: "無法獲取訂單或活動資料",
        icon: "error",
      });
    }
  }, [error]);

  // 依標籤篩選（全部符合條件的訂單，尚未分頁）
  const orders = useMemo(() => {
    return allOrders.filter((order) => {
      if (activeTab === "已預約") return order.reservedStatus === "reserved";
      if (activeTab === "進行中") return order.reservedStatus === "in_progress";
      if (activeTab === "已取消") return order.reservedStatus === "cancel";
      if (activeTab === "已完成") return order.reservedStatus === "finished";
      return true;
    });
  }, [allOrders, activeTab]);

  const totalPage = orders.length ? Math.ceil(orders.length / limit) : 1;

  // 分頁後再排序（只排序目前這頁）
  const userOrders = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const pageSlice = orders.slice(startIndex, startIndex + limit);
    const sorted = [...pageSlice];
    if (sortOption === "排序: 最近日期") {
      sorted.sort((a, b) => new Date(b.last_bookable_date) - new Date(a.last_bookable_date));
    } else if (sortOption === "排序: 最早日期") {
      sorted.sort((a, b) => new Date(a.last_bookable_date) - new Date(b.last_bookable_date));
    }
    return sorted;
  }, [orders, page, sortOption]);

  // 在目前這頁的資料中搜尋
  const filteredOrders = useMemo(() => {
    if (!appliedSearchTerm) return [];
    const lowerCaseSearchTerm = appliedSearchTerm.toLowerCase().trim();
    return userOrders.filter(order => {
      const activityName = order.activityName?.toLowerCase() || "";
      const orderNumber = order.id?.toString().toLowerCase() || "";
      return activityName.includes(lowerCaseSearchTerm) || orderNumber.includes(lowerCaseSearchTerm);
    });
  }, [userOrders, appliedSearchTerm]);

  // 篩選出符合條件的訂單
  const ordersToRender = filteredOrders.length > 0 ? filteredOrders : userOrders;
  const showNoResults = filteredOrders.length === 0 && appliedSearchTerm !== "";

    // 處理搜尋
    const handleSearch = () => {
      setAppliedSearchTerm(searchTerm);
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

  const handleCancel = async(orderId) => {
      try {
        await cancelOrderMutation.mutateAsync(orderId);
        Swal.fire({
            title: "取消訂單成功",
            icon: "success"
          })
    } catch (error) {
        console.error("取消訂單失敗:", error);
        Swal.fire({
          title: "取消訂單失敗",
          icon: "error",
        });
    }
  }


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

        {/* 載入中：先撐出訂單卡的版面 */}
        {loading && (
          <div className="col-12" role="status" aria-busy="true">
            <span className="visually-hidden">載入中，請稍候</span>
            {Array.from({ length: 3 }, (_, index) => (
              <div className="mb-4" key={index}>
                <Skeleton height="150px" radius="8px" />
              </div>
            ))}
          </div>
        )}

        {/* 顯示沒有搜尋結果的訊息 */}
        {!loading && showNoResults && (
          <div className="col-12">
            <EmptyState
              title={`沒有符合「${appliedSearchTerm}」的訂單`}
              description="換個關鍵字，或清除搜尋看看全部訂單。"
            />
          </div>
        )}

        {/* 顯示沒有資料的訊息 */}
        {!loading && orders.length === 0 && !showNoResults && (
          <div className="col-12">
            <EmptyState
              title={`目前沒有${activeTab}的訂單`}
              description="去逛逛有哪些文化體驗活動吧。"
              action={<Link to="/activity-list" className="btn btn-primary">探索活動</Link>}
            />
          </div>
        )}

        {/* 有資料時顯示訂單 */}
        {!loading && orders.length > 0 && !showNoResults && ordersToRender.map((order) => (
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
