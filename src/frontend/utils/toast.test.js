import { describe, it, expect, vi, beforeEach } from 'vitest';

const fire = vi.fn();
const mixin = vi.fn(() => ({ fire }));

vi.mock('sweetalert2', () => ({
  default: {
    mixin: (...args) => mixin(...args),
    stopTimer: vi.fn(),
    resumeTimer: vi.fn(),
  },
}));

const loadToast = async () => (await import('./toast')).default;

describe('toast', () => {
  beforeEach(() => {
    fire.mockClear();
    mixin.mockClear();
    vi.resetModules();
  });

  it('設定為右上角、不需按鈕、會自動關閉的 toast', async () => {
    await loadToast();
    const config = mixin.mock.calls[0][0];

    expect(config.toast).toBe(true);
    expect(config.position).toBe('top-end');
    // 關鍵：不顯示確認鈕且有 timer，才不會打斷使用者
    expect(config.showConfirmButton).toBe(false);
    expect(config.timer).toBeGreaterThan(0);
  });

  it.each([
    ['success', '已加入收藏'],
    ['error', '收藏失敗，請稍後再試'],
    ['warning', '請先登入會員才能收藏'],
    ['info', '這個活動已經在你的收藏裡了'],
  ])('%s 會以對應的 icon 與文字觸發', async (level, message) => {
    const toast = await loadToast();
    toast[level](message);

    expect(fire).toHaveBeenCalledWith({ icon: level, title: message });
  });

  it('滑鼠移入時暫停倒數，讓使用者讀得完', async () => {
    await loadToast();
    const { didOpen } = mixin.mock.calls[0][0];

    const listeners = {};
    didOpen({ addEventListener: (event, handler) => { listeners[event] = handler; } });

    expect(listeners.mouseenter).toBeTypeOf('function');
    expect(listeners.mouseleave).toBeTypeOf('function');
  });
});
