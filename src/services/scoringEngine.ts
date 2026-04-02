/**
 * 計分引擎：偵測用戶輸入、計算準確度、管理轉換點
 */
export class ScoringEngine {
  private targetBeatTimes: number[] = [];
  private userHitTimes: number[] = [];
  private accuracyThreshold = 0.1; // 秒（100ms）
  private transitionPoints: Array<{ measure: number; time: number }> = [];
  private currentScore = 0;
  private hitCount = 0;

  /**
   * 初始化計分會話
   */
  initialize(bpm: number, _timeSignature?: { numerator: number; denominator: number }) {
    this.targetBeatTimes = [];
    this.userHitTimes = [];
    this.currentScore = 0;
    this.hitCount = 0;

    // 生成目標節拍時間（前 60 秒）
    const beatDuration = 60 / bpm;
    for (let i = 0; i < 60 / beatDuration; i++) {
      this.targetBeatTimes.push(i * beatDuration);
    }
  }

  /**
   * 設置轉換點
   */
  setTransitionPoints(transitions: Array<{ measure: number; time: number }>) {
    this.transitionPoints = transitions;
  }

  /**
   * 記錄用戶擊鼓輸入
   */
  recordHit(time: number): { accuracy: number; isHit: boolean; transitionAccuracy?: number } {
    this.userHitTimes.push(time);

    // 尋找最近的目標節拍
    let closestBeat = this.targetBeatTimes[0];
    let minDiff = Math.abs(time - closestBeat);

    for (const beat of this.targetBeatTimes) {
      const diff = Math.abs(time - beat);
      if (diff < minDiff) {
        minDiff = diff;
        closestBeat = beat;
      }
    }

    // 計算準確度（0-100）
    const accuracy = Math.max(0, 100 - (minDiff / this.accuracyThreshold) * 100);
    const isHit = minDiff <= this.accuracyThreshold;

    if (isHit) {
      this.hitCount++;
      this.currentScore += accuracy;
    }

    // 檢查是否在轉換點附近
    let transitionAccuracy: number | undefined;
    for (const tp of this.transitionPoints) {
      const distToTransition = Math.abs(time - tp.time);
      if (distToTransition < this.accuracyThreshold) {
        transitionAccuracy = Math.max(0, 100 - (distToTransition / this.accuracyThreshold) * 100);
      }
    }

    return { accuracy, isHit, transitionAccuracy };
  }

  /**
   * 取得當前分數
   */
  getScore(): number {
    return Math.round(this.currentScore / Math.max(1, this.hitCount));
  }

  /**
   * 取得統計數據
   */
  getStats() {
    return {
      hitCount: this.hitCount,
      totalBeats: this.targetBeatTimes.length,
      accuracy: this.getScore(),
      hitRate: (this.hitCount / this.targetBeatTimes.length) * 100
    };
  }

  /**
   * 重置計分
   */
  reset() {
    this.userHitTimes = [];
    this.currentScore = 0;
    this.hitCount = 0;
  }
}
