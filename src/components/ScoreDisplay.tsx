import { useEffect, useState } from 'react';
import { AudioEngine } from '../services/audioEngine';
import '../styles/ScoreDisplay.css';

interface ScoreDisplayProps {
  audioEngine: AudioEngine;
  isPlaying: boolean;
  currentScore: number;
  onRecordHit: () => void;
}

export function ScoreDisplay({
  audioEngine,
  isPlaying,
  currentScore,
  onRecordHit
}: ScoreDisplayProps) {
  const [stats, setStats] = useState({
    hitCount: 0,
    totalBeats: 0,
    accuracy: 0,
    hitRate: 0
  });

  // 定期更新統計數據
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const newStats = audioEngine.getScoreStats();
      setStats(newStats);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, audioEngine]);

  const getScoreGrade = (score: number): string => {
    if (score >= 95) return '🌟 完美';
    if (score >= 85) return '⭐ 優秀';
    if (score >= 75) return '👍 很好';
    if (score >= 60) return '👌 及格';
    return '📚 需加油';
  };

  return (
    <div className="score-display">
      <h2>計分面板</h2>

      {/* 主分數顯示 */}
      <div className="score-main">
        <div className="score-value">{currentScore}</div>
        <div className="score-max">/100</div>
        <div className="score-grade">{getScoreGrade(currentScore)}</div>
      </div>

      {/* 統計信息 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">擊鼓次數</div>
          <div className="stat-value">{stats.hitCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">總節拍</div>
          <div className="stat-value">{stats.totalBeats}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">精準度</div>
          <div className="stat-value">{Math.round(stats.accuracy)}%</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">命中率</div>
          <div className="stat-value">{Math.round(stats.hitRate)}%</div>
        </div>
      </div>

      {/* 命中率進度條 */}
      <div className="progress-section">
        <label className="progress-label">命中率</label>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${stats.hitRate}%` }}
          />
        </div>
      </div>

      {/* 互動按鈕 */}
      <div className="action-buttons">
        <button
          className="btn-hit"
          onClick={onRecordHit}
          disabled={!isPlaying}
        >
          👏 擊鼓
        </button>
        <p className="hint">或按 SPACE 鍵擊鼓</p>
      </div>

      {/* 反饋信息 */}
      {isPlaying && (
        <div className="feedback">
          <p className="feedback-text">
            {stats.hitRate > 80
              ? '✨ 節奏感很好！'
              : stats.hitRate > 60
              ? '💪 繼續努力！'
              : '🎯 集中注意力！'}
          </p>
        </div>
      )}
    </div>
  );
}
