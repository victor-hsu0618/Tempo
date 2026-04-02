/**
 * 反饋系統
 * 提供即時的視覺和聽覺反饋
 */
export class FeedbackSystem {
  private audioContext: AudioContext;
  private feedbackCallbacks: Map<FeedbackType, Set<(data: any) => void>> = new Map();

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.initializeFeedbackTypes();
  }

  /**
   * 初始化反饋類型
   */
  private initializeFeedbackTypes() {
    const types: FeedbackType[] = ['hit', 'miss', 'transition', 'perfect', 'warning'];
    types.forEach(type => {
      this.feedbackCallbacks.set(type, new Set());
    });
  }

  /**
   * 正確擊鼓反饋
   */
  providePerfectHitFeedback(accuracy: number) {
    if (accuracy >= 95) {
      this.playPerfectSound();
      this.emit('perfect', { accuracy });
    } else if (accuracy >= 85) {
      this.playGoodSound();
      this.emit('hit', { accuracy });
    } else {
      this.playOkaySound();
      this.emit('hit', { accuracy });
    }
  }

  /**
   * 擊鼓失誤反饋
   */
  provideMissedHitFeedback() {
    this.playMissSound();
    this.emit('miss', {});
  }

  /**
   * 轉換點反饋
   */
  provideTransitionFeedback(accuracy: number) {
    this.playTransitionSound();
    this.emit('transition', { accuracy });
  }

  /**
   * 警告反饋
   */
  provideWarningFeedback(message: string) {
    this.playWarningSound();
    this.emit('warning', { message });
  }

  /**
   * 播放完美擊鼓音效
   */
  private playPerfectSound() {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * 播放良好擊鼓音效
   */
  private playGoodSound() {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * 播放一般擊鼓音效
   */
  private playOkaySound() {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * 播放失誤音效
   */
  private playMissSound() {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * 播放轉換音效
   */
  private playTransitionSound() {
    const now = this.audioContext.currentTime;

    // 雙音
    for (let i = 0; i < 2; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      const baseFreq = 1200 + i * 200;
      osc.frequency.value = baseFreq;
      gain.gain.setValueAtTime(0.15, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.1);
    }
  }

  /**
   * 播放警告音效
   */
  private playWarningSound() {
    const now = this.audioContext.currentTime;

    // 快速上升的音調
    for (let i = 0; i < 3; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.frequency.setValueAtTime(600 + i * 200, now + i * 0.08);
      osc.frequency.exponentialRampToValueAtTime(800 + i * 200, now + i * 0.08 + 0.08);
      gain.gain.setValueAtTime(0.1, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.08);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.08);
    }
  }

  /**
   * 添加反饋監聽器
   */
  addListener(type: FeedbackType, callback: (data: any) => void) {
    const listeners = this.feedbackCallbacks.get(type);
    if (listeners) {
      listeners.add(callback);
    }
  }

  /**
   * 移除反饋監聽器
   */
  removeListener(type: FeedbackType, callback: (data: any) => void) {
    const listeners = this.feedbackCallbacks.get(type);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * 觸發反饋事件
   */
  private emit(type: FeedbackType, data: any) {
    const listeners = this.feedbackCallbacks.get(type);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

export type FeedbackType = 'hit' | 'miss' | 'transition' | 'perfect' | 'warning';
