import type { UserProgress, ScoreEntry } from '../types';

const STORAGE_KEY = 'tempo_user_progress';

export class StorageService {
  /**
   * 取得用戶進度
   */
  static getUserProgress(): UserProgress {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      totalPracticeTime: 0,
      bestScore: 0,
      sessionHistory: [],
      completedLessons: []
    };
  }

  /**
   * 保存用戶進度
   */
  static saveUserProgress(progress: UserProgress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  /**
   * 新增計分記錄
   */
  static addScoreEntry(entry: ScoreEntry) {
    const progress = this.getUserProgress();
    progress.sessionHistory.push(entry);
    
    // 更新最高分
    if (entry.accuracy > progress.bestScore) {
      progress.bestScore = entry.accuracy;
    }

    this.saveUserProgress(progress);
  }

  /**
   * 標記課程完成
   */
  static completeLessonId(lessonId: string) {
    const progress = this.getUserProgress();
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }
    this.saveUserProgress(progress);
  }

  /**
   * 取得課程歷史
   */
  static getLessonHistory(_lessonId: string): ScoreEntry[] {
    const progress = this.getUserProgress();
    return progress.sessionHistory.filter(entry => entry.bpm > 0); // 簡單過濾
  }

  /**
   * 保存自訂節奏模式
   */
  static saveCustomPattern(patternId: string, pattern: any) {
    const key = `tempo_pattern_${patternId}`;
    localStorage.setItem(key, JSON.stringify(pattern));
  }

  /**
   * 取得自訂節奏模式
   */
  static getCustomPattern(patternId: string): any {
    const key = `tempo_pattern_${patternId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * 列出所有自訂模式
   */
  static listCustomPatterns(): string[] {
    const patterns: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tempo_pattern_')) {
        patterns.push(key.replace('tempo_pattern_', ''));
      }
    }
    return patterns;
  }

  /**
   * 刪除自訂模式
   */
  static deleteCustomPattern(patternId: string) {
    const key = `tempo_pattern_${patternId}`;
    localStorage.removeItem(key);
  }

  /**
   * 清空所有數據（測試用）
   */
  static clearAll() {
    localStorage.clear();
  }
}
