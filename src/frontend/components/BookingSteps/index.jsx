import PropTypes from 'prop-types';
import './BookingSteps.scss';

const STEPS = ['行程資料', '確認訂單', '付款資料', '完成預約'];

/**
 * 訂票流程的進度指示器。
 *
 * 原本四個步驟頁各自複製一份，並以 {index + 1}、{index + 2}、{index + 3}、
 * {index + 4} 來標示目前步驟 —— 但那個偏移量加在「每一個」步驟上，
 * 於是第二步會顯示成「2.行程資料 3.確認訂單 4.付款資料 5.完成預約」。
 * 編號永遠是 1~4，目前步驟改用樣式呈現。
 *
 * 另外原本用的是 <Button>，看起來可以點回上一步、實際上沒有 onClick。
 * 這裡改用非互動元素，並以 aria-current 讓輔助技術知道進行到哪一步。
 *
 * @param {number} current 目前步驟（1 起算）
 */
const BookingSteps = ({ current }) => (
  <ol className="booking-steps" aria-label="預約流程進度">
    {STEPS.map((label, index) => {
      const step = index + 1;
      const state = step < current ? 'done' : step === current ? 'active' : 'upcoming';

      return (
        <li
          key={label}
          className={`booking-steps__item booking-steps__item--${state}`}
          aria-current={state === 'active' ? 'step' : undefined}
        >
          <span className="booking-steps__index" aria-hidden="true">
            {state === 'done' ? '✓' : step}
          </span>
          <span className="booking-steps__label">{label}</span>
        </li>
      );
    })}
  </ol>
);

BookingSteps.propTypes = {
  current: PropTypes.oneOf([1, 2, 3, 4]).isRequired,
};

export default BookingSteps;
