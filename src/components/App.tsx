import { useState, useEffect } from 'react';
import { AudioEngine } from '../services/audioEngine';
import { AdvancedScoringManager } from '../services/advancedScoringManager';
import { InputManager } from '../services/inputManager';
import { FeedbackSystem } from '../services/feedbackSystem';
import { StorageService } from '../services/storageService';
import type { TimeSignature, TimeSignatureTransition } from '../types';
import { Metronome } from './Metronome';
import { Visualizer } from './Visualizer';
import { ScoreDisplay } from './ScoreDisplay';
import '../styles/App.css';

export function App() {
  const [audioEngine, setAudioEngine] = useState<AudioEngine | null>(null);
  const [scoringManager, setScoringManager] = useState<AdvancedScoringManager | null>(null);
  const [inputManager, setInputManager] = useState<InputManager | null>(null);
  const [feedbackSystem, setFeedbackSystem] = useState<FeedbackSystem | null>(null);
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>({ numerator: 4, denominator: 4 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [transitions, setTransitions] = useState<TimeSignatureTransition[]>([]);
  const [score, setScore] = useState(0);

  // 初始化所有系統
  useEffect(() => {
    const engine = new AudioEngine();
    const manager = new AdvancedScoringManager();
    const input = new InputManager();
    const feedback = new FeedbackSystem();

    setAudioEngine(engine);
    setScoringManager(manager);
    setInputManager(input);
    setFeedbackSystem(feedback);

    return () => {
      if (engine) {
        engine.stop();
      }
      if (input) {
        input.clear();
      }
    };
  }, []);

  // 當配置改變時，重新初始化引擎
  useEffect(() => {
    if (audioEngine && !isPlaying) {
      audioEngine.initialize(bpm, timeSignature, transitions);
    }
  }, [bpm, timeSignature, transitions, audioEngine, isPlaying]);

  const handlePlayToggle = () => {
    if (!audioEngine || !scoringManager || !inputManager) return;

    if (isPlaying) {
      audioEngine.stop();
      inputManager.clear();
      if (scoringManager) {
        const summary = scoringManager.endSession();
        console.log('會話統計：', summary);
        
        // 保存會話記錄到 LocalStorage
        const scoreEntry = {
          timestamp: Date.now(),
          bpm,
          accuracy: summary.accuracy,
          hitCount: summary.totalHits,
          totalBeats: summary.totalBeats,
          transitionAccuracy: summary.transitionAccuracy
        };
        StorageService.addScoreEntry(scoreEntry);
      }
      setIsPlaying(false);
    } else {
      audioEngine.initialize(bpm, timeSignature, transitions);
      scoringManager.startSession(bpm, timeSignature);

      // 設置輸入監聽
      const handleInput = (timestamp: number) => {
        const result = scoringManager.recordInput(timestamp);
        const stats = scoringManager.getCurrentStats();
        setScore(stats.averageScore);

        // 提供反饋
        if (feedbackSystem) {
          if (result.isHit) {
            feedbackSystem.providePerfectHitFeedback(result.accuracy);
          } else {
            feedbackSystem.provideMissedHitFeedback();
          }

          if (result.transitionAccuracy !== undefined) {
            feedbackSystem.provideTransitionFeedback(result.transitionAccuracy);
          }
        }
      };

      inputManager.addEventListener(handleInput);

      audioEngine.start();
      setIsPlaying(true);
    }
  };

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
  };

  const handleTimeSignatureChange = (ts: TimeSignature) => {
    setTimeSignature(ts);
  };

  const handleTransitionAdd = (transition: TimeSignatureTransition) => {
    setTransitions([...transitions, transition]);
  };

  const handleClearTransitions = () => {
    setTransitions([]);
  };

  const handleRecordHit = () => {
    if (!scoringManager) return;
    const currentTime = performance.now() / 1000;
    const result = scoringManager.recordInput(currentTime);
    if (result.isHit) {
      const stats = scoringManager.getCurrentStats();
      setScore(stats.averageScore);
    }
  };

  // 鍵盤輸入：空白鍵擊鼓
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isPlaying) {
        e.preventDefault();
        handleRecordHit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, audioEngine]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎵 Tempo - 節奏運練</h1>
        <p>音樂節奏感訓練應用程式</p>
      </header>

      <main className="app-main">
        <div className="panel-grid">
          {/* 控制面板 */}
          <section className="panel control-panel">
            <Metronome
              bpm={bpm}
              timeSignature={timeSignature}
              isPlaying={isPlaying}
              transitions={transitions}
              onBpmChange={handleBpmChange}
              onTimeSignatureChange={handleTimeSignatureChange}
              onTransitionAdd={handleTransitionAdd}
              onClearTransitions={handleClearTransitions}
              onPlayToggle={handlePlayToggle}
            />
          </section>

          {/* 視覺化面板 */}
          <section className="panel visualizer-panel">
            {audioEngine && (
              <Visualizer
                audioEngine={audioEngine}
                isPlaying={isPlaying}
                timeSignature={timeSignature}
                transitions={transitions}
              />
            )}
          </section>

          {/* 計分面板 */}
          <section className="panel score-panel">
            {audioEngine && (
              <ScoreDisplay
                audioEngine={audioEngine}
                isPlaying={isPlaying}
                currentScore={score}
                onRecordHit={handleRecordHit}
              />
            )}
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>提示：按 SPACE 鍵擊鼓 | 支援離線模式 | PWA 應用程式</p>
      </footer>
    </div>
  );
}

export default App;
