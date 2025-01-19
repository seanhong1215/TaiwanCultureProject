// import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ title, description, image }) => {
  return (
    <div className="card">
      <img src={image} className="card-img-top" alt="..." />
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
        {/* <button className="btn btn-primary" onClick={onButtonClick}>
          {buttonText}
        </button> */}
      </div>
    </div>
  );
};

// PropTypes validation
Card.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  // buttonText: PropTypes.string.isRequired,
  // onButtonClick: PropTypes.func.isRequired,
};

export default Card;
