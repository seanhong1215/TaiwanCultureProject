import React, { useState, useEffect } from 'react';
import { getActivityAll, getActivityPage } from '@/frontend/utils/api';
import { useNavigate } from "react-router-dom";
import PageNation from "@/frontend/components/PageNation";
import './ActivityManager.scss';

const ActivityManager = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [activities , setActivities] = useState([]);

  const [totalPage , setTotalPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // 訂單總筆數
  const [page, setPage] = useState(1); // 頁數狀態
  const limit = 10;

  const navigate = useNavigate();


  // 處理查看詳情
  const handleViewDetails = (activityId) => {
    navigate(`/activity-list/${activityId}`);
  };

  // 根據標籤篩選活動
  const filterActivities = () => {
    switch (activeTab) {
      case 'upcome':
        return orders.filter(o => o.status === 'upcome');
      case 'ended':
        return orders.filter(o => o.status === 'ended');
      default:
        return activities;
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success bg-opacity-25 text-success';
      case 'upcoming':
        return 'bg-primary bg-opacity-25 text-primary';
      case 'canceled':
        return 'bg-danger bg-opacity-25 text-danger';
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
      case 'canceled':
        return '已取消';
      default:
        return '未知狀態';
    }
  };

  // 處理搜尋
  const handleSearch = () => {
    console.log("搜尋");
  }

  useEffect(() => {
    const EventManagement = async () => {
       try{
          // 先獲取所有資料
          const response  = await getActivityAll();
          const totalItems = response.length; // 直接計算總筆數
      
          // 設定總筆數
          setTotalItems(totalItems);
      
          // 計算總頁數
          const totalPages = totalItems ? Math.ceil(totalItems / limit) : 1;
          setTotalPage(totalPages);
      
          // 獲取當前頁面的資料
          const responsePage  = await getActivityPage(page, limit)
          setActivities(responsePage); 
      
      
      
          } catch(error){
              console.log(error);
          }
    }



    EventManagement();
    // 每次換頁時，讓畫面回到頂部
  window.scrollTo(0, 0);
}, [page, limit]); 

  return (
    <div className="page-container activityManager">
      {/* <h2 className="text-center">店家活動管理</h2> */}

      {/* 頁面標題 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">活動管理</h2>
      </div>

      {/* 分頁標籤 */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            全部活動
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'ended' ? 'active' : ''}`}
            onClick={() => setActiveTab('ended')}
          >
            歷史活動
          </button>
        </li>
      </ul>

      {/* 篩選和搜尋 */}
      <div className="d-flex justify-content-between mb-4">
        <select className="form-select w-auto">
          <option>排序: 價格高至低</option>
          <option>排序: 價格低至高</option>
        </select>

        <div className="input-group w-auto">
          <input 
            type="text" 
            className="form-control" 
            placeholder="搜尋活動..."
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            <span className="material-icons">search</span>
          </button>
        </div>
      </div>

      {/* 活動列表 */}
      {filterActivities().map(activity => (
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
      ))}
      <div className="row">
              <div className="col-12 mb-4">
                {/* Render Pagination only if there are results */}
                {totalPage > 0 && totalItems >= limit && <PageNation totalPage={totalPage} page={page} setPage={setPage} />}
              </div>
      </div>
    </div>
  )
};

export default ActivityManager;