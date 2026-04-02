import { useEffect, useRef } from 'react';
import type { TimeSignature, TimeSignatureTransition } from '../types';
import { AudioEngine } from '../services/audioEngine';
import { StaffNotationEngine } from '../services/staffNotation';
import '../styles/Visualizer.css';

interface VisualizerProps {
  audioEngine: AudioEngine;
  isPlaying: boolean;
  timeSignature: TimeSignature;
  transitions: TimeSignatureTransition[];
}

export function Visualizer({
  audioEngine,
  isPlaying,
  timeSignature,
  transitions
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ledContainerRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const staffEngineRef = useRef<StaffNotationEngine | null>(null);

  // 初始化五線譜引擎
  useEffect(() => {
    if (canvasRef.current) {
      const staffEngine = new StaffNotationEngine(canvasRef.current);
      staffEngine.setCanvasSize(600, 200);
      staffEngineRef.current = staffEngine;
      
      // 初始化 LED 和五線譜
      updateLEDs(0, timeSignature.numerator);
    }
  }, [timeSignature.numerator]);

  // 動畫循環
  useEffect(() => {
    const animate = () => {
      if (!staffEngineRef.current || !canvasRef.current) {
        animationIdRef.current = requestAnimationFrame(animate);
        return;
      }

      const state = audioEngine.getState();

      // 繪製五線譜
      staffEngineRef.current.drawStaff(state.timeSignature);

      // 繪製播放進度指標（使用 0-based beatIndex）
      staffEngineRef.current.drawPlayhead(state.currentBeat);

      // 繪製轉換警告（如果有）
      if (transitions.length > 0) {
        const nextTransition = transitions.find(
          (t) => t.measureAtTransition > state.currentMeasure
        );
        if (nextTransition && nextTransition.warningMeasure) {
          const warningMeasure =
            nextTransition.measureAtTransition - nextTransition.warningMeasure;
          if (state.currentMeasure >= warningMeasure) {
            staffEngineRef.current.drawTransitionWarning(
              nextTransition.measureAtTransition,
              nextTransition.warningMeasure * timeSignature.numerator
            );
          }
        }
      }

      // 更新 LED 指示器（使用 0-based beatIndex）
      updateLEDs(state.currentBeat, timeSignature.numerator);

      animationIdRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animationIdRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isPlaying, audioEngine, timeSignature, transitions]);

  const updateLEDs = (beatIndex: number, numerator: number) => {
    if (!ledContainerRef.current) return;

    const leds = ledContainerRef.current.querySelectorAll('.led');
    // beatIndex 是 0-based，但需要與 1-based 的拍號對齐
    // 第 1 拍 (beatIndex=0) 应该点亮 idx=0 的 LED
    const currentBeatInMeasure = beatIndex % numerator;
    
    leds.forEach((led, idx) => {
      if (idx === currentBeatInMeasure) {
        led.classList.add('active');
      } else {
        led.classList.remove('active');
      }
    });
  };

  const renderLEDs = (numerator: number) => {
    return Array.from({ length: numerator }).map((_, idx) => (
      <div
        key={idx}
        className={`led ${idx === 0 ? 'downbeat' : ''}`}
      />
    ));
  };

  const state = audioEngine.getState();

  return (
    <div className="visualizer">
      <h2>視覺化顯示</h2>

      {/* LED 指示器 */}
      <div className="led-container" ref={ledContainerRef}>
        {renderLEDs(timeSignature.numerator)}
      </div>

      {/* 五線譜 */}
      <div className="staff-container">
        <canvas
          ref={canvasRef}
          className="staff-canvas"
          width={800}
          height={300}
        />
      </div>

      {/* 進度信息 */}
      <div className="progress-info">
        <div className="progress-item">
          <span className="label">小節：</span>
          <span className="value">{state.currentMeasure}</span>
        </div>
        <div className="progress-item">
          <span className="label">進度：</span>
          <span className="value">
            {state.currentBeat + 1}/{timeSignature.numerator}
          </span>
        </div>
        <div className="progress-item">
          <span className="label">拍號：</span>
          <span className="value">
            {timeSignature.numerator}/{timeSignature.denominator}
          </span>
        </div>
      </div>

      {/* 進度條 */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${((state.currentBeat + 1) / timeSignature.numerator) * 100}%`
          }}
        />
      </div>
    </div>
  );
}
