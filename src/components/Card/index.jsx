// import React from 'react';
import PropTypes from 'prop-types';

export const Card = ({ id, city, images, isFavorited, rating, date, eventType, content, onFavoriteToggle }) => {
  // PropTypes for validation
  Card.propTypes = {
    id: PropTypes.number.isRequired,
    city: PropTypes.string.isRequired,
    images: PropTypes.string.isRequired,
    isFavorited: PropTypes.bool.isRequired,
    rating: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    eventType: PropTypes.string.isRequired,
    content: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired
    }).isRequired,
    onFavoriteToggle: PropTypes.func.isRequired
  };
  return (
        <div className="card mb-3" key={id}>
        <img src={images} className="card-img-top" />
        <div className="card-body">
            <span className="badge bg-warning text-dark">
                評分: {rating} ★
            </span>
            <h5 className="card-title">{city}:{content.title}</h5>
            <p className="card-text">
            <small className="text-muted">日期: {date}</small>
            </p>
            <p className="card-text">
            <small className="text-muted">類型: {eventType}</small>
            </p>
            <p className="card-text">{content.description}</p>
            <button
                className={`btn btn-sm ${isFavorited ? "btn-danger" : "btn-outline-danger"}`}
                onClick={() => onFavoriteToggle(id)}
            >
                {isFavorited ? "已收藏" : "收藏"}
            </button>
        </div>
        </div>
    );
};


export const ReviewCard = ({ avatar, name, rating, activityTitle, reviewContent }) => {
    // PropTypes for validation
  ReviewCard.propTypes = {
    avatar: PropTypes.string.isRequired, // 大頭照 URL
    name: PropTypes.string.isRequired, // 用戶名稱
    rating: PropTypes.number.isRequired, // 星星數 (0~5)
    activityTitle: PropTypes.string.isRequired, // 活動標題
    reviewContent: PropTypes.string.isRequired, // 評價內容
  };

  return (
    <div className="card mb-3">
      <div className="row g-0">
        <div className="col-md-3 text-center">
          <img
            src={avatar}
            alt={`${name} avatar`}
            className="rounded-circle"
            style={{ width: "60px", height: "60px", objectFit: "cover" }}
          />
        </div>
        <div className="col-md-9">
          <div className="card-body">
            <h5 className="card-title">{name}</h5>
            <p className="text-warning">
              {Array.from({ length: 5 }, (_, i) => (
                <i
                  key={i}
                  className={`fa${i < Math.floor(rating) ? "s" : "r"} fa-star`}
                ></i>
              ))}
            </p>
            <h6 className="card-subtitle mb-2 text-muted">{activityTitle}</h6>
            <p className="card-text">{reviewContent}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

