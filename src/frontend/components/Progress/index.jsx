import { useState , useEffect } from 'react'; 
import PropTypes from "prop-types";


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
ReviewBars.propTypes = {
  reviewData: PropTypes.arrayOf(
    PropTypes.shape({
      rating: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ReviewBars;
