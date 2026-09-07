import './ActivityList.scss';
import Breadcrumb from "@/frontend/components/Breadcrumb"
import { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/frontend/components/Datepicker/Datepicker.scss";
import { getActivityAll, getActivityPage } from '@/frontend/utils/api/activity';
import { ActivityCard } from '@/frontend/components/Card/ActivityCard';
import { CardGridSkeleton } from '@/frontend/components/Skeleton';
import EmptyState from '@/frontend/components/EmptyState';
import PageNation from "@/frontend/components/PageNation";


const ActivityList = () => {
  const userId = Number(localStorage.getItem("userId"));
  const [searchResultsData, setSearchResultsData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchingValue , setSearchingValue] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // 初始值為 null
  const [selectedPrice, setSelectedPrice] = useState('');

  const [selectedCity, setSelectedCity] = useState("");  // 存放選擇的城市
  const [selectedType, setSelectedType] = useState(""); // 存放選擇的活動類型

  // dropdown
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false); // 控制地區下拉選單
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false); // 控制類型下拉選單

  const cities = ['宜蘭', '台北', '新竹', '苗栗', '台中', '雲林', '高雄', '墾丁', '屏東', '台東', '花蓮', '墾丁']; // 城市列表
  const eventTypes = ["一日行程", "特色體驗", "戶外探索"]; // 活動類型列表
  
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

      // 設定總筆數
      setTotalItems(totalItems);

      // 計算總頁數
      const totalPages = totalItems ? Math.ceil(totalItems / limit) : 1;
      setTotalPage(totalPages);

      // 獲取當前頁面的資料
      const responsePage  = await getActivityPage(page, limit)
      setActivityData(responsePage); 
      // 獲得所有資料(給搜尋用)
      setSearchData(response)

    } catch (error) {
        console.error('取得活動資料失敗:', error);
        setError('活動資料載入失敗');
    } finally {
        // 原本沒有 finally，setLoading(true) 之後永遠不會設回 false
        setLoading(false);
    }
};

  useEffect(() => {
  fetchGetActivityAll();
  // 每次換頁時，讓畫面回到頂部
  window.scrollTo(0, 0);
}, [page]);

useEffect(()=>{
  searchActivity()
  window.scrollTo(0, 0);
},[page])

  const getSearchInput = (value) => {
    setSearchInput(value)
  }
  
  const getSelectedDate = (date) => {
    setSelectedDate(date);
  };


  const getSelectedPrice = (e) => {
    setSelectedPrice(e.target.value);
  };

  
  const searchActivity = () => {
    if (!searchInput && !selectedDate && !selectedType && !selectedCity && !selectedPrice) {
      setSearchResultsData([]);
      setSearchingValue([]);
      fetchGetActivityAll();
      return;
    }
    setSearchingValue([searchInput , selectedDate , selectedType, selectedCity, selectedPrice])
    
    const searchResults = searchData.filter((item) => {
      const matchesTitle = searchInput 
      ? item.content.title.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.content.description.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.city.toLowerCase().includes(searchInput.toLowerCase()) 
      : true;
      const matchesDate =
      selectedDate ? new Date(item.startDate) >= new Date(selectedDate || "1970-01-01") && new Date(item.startDate) <= new Date(selectedDate || "2099-12-31") : true;
      const matchesType = selectedType ? item.eventType === selectedType : true;
      const matchesSite = selectedCity ? item.city === selectedCity : true;
      const matchesPrice = selectedPrice ? item.price <= selectedPrice : true;
      
      return matchesTitle && matchesDate && matchesType && matchesSite && matchesPrice;
    });

    setTotalItems(searchResults.length); // 總結果數量
    setTotalPage(Math.ceil(searchResults.length / limit)); // 總頁數
    
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    
    const paginatedResults = searchResults.slice(startIdx, endIdx);
    
    setSearchResultsData(paginatedResults); // Log the filtered results
  };

  const searchBtn = () => {
    setPage(1);
    searchActivity();
  }

  // 切換地區選單
  const toggleDropdownCity = () => {
    setIsCityDropdownOpen((prev) => !prev);
    setIsTypeDropdownOpen(false); // 確保另一個選單關閉
};

// 選擇城市
const selectOptionCity = (city) => {
    setSelectedCity(city);
    setIsCityDropdownOpen(false); // 選擇後關閉選單
};

// 切換類型選單
const toggleDropdownType = () => {
    setIsTypeDropdownOpen((prev) => !prev);
    setIsCityDropdownOpen(false); // 確保另一個選單關閉
};

// 選擇活動類型
const selectOptionType = (eventType) => {
    setSelectedType(eventType);
    setIsTypeDropdownOpen(false); // 選擇後關閉選單
};
  

  return (
    <div className="blog-container">
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
                   <div className="mb-3 modal-body-list">
                    <span className="title">活動日期</span>
                    <div className="list-content">
                      <span className="material-icons">today</span>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => getSelectedDate(date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="請選擇活動日期"
                        className="date-input"
                        calendarClassName="custom-calendar"
                      />
                    </div>
                  </div>

                  {/* 地區選擇 */}
                  <div className="mb-3 modal-body-list">
                      <span className="title">地區</span>
                      <div className="list-content">
                      <span className="material-icons">location_on</span>
                      <div className="form-control-dropdown">
                          {/* 選擇框 */}
                          <div className={`dropdown-selected ${selectedCity ? "selected" : ""}`}  onClick={toggleDropdownCity}>
                              {selectedCity || '地區'}
                          </div>
                          {/* 下拉選單 */}
                          {isCityDropdownOpen  && (
                              <ul className="dropdown-list">
                              {cities.map((city, index) => (
                                  <li key={index} onClick={() => selectOptionCity(city)}>
                                  {city}
                                  </li>
                              ))}
                              </ul>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* 類型選擇 */}
                  <div className="mb-3 modal-body-list">
                    <span className="title">類型</span>
                    <div className="list-content">
                    <span className="material-icons">directions_walk</span>
                      <div className="form-control-dropdown">
                          {/* 選擇框 */}
                          <div className={`dropdown-selected ${selectedCity ? "selected" : ""}`}  onClick={toggleDropdownType}>
                              {selectedType || '類型'}
                          </div>
                          {/* 下拉選單 */}
                          {isTypeDropdownOpen && (
                              <ul className="dropdown-list">
                              {eventTypes.map((eventType, index) => (
                                  <li key={index} onClick={() => selectOptionType(eventType)}>
                                  {eventType}
                                  </li>
                              ))}
                              </ul>
                          )}
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
                  
                    {/* 載入中先用骨架屏撐出版面，避免整片空白讓人以為壞掉 */}
                    {loading ? (
                      <CardGridSkeleton count={6} />
                    ) : error ? (
                      <div className="col-12">
                        <EmptyState
                          title={error}
                          description="請檢查網路連線後重試。"
                          action={
                            <button type="button" className="btn btn-primary" onClick={fetchGetActivityAll}>
                              重新載入
                            </button>
                          }
                        />
                      </div>
                    ) : (searchResultsData.length === 0 && searchingValue.length > 0) ? (
                      <div className="col-12">
                        <EmptyState
                          title="找不到符合條件的活動"
                          description="試著放寬搜尋條件，或清除篩選看看所有活動。"
                        />
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
                    {/* 載入中或查無結果時不顯示分頁 */}
                    {(loading || error || (searchResultsData.length === 0 && searchingValue.length > 0)) ? (
                      ""
                    ) : (
                      <div className="col-12">
                        {/* Render Pagination only if there are results */}
                        {totalPage > 0 && totalItems >= limit && <PageNation totalPage={totalPage} page={page} setPage={setPage} />}
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
                 <div className="mb-3 modal-body-list">
                    <span className="title">活動日期</span>
                    <div className="list-content">
                      <span className="material-icons">today</span>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => getSelectedDate(date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="請選擇活動日期"
                        className="date-input"
                        calendarClassName="custom-calendar"
                      />
                    </div>
                  </div>

                  {/* 地區選擇 */}
                  <div className="mb-3 modal-body-list">
                      <span className="title">地區</span>
                      <div className="list-content">
                      <span className="material-icons">location_on</span>
                      <div className="form-control-dropdown">
                          {/* 選擇框 */}
                          <div className={`dropdown-selected ${selectedCity ? "selected" : ""}`}  onClick={toggleDropdownCity}>
                              {selectedCity || '地區'}
                          </div>
                          {/* 下拉選單 */}
                          {isCityDropdownOpen  && (
                              <ul className="dropdown-list">
                              {cities.map((city, index) => (
                                  <li key={index} onClick={() => selectOptionCity(city)}>
                                  {city}
                                  </li>
                              ))}
                              </ul>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* 類型選擇 */}
                  <div className="mb-3 modal-body-list">
                    <span className="title">類型</span>
                    <div className="list-content">
                    <span className="material-icons">directions_walk</span>
                      <div className="form-control-dropdown">
                          {/* 選擇框 */}
                          <div className={`dropdown-selected ${selectedCity ? "selected" : ""}`}  onClick={toggleDropdownType}>
                              {selectedType || '類型'}
                          </div>
                          {/* 下拉選單 */}
                          {isTypeDropdownOpen && (
                              <ul className="dropdown-list">
                              {eventTypes.map((eventType, index) => (
                                  <li key={index} onClick={() => selectOptionType(eventType)}>
                                  {eventType}
                                  </li>
                              ))}
                              </ul>
                          )}
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