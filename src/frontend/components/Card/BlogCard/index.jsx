import PropTypes from 'prop-types';
import './Blog.scss';
import { cloudinaryOptimize } from '@/frontend/utils/cloudinary';


export const BlogCard = ({ image, title, content, date }) => {

  return (
    <>
        <img src={cloudinaryOptimize(image, 300)} alt={title} loading="lazy" />
        <p className="card-date">{date}</p>
        <h3 className="card-title">{title}</h3>
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