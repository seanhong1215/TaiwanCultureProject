import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookingSteps from './index';

describe('BookingSteps', () => {
  // 修正前四個步驟頁各自用 {index + 1} ~ {index + 4}，
  // 導致第二步顯示成「2.行程資料 3.確認訂單 4.付款資料 5.完成預約」
  it.each([1, 2, 3, 4])('current=%i 時，未完成步驟的編號一律是 1~4', (current) => {
    const { container } = render(<BookingSteps current={current} />);
    const numbers = [...container.querySelectorAll('.booking-steps__index')].map((n) => n.textContent);

    // 已完成的步驟顯示打勾，其餘顯示自己的序號
    const expected = [1, 2, 3, 4].map((step) => (step < current ? '✓' : String(step)));
    expect(numbers).toEqual(expected);
  });

  it('四個步驟的名稱固定且依序出現', () => {
    render(<BookingSteps current={1} />);
    ['行程資料', '確認訂單', '付款資料', '完成預約'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('以 aria-current="step" 標示目前步驟，且只有一個', () => {
    const { container } = render(<BookingSteps current={3} />);
    const currentItems = container.querySelectorAll('[aria-current="step"]');

    expect(currentItems).toHaveLength(1);
    expect(currentItems[0]).toHaveTextContent('付款資料');
  });

  it('依步驟前後標上 done / active / upcoming', () => {
    const { container } = render(<BookingSteps current={2} />);
    const items = [...container.querySelectorAll('.booking-steps__item')];

    expect(items[0].className).toContain('booking-steps__item--done');
    expect(items[1].className).toContain('booking-steps__item--active');
    expect(items[2].className).toContain('booking-steps__item--upcoming');
    expect(items[3].className).toContain('booking-steps__item--upcoming');
  });

  it('使用有序清單語意，而非原本看起來可點卻沒反應的按鈕', () => {
    const { container } = render(<BookingSteps current={1} />);

    expect(container.querySelector('ol.booking-steps')).toBeInTheDocument();
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
