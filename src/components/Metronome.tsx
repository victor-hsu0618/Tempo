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
  const [transitionToIdx, setTransitionToIdx] = useState(1);
  const [transitionBeat, setTransitionBeat] = useState('2');

  const timeSignatures: TimeSignature[] = [
    { numerator: 2, denominator: 4 },
    { numerator: 3, denominator: 4 },
    { numerator: 4, denominator: 4 },
    { numerator: 6, denominator: 8 }
  ];

  // 找到當前時間簽名的索引
  const currentTsIdx = timeSignatures.findIndex(
    ts => ts.numerator === timeSignature.numerator && ts.denominator === timeSignature.denominator
  );

  const handleAddTransition = () => {
    if (!transitionBeat || currentTsIdx === transitionToIdx) return;

    const newTransition: TimeSignatureTransition = {
      from: timeSignature,
      to: timeSignatures[transitionToIdx],
      measureAtTransition: parseInt(transitionBeat, 10),
      warningMeasure: 1
    };

    onTransitionAdd(newTransition);
    setTransitionBeat('2');
    setShowTransitionForm(false);
    setShowTransitionForm(false);
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
            {/* 標題 */}
            <div className="transition-form-title">
              設置時間簽名轉換
            </div>

            {/* FROM - 初始拍號（只讀） */}
            <div className="transition-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <label className="step-label">FROM (初始拍號):</label>
                <div className="tempo-display from-display">
                  <span className="tempo-value">{timeSignature.numerator}/{timeSignature.denominator}</span>
                </div>
              </div>
            </div>

            {/* TO - 目標拍號 */}
            <div className="transition-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <label htmlFor="transition-to" className="step-label">TO (目標拍號):</label>
                <select
                  id="transition-to"
                  className="tempo-select"
                  value={transitionToIdx}
                  onChange={(e) => setTransitionToIdx(parseInt(e.target.value, 10))}
                >
                  {timeSignatures.map((ts, idx) => (
                    <option key={idx} value={idx} disabled={idx === currentTsIdx}>
                      {ts.numerator}/{ts.denominator}
                      {idx === currentTsIdx ? ' (當前)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* AFTER - 第幾個小節 */}
            <div className="transition-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <label htmlFor="transition-beat" className="step-label">AFTER (第幾小節):</label>
                <div className="measure-input-wrapper">
                  <input
                    id="transition-beat"
                    type="text"
                    inputMode="numeric"
                    min="1"
                    max="32"
                    value={transitionBeat}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        setTransitionBeat(value);
                      }
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        setTransitionBeat('2');
                      }
                    }}
                    placeholder="2"
                    className="measure-input"
                  />
                  <span className="measure-label">measures</span>
                </div>
              </div>
            </div>

            {/* 完整預覽 */}
            <div className="transition-preview">
              <div className="preview-line">
                FROM <strong>{timeSignature.numerator}/{timeSignature.denominator}</strong>
              </div>
              <div className="preview-arrow">↓</div>
              <div className="preview-line">
                TO <strong>{timeSignatures[transitionToIdx].numerator}/{timeSignatures[transitionToIdx].denominator}</strong>
              </div>
              <div className="preview-arrow">↓</div>
              <div className="preview-line">
                AFTER <strong>{transitionBeat}</strong> measure{transitionBeat !== '1' ? 's' : ''}
              </div>
            </div>

            {/* 按鈕組 */}
            <div className="transition-button-group">
              <button 
                onClick={handleAddTransition} 
                className="btn-primary"
                disabled={currentTsIdx === transitionToIdx || !transitionBeat}
              >
                ✓ 確認添加轉換
              </button>
              <button
                onClick={() => {
                  setShowTransitionForm(false);
                  setTransitionBeat('2');
                }}
                className="btn-secondary"
              >
                ✕ 取消
              </button>
            </div>
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
