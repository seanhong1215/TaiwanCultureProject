import "./ActivityDetailPage.scss";
import React from "react";
import Breadcrumb from "@/frontend/components/Breadcrumb"
import { getActivitys , getMembers } from '@/frontend/utils/api';
import { useState , useEffect , useRef } from 'react'; 
import Swal from 'sweetalert2';
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import { Outlet, useParams , Link , useNavigate , useLocation} from "react-router-dom";
import axios from "axios";


axios.defaults.baseURL = process.env.NODE_ENV === 'production'
 ? 'https://taiwan-culture-project.onrender.com'
 : 'http://localhost:3002'


 const MapComponent = ({ activityDetailData, loading }) => {
  // Ref for the map container and the map instance
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Always call hooks regardless of conditions
  useEffect(() => {
    // Ensure that we have the necessary data before proceeding
    if (activityDetailData && activityDetailData.length > 0) {
      const { map } = activityDetailData[0] || {};

      if (map && map.latitude && map.longitude) {
        // Initialize the map only if it hasn't been initialized already
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapContainerRef.current).setView([map.latitude, map.longitude], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapInstanceRef.current);

          L.marker([map.latitude, map.longitude]).addTo(mapInstanceRef.current)
            .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
            .openPopup();
        }
      }
    }

    // Cleanup function to remove the map on unmount or before running the effect again
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activityDetailData]); // Run when activityDetailData changes

  // Conditional rendering for loading and missing data
  if (loading) {
    return <p style={{ marginLeft: 'auto' }}>找不到活動資訊</p>;
  }

  if (!activityDetailData || activityDetailData.length === 0) {
    return <p style={{ marginLeft: 'auto' }}>找不到活動資訊</p>;
  }

  const { map } = activityDetailData[0] || {};
  if (!map || !map.latitude || !map.longitude) {
    return <p style={{ marginLeft: 'auto' }}>地圖資訊不可用</p>;
  }

  return <div ref={mapContainerRef} style={{ height: '500px' }}></div>;
};


  
const ReviewBars = ({ reviewData }) => {
  const [reviewPercentage , setReviewPercentage] = useState([])
  
  useEffect(()=>{
    const ratingCounts = {};
    const totalReviews = reviewData.length;


    reviewData.length===0 ? {0:0} :   reviewData.map((item)=>{
      if ( !ratingCounts[item.rating] ) {
        ratingCounts[item.rating] = 1;
      }else{
        ratingCounts[item.rating] += 1
      }
    })
    
    const calculatedReviewData = Object.entries(ratingCounts).map(([rating, count]) => ({
      
      rating: Number(rating),
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    }));

  setReviewPercentage(calculatedReviewData.reverse())
  },[reviewData])


  return (
    <div className="progress-wrap" style={{ width: "100%" }}>
      {reviewPercentage.map(({ rating, percentage }, index) => {
        return (
          <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ width: "50%", textAlign: "right", marginRight: "8px", whiteSpace: 'nowrap' }}>
              {rating} ⭐
            </span>
            <div
              className="progress"
              style={{ width: "200px", height: "12px", backgroundColor: "#e9ecef", borderRadius: "4px" , marginBottom:'0px'}}
            >
              <div
                className="progress-bar bg-warning"
                role="progressbar"
                style={{ width: `${percentage}%`,
                height: "100%",
                }}
                aria-valuenow={percentage}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};


const ActivityDetailPage = () => {

  const token = localStorage.getItem('token');
  const userId = Number(localStorage.getItem("userId"));
  const userName = localStorage.getItem("userName");
  const [activityData, setActivityData] = useState([]);
  const [reviewData, setReviewData] = useState([]);
  const [activityDetailDataSection, setActivityDetailDataSection] = useState([]);
  const [activityDetailData, setActivityDetailData] = useState({});
  const [showMainImage, setShowMainImage] = useState("");
  const [getReservationData , setGetReservationData] = useState({})
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedData, setSelectedData] = useState(null);
  const [RatingstarAll , setRatingStarAll] = useState([])
  const [Ratingstar , setRatingStar] = useState(0)
  const [avgRatingstar , setAvgRatingStar] = useState(0)
  const [totalPage , setTotalPage] = useState(0)
  const [page, setPage] = useState(1); // 頁數狀態
  const [isFirstEffectDone, setIsFirstEffectDone] = useState(false);
  const limit = 2;
  const [submitdData, setSubmitData] = useState({
      "userId": null,
      "activityId": null,
      "createdAt": "",
      "contactName": "",
      "activityName": "",
      "last_bookable_date": "",
      "activityLocation": "",
      "activityPeriod": {
        "startDate": "",
        "endDate": ""
      },
      "adultCount": null,
      "childCount": null,
      "adultPrice": 150,
      "childPrice": 120,
      "timeSlot": "",
      "totalAmount": null,
      "paymentStatus": "PAID",
      "orderId": "",
      "reservedStatus": "reserved",
      "actImage" : ""
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const  param  = useParams();
  const { id } = param
  

  const getReservationDate = async(activityData) => {
    
    const result = { id: activityData.id };
    const startDate = new Date(activityData.startDate);
    const endDate = new Date(activityData.endDate);
    const price = Number(activityData.price); // 確保 price 是數字

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const formattedDate = currentDate.toISOString().split('T')[0];

        // 這裡的價格可以改成你的計算方式，目前是隨機價格
        result[formattedDate] = { price: price };

        currentDate.setDate(currentDate.getDate() + 1);
    }
    
      
    try {
      const existingResponse = await axios.get(`/api/reservations/${activityData.id}`, {
        validateStatus: (status) => status === 200 // 只在 200 時視為成功，其他狀況不拋出錯誤
    });
      if (existingResponse.data && Object.keys(existingResponse.data).length > 0) {
          return;
      }
      } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(error);
          }
      }
      
      // 發送 POST 請求
      try {
          const response = await axios.post(`/api/reservations`, result);
      } catch (postError) {
        console.log(postError);
      }
  }
  
  const getReverseData = async() => {
    try{
      const response = await axios.get(`/api/reservations/${id}`)
      setGetReservationData(response.data) 
    }catch(error){
      console.log(error);
    }
  }

  const getReviewsAll = async (id) => {
    const response = await axios.get(`/api/reviews?activityId=${id}`);
    setTotalPage(Math.ceil(response.data.length/limit))
    setRatingStarAll(response.data)
    
};

const handlePageChange = (page) => {
  setPage(page);
};

const renderPaginationButtons = () => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPage; i++) {
    pageNumbers.push(i);
  }

return pageNumbers.map((pageNumber) => (
  <button
    key={pageNumber}
    onClick={() => handlePageChange(pageNumber)}
    disabled={page === pageNumber}
  >
    {pageNumber}
  </button>
));
};

useEffect(() => {
  fetchGetReview(id , page, limit); // 這裡傳遞 page 和 limit
}, [page]); // 監聽 page 變數，變更時重新獲取數據


const getReviews = async (id , page = 1, limit = 2) => {
  const response = await axios.get(`/api/reviews?activityId=${id}&_page=${page}&_limit=${limit}`);
  return response.data;
};
  

  useEffect(() => {
    async function fetchData() {
      await fetchGetActivity(id);
      await fetchGetReview(id);
      await getReviewsAll(id);
      setIsFirstEffectDone(true); // 標記第一個 useEffect 已完成
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    if (isFirstEffectDone) {
      getReverseData(id);
    }
  }, [id, isFirstEffectDone]);



  const fetchGetReview = async (id, page = 1, limit) => {
    setLoading(true);
    setError(null);
    try {
        const response = await getReviews(id, page, limit) // 傳入當前頁數與每頁顯示數量
        setReviewData(response);
    } catch (error) {
        setError(error);
    } finally {
        setLoading(false);
    }
};

useEffect(()=>{
  reviewData.length === 0 ? setRatingStar(0) : setRatingStar(reviewData.reduce((sum , item)=> sum + item.rating, 0) / Number(reviewData.length))
  RatingstarAll.length === 0 ? setAvgRatingStar(0) : setAvgRatingStar((RatingstarAll.reduce((sum , item)=> sum + item.rating, 0) / Number(RatingstarAll.length)).toFixed(1))
},[reviewData , RatingstarAll])

  const fetchGetActivity = async (id) => {
    setLoading(true);
    setError(null);
    try {
        const response  = await getActivitys(id); 
        
        setActivityData(response); 
        response.activityDetails.length===0 ? "" : setActivityDetailData(response.activityDetails)
        response.activityDetails.length===0 ? "" : setActivityDetailDataSection(response.activityDetails?.[0]?.sections)
        setShowMainImage(
          response?.activityDetails?.[0]?.images?.length > 0 
          ? response.activityDetails[0].images[0].url  // 取得第一張圖片
          : "Loading" )
          getReservationDate(response)
    } catch (error) {
        console.error("Error fetching activity:", error);
        setError('Error fetching activity:', error);
    } finally{
      setLoading(false);// ✅ 確保無論成功或失敗都會更新 `loading`
    }
};

const renderStars = (rating) => {
  
  const fullStars = Math.floor(rating); // 取得完整的星星數量
  const hasHalfStar = rating % 1 !== 0; // 是否有半顆星
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // 剩餘的空星數量

  return (
    <>
      {/* 實心星星 */}
      {Array.from({ length: fullStars }).map((_, index) => (
        <span key={index} className="material-icons">star</span>
      ))}

      {/* 半顆星 */}
      {hasHalfStar && <span className="material-icons">star_half</span>}

      {/* 空星 */}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <span key={`empty-${index}`} className="material-icons">star_border</span>
      ))}
    </>
  );
};


const handleDateClick = (date) => {

  setSelectedDate(date);
  const dateData = getReservationData[date];
  setSelectedData(dateData);
  setSubmitData((preData) => ({
    ...preData,
    userId: userId,
    activityId: Number(id),
    contactName: userName,
    activityName: activityData.content?.title,
    activityLocation: activityData.eventAddress,
    last_bookable_date: date, // 更新最後可預約日期
    actImage : activityData.images,
    adultPrice : Number(activityData.price),
    childPrice : (activityData.price) * 0.5
  }));
};

const submitDateClick = () => {
  
  if(selectedDate.length===0){
    Swal.fire({
        title: "請選擇預約日期",
        icon: "error"
    })
    return
  }
  if(token===null){
    Swal.fire({
      title: "請登入會員",
      icon: "error"})

  setSelectedDate('')
  return
  }


    setTimeout(() => {
      navigate("/activity-list/booking1" ,{ state: submitdData }); // 跳轉到預約頁面
    }, 300); // 帶著資料跳轉到預約頁面
};

const date = new Date(activityData.startDate);

const formattedDate = `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2)}月`;
const formattedMonth = `${(date.getMonth() + 1).toString().padStart(2,"0")}`;
const renderDay = (day) => {
  
  const date = `2025-${formattedMonth}-${day < 10 ? `0${day}` : day}`;
  if (!getReservationData) return null; // 確保有資料
  const reservation = getReservationData[date];
  
  const isAvailable = !!reservation; 
  return (
    <div className="day" key={day} >
      <button 
        onClick={isAvailable ? () => handleDateClick(date) : null }
        disabled={!isAvailable}
        style={{
          backgroundColor: selectedDate === date ? '#4DAAB0' : 'transparent', // 當前選中的日期顯示背景顏色
          color: selectedDate === date ? 'white' : 'black', // 當前選中的日期顯示文字顏色
          borderRadius: '8px', // 圓角
          fontSize: '14px',
          display: 'inline-block',
          cursor: isAvailable ? 'pointer' : 'not-allowed', // 如果有資料，游標為指針，否則為禁止符號
          opacity: isAvailable ? 1 : 0.5
        }}
      >
        {day}
        {reservation && (
          <div style={{color:selectedDate === date ? 'white' : '#616161'}}>
            <small>價格 :{reservation.price}</small>
          </div>
        )}
      </button>
    </div>
  );
};

return (
<div className="activity-detail-page container">

  <div className="showContainer">
    <Breadcrumb />
      <div className="mainPic">

      {Array.isArray(activityDetailData) ? (
          activityDetailData.map((item, index) => (
            
          <div className="row no-gutter" key={index}>
            {/* 左邊大圖 */}
            <div className="col-12 col-lg-6 no-gutters mainImage-container">
              <img src={showMainImage} alt={`Main ${index}`} />
            </div>

            {/* 右邊 2x2 小圖 */}
            <div className="col-12 col-lg-6 rightSide">
              <div className="row no-gutters">
                {item.images?.slice(1).map((image, imgIndex) => (

                  <div className="col-6 no-gutters image-container" key={imgIndex}>
                    <img src={image?.url} alt={`Thumbnail ${index}-${imgIndex}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          ))
        ) : (
          <p>Loading...</p>
      )}



      </div>
      <div className="mainContent">
      <div className="row g-0" >
              <div className="card col-lg-8 titleArea" >
                <div className="card-body actTitleBody">
                  <div className='actTitleDiv'>
                    <h2 className="actTitle" >{activityData.content?.title}

                      <button className='addFavorites'><span className="material-icons favoriteHeart">favorite_border</span><span>加入收藏</span></button>
                      
                    </h2>
                    <span className='rating'><span className="material-icons">star</span>{avgRatingstar}({RatingstarAll.length}) <span className='addFavorites'>{RatingstarAll.length} 人參加過</span></span>
                  </div>
                  <hr />
                  <div className='actContent'>
                      <div className='actContentTitle'>
                        <p>行程特色</p>
                      </div>
                      <h3 className="card-text">{activityDetailData[0]?.trip?.title}</h3>
                      {activityDetailData[0]?.trip?.highlights.map((item,index)=>
                        <div key={index}>
                          <p className="card-text">{item}</p>
                        </div>
                      )}
                        
                  </div>
                  <hr/>
                    
                </div>

                <div className="card-body actTitleBody">
                  <div className='siteContent'>
                      <div className='actContentTitle site'>
                        <p>地點</p>
                      </div>
                      <div className="siteMap">
                        <MapComponent activityDetailData={activityDetailData} />
                      </div>
                  </div>
                  <hr/>
                  <div className="activityContent">
                      <div className='actContentTitle site'>
                        <p>活動介紹</p>
                      </div>
                        {Array.isArray(activityDetailDataSection) ? (
                            activityDetailDataSection.map((item, index) => (
                                <div className="mb-4" key={index}>
                                  <div className="actPic">
                                      <img src={item.image} 
                                        alt="" 
                                        className="card-img w-100"
                                        style={{objectFit:"cover"}}
                                      />
                                  
                                  </div>
                                  <div className='contentText'>
                                    <div className='contentTextsmall'>
                                      <span className="material-icons">arrow_drop_up</span><p>{item.imageCaption}</p>
                                    </div>
                                    <p className="contentDescribute">{item.description}</p>
                                  </div>
                                </div>

                         ))
                            ) : (
                              <p>Loading...</p>
                          )}
                    
                  </div>

                  <hr/>
                {/*活動評價*/}
                <div className='actContent'>
                      {/*長條圖及星星*/ }
                      <h4 className="card-title ratingTitle">活動評價</h4>
                      <div className="d-flex align-items-center ratingStartDiv">
                      <div style={{ width: "50%", height: "105px" }}>
                        <span
                          className="fs-1 fw-bold"
                          style={{
                            fontSize: "40px",
                            fontWeight: "700",
                            lineHeight: "48px"
                          }}
                        >
                          {avgRatingstar}
                        </span>
                        <div className="d-flex ratingStart">
                          {renderStars(Ratingstar)} {/* ⭐ 渲染動態星星 */}
                        </div>
                        <p className="card-text small"style={{ marginTop:'4.6px',color:"#9E9E9E" }}>{reviewData.length} 則評論</p>
                      </div>

                          <div className="w-50" style={{marginLeft:"32px",height:'121px'}}>
                            <ReviewBars reviewData={reviewData} />
                          </div>

                       
                      </div>
                       {/*評論區塊 */}  
                       <div >
                          {(reviewData.length > 0) ? (reviewData.map((item,index)=>
                                
                            <div className="row reviewRow g-0" key={index}>
                              <div className="col-1 ratingerImg">
                                <div className="roundedCircle">
                                    <img src={item.avatar}
                                    alt="..." 
                                    />
                                </div>
                              </div>
                              {/*單一評論和星星 */}
                              <div className="col-10 ratingContext">
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className='ratingName'>{item.name}</span>
                                  <div className='singleRating'>
                                  {renderStars(item.rating)}
                                  </div>
                     
                                </div>
                                <p>{item.reviewContent}</p>
                                
                              </div>
                              <div className="ratingImage">
                              { item.imageFiles.map((image,index) => 
                                  <div className='imageBox' key={index}>
                                    <img src={image} alt={`image-${index}`}  />
                                  </div>
                                )}
                                </div>
                            </div>
                            
                            
                          )) : (<p>No review found.</p> )}
                              <div className="pagenation" >

                              <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
                              <span className="material-icons">
                              chevron_left
                              </span>
                              </button>
                              <div className="currentPage">{renderPaginationButtons()}</div>
                              <button onClick={() => setPage((prev) => prev + 1)}  disabled={page === totalPage}>
                                <span className="material-icons">
                                navigate_next
                                </span>
                              </button> 
                              </div>
                        </div>
                </div>

                {/*最上面的2個DIV*/ }
                </div>
              </div>
              {/*CallToAction */}
              <div className="card priceArea addDateTime col-lg-4">
                <div className="card-body priceAreatitle">
                  <h2 className="actTitle">NT${activityData.price}起</h2>
                  <div className="callbutton">
                  <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                    選擇日期
                  </button>
                </div>
                </div>
              </div>
            </div>
            
      </div>

      <div className="mobileView">
        <div className="card-body actTitleMobile">
          <h2 className="">NT${activityData.price}起</h2>
          <div className="callbutton">
          <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
            選擇日期
          </button>
        </div>
        </div>
      </div>

  </div>



<div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modalBody">
              <div className="getActDate" >
                      <div className="calendar">
                        <div className="calendar-header">
                            <p>{formattedDate}</p>
                        </div>
                        <div className="week-days">
                            <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
                        </div>
                        <div className="days">
                        {[...Array(31)].map((_, index) => renderDay(index + 1))}
                        </div>
                      </div>      
              </div>
            </div>
            <div className="getActDateFooter">
              <button type="button" data-bs-dismiss="modal" onClick={submitDateClick}>預約行程</button>
            </div>
    </div>
  </div>
</div>


                
</div>

  );
};
  
  export default ActivityDetailPage;