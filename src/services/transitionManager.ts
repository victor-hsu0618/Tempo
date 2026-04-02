import type { TimeSignature, TimeSignatureTransition } from '../types';

/**
 * 時間簽名轉換管理器
 * 處理複雜的拍號轉換邏輯（如 2/4 → 3/4）
 */
export class TransitionManager {
  private transitions: TimeSignatureTransition[] = [];
  private currentMeasure = 0;
  private currentBeat = 0;
  private currentTimeSignature: TimeSignature;
  private warningCallback?: (warningData: TransitionWarning) => void;
  private transitionCallback?: (newTimeSignature: TimeSignature) => void;

  constructor(initialTimeSignature: TimeSignature) {
    this.currentTimeSignature = { ...initialTimeSignature };
  }

  /**
   * 設置轉換序列
   */
  setTransitions(transitions: TimeSignatureTransition[]) {
    this.transitions = transitions.sort((a, b) => a.measureAtTransition - b.measureAtTransition);
  }

  /**
   * 推進到下一拍
   */
  advance(): { transitioned: boolean; newTimeSignature?: TimeSignature; warning?: TransitionWarning } {
    this.currentBeat++;

    // 檢查小節邊界
    if (this.currentBeat >= this.currentTimeSignature.numerator) {
      this.currentBeat = 0;
      this.currentMeasure++;
    }

    const result: { transitioned: boolean; newTimeSignature?: TimeSignature; warning?: TransitionWarning } = {
      transitioned: false
    };

    // 檢查是否有待轉換
    for (const transition of this.transitions) {
      // 轉換已發生
      if (this.currentMeasure === transition.measureAtTransition && this.currentBeat === 0) {
        this.currentTimeSignature = { ...transition.to };
        result.transitioned = true;
        result.newTimeSignature = { ...transition.to };

        if (this.transitionCallback) {
          this.transitionCallback(this.currentTimeSignature);
        }
      }

      // 轉換警告（提前 N 小節）
      if (transition.warningMeasure !== undefined) {
        const warningMeasure = transition.measureAtTransition - transition.warningMeasure;
        if (this.currentMeasure === warningMeasure && this.currentBeat === 0) {
          const warning: TransitionWarning = {
            fromTimeSignature: transition.from,
            toTimeSignature: transition.to,
            measureCount: transition.warningMeasure,
            beatsUntilTransition: transition.warningMeasure * transition.from.numerator
          };
          result.warning = warning;

          if (this.warningCallback) {
            this.warningCallback(warning);
          }
        }
      }
    }

    return result;
  }

  /**
   * 設置警告回調
   */
  onWarning(callback: (warning: TransitionWarning) => void) {
    this.warningCallback = callback;
  }

  /**
   * 設置轉換完成回調
   */
  onTransition(callback: (newTimeSignature: TimeSignature) => void) {
    this.transitionCallback = callback;
  }

  /**
   * 取得當前狀態
   */
  getState() {
    return {
      currentTimeSignature: { ...this.currentTimeSignature },
      currentMeasure: this.currentMeasure,
      currentBeat: this.currentBeat,
      measureProgress: `${this.currentBeat + 1}/${this.currentTimeSignature.numerator}`
    };
  }

  /**
   * 重置
   */
  reset() {
    this.currentMeasure = 0;
    this.currentBeat = 0;
  }

  /**
   * 取得下一個轉換信息
   */
  getNextTransition(): TimeSignatureTransition | null {
    for (const t of this.transitions) {
      if (t.measureAtTransition > this.currentMeasure) {
        return t;
      }
    }
    return null;
  }
}

/**
 * 轉換警告數據
 */
export interface TransitionWarning {
  fromTimeSignature: TimeSignature;
  toTimeSignature: TimeSignature;
  measureCount: number;
  beatsUntilTransition: number;
}
