import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveBookingDraft,
  loadBookingDraft,
  clearBookingDraft,
  resolveBookingData,
} from './bookingDraft';

const SAMPLE = { activityName: '沉浸式 DIY 調製香水', adultCount: 2, totalAmount: 3000 };

describe('bookingDraft', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('save / load', () => {
    it('存進去的資料能原樣讀回來', () => {
      saveBookingDraft(SAMPLE);
      expect(loadBookingDraft()).toEqual(SAMPLE);
    });

    it('沒有草稿時回傳 null', () => {
      expect(loadBookingDraft()).toBeNull();
    });

    it('內容不是合法 JSON 時回傳 null，而不是拋錯', () => {
      sessionStorage.setItem('bookingDraft', '{壞掉的內容');
      expect(loadBookingDraft()).toBeNull();
    });

    it('缺少時間戳的舊格式視為無效', () => {
      sessionStorage.setItem('bookingDraft', JSON.stringify({ data: SAMPLE }));
      expect(loadBookingDraft()).toBeNull();
    });

    it('忽略非物件的輸入', () => {
      saveBookingDraft(null);
      saveBookingDraft('字串');
      expect(loadBookingDraft()).toBeNull();
    });
  });

  describe('時效', () => {
    it('兩小時內仍可還原', () => {
      vi.useFakeTimers();
      saveBookingDraft(SAMPLE);

      vi.advanceTimersByTime(2 * 60 * 60 * 1000 - 1000);
      expect(loadBookingDraft()).toEqual(SAMPLE);
    });

    // 擱置太久的草稿不該還原：名額與價格都可能已經變了
    it('超過兩小時就失效，並清掉殘留資料', () => {
      vi.useFakeTimers();
      saveBookingDraft(SAMPLE);

      vi.advanceTimersByTime(2 * 60 * 60 * 1000 + 1000);
      expect(loadBookingDraft()).toBeNull();
      expect(sessionStorage.getItem('bookingDraft')).toBeNull();
    });
  });

  describe('clearBookingDraft', () => {
    it('清除後讀不到資料', () => {
      saveBookingDraft(SAMPLE);
      clearBookingDraft();
      expect(loadBookingDraft()).toBeNull();
    });
  });

  describe('resolveBookingData', () => {
    it('有 router state 時優先使用它', () => {
      saveBookingDraft({ activityName: '舊的草稿' });
      expect(resolveBookingData(SAMPLE)).toEqual(SAMPLE);
    });

    // 這是整個模組存在的理由：重新整理後 location.state 會是 null
    it('沒有 router state 時退回草稿', () => {
      saveBookingDraft(SAMPLE);
      expect(resolveBookingData(null)).toEqual(SAMPLE);
      expect(resolveBookingData(undefined)).toEqual(SAMPLE);
    });

    it('空物件的 router state 也視為沒有資料', () => {
      saveBookingDraft(SAMPLE);
      expect(resolveBookingData({})).toEqual(SAMPLE);
    });

    it('兩者都沒有時回傳空物件，讓呼叫端能安全取值', () => {
      expect(resolveBookingData(null)).toEqual({});
    });
  });
});
