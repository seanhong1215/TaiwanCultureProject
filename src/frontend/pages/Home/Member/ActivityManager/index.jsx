import React, { useState, useEffect } from 'react';
import { getActivityAll, getActivityPage } from '@/frontend/utils/api/activity';
import { getNotifications } from '@/frontend/utils/api/notification';
import { useNavigate } from "react-router-dom";
import PageNation from "@/frontend/components/PageNation";
import './ActivityManager.scss';
import { Badge, Button } from "react-bootstrap";

const ActivityManager = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [activities , setActivities] = useState([]);

  const [totalPage , setTotalPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // 訂單總筆數
  const [page, setPage] = useState(1); // 頁數狀態
  const limit = 5;

  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  const [searchQuery, setSearchQuery] = useState(""); // 搜尋關鍵字
  const [sortOrder, setSortOrder] = useState("desc"); // 預設為價格高至低
  const [filteredActivities, setFilteredActivities] = useState([]);

  // 處理查看詳情
  const handleViewDetails = (activityId) => {
    navigate(`/activity-list/${activityId}`);
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success bg-opacity-25 text-success';
      case 'upcoming':
        return 'bg-custom-primary bg-opacity-25 text-primary';
      default:
        return 'bg-secondary bg-opacity-25 text-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'upcoming':
        return '即將參加';
      default:
        return '未知狀態';
    }
  };

  // 處理搜尋
  const handleSearch = () => {  
    setSearchQuery(searchQuery);
  }

  useEffect(() => {
    // 獲取所有活動資料並設定活動數量和頁數
    const fetchData = async () => {
      try {
        const response = await getActivityAll();  // 獲取所有活動資料
        setActivities(response);  // 設置活動資料
        const totalItems = response.length;  // 計算活動總數
        setTotalItems(totalItems);
  
        const totalPages = Math.ceil(totalItems / limit); // 計算總頁數
        setTotalPage(totalPages);
  
        // 獲取當前頁面的資料
        const responsePage = await getActivityPage(page, limit);
        setFilteredActivities(responsePage);  // 更新過濾後的活動資料
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchData();
    window.scrollTo(0, 0); // 每次換頁時，讓畫面回到頂部
  }, [page]);  // 只依賴於頁面變動，獲取資料和更新活動

useEffect(() => {
  const fetchData = async() => {
    const res = await getNotifications();
    setNotifications(res);
  }
  fetchData();
}, []);

// 更新活動資料的過濾、排序邏輯
useEffect(() => {
  const filterActivities = () => {
    let filtered = activities;

    // 根據 activeTab 篩選活動
    switch (activeTab) {
      case 'upcoming':
        filtered = activities.filter(o => o.status === 'upcoming');
        break;
      case 'completed':
        filtered = activities.filter(o => o.status === 'completed');
        break;
      default:
        filtered = activities;
    }

    // 根據搜尋條件篩選活動
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(activity =>
        activity.content?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 根據排序條件排序活動
    filtered.sort((a, b) => {
      return sortOrder === "desc" ? b.price - a.price : a.price - b.price;
    });

    return filtered;
  };

  // 進行篩選和計算
  const filtered = filterActivities();
  setFilteredActivities(filtered);

  // 更新分頁資料
  const totalItems = filtered.length;
  const totalPages = totalItems ? Math.ceil(totalItems / limit) : 1;
  setTotalPage(totalPages);
}, [activities, activeTab, searchQuery, sortOrder, limit]); // 根據活動資料、篩選條件變化時更新


  return (
    <div className="page-container activityManager">

      {/* 頁面標題 */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-lg-row flex-column gap-3">
        <h2 className="fw-bold">活動管理</h2>
        <Button
          onClick={() => navigate("/member-center/notifications")}
          className="position-relative btn-custom-primary"
        >
      <span className="material-icons fs-3">notifications_active</span>
      
      {notifications.length > 0 && (
        <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle">
          {notifications.length}
        </Badge>
      )}
    </Button>
      </div>

      {/* 分頁標籤 */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            全部活動
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            歷史活動
          </button>
        </li>
      </ul>

      {/* 篩選和搜尋 */}
      <div className="d-flex justify-content-between mb-4 flex-lg-row flex-column gap-3">
        <select 
          className="form-select w-auto" 
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">排序: 價格高至低</option>
          <option value="asc">排序: 價格低至高</option>
        </select>

        <div className="input-group w-auto">
          <input 
            type="text" 
            className="form-control" 
            placeholder="搜尋活動..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            <span className="material-icons">search</span>
          </button>
        </div>
      </div>

      {/* 活動列表 */}
      {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="card mb-3 shadow-sm">
              <div className="card-body">
                <div className="row">
                  {/* 活動圖片 */}
                  <div className="col-md-4 col-sm-3 mb-3 mb-sm-0">
                    <img 
                      src={activity.images} 
                      alt={activity.content?.title}
                      className="img-fluid rounded"
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                    />
                  </div>
                  
                  {/* 活動詳情 */}
                  <div className="col-md-8 col-sm-9">
                    <div className="d-flex flex-column h-100">
                      <h5 className="card-title fw-bold mb-2">{activity.content?.title}</h5>
                      
                      <div className="card-text text-muted mb-3">
                        <div>參加日期: {activity.startDate}</div>
                        <div>價格: NT$ {activity.price.toLocaleString()}</div>
                      </div>
                      
                      <div className="d-flex justify-content-between mt-auto">
                        <span className={`badge rounded-pill ${getStatusBadgeClasses(activity.status)} px-3 py-3`}>
                          {getStatusText(activity.status)}
                        </span>
                        
                        <div className="d-flex gap-2">
                          <button 
                            className="btn bg-custom-outline-primary"
                            onClick={() => handleViewDetails(activity.id)}
                          >
                            查看詳情
                          </button>
                        </div>
                      </div>
        
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
      ) : (
        
        <p className="text-center text-muted">目前沒有符合條件的活動</p>
)}

      <div className="row">
              <div className="col-12 mb-4">
              {/* 只有在有活動且總頁數大於 1 才顯示分頁 */}
        {filteredActivities.length > 0 && totalPage > 1 && (
          <PageNation totalPage={totalPage} page={page} setPage={setPage} />
        )}
              </div>
      </div>

    </div>
  )
};

export default ActivityManager;