import React from "react";
import './ActivityList.scss';
import Breadcrumb from "@/frontend/components/Breadcrumb"
import { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/frontend/components/DatePicker/DatePicker.scss";
import { getActivityAll, getActivityPage } from '@/frontend/utils/api';
import Swal from 'sweetalert2';
import { ActivityCard } from '@/frontend/components/Card/ActivityCard';
import PageNation from "@/frontend/components/PageNation";


const ActivityList = () => {
  const userId = Number(localStorage.getItem("userId"));
  const [searchResultsData, setSearchResultsData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchingValue , setSearchingValue] = useState([]);
  const [selectedStartDate, SelectedStartDate] = useState('');
  const [selectedEndDate, SelectedEndDate] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');

 const [totalPage , setTotalPage] = useState(1);
 const [totalItems, setTotalItems] = useState(0); // 訂單總筆數
  const [page, setPage] = useState(1); // 頁數狀態
  const limit = 6;

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGetActivityAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // 先獲取所有資料
      const response  = await getActivityAll();
      const totalItems = response.length; // 直接計算總筆數

      // 設定總筆數與頁數
      setTotalItems(totalItems);
      setTotalPage(totalItems ? Math.ceil(totalItems / limit) : 1);

      // 儲存完整資料
      setActivityData(response);
      setSearchData(response); // 預設搜尋資料為全部

      // 設定當前頁面應顯示的資料
      const startIdx = (page - 1) * limit;
      const endIdx = startIdx + limit;
      setSearchResultsData(response.slice(startIdx, endIdx));

      // 獲取當前頁面的資料
      // const responsePage  = await getActivityPage(page, limit)
      // setActivityData(responsePage); 
      // setSearchData(responsePage)

    } catch (error) {
        setError('Error fetching activity:', error);
    } 
};

//   useEffect(() => {
//   fetchGetActivityAll();
//   // 每次換頁時，讓畫面回到頂部
//   window.scrollTo(0, 0);
// }, [page , limit]);

useEffect(() => {
  if (searchingValue.length > 0) {
      searchActivity(page); // 如果有搜尋條件，則使用搜尋分頁
  } else {
    fetchGetActivityAll(page); // 否則獲取一般分頁
  }
  window.scrollTo(0, 0);
}, [page]); // 當 `page` 變更時執行


  const getSearchInput = (value) => {
    setSearchInput(value)
  }
  
  const getSelectedStartDate = (e) => {
    SelectedStartDate(e.target.value)
  };

  const getSelectedEndDate = (e) => { 
    SelectedEndDate(e.target.value);
  };

  const getSelectedType = (e) => {
    setSelectedType(e.target.value);
  };

  const getSelectedSite = (e) => {
    setSelectedSite(e.target.value);
  };

  const getSelectedPrice = (e) => {
    setSelectedPrice(e.target.value);
  };

  
  const searchActivity = (pageNumber = 1) => {
    if (!searchInput && !selectedStartDate && !selectedEndDate && !selectedType && !selectedSite && !selectedPrice) {
      setSearchResultsData([]);
      setSearchingValue([]);
      fetchGetActivityAll();
      return;
    }
    setSearchingValue([searchInput , selectedStartDate , selectedType, selectedEndDate, selectedSite, selectedPrice])
    
    const searchResults = searchData.filter((item) => {
      const matchesTitle = searchInput ? item.content?.title?.match(new RegExp(searchInput, 'i')) : true;
      const matchesDate =
      selectedStartDate || selectedEndDate
                ? new Date(item.startDate) >= new Date(selectedStartDate || "1970-01-01") &&
                new Date(item.startDate) <= new Date(selectedEndDate || "2099-12-31")
                : true;
      const matchesType = selectedType ? item.eventType === selectedType : true;
      const matchesSite = selectedSite ? item.city === selectedSite : true;
      const matchesPrice = selectedPrice ? item.price <= selectedPrice : true;
      
      return matchesTitle && matchesDate && matchesType && matchesSite && matchesPrice;
    });

    // 計算總頁數
    setTotalPage(Math.ceil(searchResults.length / limit));

    // 依據 pageNumber 取 6 筆資料
    const startIdx = (pageNumber - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedResults = searchResults.slice(startIdx, endIdx);

    setSearchResultsData(paginatedResults);
  };

  const searchBtn = () => {
    setPage(1); // 每次搜尋時回到第 1 頁
    searchActivity(1);
  }


  return (
    <div className="test-container">
      <div className="content">
        <div className="container">
          {/* 麵包屑 */}
          <Breadcrumb />
          <div className="row">
            <div className="col-lg-3 col-12">
              <div className="left-searchBar">
                <div className="body">
                  {/* 搜尋關鍵字 */}
                  <div className="mb-4 modal-body-list">
                    <span className="title">關鍵字搜尋</span>
                    <div className="list-content">
                      <span className="material-icons">search</span>
                      <input type="text" className="form-control" placeholder="搜尋關鍵字" value={searchInput} onChange={(e) => getSearchInput(e.target.value)}   />
                    </div>
                  </div>
                  {/* 日期選擇 */}
                  <div className="mb-4 modal-body-list">
                    <span className="title">起始日期</span>
                    <div className="list-content">
                      <span className="material-icons">today</span>
                      <div className="react-datepicker-wrapper">
                        <div className="react-datepicker__input-container">
                          <input type="date" placeholder="請選擇開始日期" className="date-input" value={selectedStartDate} onChange={getSelectedStartDate}/>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 modal-body-list">
                    <span className="title">結束日期</span>
                    <div className="list-content">
                      <span className="material-icons">today</span>
                      <div className="react-datepicker-wrapper">
                        <div className="react-datepicker__input-container">
                          <input type="date" placeholder="請選擇結束日期" className="date-input" value={selectedEndDate} onChange={getSelectedEndDate} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 類型選擇 */}
                  <div className="mb-4 modal-body-list">
                    <span className="title">活動類型</span>
                    <div className="list-content">
                      <span className="material-icons">directions_walk</span>
                      <div className="form-control-dropdown">
                        {/* <div className="dropdown-selected ">類型</div> */}
                        <select name="" id="" className="dropdown-selected " value={selectedType} onChange={getSelectedType}>
                          <option value="">請選擇活動類型</option>
                          <option value="一日行程">一日行程</option>
                          <option value="特色體驗">特色體驗</option>
                          <option value="戶外探索">戶外探索</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* 價格輸入 */}
                  <div className="mb-4 modal-body-list">
                    <span className="title">價格</span>
                    <div className="list-content">
                      <span className="material-icons">paid</span>
                      <input type="text" className="form-control" placeholder="請選擇價格區間" value={selectedPrice} onChange={getSelectedPrice}/>
                    </div>
                  </div>
                  {/* 地區選擇 */}
                  <div className="mb-4 modal-body-list">
                    <span className="title">地區</span>
                    <div className="list-content">
                      <span className="material-icons">location_on</span>
                      <div className="form-control-dropdown">
                        <select name="" id="" className="dropdown-selected " value={selectedSite} onChange={getSelectedSite}>
                          <option value="">請選擇地區</option>
                          <option value="宜蘭">宜蘭</option>
                          <option value="台北">台北</option>
                          <option value="新竹">新竹</option>
                          <option value="苗栗">苗栗</option>
                          <option value="台中">台中</option>
                          <option value="雲林">雲林</option>
                          <option value="高雄">高雄</option>
                          <option value="墾丁">墾丁</option>
                          <option value="屏東">屏東</option>
                          <option value="台東">台東</option>
                          <option value="花蓮">花蓮</option>
                          <option value="墾丁">墾丁</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="footer">
                  <button type="button" className="btn btn-primary" onClick={searchBtn}>搜尋</button>
                </div>
              </div>
              <div className="mobile-bar">
                <button data-bs-toggle="modal" data-bs-target="#exampleModal">
                  篩選
                  <span className="material-icons">keyboard_arrow_down</span>
                </button>
              </div>
            </div>
            <div className="col-lg-9 col-12">
              <div className="right-content">
                <div className="row main-body">
                  
                    {/* Check if no search results and there are search criteria */}
                    {(searchResultsData.length === 0 && searchingValue.length > 0) ? (
                      <div className="col-12">
                        <p>No activities found.</p>
                      </div>
                    ) : (
                      // If there are search results, show them; otherwise, show all activities
                      (searchResultsData.length > 0 ? searchResultsData : activityData).map((activity, index) => (
                        <div className="col-md-6 col-lg-4" key={index}>
                          <ActivityCard
                              activity={activity}
                              userId={userId}
                              isCollectedPage={false}
                              onToggleFavorite = {()=>{}}
                          />
                        </div>
                      ))
                    )}
                </div>
                <div className="row">
                    {/* Check if no search results and there are search criteria */}
                    {(searchResultsData.length === 0 && searchingValue.length > 0) ? (
                      ""
                    ) : (
                      <div className="col-12">
                        {/* Render Pagination only if there are results */}
                        {totalPage > 1 && totalItems >= limit && <PageNation totalPage={totalPage} page={page} setPage={setPage} />}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
          <div className="left-searchBar">
                <div className="body">
                  {/* 搜尋關鍵字 */}
                  <div className="mb-4 modal-body-list">
                    <span className="title">關鍵字搜尋</span>
                    <div className="list-content">
                      <span className="material-icons">search</span>
                      <input type="text" className="form-control" placeholder="搜尋關鍵字" value={searchInput} onChange={(e) => getSearchInput(e.target.value)}   />
                    </div>
                  </div>
                  {/* 日期選擇 */}
                  <div className="mb-4 modal-body-list">
                    <span className="title">起始日期</span>
                    <div className="list-content">
                      <span className="material-icons">today</span>
                      <div className="react-datepicker-wrapper">
                        <div className="react-datepicker__input-container">
                          <input type="date" placeholder="請選擇開始日期" className="date-input" value={selectedStartDate} onChange={getSelectedStartDate}/>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 modal-body-list">
                    <span className="title">結束日期</span>
                    <div className="list-content">
                      <span className="material-icons">today</span>
                      <div className="react-datepicker-wrapper">
                        <div className="react-datepicker__input-container">
                          <input type="date" placeholder="請選擇結束日期" className="date-input" value={selectedEndDate} onChange={getSelectedEndDate} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 類型選擇 */}
                  <div className="mb-4 modal-body-list">
                    <span className="title">活動類型</span>
                    <div className="list-content">
                      <span className="material-icons">directions_walk</span>
                      <div className="form-control-dropdown">
                        {/* <div className="dropdown-selected ">類型</div> */}
                        <select name="" id="" className="dropdown-selected " value={selectedType} onChange={getSelectedType}>
                          <option value="">請選擇活動類型</option>
                          <option value="一日行程">一日行程</option>
                          <option value="特色體驗">特色體驗</option>
                          <option value="戶外探索">戶外探索</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* 價格輸入 */}
                  <div className="mb-4 modal-body-list">
                    <span className="title">價格</span>
                    <div className="list-content">
                      <span className="material-icons">paid</span>
                      <input type="text" className="form-control" placeholder="請選擇價格區間" value={selectedPrice} onChange={getSelectedPrice}/>
                    </div>
                  </div>
                  {/* 地區選擇 */}
                  <div className="mb-4 modal-body-list">
                    <span className="title">地區</span>
                    <div className="list-content">
                      <span className="material-icons">location_on</span>
                      <div className="form-control-dropdown">
                        <select name="" id="" className="dropdown-selected " value={selectedSite} onChange={getSelectedSite}>
                          <option value="">請選擇地區</option>
                          <option value="台北">台北</option>
                          <option value="台中">台中</option>
                          <option value="高雄">高雄</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="footer">
                  <button type="button" className="btn btn-primary" onClick={searchBtn} data-bs-dismiss="modal">搜尋</button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityList;