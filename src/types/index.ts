// 節拍配置
export interface TimeSignature {
  numerator: number;   // 分子 (2, 3, 4, 6)
  denominator: number; // 分母 (4, 8)
}

// 轉換配置
export interface TimeSignatureTransition {
  from: TimeSignature;
  to: TimeSignature;
  measureAtTransition: number; // 第幾個小節轉換
  warningMeasure?: number;     // 提前多少小節警告
}

// 練習會話配置
export interface PracticeSession {
  id: string;
  bpm: number;
  timeSignature: TimeSignature;
  transitions?: TimeSignatureTransition[];
  rhythmPattern?: string;       // MusicXML 或節奏模式識別碼
  duration: number;             // 秒數
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// 計分數據
export interface ScoreEntry {
  timestamp: number;
  bpm: number;
  accuracy: number;             // 0-100
  hitCount: number;
  totalBeats: number;
  transitionAccuracy?: number;  // 轉換點準確度
}

// 用戶進度
export interface UserProgress {
  totalPracticeTime: number;    // 總秒數
  bestScore: number;
  sessionHistory: ScoreEntry[];
  completedLessons: string[];
  currentLesson?: string;
}

// 五線譜音符
export interface Note {
  pitch: string;                // C4, D4, etc.
  duration: number;            // 以拍為單位
  dotted?: boolean;
}

// 節奏模式
export interface RhythmPattern {
  id: string;
  name: string;
  description?: string;
  timeSignature: TimeSignature;
  notes: Note[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// 課程單元
export interface Lesson {
  id: string;
  title: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  sessions: PracticeSession[];
  requiredScore: number;       // 通過分數
}
