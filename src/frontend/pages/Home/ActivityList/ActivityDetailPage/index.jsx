import "./ActivityDetailPage.scss";
import Breadcrumb from "@/frontend/components/Breadcrumb";
import ReviewBars from "@/frontend/components/Progress";
import ActivityMap from "@/frontend/components/ActivityMap";
import { getActivitys, getReservations, addReservations, getReviewsActivityId, getReviewsActivityIdPage } from '@/frontend/utils/api';
import { useState , useEffect } from 'react'; 
import Swal from 'sweetalert2';
import { useParams , useNavigate } from "react-router-dom";

const ActivityDetailPage = () => {

  const token = localStorage.getItem('token');
  const userId = Number(localStorage.getItem("userId"));
  const userName = localStorage.getItem("userName");
  const [activityData, setActivityData] = useState([]);
  const [reviewData, setReviewData] = useState([]);
  const [activityDetailDataSection, setActivityDetailDataSection] = useState([]);
  const [activityDetailData, setActivityDetailData] = useState([]);
  const [showMainImage, setShowMainImage] = useState("");
  const [getReservationData , setGetReservationData] = useState({})
  const [selectedDate, setSelectedDate] = useState('');

  // 日期選擇
  const [selectedActDate, setSelectedActDate] = useState(null);
  const [currentActDate, setCurrentActDate] = useState(new Date());

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
      "adultCount": null,
      "childCount": null,
      "adultPrice": 150,
      "childPrice": 120,
      "timeSlot": "",
      "totalAmount": null,
      "paymentStatus": "PAID",
      "orderId": "",
      "reservedStatus": "reserved",
      "actImage" : "",
      "reviewed": false,
      "status": "upcoming"
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const  param  = useParams();
  const { id } = param
  

const getReservationDate = async (activityData) => {
    const result = { id: activityData.id };
    const startDate = new Date(activityData.startDate);
    const endDate = new Date(activityData.endDate);
    const price = Number(activityData.price); // 確保 price 是數字

    let currentDate = new Date(startDate);

    // 使用更簡潔的日期格式化
    const formatDate = (date) => date.toISOString().split('T')[0];

    // 計算從開始日期到結束日期的所有日期
    while (currentDate <= endDate) {
        const formattedDate = formatDate(currentDate);
        result[formattedDate] = { price };  // 添加價格
        currentDate.setDate(currentDate.getDate() + 1);
    }

    try {
        // 檢查是否已經存在該活動的預約資料
        const existingResponse = await getReservations(activityData.id);

        if (existingResponse && Object.keys(existingResponse).length === 0) {
            // 如果不存在，添加新的預約資料
            await addReservations(result);
        }
    } catch (error) {
        // 錯誤處理，針對不同的錯誤情況進行處理
        if (error.response && error.response.status === 404) {
            console.log('Reservations not found:', error);
        } else {
            console.error('Error processing reservation:', error);
        }
    }
};

  const getReverseData = async() => {
    try{
      const response = await getReservations(id)
      setGetReservationData(response) 
    }catch(error){
      console.log(error);
    }
  }

  const getReviewsAll = async (id) => {
    const response = await getReviewsActivityId(id);
    setTotalPage(Math.ceil(response.length/limit))
    setRatingStarAll(response)
    
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
      const response = await getReviewsActivityIdPage(id, page, limit) // 傳入當前頁數與每頁顯示數量
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
        icon: "warning"
    })
    return
  }
  if(token===null){
    Swal.fire({
      title: "請登入會員",
      icon: "warning"})

  setSelectedDate('')
  return
  }


    setTimeout(() => {
      navigate("/activity-list/booking1" ,{ state: submitdData }); // 跳轉到預約頁面
    }, 300); // 帶著資料跳轉到預約頁面
};

// ********************日期選擇*********************
useEffect(() => {
  // To update the modal when the selected date changes
  if (selectedActDate) {
    const formattedDate = `${selectedActDate.getFullYear()}-${selectedActDate.getMonth() + 1}-${selectedActDate.getDate()}`;
  }
}, [selectedActDate]);

const renderCalendarDays = () => {
  const daysInMonth = new Date(currentActDate.getFullYear(), currentActDate.getMonth() + 1, 0).getDate();
  const days = [...Array(daysInMonth)].map((_, index) => renderDay(index + 1));
  return days;
};

// Update formatted date when currentDate changes
const formattedDate = `${currentActDate.getFullYear()}年${(currentActDate.getMonth() + 1).toString().padStart(2, '0')}月`;
const formattedMonth = `${(currentActDate.getMonth() + 1).toString().padStart(2, '0')}`;

// Function to handle month change (next and previous)
const handleMonthChange = (increment) => {
  const newDate = new Date(currentActDate);
  newDate.setMonth(currentActDate.getMonth() + increment);
  setCurrentActDate(newDate);
};

const renderDay = (day) => {
  const formattedDay = day < 10 ? `0${day}` : day; // Ensure day is two digits
  const fullDate = `${currentActDate.getFullYear()}-${formattedMonth}-${formattedDay}`; // Create the full date string in YYYY-MM-DD format
  
  if (!getReservationData) return null; // Ensure there is reservation data

  const reservation = getReservationData[fullDate];
  const isAvailable = !!reservation; // Check if there's a reservation for this date

  return (
    <div className="day" key={day}>
      <button
        onClick={isAvailable ? () => handleDateClick(fullDate) : null} // Handle date click if available
        disabled={!isAvailable} // Disable button if no reservation data available
        style={{
          backgroundColor: selectedDate === fullDate ? '#4DAAB0' : 'transparent', // Highlight selected date
          color: selectedDate === fullDate ? 'white' : 'black', // Change text color if selected
          borderRadius: '8px',
          fontSize: '14px',
          display: 'inline-block',
          cursor: isAvailable ? 'pointer' : 'not-allowed', // Pointer cursor for available dates
          opacity: isAvailable ? 1 : 0.5, // Dim unavailable dates
        }}
      >
        {day} {/* Display day */}
        {reservation && (
          <div style={{ color: selectedDate === fullDate ? 'white' : '#616161' }}>
            <small>價格 : {reservation.price}</small> {/* Show reservation price */}
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
                        <ActivityMap activityDetailData={activityDetailData} />
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
          <div className="modal-body">
            <div className="getActDate">
              <div className="calendar">
              <div className="calendar-header">
                <button onClick={() => handleMonthChange(-1)} className="btn btn-custom-outline-primary">Prev</button>
                <p>{formattedDate}</p> {/* Show the current month */}
                <button onClick={() => handleMonthChange(1)} className="btn btn-custom-outline-primary">Next</button>
              </div>
                <div className="week-days">
                  <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
                </div>
                <div className="days">
                  {renderCalendarDays()}
                </div>
              </div>
            </div>
          </div>
          <div className="getActDateFooter">
            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={submitDateClick}>
              預約行程
            </button>
          </div>
        </div>
      </div>
    </div>
</div>
  );
};
  
  export default ActivityDetailPage;