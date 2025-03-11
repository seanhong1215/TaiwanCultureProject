import { ReviewCard } from '@/frontend/components/Card/ReviewCard';
import { BlogCard } from '@/frontend/components/Card/BlogCard';
import { ActivityCard } from '@/frontend/components/Card/ActivityCard';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { getActivityAll, getJournalAll, getReviewAll } from '@/frontend/utils/api';
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import DatePicker from "react-datepicker";
import beach from '@/frontend/assets/images/choosing/beach.svg';
import communication from '@/frontend/assets/images/choosing/communication.svg';
import fishing from '@/frontend/assets/images/choosing/fishing.svg';
import travel from '@/frontend/assets/images/choosing/travel.svg';
import "react-datepicker/dist/react-datepicker.css";
import "@/frontend/components/DatePicker/DatePicker.scss"; 
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import './HomePage.scss';


const HomePage = () => {
    const [activityData, setActivityData] = useState([]);
    const [journalData, setJournalData] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);

    const userId = Number(localStorage.getItem("userId"));


    // input value
    const [isSearchVisible, setIsSearchVisible] = useState(true);

    // 搜尋功能
    const handleOpenModalSearch = () => setShowSearchModal(true);
    const handleCloseModalSearch = () => {
        resetForm();
        setShowSearchModal(false)
    };

    // 轉址功能
    const navigate = useNavigate();
    const handleNavigate = () => {
        navigate("/activity-list");
        window.scrollTo({ top: 0, behavior: "smooth" }); // 滑動到最上方
    };
    
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedCity, setSelectedCity] = useState("");  // 存放選擇的城市
    const [selectedType, setSelectedType] = useState(""); // 存放選擇的活動類型
    const [price, setPrice] = useState("");
    const [keyword, setKeyword] = useState("");
    const [filteredData, setFilteredData] = useState([]); // 篩選後的資料
    const [loading, setLoading] = useState(false);  
    
    // dropdown
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false); // 控制地區下拉選單
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false); // 控制類型下拉選單
    
    const cities = ["台北", "台中", "高雄"]; // 城市列表
    const eventTypes = ["一日行程", "特色體驗", "戶外探索"]; // 活動類型列表

    // back to top
    const [showButton, setShowButton] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
          behavior: "smooth", // 平滑滾動效果
        });
    };

    useEffect(() => {
        fetchGetActivity();
        fetchgetJournalAll();
        fetchReviews();

        const handleScroll = () => {
            if (window.scrollY > 300) {
            setShowButton(true);
            } else {
            setShowButton(false);
            }
        };
    
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []); // 空陣列表示只在組件加載時呼叫一次

    useEffect(() => {
        if (showSearchModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [showSearchModal]);

    const fetchGetActivity = async () => {
        setLoading(true);
        setError(null);
        try {
            const response  = await getActivityAll(); 
            const result = response.slice(0, 3); // 只取前三筆
            setActivityData(result); 
            setFilteredData(result); // 預設顯示全部資料
        } catch (error) {
            setError('Error fetching activity:', error);
        } 
    };
    const fetchgetJournalAll = async () => {
        setLoading(true);
        try {
            const response  = await getJournalAll(); 
            setJournalData(response); 
        } catch (error) {
            setError('Error fetching journal:', error);
        } finally {
            setLoading(false);
        }
    };
    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await getReviewAll();
            const result = response.slice(0, 6); // 只取前六筆
            setReviews(result); 
        } catch (error) {
            setError('Error fetching reviews:', error);
        }finally {
            setLoading(false);
        }
    };

     // 處理搜尋邏輯
    const handleSearch = () => {
        const filteredResults = activityData.filter((item) => {
            const matchCity = selectedCity ? item.city.includes(selectedCity) : true;
            const matchEventType = selectedType ? item.eventType.includes(selectedType) : true;
            const matchDate =
            startDate || endDate
                ? new Date(item.date) >= new Date(startDate || "1970-01-01") &&
                new Date(item.date) <= new Date(endDate || "2099-12-31")
                : true;
            const matchKeyword =
            keyword ? item.content.title.includes(keyword) || item.content.description.includes(keyword) : true;

            return matchCity && matchEventType && matchDate && matchKeyword;
        });

        setFilteredData(filteredResults);
        setShowSearchModal(false);
        resetForm();
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setKeyword(value);
    };

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

     // 重設表單資料
    const resetForm = () => {
        setSelectedCity("");
        setSelectedType("");
        setStartDate("");
        setEndDate("");
        setPrice("");
        setKeyword("");
    };


    const { t } = useTranslation();

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }
    
    return (
        <div className="home">
            <section className="banner-section">
                <div className="container">
                    <h2 className="banner-section-title" dangerouslySetInnerHTML={{ __html: t('searchViewInfo') }}></h2>
                    <div className="search-wrapper">
                        <div className="search-input-group">
                            <div className="search-input-wrap">
                            {isSearchVisible &&<span className="material-icons search-icon">search</span>}
                                <input 
                                    type="text" 
                                    className="search-input form-control" 
                                    placeholder={t('banner.searchPlacehoder')}
                                    value={keyword}
                                    onChange={handleInputChange}
                                    />
                            </div>
                            <div className="search-button-more-wrap" onClick={handleOpenModalSearch}>
                                <span className="material-icons search-button-more">tune</span>
                            </div>
                            <span className="material-icons search-button" onClick={handleSearch}>search</span>
                        </div>
                        <div className="quick-filters">
                            <span className="quick-filter">{t('banner.taichung')}</span>
                            <span className="quick-filter">{t('banner.taipei')}</span>
                            <span className="quick-filter">{t('banner.kaohsiung')}</span>
                            <span className="quick-filter">{t('banner.tainan')}</span>
                        </div>
                    </div>
                    {/* 搜尋彈窗 */}
                    {showSearchModal && (
                        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                        <div className="modal-dialog modal-dialog-centered search-modal">
                            <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{t('form.searchMore')}</h5>
                            </div>
                            <div className="modal-body">
                                {/* 日期選擇 */}
                                <div className="mb-3 modal-body-list">
                                    <span className="material-icons">today</span>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText={t('form.startDate')}
                                        className="date-input"
                                        calendarClassName="custom-calendar"
                                    />
                                </div>
                                <div className="mb-3 modal-body-list">
                                    <span className="material-icons">today</span>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText={t('form.endDate')}
                                        className="date-input"
                                        calendarClassName="custom-calendar"
                                    />
                                </div>

                                {/* 地區選擇 */}
                                <div className="mb-3 modal-body-list">
                                    <span className="material-icons">location_on</span>
                                    <div className="form-control-dropdown">
                                        {/* 選擇框 */}
                                        <div className={`dropdown-selected ${selectedCity ? "selected" : ""}`}  onClick={toggleDropdownCity}>
                                            {selectedCity || t("form.area")}
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

                                {/* 類型選擇 */}
                                <div className="mb-3 modal-body-list">
                                    <span className="material-icons">directions_walk</span>
                                    <div className="form-control-dropdown">
                                        {/* 選擇框 */}
                                        <div className={`dropdown-selected ${selectedCity ? "selected" : ""}`}  onClick={toggleDropdownType}>
                                            {selectedType  || t("form.eventType")}
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

                                {/* 價格輸入 */}
                                <div className="mb-3 modal-body-list">
                                    <span className="material-icons">paid</span>
                                    <input type="text" className="form-control" value={price} placeholder={t('form.price')} onChange={(e) => setPrice(e.target.value)} />
                                </div>

                                {/* 搜尋關鍵字 */}
                                <div className="mb-3 modal-body-list">
                                    <span className="material-icons">search</span>
                                    <input type="text" className="form-control" value={keyword} placeholder={t('form.keyword')} onChange={(e) => setKeyword(e.target.value)} />
                                </div>
                            </div>

                            {/* 底部按鈕 */}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModalSearch}>
                                {t('common.cancel')}
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSearch}>
                                {t('common.search')}
                                </button>
                            </div>
                            </div>
                        </div>
                        </div>
                    )}
                    
                </div>
            </section>

            <section className="section popular-event-section">
                <div className="container">
                    <div className="main-text text-center">
                        <h2 className="section-title">{t('activity.popularEventTitle')}</h2>
                        <p className="section-subtitle">{t('activity.popularEventSubTitle')}</p>
                    </div>
                    <div className="row main-body">
                    {loading ? (
                        <div className="col-12">
                            <p className="text-center">{t('common.loading')}</p>
                        </div>
                    ) : filteredData.length > 0 ? (
                        filteredData.map((activity) => (
                            <div className="col-md-6 col-lg-4" key={activity.id}>
                                <ActivityCard
                                    activity={activity}
                                    userId={userId}
                                    isCollectedPage={false}
                                    onToggleFavorite = {()=>{}}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-12">
                            <p className="text-center">{t('common.noData')}</p> {/* 顯示目前沒資料 */}
                        </div>
                    )}
                    </div>
                    <button className="btn btn-primary" onClick={handleNavigate}>{t('activity.moreEvents')}</button>
                </div>
            </section>

            <section className="section choosing-section">
                <div className="container">
                    <h2 className="section-title text-center py-4">{t('choosing.mainTitle')}</h2>
                    <div className="main-body">
                        <div className="main-body-section row">
                            <div className="col-md-5 text-center choosing-section-content-wrap">
                                <div className="choosing-section-content">
                                    <img src={ beach } alt="..." />
                                    <div className="main-card-content">
                                        <h5 className="card-title">{t('choosing.content.culturalExperienceTitle')}</h5>
                                        <p className="card-text">{t('choosing.content.culturalExperienceText')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-5 text-center choosing-section-content-wrap">
                                <div className="choosing-section-content">
                                    <img src={ communication } alt="..." />
                                    <div className="main-card-content">
                                        <h5 className="card-title">{t('choosing.content.reservationPlatformTitle')}</h5>
                                        <p className="card-text">{t('choosing.content.reservationPlatformText')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="main-body-section row">
                            <div className="col-md-5 text-center choosing-section-content-wrap">
                                <div className="choosing-section-content">
                                    <img src={ fishing } alt="..." />
                                    <div className="main-card-content">
                                        <h5 className="card-title">{t('choosing.content.recommendationsTitle')}</h5>
                                        <p className="card-text">{t('choosing.content.recommendationsText')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-5 text-center choosing-section-content-wrap">
                                <div className="choosing-section-content">
                                    <img src={ travel } alt="..." />
                                    <div className="main-card-content">
                                        <h5 className="card-title">{t('choosing.content.DeepConnectionTitle')}</h5>
                                        <p className="card-text">{t('choosing.content.DeepConnectionText')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section journal-section">
                <div className="container">
                    <div className="main-text text-center">
                        <h2 className="section-title">{t('journal.title')}</h2>
                        <p className="section-subtitle">{t('journal.subTitle')}</p>
                    </div>
                    <div className="row main-body">
                        {journalData.length > 5 ? (
                            <Swiper
                                modules={[Navigation]}
                                spaceBetween={20}
                                slidesPerView={5} // 每次輪播顯示 1 筆資料
                                loop={true}
                                navigation={{
                                    prevEl: '.custom-prev',
                                    nextEl: '.custom-next',
                                }}
                                pagination={{ clickable: true }}
                                breakpoints={{
                                    375: {
                                        slidesPerView: 2, // 顯示五筆
                                    },
                                    768: {
                                        slidesPerView: 3, // 顯示五筆
                                    },
                                    1024: {
                                        slidesPerView: 4, // 顯示五筆
                                    },
                                    1400: {
                                        slidesPerView: 5, // 顯示五筆
                                    },
                                }}
                            >
                                {journalData.map((item) => (
                                    <SwiperSlide key={item.id}>
                                        <BlogCard
                                            image={item.images}
                                            date={item.date}
                                            title={item.title}
                                            content={item.content}
                                        />
                                    </SwiperSlide>
                                ))}
                                {/* 自定義導航按鈕 */}
                                <div className="swiper-button-wrap">
                                    <div className="swiper-button-next custom-next">
                                        <span className="material-icons">chevron_left</span>
                                    </div>
                                    <div className="swiper-button-prev custom-prev">
                                        <span className="material-icons">chevron_right</span>
                                    </div>
                                </div>
                            </Swiper>
                        ) : (
                            journalData.map((item) => (
                            <div className="col-custom">
                                <div className="blog-item">
                                    <img src={item.images} alt={item.title} />
                                    <p className="card-date">{item.date}</p>
                                    <h5 className="card-title">{item.title}</h5>
                                    <p className="card-text">{item.body}</p>
                                </div>
                            </div> 
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className="section reviews-section">
                <div className="container">
                    <h2 className="section-title text-center">{t('eventReviews')}</h2>
                    <div className="row main-body">
                        {reviews.length > 0 ? ( 
                            reviews.map((review) => (
                            <div className="col-md-6 col-lg-4" key={review.id}>
                                <ReviewCard
                                    key={review.id}
                                    avatar={review.avatar}
                                    name={review.name}
                                    rating={review.rating}
                                    activityTitle={review.activityTitle}
                                    reviewContent={review.reviewContent}
                                />
                            </div>
                            ))
                        ) : (
                            <p className='text-center'>{t('common.loading')}</p>
                        )}
                    </div>
                </div>
            </section>

            <div className={`back-to-top ${showButton ? "show" : ""}`} onClick={scrollToTop}>
                <span className="material-icons">arrow_upward</span>
            </div>
        </div>
    );
};

export default HomePage;