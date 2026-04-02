import { useState } from 'react';
import type { TimeSignature, TimeSignatureTransition } from '../types';
import '../styles/Metronome.css';

interface MetronomeProps {
  bpm: number;
  timeSignature: TimeSignature;
  isPlaying: boolean;
  transitions: TimeSignatureTransition[];
  onBpmChange: (bpm: number) => void;
  onTimeSignatureChange: (ts: TimeSignature) => void;
  onTransitionAdd: (transition: TimeSignatureTransition) => void;
  onClearTransitions: () => void;
  onPlayToggle: () => void;
}

export function Metronome({
  bpm,
  timeSignature,
  isPlaying,
  transitions,
  onBpmChange,
  onTimeSignatureChange,
  onTransitionAdd,
  onClearTransitions,
  onPlayToggle
}: MetronomeProps) {
  const [showTransitionForm, setShowTransitionForm] = useState(false);
  const [transitionBeat, setTransitionBeat] = useState('2');

  const timeSignatures: TimeSignature[] = [
    { numerator: 2, denominator: 4 },
    { numerator: 3, denominator: 4 },
    { numerator: 4, denominator: 4 },
    { numerator: 6, denominator: 8 }
  ];

  const handleAddTransition = () => {
    if (!transitionBeat) return;

    const newTransition: TimeSignatureTransition = {
      from: timeSignature,
      to: timeSignatures[(timeSignatures.indexOf(timeSignature) + 1) % timeSignatures.length],
      measureAtTransition: parseInt(transitionBeat, 10),
      warningMeasure: 1
    };

    onTransitionAdd(newTransition);
    setTransitionBeat('');
  };

  return (
    <div className="metronome">
      <h2>節拍控制</h2>

      {/* BPM 控制 */}
      <div className="control-group">
        <label htmlFor="bpm-input">
          BPM: <span className="value">{bpm}</span>
        </label>
        <input
          id="bpm-input"
          type="range"
          min="60"
          max="240"
          value={bpm}
          onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
          disabled={isPlaying}
          className="slider"
        />
        <div className="input-group">
          <input
            type="number"
            min="60"
            max="240"
            value={bpm}
            onChange={(e) => onBpmChange(parseInt(e.target.value, 10) || 60)}
            disabled={isPlaying}
          />
        </div>
      </div>

      {/* 拍號選擇 */}
      <div className="control-group">
        <label>拍號</label>
        <div className="time-signature-buttons">
          {timeSignatures.map((ts) => (
            <button
              key={`${ts.numerator}/${ts.denominator}`}
              className={`ts-btn ${timeSignature.numerator === ts.numerator ? 'active' : ''}`}
              onClick={() => onTimeSignatureChange(ts)}
              disabled={isPlaying}
            >
              {ts.numerator}/{ts.denominator}
            </button>
          ))}
        </div>
      </div>

      {/* 轉換配置 */}
      <div className="control-group">
        <label>拍號轉換</label>
        <button
          className="btn-secondary"
          onClick={() => setShowTransitionForm(!showTransitionForm)}
          disabled={isPlaying}
        >
          {showTransitionForm ? '取消' : '+ 添加轉換'}
        </button>

        {showTransitionForm && (
          <div className="transition-form">
            <label htmlFor="transition-beat">第幾個小節轉換：</label>
            <input
              id="transition-beat"
              type="number"
              min="1"
              value={transitionBeat}
              onChange={(e) => setTransitionBeat(e.target.value)}
              placeholder="例：2"
            />
            <button onClick={handleAddTransition} className="btn-primary btn-small">
              確認轉換
            </button>
          </div>
        )}

        {transitions.length > 0 && (
          <div className="transitions-list">
            <p className="transitions-label">已設置轉換：</p>
            {transitions.map((t, idx) => (
              <div key={idx} className="transition-item">
                <span>
                  {t.from.numerator}/{t.from.denominator} → {t.to.numerator}/{t.to.denominator} (第 {t.measureAtTransition} 小節)
                </span>
              </div>
            ))}
            <button onClick={onClearTransitions} className="btn-danger btn-small">
              清除所有轉換
            </button>
          </div>
        )}
      </div>

      {/* 播放控制 */}
      <div className="control-group">
        <button
          className={`btn-play ${isPlaying ? 'playing' : ''}`}
          onClick={onPlayToggle}
        >
          {isPlaying ? '⏸ 暫停' : '▶ 開始'}
        </button>
      </div>
    </div>
  );
}
