import { useState } from 'react';
import type { Lesson } from '../types';
import { LessonManager } from '../services/lessonManager';
import '../styles/LessonPanel.css';

interface LessonPanelProps {
  onLessonSelect: (lesson: Lesson) => void;
}

export function LessonPanel({ onLessonSelect }: LessonPanelProps) {
  const [manager] = useState(() => new LessonManager());
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [stats] = useState(() => manager.getStatistics());

  const lessons = manager.getAllLessons();
  const filteredLessons =
    filterDifficulty === 'all'
      ? lessons
      : lessons.filter(l => l.difficulty === filterDifficulty);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      case 'expert':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getDifficultyLabel = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return '初級';
      case 'intermediate':
        return '中級';
      case 'advanced':
        return '高級';
      case 'expert':
        return '專家';
      default:
        return difficulty;
    }
  };

  const recommendedLesson = manager.getRecommendedLesson();

  return (
    <div className="lesson-panel">
      <h2>課程中心</h2>

      {/* 進度統計 */}
      <div className="progress-summary">
        <div className="progress-card">
          <div className="progress-value">{stats.completedLessons}</div>
          <div className="progress-label">完成課程</div>
        </div>
        <div className="progress-card">
          <div className="progress-value">{stats.completionPercentage}%</div>
          <div className="progress-label">完成率</div>
        </div>
        <div className="progress-card">
          <div className="progress-value">{stats.totalAttempts}</div>
          <div className="progress-label">總嘗試次</div>
        </div>
        <div className="progress-card">
          <div className="progress-value">{stats.averageBestScore}</div>
          <div className="progress-label">平均最高分</div>
        </div>
      </div>

      {/* 推薦課程 */}
      {recommendedLesson && (
        <div className="recommended-lesson">
          <div className="recommended-label">📌 推薦課程</div>
          <div
            className="recommended-card"
            style={{ borderLeftColor: getDifficultyColor(recommendedLesson.difficulty) }}
          >
            <h4>{recommendedLesson.title}</h4>
            <p>{recommendedLesson.description}</p>
            <button
              className="btn-primary btn-small"
              onClick={() => onLessonSelect(recommendedLesson)}
            >
              開始課程
            </button>
          </div>
        </div>
      )}

      {/* 篩選 */}
      <div className="lesson-controls">
        <label htmlFor="difficulty-filter">難度篩選：</label>
        <select
          id="difficulty-filter"
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
        >
          <option value="all">全部</option>
          <option value="beginner">初級</option>
          <option value="intermediate">中級</option>
          <option value="advanced">高級</option>
          <option value="expert">專家</option>
        </select>
      </div>

      {/* 課程列表 */}
      <div className="lessons-list">
        {filteredLessons.length === 0 ? (
          <p className="empty-message">沒有找到匹配的課程</p>
        ) : (
          filteredLessons.map(lesson => {
            const isCompleted = manager.isLessonCompleted(lesson.id);
            const progress = manager.getLessonProgress(lesson.id);

            return (
              <div
                key={lesson.id}
                className={`lesson-card ${isCompleted ? 'completed' : ''}`}
                style={{ borderLeftColor: getDifficultyColor(lesson.difficulty) }}
              >
                <div className="lesson-header">
                  <div className="lesson-title-group">
                    <h3>{lesson.title}</h3>
                    <span
                      className="difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(lesson.difficulty) }}
                    >
                      {getDifficultyLabel(lesson.difficulty)}
                    </span>
                  </div>
                  <div className="lesson-status">
                    {isCompleted && <span className="status-completed">✓ 已完成</span>}
                  </div>
                </div>

                <p className="lesson-description">{lesson.description}</p>

                <div className="lesson-details">
                  <div className="detail-item">
                    <span className="label">會話數：</span>
                    <span className="value">{lesson.sessions.length}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">通過分數：</span>
                    <span className="value">{lesson.requiredScore}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">尘試次數：</span>
                    <span className="value">{progress.attempts}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">最高分：</span>
                    <span className="value">{progress.bestScore}</span>
                  </div>
                </div>

                {/* 進度條 */}
                <div className="lesson-progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((progress.bestScore / lesson.requiredScore) * 100, 100)}%`,
                      backgroundColor: isCompleted ? '#10b981' : getDifficultyColor(lesson.difficulty)
                    }}
                  />
                </div>

                <div className="lesson-actions">
                  <button
                    className={`btn-primary ${isCompleted ? 'btn-secondary' : ''}`}
                    onClick={() => onLessonSelect(lesson)}
                  >
                    {isCompleted ? '重新練習' : '開始課程'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
