import type { TimeSignature, TimeSignatureTransition } from '../types';
import { TransitionManager } from './transitionManager';
import { ScoringEngine } from './scoringEngine';

export class AudioEngine {
  private audioContext: AudioContext;
  private isPlaying = false;
  private bpm = 120;
  private currentBeat = 0;
  private currentMeasure = 0;
  private timeSignature: TimeSignature = { numerator: 4, denominator: 4 };
  private transitions: TimeSignatureTransition[] = [];
  private transitionManager: TransitionManager;
  private scoringEngine: ScoringEngine;
  private nextNoteTime = 0.0;
  private scheduleAheadTime = 0.1;
  // private lookAhead = 25.0; // 未來用於優化
  private noteQueue: Array<{ time: number; isDownbeat: boolean; measure: number }> = [];
  private schedulerId: number | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.transitionManager = new TransitionManager(this.timeSignature);
    this.scoringEngine = new ScoringEngine();
  }

  /**
   * 初始化會話
   */
  initialize(bpm: number, timeSignature: TimeSignature, transitions?: TimeSignatureTransition[]) {
    this.bpm = bpm;
    this.timeSignature = timeSignature;
    this.transitions = transitions || [];
    this.currentBeat = 0;
    this.currentMeasure = 0;

    // 初始化轉換管理器和計分引擎
    this.transitionManager = new TransitionManager(timeSignature);
    if (transitions && transitions.length > 0) {
      this.transitionManager.setTransitions(transitions);
    }

    this.scoringEngine.initialize(bpm, timeSignature);
    if (transitions) {
      // 轉換時間點需要根據 BPM 計算
      const beatDuration = 60 / bpm;
      const transitionPoints = transitions.map(t => ({
        measure: t.measureAtTransition,
        time: t.measureAtTransition * t.from.numerator * beatDuration
      }));
      this.scoringEngine.setTransitionPoints(transitionPoints);
    }
  }

  /**
   * 開始播放
   */
  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentBeat = 0;
    this.currentMeasure = 0;
    this.nextNoteTime = this.audioContext.currentTime;
    this.scheduler();
  }

  /**
   * 停止播放
   */
  stop() {
    this.isPlaying = false;
    if (this.schedulerId !== null) {
      cancelAnimationFrame(this.schedulerId);
      this.schedulerId = null;
    }
    this.noteQueue = [];
  }

  /**
   * 暫停/恢復
   */
  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * 取得當前時間的拍號（用於處理轉換）
   */
  private getCurrentTimeSignature(): TimeSignature {
    if (!this.transitions || this.transitions.length === 0) {
      return this.timeSignature;
    }

    for (const transition of this.transitions) {
      if (this.currentMeasure >= transition.measureAtTransition) {
        return transition.to;
      }
    }
    return this.timeSignature;
  }

  /**
   * 調度器：定時檢查並安排音符
   */
  private scheduler() {
    // 檢查是否有待安排的音符
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime);
      this.advance();
    }

    this.schedulerId = requestAnimationFrame(() => this.scheduler());
  }

  /**
   * 推進到下一拍
   */
  private advance() {
    const beatLength = 60.0 / this.bpm;
    this.nextNoteTime += beatLength;
    this.currentBeat++;

    // 檢查小節邊界
    const ts = this.getCurrentTimeSignature();
    if (this.currentBeat % ts.numerator === 0) {
      this.currentMeasure++;
      this.currentBeat = 0;
    }
  }

  /**
   * 安排音符播放
   */
  private scheduleNote(beatInMeasure: number, time: number) {
    // const ts = this.getCurrentTimeSignature(); // 獲取當前拍號（未來用於複雜邏輯）
    const isDownbeat = beatInMeasure === 0;

    this.noteQueue.push({ time, isDownbeat, measure: this.currentMeasure });

    // 實際播放聲音
    this.playSound(isDownbeat, time);
  }

  /**
   * 播放聲音
   */
  private playSound(isDownbeat: boolean, time: number) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    // 重音用不同頻率
    osc.frequency.value = isDownbeat ? 880 : 440;
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  /**
   * 記錄用戶擊鼓輸入
   */
  recordUserHit() {
    const result = this.scoringEngine.recordHit(this.audioContext.currentTime);
    return result;
  }

  /**
   * 取得當前計分統計
   */
  getScoreStats() {
    return this.scoringEngine.getStats();
  }

  /**
   * 取得轉換管理器
   */
  getTransitionManager() {
    return this.transitionManager;
  }

  /**
   * 取得計分引擎
   */
  getScoringEngine() {
    return this.scoringEngine;
  }

  /**
   * 取得當前狀態
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      bpm: this.bpm,
      currentBeat: this.currentBeat,
      currentMeasure: this.currentMeasure,
      timeSignature: this.getCurrentTimeSignature(),
      audioContextTime: this.audioContext.currentTime,
      transitionState: this.transitionManager.getState()
    };
  }

  /**
   * 取得最近的音符隊列（用於視覺化）
   */
  getNoteQueue() {
    return [...this.noteQueue].slice(-10);
  }

  /**
   * 清空音符隊列
   */
  clearNoteQueue() {
    this.noteQueue = [];
  }
}
