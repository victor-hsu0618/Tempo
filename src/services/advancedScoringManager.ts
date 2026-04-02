import type { ScoreEntry } from '../types';
import { ScoringEngine } from './scoringEngine';

/**
 * 高級計分管理器
 * 提供會話級別的計分管理、歷史追蹤和分析
 */
export class AdvancedScoringManager {
  private scoringEngine: ScoringEngine;
  private sessionScores: ScoreEntry[] = [];
  private startTime: number = 0;
  private sessionDuration: number = 0;
  private isSessionActive: boolean = false;
  private transitionHitCount: number = 0;
  private transitionMissCount: number = 0;

  constructor() {
    this.scoringEngine = new ScoringEngine();
  }

  /**
   * 開始新的計分會話
   */
  startSession(bpm: number, timeSignature: { numerator: number; denominator: number }) {
    this.scoringEngine.initialize(bpm, timeSignature);
    this.sessionScores = [];
    this.startTime = Date.now();
    this.isSessionActive = true;
    this.transitionHitCount = 0;
    this.transitionMissCount = 0;
  }

  /**
   * 結束會話
   */
  endSession(): SessionSummary {
    this.isSessionActive = false;
    this.sessionDuration = (Date.now() - this.startTime) / 1000;

    return {
      totalScore: this.getAverageScore(),
      sessionDuration: this.sessionDuration,
      totalHits: this.getTotalHits(),
      totalBeats: this.getTotalBeats(),
      accuracy: this.getOverallAccuracy(),
      improvement: this.calculateImprovement(),
      transitionAccuracy: this.getTransitionAccuracy(),
      scoreHistory: [...this.sessionScores]
    };
  }

  /**
   * 記錄用戶輸入
   */
  recordInput(time: number, isTransitionPoint: boolean = false) {
    const result = this.scoringEngine.recordHit(time);

    // 記錄到會話歷史
    const entry: ScoreEntry = {
      timestamp: time,
      bpm: 0, // 會在 getStats 中更新
      accuracy: result.accuracy,
      hitCount: 1,
      totalBeats: 1,
      transitionAccuracy: result.transitionAccuracy
    };

    this.sessionScores.push(entry);

    // 追蹤轉換點命中
    if (isTransitionPoint) {
      if (result.isHit) {
        this.transitionHitCount++;
      } else {
        this.transitionMissCount++;
      }
    }

    return result;
  }

  /**
   * 取得平均分數
   */
  getAverageScore(): number {
    if (this.sessionScores.length === 0) return 0;
    const sum = this.sessionScores.reduce((acc, entry) => acc + entry.accuracy, 0);
    return Math.round(sum / this.sessionScores.length);
  }

  /**
   * 取得總擊鼓次數
   */
  getTotalHits(): number {
    return this.scoringEngine.getStats().hitCount;
  }

  /**
   * 取得總節拍
   */
  getTotalBeats(): number {
    return this.scoringEngine.getStats().totalBeats;
  }

  /**
   * 取得整體準確度
   */
  getOverallAccuracy(): number {
    const stats = this.scoringEngine.getStats();
    return Math.round(stats.hitRate);
  }

  /**
   * 計算進度改善
   */
  private calculateImprovement(): number {
    if (this.sessionScores.length < 2) return 0;

    const firstQuarter = this.sessionScores.slice(0, Math.floor(this.sessionScores.length / 4));
    const lastQuarter = this.sessionScores.slice(-Math.floor(this.sessionScores.length / 4));

    if (firstQuarter.length === 0 || lastQuarter.length === 0) return 0;

    const avgFirst = firstQuarter.reduce((sum, e) => sum + e.accuracy, 0) / firstQuarter.length;
    const avgLast = lastQuarter.reduce((sum, e) => sum + e.accuracy, 0) / lastQuarter.length;

    return Math.round(((avgLast - avgFirst) / avgFirst) * 100);
  }

  /**
   * 取得轉換點準確度
   */
  getTransitionAccuracy(): number {
    if (this.transitionHitCount + this.transitionMissCount === 0) return 0;
    return Math.round(
      (this.transitionHitCount / (this.transitionHitCount + this.transitionMissCount)) * 100
    );
  }

  /**
   * 取得當前統計
   */
  getCurrentStats() {
    return {
      averageScore: this.getAverageScore(),
      totalHits: this.getTotalHits(),
      totalBeats: this.getTotalBeats(),
      accuracy: this.getOverallAccuracy(),
      transitionAccuracy: this.getTransitionAccuracy(),
      isActive: this.isSessionActive
    };
  }

  /**
   * 取得詳細的分數分佈
   */
  getScoreDistribution(): ScoreDistribution {
    const excellent = this.sessionScores.filter(e => e.accuracy >= 95).length;
    const good = this.sessionScores.filter(e => e.accuracy >= 85 && e.accuracy < 95).length;
    const fair = this.sessionScores.filter(e => e.accuracy >= 75 && e.accuracy < 85).length;
    const poor = this.sessionScores.filter(e => e.accuracy < 75).length;

    return {
      excellent,
      good,
      fair,
      poor,
      total: this.sessionScores.length
    };
  }

  /**
   * 重置
   */
  reset() {
    this.scoringEngine.reset();
    this.sessionScores = [];
    this.startTime = 0;
    this.sessionDuration = 0;
    this.isSessionActive = false;
    this.transitionHitCount = 0;
    this.transitionMissCount = 0;
  }
}

/**
 * 會話總結
 */
export interface SessionSummary {
  totalScore: number;
  sessionDuration: number;
  totalHits: number;
  totalBeats: number;
  accuracy: number;
  improvement: number;
  transitionAccuracy: number;
  scoreHistory: ScoreEntry[];
}

/**
 * 分數分佈
 */
export interface ScoreDistribution {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
  total: number;
}
