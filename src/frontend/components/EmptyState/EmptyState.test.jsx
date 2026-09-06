import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from './index';

describe('EmptyState', () => {
  it('顯示標題', () => {
    render(<EmptyState title="找不到符合條件的活動" />);
    expect(screen.getByText('找不到符合條件的活動')).toBeInTheDocument();
  });

  it('description 與 action 為選填，未提供時不渲染', () => {
    const { container } = render(<EmptyState title="沒有資料" />);

    expect(container.querySelector('.empty-state__description')).not.toBeInTheDocument();
    expect(container.querySelector('.empty-state__action')).not.toBeInTheDocument();
  });

  it('提供時顯示說明與下一步操作', () => {
    render(
      <EmptyState
        title="目前沒有訂單"
        description="去逛逛有哪些文化體驗活動吧。"
        action={<button type="button">探索活動</button>}
      />
    );

    expect(screen.getByText('去逛逛有哪些文化體驗活動吧。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '探索活動' })).toBeInTheDocument();
  });

  it('圖示屬裝飾性，對輔助技術隱藏', () => {
    const { container } = render(<EmptyState title="沒有資料" icon={<span>📭</span>} />);
    expect(container.querySelector('.empty-state__icon')).toHaveAttribute('aria-hidden', 'true');
  });
});
