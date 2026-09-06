import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton, { SkeletonText, CardSkeleton, CardGridSkeleton } from './index';

describe('Skeleton', () => {
  it('套用指定的尺寸與圓角', () => {
    const { container } = render(<Skeleton width="120px" height="2rem" radius="8px" />);
    const block = container.querySelector('.skeleton');

    expect(block).toBeInTheDocument();
    expect(block).toHaveStyle({ width: '120px', height: '2rem', borderRadius: '8px' });
  });

  it('對輔助技術隱藏（純裝飾，不該被讀出來）', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('.skeleton')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('SkeletonText', () => {
  it('依 lines 產生對應行數', () => {
    const { container } = render(<SkeletonText lines={4} />);
    expect(container.querySelectorAll('.skeleton')).toHaveLength(4);
  });

  it('最後一行較短，模擬真實段落的收尾', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const blocks = [...container.querySelectorAll('.skeleton')];

    expect(blocks[0]).toHaveStyle({ width: '100%' });
    expect(blocks[blocks.length - 1]).toHaveStyle({ width: '60%' });
  });
});

describe('CardSkeleton', () => {
  it('包含圖片區與文字區的佔位', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelector('.skeleton-card')).toBeInTheDocument();
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(3);
  });
});

describe('CardGridSkeleton', () => {
  it('依 count 產生對應數量的卡片', () => {
    const { container } = render(<CardGridSkeleton count={6} />);
    expect(container.querySelectorAll('.skeleton-card')).toHaveLength(6);
  });

  it('以 role=status 與 aria-busy 告知輔助技術正在載入', () => {
    render(<CardGridSkeleton count={2} />);
    const status = screen.getByRole('status');

    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('載入中，請稍候')).toBeInTheDocument();
  });

  it('可自訂欄位寬度的 class', () => {
    const { container } = render(<CardGridSkeleton count={2} colClassName="col-lg-3" />);
    expect(container.querySelectorAll('.col-lg-3')).toHaveLength(2);
  });
});
