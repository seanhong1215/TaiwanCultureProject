import './ActivityList.scss';
import Breadcrumb from "@/frontend/components/Breadcrumb"
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/frontend/components/Datepicker/Datepicker.scss";
import { useActivityListPage } from './hooks';
import { ActivityCard } from '@/frontend/components/Card/ActivityCard';
import { CardGridSkeleton } from '@/frontend/components/Skeleton';
import EmptyState from '@/frontend/components/EmptyState';
import PageNation from "@/frontend/components/PageNation";

// 篩選用的「值」固定用中文，因為要跟資料庫記錄的活動城市／類型比對；
// 顯示給使用者看的文字才依語言翻譯（labelKey）。
const CITY_OPTIONS = [
  { value: '宜蘭', labelKey: 'cities.yilan' },
  { value: '台北', labelKey: 'cities.taipei' },
  { value: '新竹', labelKey: 'cities.hsinchu' },
  { value: '苗栗', labelKey: 'cities.miaoli' },
  { value: '台中', labelKey: 'cities.taichung' },
  { value: '雲林', labelKey: 'cities.yunlin' },
  { value: '高雄', labelKey: 'cities.kaohsiung' },
  { value: '墾丁', labelKey: 'cities.kenting' },
  { value: '屏東', labelKey: 'cities.pingtung' },
  { value: '台東', labelKey: 'cities.taitung' },
  { value: '花蓮', labelKey: 'cities.hualien' },
];

const EVENT_TYPE_OPTIONS = [
  { value: '一日行程', labelKey: 'form.oneDayItinerary' },
  { value: '特色體驗', labelKey: 'form.featuredExperiences' },
  { value: '戶外探索', labelKey: 'form.outdoorExploration' },
];

const ActivityList = () => {
  const { t } = useTranslation();
  const userId = Number(localStorage.getItem("userId"));
  const [searchInput, setSearchInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(null); // 初始值為 null
  const [selectedPrice, setSelectedPrice] = useState('');

  const [selectedCity, setSelectedCity] = useState("");  // 存放選擇的城市
  const [selectedType, setSelectedType] = useState(""); // 存放選擇的活動類型

  // dropdown
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false); // 控制地區下拉選單
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false); // 控制類型下拉選單

  const [page, setPage] = useState(1); // 頁數狀態
  const limit = 6;

  // 按下搜尋才「定案」這次要用的篩選條件；null 代表未搜尋（瀏覽全部活動）。
  // 個別欄位的即時輸入值（searchInput 等）不會直接觸發篩選。
  const [appliedFilters, setAppliedFilters] = useState(null);

  const {
    activityData,
    searchResultsData,
    isSearching,
    totalItems,
    totalPage,
    loading,
    error,
    refetch,
  } = useActivityListPage({ page, limit, appliedFilters });

  useEffect(() => {
    // 每次換頁時，讓畫面回到頂部
    window.scrollTo(0, 0);
  }, [page]);

  const getSearchInput = (value) => {
    setSearchInput(value)
  }

  const getSelectedDate = (date) => {
    setSelectedDate(date);
  };


  const getSelectedPrice = (e) => {
    setSelectedPrice(e.target.value);
  };

  const searchBtn = () => {
    setPage(1);
    const hasAnyFilter = Boolean(searchInput || selectedDate || selectedType || selectedCity || selectedPrice);
    setAppliedFilters(hasAnyFilter ? { searchInput, selectedDate, selectedType, selectedCity, selectedPrice } : null);
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

  const selectedCityLabel = CITY_OPTIONS.find((c) => c.value === selectedCity)?.labelKey;
  const selectedTypeLabel = EVENT_TYPE_OPTIONS.find((e) => e.value === selectedType)?.labelKey;

  const searchFormFields = (
    <>
      {/* 搜尋關鍵字 */}
      <div className="mb-4 modal-body-list">
        <span className="title">{t('form.keywordSearch')}</span>
        <div className="list-content">
          <span className="material-icons">search</span>
          <input type="text" className="form-control" placeholder={t('form.keyword')} value={searchInput} onChange={(e) => getSearchInput(e.target.value)}   />
        </div>
      </div>

      {/* 日期選擇 */}
       <div className="mb-3 modal-body-list">
        <span className="title">{t('form.activityDate')}</span>
        <div className="list-content">
          <span className="material-icons">today</span>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => getSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText={t('form.selectActivityDate')}
            className="date-input"
            calendarClassName="custom-calendar"
          />
        </div>
      </div>

      {/* 地區選擇 */}
      <div className="mb-3 modal-body-list">
          <span className="title">{t('form.area')}</span>
          <div className="list-content">
          <span className="material-icons">location_on</span>
          <div className="form-control-dropdown">
              {/* 選擇框 */}
              <div className={`dropdown-selected ${selectedCity ? "selected" : ""}`}  onClick={toggleDropdownCity}>
                  {selectedCityLabel ? t(selectedCityLabel) : t('form.area')}
              </div>
              {/* 下拉選單 */}
              {isCityDropdownOpen  && (
                  <ul className="dropdown-list">
                  {CITY_OPTIONS.map((city) => (
                      <li key={city.value} onClick={() => selectOptionCity(city.value)}>
                      {t(city.labelKey)}
                      </li>
                  ))}
                  </ul>
              )}
          </div>
        </div>
      </div>

      {/* 類型選擇 */}
      <div className="mb-3 modal-body-list">
        <span className="title">{t('form.eventType')}</span>
        <div className="list-content">
        <span className="material-icons">directions_walk</span>
          <div className="form-control-dropdown">
              {/* 選擇框 */}
              <div className={`dropdown-selected ${selectedCity ? "selected" : ""}`}  onClick={toggleDropdownType}>
                  {selectedTypeLabel ? t(selectedTypeLabel) : t('form.eventType')}
              </div>
              {/* 下拉選單 */}
              {isTypeDropdownOpen && (
                  <ul className="dropdown-list">
                  {EVENT_TYPE_OPTIONS.map((eventType) => (
                      <li key={eventType.value} onClick={() => selectOptionType(eventType.value)}>
                      {t(eventType.labelKey)}
                      </li>
                  ))}
                  </ul>
              )}
          </div>
        </div>
      </div>

      {/* 價格輸入 */}
      <div className="mb-4 modal-body-list">
        <span className="title">{t('form.price')}</span>
        <div className="list-content">
          <span className="material-icons">paid</span>
          <input type="text" className="form-control" placeholder={t('form.selectPriceRange')} value={selectedPrice} onChange={getSelectedPrice}/>
        </div>
      </div>
    </>
  );

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
                  {searchFormFields}
                </div>
                <div className="footer">
                  <button type="button" className="btn btn-primary" onClick={searchBtn}>{t('common.search')}</button>
                </div>
              </div>
              <div className="mobile-bar">
                <button data-bs-toggle="modal" data-bs-target="#exampleModal">
                  {t('form.filter')}
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
                          title={t('activityList.loadErrorTitle')}
                          description={t('activityList.loadErrorDescription')}
                          action={
                            <button type="button" className="btn btn-primary" onClick={refetch}>
                              {t('activityList.reload')}
                            </button>
                          }
                        />
                      </div>
                    ) : (isSearching && searchResultsData.length === 0) ? (
                      <div className="col-12">
                        <EmptyState
                          title={t('activityList.notFoundTitle')}
                          description={t('activityList.notFoundDescription')}
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
                    {(loading || error || (isSearching && searchResultsData.length === 0)) ? (
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
                  {searchFormFields}
                </div>
                <div className="footer">
                  <button type="button" className="btn btn-primary" onClick={searchBtn} data-bs-dismiss="modal">{t('common.search')}</button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityList;
