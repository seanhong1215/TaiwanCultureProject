import { describe, it, expect } from 'vitest';
import { cloudinaryOptimize } from './cloudinary';

const sample = 'https://res.cloudinary.com/dwjbzadev/image/upload/v1741062253/foo_bar.png';

describe('cloudinaryOptimize', () => {
  it('插入 f_auto,q_auto,w_<width> 轉換參數', () => {
    expect(cloudinaryOptimize(sample, 400)).toBe(
      'https://res.cloudinary.com/dwjbzadev/image/upload/f_auto,q_auto,w_400/v1741062253/foo_bar.png'
    );
  });

  it('未傳 width 時只加 f_auto,q_auto', () => {
    expect(cloudinaryOptimize(sample)).toBe(
      'https://res.cloudinary.com/dwjbzadev/image/upload/f_auto,q_auto/v1741062253/foo_bar.png'
    );
  });

  it('非 Cloudinary 網址原樣返回', () => {
    const other = 'https://example.com/image.png';
    expect(cloudinaryOptimize(other, 400)).toBe(other);
  });

  it('空值／非字串原樣返回', () => {
    expect(cloudinaryOptimize(null, 400)).toBe(null);
    expect(cloudinaryOptimize(undefined, 400)).toBe(undefined);
    expect(cloudinaryOptimize('', 400)).toBe('');
  });
});
