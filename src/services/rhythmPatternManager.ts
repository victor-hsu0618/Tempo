import type { RhythmPattern, Note, TimeSignature } from '../types';
import { StorageService } from './storageService';

/**
 * 節奏模式管理器
 * 管理預設和自訂節奏模式
 */
export class RhythmPatternManager {
  private patterns: Map<string, RhythmPattern> = new Map();
  private defaultPatterns: RhythmPattern[] = [];

  constructor() {
    this.initializeDefaultPatterns();
  }

  /**
   * 初始化預設模式
   */
  private initializeDefaultPatterns() {
    this.defaultPatterns = [
      // 初級：簡單四分音符
      {
        id: 'beginner-quarter-4-4',
        name: '初級 - 四分音符 (4/4)',
        description: '每拍一個四分音符',
        timeSignature: { numerator: 4, denominator: 4 },
        notes: [
          { pitch: 'C4', duration: 1, dotted: false },
          { pitch: 'C4', duration: 1, dotted: false },
          { pitch: 'C4', duration: 1, dotted: false },
          { pitch: 'C4', duration: 1, dotted: false }
        ],
        difficulty: 'beginner'
      },

      // 初級：簡單三拍
      {
        id: 'beginner-quarter-3-4',
        name: '初級 - 四分音符 (3/4)',
        description: '圓舞曲風格',
        timeSignature: { numerator: 3, denominator: 4 },
        notes: [
          { pitch: 'C4', duration: 1, dotted: false },
          { pitch: 'C4', duration: 1, dotted: false },
          { pitch: 'C4', duration: 1, dotted: false }
        ],
        difficulty: 'beginner'
      },

      // 中級：八分音符混合
      {
        id: 'intermediate-eighth-4-4',
        name: '中級 - 八分音符 (4/4)',
        description: '速度加倍',
        timeSignature: { numerator: 4, denominator: 4 },
        notes: [
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false }
        ],
        difficulty: 'intermediate'
      },

      // 中級：複合拍子 (6/8)
      {
        id: 'intermediate-compound-6-8',
        name: '中級 - 複合拍 (6/8)',
        description: '搖晃感的 6/8 拍',
        timeSignature: { numerator: 6, denominator: 8 },
        notes: [
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false }
        ],
        difficulty: 'intermediate'
      },

      // 高級：混合模式
      {
        id: 'advanced-mixed-rhythm',
        name: '高級 - 混合節奏',
        description: '四分、八分、十六分混合',
        timeSignature: { numerator: 4, denominator: 4 },
        notes: [
          { pitch: 'C4', duration: 1, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false }
        ],
        difficulty: 'advanced'
      },

      // 專家：切分節奏
      {
        id: 'expert-syncopated',
        name: '專家 - 切分節奏',
        description: '複雜的切分節奏',
        timeSignature: { numerator: 4, denominator: 4 },
        notes: [
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 1.5, dotted: true },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 1, dotted: false },
          { pitch: 'C4', duration: 0.5, dotted: false },
          { pitch: 'C4', duration: 1, dotted: false }
        ],
        difficulty: 'expert'
      }
    ];

    // 添加預設模式到 map
    this.defaultPatterns.forEach(pattern => {
      this.patterns.set(pattern.id, pattern);
    });

    // 載入自訂模式
    this.loadCustomPatterns();
  }

  /**
   * 載入自訂模式
   */
  private loadCustomPatterns() {
    const customPatternIds = StorageService.listCustomPatterns();
    customPatternIds.forEach(id => {
      const pattern = StorageService.getCustomPattern(id);
      if (pattern) {
        this.patterns.set(id, pattern);
      }
    });
  }

  /**
   * 取得所有模式
   */
  getAllPatterns(): RhythmPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * 按難度取得模式
   */
  getPatternsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'): RhythmPattern[] {
    return Array.from(this.patterns.values()).filter(p => p.difficulty === difficulty);
  }

  /**
   * 取得單個模式
   */
  getPattern(id: string): RhythmPattern | undefined {
    return this.patterns.get(id);
  }

  /**
   * 建立自訂模式
   */
  createPattern(
    id: string,
    name: string,
    timeSignature: TimeSignature,
    notes: Note[],
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert',
    description?: string
  ): RhythmPattern {
    const pattern: RhythmPattern = {
      id,
      name,
      description,
      timeSignature,
      notes,
      difficulty
    };

    this.patterns.set(id, pattern);
    StorageService.saveCustomPattern(id, pattern);

    return pattern;
  }

  /**
   * 編輯模式
   */
  editPattern(id: string, updates: Partial<RhythmPattern>): RhythmPattern | null {
    const pattern = this.patterns.get(id);
    if (!pattern || !this.isCustomPattern(id)) {
      return null;
    }

    const updated = { ...pattern, ...updates, id };
    this.patterns.set(id, updated);
    StorageService.saveCustomPattern(id, updated);

    return updated;
  }

  /**
   * 刪除模式
   */
  deletePattern(id: string): boolean {
    if (!this.isCustomPattern(id)) {
      return false; // 無法刪除預設模式
    }

    this.patterns.delete(id);
    StorageService.deleteCustomPattern(id);
    return true;
  }

  /**
   * 檢查是否為自訂模式
   */
  isCustomPattern(id: string): boolean {
    return !this.defaultPatterns.some(p => p.id === id);
  }

  /**
   * 複製模式
   */
  duplicatePattern(sourceId: string, newId: string, newName: string): RhythmPattern | null {
    const source = this.patterns.get(sourceId);
    if (!source) return null;

    return this.createPattern(
      newId,
      newName,
      source.timeSignature,
      [...source.notes],
      source.difficulty,
      source.description
    );
  }

  /**
   * 計算模式總時長
   */
  getPatternDuration(id: string): number {
    const pattern = this.patterns.get(id);
    if (!pattern) return 0;

    return pattern.notes.reduce((sum, note) => sum + note.duration, 0);
  }

  /**
   * 驗證模式
   */
  validatePattern(pattern: RhythmPattern): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!pattern.id) errors.push('模式 ID 不能為空');
    if (!pattern.name) errors.push('模式名稱不能為空');
    if (pattern.notes.length === 0) errors.push('模式至少需要一個音符');

    // 驗證時長
    const totalDuration = pattern.notes.reduce((sum, note) => sum + note.duration, 0);
    const expectedDuration = pattern.timeSignature.numerator;
    if (Math.abs(totalDuration - expectedDuration) > 0.01) {
      errors.push(
        `總時長應為 ${expectedDuration} 拍，實際為 ${totalDuration.toFixed(2)} 拍`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
