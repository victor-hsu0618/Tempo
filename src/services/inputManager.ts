/**
 * 輸入管理器
 * 處理鍵盤和觸屏輸入
 */
export class InputManager {
  private listeners: Set<(timestamp: number) => void> = new Set();
  private lastInputTime: number = 0;
  private inputDebounce: number = 50; // 毫秒，防止連續輸入

  constructor() {
    this.setupKeyboardListener();
    this.setupTouchListener();
  }

  /**
   * 設置鍵盤監聽
   */
  private setupKeyboardListener() {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        this.recordInput();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
  }

  /**
   * 設置觸屏監聽
   */
  private setupTouchListener() {
    const handleTouchStart = (event: TouchEvent) => {
      // 可以添加特定元素的觸屏檢測
      const target = event.target as HTMLElement;
      if (target?.classList.contains('touchable-input')) {
        event.preventDefault();
        this.recordInput();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
  }

  /**
   * 記錄輸入
   */
  private recordInput() {
    const now = performance.now() / 1000; // 轉換為秒

    // 防抖：避免連續輸入
    if (now - this.lastInputTime < this.inputDebounce / 1000) {
      return;
    }

    this.lastInputTime = now;

    // 通知所有監聽器
    this.listeners.forEach(listener => listener(now));
  }

  /**
   * 添加監聽器
   */
  addEventListener(listener: (timestamp: number) => void) {
    this.listeners.add(listener);
  }

  /**
   * 移除監聽器
   */
  removeEventListener(listener: (timestamp: number) => void) {
    this.listeners.delete(listener);
  }

  /**
   * 清空所有監聽器
   */
  clear() {
    this.listeners.clear();
  }

  /**
   * 取得最後輸入時間
   */
  getLastInputTime(): number {
    return this.lastInputTime;
  }
}
