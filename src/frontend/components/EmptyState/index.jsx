import PropTypes from 'prop-types';
import './EmptyState.scss';

/**
 * 空狀態畫面。
 *
 * 原本查無結果時只顯示一行「No activities found.」——
 * 在全中文的介面裡是英文，也沒有告訴使用者接下來能做什麼。
 * 這個元件統一「沒有資料」的呈現，並提供一個明確的下一步。
 */
const EmptyState = ({ icon = null, title, description = '', action = null }) => (
  <div className="empty-state">
    {icon && <div className="empty-state__icon" aria-hidden="true">{icon}</div>}
    <p className="empty-state__title">{title}</p>
    {description && <p className="empty-state__description">{description}</p>}
    {action && <div className="empty-state__action">{action}</div>}
  </div>
);

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
};

export default EmptyState;
