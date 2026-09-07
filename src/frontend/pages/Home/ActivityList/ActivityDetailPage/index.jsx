import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from "react-router-dom";
import { useActivityDetailPage } from './hooks';
import Breadcrumb from "@/frontend/components/Breadcrumb";
import ReviewBars from "@/frontend/components/Progress";
import ActivityMap from "@/frontend/components/ActivityMap";
import { formatDateZh } from "@/frontend/utils/date";
import Skeleton, { SkeletonText } from "@/frontend/components/Skeleton";
import "./ActivityDetailPage.scss";

const LIMIT = 2;

const ActivityDetailPage = () => {

  const token = localStorage.getItem('token');
  const userId = Number(localStorage.getItem("userId"));
  const userName = localStorage.getItem("userName");
  const [selectedDate, setSelectedDate] = useState('');
  const [currentActDate, setCurrentActDate] = useState(new Date());

  const [page, setPage] = useState(1); // 頁數狀態
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

  const navigate = useNavigate();

  const  param  = useParams();
  const { id } = param

  const {
    activityData,
    activityDetailData,
    activityDetailDataSection,
    showMainImage,
    getReservationData,
    reviewData,
    RatingstarAll,
    Ratingstar,
    avgRatingstar,
    totalPage,
    loading,
  } = useActivityDetailPage(id, page, LIMIT);

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
    // 不清除已選日期：使用者登入後回到這一頁，選好的日期還在，不必重選
    Swal.fire({
      title: "請先登入會員",
      text: "登入後即可繼續預約，你選擇的日期會保留",
      icon: "info"
    })
    return
  }

  navigate("/activity-list/booking1", { state: submitdData }); // 帶著資料跳轉到預約頁面
};

const renderCalendarDays = () => {
  const daysInMonth = new Date(currentActDate.getFullYear(), currentActDate.getMonth() + 1, 0).getDate();
  const days = [...Array(daysInMonth)].map((_, index) => renderDay(index + 1));
  return days;
};

// 所有可預約的日期（由小到大）
const availableDates = Object.keys(getReservationData)
  .filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key))
  .sort();

// 目前顯示的月份是否有可預約日期
const currentMonthKey = `${currentActDate.getFullYear()}-${String(currentActDate.getMonth() + 1).padStart(2, '0')}`;
const monthHasAvailability = availableDates.some((date) => date.startsWith(currentMonthKey));

/*
 * 日曆預設停在「今天」的月份，但活動可能排在好幾個月後，
 * 使用者會看到整片灰色、又沒有任何提示，只能盲目按 Next 猜哪個月有名額。
 * 這裡在可預約資料載入後，直接把日曆跳到第一個有名額的月份。
 */
useEffect(() => {
  if (availableDates.length === 0) return;
  const [firstDate] = availableDates;
  setCurrentActDate(new Date(`${firstDate}T00:00:00`));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [getReservationData]);

/*
 * 活動日期原本只藏在日曆裡，價格區塊只寫「NT$1200起」，
 * 使用者得先開日曆亂翻才知道這活動什麼時候辦。這裡直接顯示出來。
 */
const activityDateLabel = (() => {
  const start = formatDateZh(activityData.startDate);
  if (!start) return '';
  const end = formatDateZh(activityData.endDate);
  return !end || end === start ? start : `${start} ~ ${end}`;
})();

/** 跳到最接近、且有名額的月份 */
const jumpToNearestAvailableMonth = () => {
  if (availableDates.length === 0) return;
  const current = currentActDate.getTime();
  const nearest = availableDates
    .map((date) => new Date(`${date}T00:00:00`))
    .reduce((best, date) =>
      Math.abs(date.getTime() - current) < Math.abs(best.getTime() - current) ? date : best
    );
  setCurrentActDate(nearest);
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


// 資料回來之前先撐出版面。原本 loading 狀態有設定卻從未渲染，
// 使用者在載入期間看到的是一片空白。
if (loading && !activityData.content) {
  return (
    <div className="activity-detail-page container" role="status" aria-busy="true">
      <span className="visually-hidden">載入中，請稍候</span>
      <div className="py-4">
        <Skeleton height="360px" radius="8px" />
        <div className="row mt-4">
          <div className="col-lg-8">
            <Skeleton width="55%" height="2rem" />
            <div className="mt-3"><SkeletonText lines={4} /></div>
          </div>
          <div className="col-lg-4 mt-4 mt-lg-0">
            <Skeleton height="160px" radius="8px" />
          </div>
        </div>
      </div>
    </div>
  );
}

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
                    <h2 className="actTitle" >{activityData.content?.title}</h2>
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
                                          alt="活動圖片"
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
                                    alt={item.name}
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
                  {activityDateLabel && (
                    <p className="text-muted small mb-2">活動日期：{activityDateLabel}</p>
                  )}
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
          {activityDateLabel && (
            <p className="text-muted small mb-2">活動日期：{activityDateLabel}</p>
          )}
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

                {/* 本月沒有名額時給出明確指引，而不是讓使用者對著一片灰色亂猜 */}
                {availableDates.length > 0 && !monthHasAvailability && (
                  <p className="text-center text-muted small mt-3 mb-0">
                    本月沒有可預約的日期
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 ms-1 align-baseline"
                      onClick={jumpToNearestAvailableMonth}
                    >
                      前往最近可預約的月份
                    </button>
                  </p>
                )}
                {availableDates.length === 0 && (
                  <p className="text-center text-muted small mt-3 mb-0">此活動目前沒有開放預約的日期</p>
                )}
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
