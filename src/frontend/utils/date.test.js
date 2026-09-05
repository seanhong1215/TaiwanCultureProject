import { describe, it, expect } from 'vitest';
import { formatDate, formatDateZh } from './date';

const sample = new Date(2025, 2, 7); // 2025-03-07（本地時間）

describe('formatDate', () => {
  // 修正前的實作會回傳 "03-07-2025"，欄位順序與格式名稱不符
  it('YYYY-MM-DD 應為年在前', () => {
    expect(formatDate(sample, 'YYYY-MM-DD')).toBe('2025-03-07');
  });

  it('支援其他格式', () => {
    expect(formatDate(sample, 'YYYY/MM/DD')).toBe('2025/03/07');
    expect(formatDate(sample, 'MM/DD/YYYY')).toBe('03/07/2025');
    expect(formatDate(sample, 'DD-MM-YYYY')).toBe('07-03-2025');
  });

  it('個位數的月與日補零', () => {
    expect(formatDate(new Date(2025, 0, 1))).toBe('2025-01-01');
  });

  it('未指定格式時預設 YYYY-MM-DD', () => {
    expect(formatDate(sample)).toBe('2025-03-07');
  });

  it('接受日期字串', () => {
    expect(formatDate('2025-03-07T00:00:00')).toBe('2025-03-07');
  });

  it('無效日期回傳空字串而非 "Invalid Date"', () => {
    expect(formatDate('不是日期')).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate(null)).toBe('');
  });
});

describe('formatDateZh', () => {
  it('輸出中文長格式', () => {
    expect(formatDateZh(sample)).toBe('2025年03月07日');
  });

  it('無效日期回傳空字串', () => {
    expect(formatDateZh('')).toBe('');
  });
});
