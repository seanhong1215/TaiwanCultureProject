import PropTypes from 'prop-types';
import './Skeleton.scss';

/**
 * 骨架屏元件。
 *
 * 這個專案有多個頁面已經宣告了 loading 狀態，卻從來沒有接到畫面上，
 * 使用者在資料回來之前看到的是一片空白，體感像當掉。
 * 骨架屏先把版面撐出來，讓「正在載入」與「沒有資料」能被區分開。
 */

/** 單一灰塊；width / height 接受任何合法的 CSS 長度 */
export const Skeleton = ({ width = '100%', height = '1rem', radius = '4px', className = '' }) => (
  <span
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius: radius }}
    aria-hidden="true"
  />
);

Skeleton.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  radius: PropTypes.string,
  className: PropTypes.string,
};

/** 多行文字骨架，最後一行較短以模擬真實段落 */
export const SkeletonText = ({ lines = 3 }) => (
  <span className="skeleton-text" aria-hidden="true">
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton key={index} height="0.85rem" width={index === lines - 1 ? '60%' : '100%'} />
    ))}
  </span>
);

SkeletonText.propTypes = { lines: PropTypes.number };

/** 活動卡 / 文章卡的骨架，尺寸對齊 ActivityCard 與 BlogCard */
export const CardSkeleton = () => (
  <div className="skeleton-card" aria-hidden="true">
    <Skeleton height="200px" radius="8px" />
    <div className="skeleton-card__body">
      <Skeleton width="30%" height="0.75rem" />
      <Skeleton width="80%" height="1.15rem" />
      <SkeletonText lines={2} />
      <Skeleton width="40%" height="1rem" />
    </div>
  </div>
);

/**
 * 一整排卡片骨架。
 * 包在有 aria-busy 與 sr-only 文字的容器裡，讓螢幕閱讀器也知道正在載入。
 */
export const CardGridSkeleton = ({ count = 6, colClassName = 'col-md-6 col-lg-4' }) => (
  <div className="row" role="status" aria-busy="true">
    <span className="visually-hidden">載入中，請稍候</span>
    {Array.from({ length: count }, (_, index) => (
      <div className={colClassName} key={index}>
        <CardSkeleton />
      </div>
    ))}
  </div>
);

CardGridSkeleton.propTypes = {
  count: PropTypes.number,
  colClassName: PropTypes.string,
};

export default Skeleton;
