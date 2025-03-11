import PropTypes from 'prop-types';
import './Blog.scss';


export const BlogCard = ({ image, title, content, date }) => {

  return (
    <>
        <img src={image} alt={title} />
        <p className="card-date">{date}</p>
        <h5 className="card-title">{title}</h5>
        <p className="card-text" dangerouslySetInnerHTML={{ __html: content }}></p>
    </>
  );
};


BlogCard.propTypes = {
  image: PropTypes.string.isRequired, 
  title: PropTypes.string.isRequired, 
  date: PropTypes.string.isRequired, 
  content: PropTypes.string.isRequired, 
};