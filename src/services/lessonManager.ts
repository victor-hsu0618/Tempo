import type { Lesson } from '../types';
import { StorageService } from './storageService';

/**
 * 課程管理器
 * 管理課程、難度級別和進度追蹤
 */
export class LessonManager {
  private lessons: Map<string, Lesson> = new Map();
  private userProgress: Map<string, LessonProgress> = new Map();

  constructor() {
    this.initializeDefaultLessons();
    this.loadUserProgress();
  }

  /**
   * 初始化預設課程
   */
  private initializeDefaultLessons() {
    const defaultLessons: Lesson[] = [
      // 初級課程
      {
        id: 'beginner-basic-4-4',
        title: '初級：基礎 4/4 拍',
        description: '學習最基本的四拍子節奏',
        difficulty: 'beginner',
        sessions: [
          { id: 'session-1', bpm: 60, timeSignature: { numerator: 4, denominator: 4 }, duration: 30, difficulty: 'beginner' },
          { id: 'session-2', bpm: 80, timeSignature: { numerator: 4, denominator: 4 }, duration: 30, difficulty: 'beginner' },
          { id: 'session-3', bpm: 100, timeSignature: { numerator: 4, denominator: 4 }, duration: 45, difficulty: 'beginner' }
        ],
        requiredScore: 75
      },

      {
        id: 'beginner-basic-3-4',
        title: '初級：基礎 3/4 拍',
        description: '學習三拍子（圓舞曲風格）',
        difficulty: 'beginner',
        sessions: [
          { id: 'session-1', bpm: 60, timeSignature: { numerator: 3, denominator: 4 }, duration: 30, difficulty: 'beginner' },
          { id: 'session-2', bpm: 80, timeSignature: { numerator: 3, denominator: 4 }, duration: 30, difficulty: 'beginner' },
          { id: 'session-3', bpm: 100, timeSignature: { numerator: 3, denominator: 4 }, duration: 45, difficulty: 'beginner' }
        ],
        requiredScore: 75
      },

      // 中級課程
      {
        id: 'intermediate-eighth-notes',
        title: '中級：八分音符',
        description: '增加速度，練習八分音符',
        difficulty: 'intermediate',
        sessions: [
          { id: 'session-1', bpm: 80, timeSignature: { numerator: 4, denominator: 4 }, duration: 45, difficulty: 'intermediate' },
          { id: 'session-2', bpm: 100, timeSignature: { numerator: 4, denominator: 4 }, duration: 60, difficulty: 'intermediate' },
          { id: 'session-3', bpm: 120, timeSignature: { numerator: 4, denominator: 4 }, duration: 60, difficulty: 'intermediate' }
        ],
        requiredScore: 80
      },

      {
        id: 'intermediate-compound-time',
        title: '中級：複合拍子 6/8',
        description: '學習複合拍子（搖晃感）',
        difficulty: 'intermediate',
        sessions: [
          { id: 'session-1', bpm: 70, timeSignature: { numerator: 6, denominator: 8 }, duration: 45, difficulty: 'intermediate' },
          { id: 'session-2', bpm: 90, timeSignature: { numerator: 6, denominator: 8 }, duration: 60, difficulty: 'intermediate' },
          { id: 'session-3', bpm: 110, timeSignature: { numerator: 6, denominator: 8 }, duration: 60, difficulty: 'intermediate' }
        ],
        requiredScore: 80
      },

      // 高級：轉換訓練
      {
        id: 'advanced-transition-2-3',
        title: '高級：轉換訓練 2/4 → 3/4',
        description: '學習拍號轉換（2/4 到 3/4）',
        difficulty: 'advanced',
        sessions: [
          { id: 'session-1', bpm: 90, timeSignature: { numerator: 2, denominator: 4 }, transitions: [{ from: { numerator: 2, denominator: 4 }, to: { numerator: 3, denominator: 4 }, measureAtTransition: 4, warningMeasure: 1 }], duration: 60, difficulty: 'advanced' },
          { id: 'session-2', bpm: 110, timeSignature: { numerator: 2, denominator: 4 }, transitions: [{ from: { numerator: 2, denominator: 4 }, to: { numerator: 3, denominator: 4 }, measureAtTransition: 3, warningMeasure: 1 }], duration: 60, difficulty: 'advanced' },
          { id: 'session-3', bpm: 130, timeSignature: { numerator: 2, denominator: 4 }, transitions: [{ from: { numerator: 2, denominator: 4 }, to: { numerator: 3, denominator: 4 }, measureAtTransition: 2, warningMeasure: 1 }], duration: 90, difficulty: 'advanced' }
        ],
        requiredScore: 85
      },

      {
        id: 'advanced-transition-3-4',
        title: '高級：轉換訓練 3/4 → 4/4',
        description: '學習拍號轉換（3/4 到 4/4）',
        difficulty: 'advanced',
        sessions: [
          { id: 'session-1', bpm: 90, timeSignature: { numerator: 3, denominator: 4 }, transitions: [{ from: { numerator: 3, denominator: 4 }, to: { numerator: 4, denominator: 4 }, measureAtTransition: 4, warningMeasure: 1 }], duration: 60, difficulty: 'advanced' },
          { id: 'session-2', bpm: 110, timeSignature: { numerator: 3, denominator: 4 }, transitions: [{ from: { numerator: 3, denominator: 4 }, to: { numerator: 4, denominator: 4 }, measureAtTransition: 3, warningMeasure: 1 }], duration: 60, difficulty: 'advanced' },
          { id: 'session-3', bpm: 130, timeSignature: { numerator: 3, denominator: 4 }, transitions: [{ from: { numerator: 3, denominator: 4 }, to: { numerator: 4, denominator: 4 }, measureAtTransition: 2, warningMeasure: 1 }], duration: 90, difficulty: 'advanced' }
        ],
        requiredScore: 85
      },

      // 專家：複雜轉換鏈
      {
        id: 'expert-complex-transitions',
        title: '專家：複雜轉換鏈 2/4 → 3/4 → 4/4',
        description: '連續多個轉換（2/4 → 3/4 → 4/4）',
        difficulty: 'expert',
        sessions: [
          {
            id: 'session-1',
            bpm: 100,
            timeSignature: { numerator: 2, denominator: 4 },
            transitions: [
              { from: { numerator: 2, denominator: 4 }, to: { numerator: 3, denominator: 4 }, measureAtTransition: 4, warningMeasure: 1 },
              { from: { numerator: 3, denominator: 4 }, to: { numerator: 4, denominator: 4 }, measureAtTransition: 8, warningMeasure: 1 }
            ],
            duration: 90,
            difficulty: 'expert'
          },
          {
            id: 'session-2',
            bpm: 120,
            timeSignature: { numerator: 2, denominator: 4 },
            transitions: [
              { from: { numerator: 2, denominator: 4 }, to: { numerator: 3, denominator: 4 }, measureAtTransition: 3, warningMeasure: 1 },
              { from: { numerator: 3, denominator: 4 }, to: { numerator: 4, denominator: 4 }, measureAtTransition: 6, warningMeasure: 1 }
            ],
            duration: 90,
            difficulty: 'expert'
          }
        ],
        requiredScore: 90
      }
    ];

    defaultLessons.forEach(lesson => {
      this.lessons.set(lesson.id, lesson);
    });
  }

  /**
   * 載入用戶進度
   */
  private loadUserProgress() {
    const progress = StorageService.getUserProgress();
    progress.completedLessons.forEach(lessonId => {
      this.userProgress.set(lessonId, { completed: true, attempts: 0, bestScore: 0 });
    });
  }

  /**
   * 取得所有課程
   */
  getAllLessons(): Lesson[] {
    return Array.from(this.lessons.values());
  }

  /**
   * 按難度取得課程
   */
  getLessonsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'): Lesson[] {
    return Array.from(this.lessons.values()).filter(l => l.difficulty === difficulty);
  }

  /**
   * 取得單個課程
   */
  getLesson(id: string): Lesson | undefined {
    return this.lessons.get(id);
  }

  /**
   * 取得課程進度
   */
  getLessonProgress(lessonId: string): LessonProgress {
    return this.userProgress.get(lessonId) || { completed: false, attempts: 0, bestScore: 0 };
  }

  /**
   * 更新課程分數
   */
  updateLessonScore(lessonId: string, score: number): LessonProgress {
    const progress = this.getLessonProgress(lessonId);
    progress.attempts++;
    progress.bestScore = Math.max(progress.bestScore, score);

    // 檢查是否完成課程
    const lesson = this.lessons.get(lessonId);
    if (lesson && score >= lesson.requiredScore) {
      progress.completed = true;
      StorageService.completeLessonId(lessonId);
    }

    this.userProgress.set(lessonId, progress);
    return progress;
  }

  /**
   * 檢查課程是否完成
   */
  isLessonCompleted(lessonId: string): boolean {
    const progress = this.getLessonProgress(lessonId);
    return progress.completed;
  }

  /**
   * 取得完成進度百分比
   */
  getCompletionPercentage(): number {
    const total = this.lessons.size;
    const completed = Array.from(this.userProgress.values()).filter(p => p.completed).length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }

  /**
   * 取得下一個推薦課程
   */
  getRecommendedLesson(): Lesson | null {
    // 優先完成初級課程
    const beginnerLessons = this.getLessonsByDifficulty('beginner');
    for (const lesson of beginnerLessons) {
      if (!this.isLessonCompleted(lesson.id)) {
        return lesson;
      }
    }

    // 然後中級
    const intermediateLessons = this.getLessonsByDifficulty('intermediate');
    for (const lesson of intermediateLessons) {
      if (!this.isLessonCompleted(lesson.id)) {
        return lesson;
      }
    }

    // 然後高級
    const advancedLessons = this.getLessonsByDifficulty('advanced');
    for (const lesson of advancedLessons) {
      if (!this.isLessonCompleted(lesson.id)) {
        return lesson;
      }
    }

    // 最後專家
    const expertLessons = this.getLessonsByDifficulty('expert');
    for (const lesson of expertLessons) {
      if (!this.isLessonCompleted(lesson.id)) {
        return lesson;
      }
    }

    return null;
  }

  /**
   * 取得統計信息
   */
  getStatistics() {
    const allLessons = this.getAllLessons();
    const completedLessons = allLessons.filter(l => this.isLessonCompleted(l.id));

    let totalAttempts = 0;
    let totalBestScore = 0;

    this.userProgress.forEach(progress => {
      totalAttempts += progress.attempts;
      totalBestScore += progress.bestScore;
    });

    return {
      totalLessons: allLessons.length,
      completedLessons: completedLessons.length,
      completionPercentage: this.getCompletionPercentage(),
      totalAttempts,
      averageBestScore: this.userProgress.size === 0 ? 0 : Math.round(totalBestScore / this.userProgress.size)
    };
  }
}

/**
 * 課程進度
 */
export interface LessonProgress {
  completed: boolean;
  attempts: number;
  bestScore: number;
}
