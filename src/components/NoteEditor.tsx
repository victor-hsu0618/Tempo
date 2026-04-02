import { useState, useEffect, useRef } from 'react';
import type { Note } from '../types';
import { StaffNotationEngine } from '../services/staffNotation';
import '../styles/NoteEditor.css';

interface NoteEditorProps {
  notes: Note[];
  onNotesChange: (notes: Note[]) => void;
  timeSignature?: { numerator: number; denominator: number };
}

export function NoteEditor({ notes, onNotesChange, timeSignature }: NoteEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<StaffNotationEngine | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedNoteIdx, setSelectedNoteIdx] = useState<number | null>(null);
  const [currentNotes, setCurrentNotes] = useState<Note[]>(notes);

  // 初始化 Canvas 和引擎
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 300;

    const engine = new StaffNotationEngine(canvas);
    engineRef.current = engine;
    engine.setEditMode(editMode);

    const redraw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      engine.drawStaff(timeSignature || { numerator: 4, denominator: 4 });
      engine.drawNotes(currentNotes, timeSignature);

      if (selectedNoteIdx !== null) {
        // 顯示選中指示
        const beatWidth = 60;
        let beatPos = 0;
        for (let i = 0; i < selectedNoteIdx; i++) {
          beatPos += currentNotes[i].duration;
        }
        const x = 50 + beatPos * beatWidth + beatWidth * 0.5;
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - beatWidth * 0.4, 50 - 30, beatWidth * 0.8, 120);
      }
    };

    redraw();
  }, [editMode, currentNotes, timeSignature, selectedNoteIdx]);

  // 鍵盤事件：上下鍵調整音高
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editMode || selectedNoteIdx === null) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const updated = currentNotes.map((note, idx) =>
          idx === selectedNoteIdx
            ? adjustNotePitch(note, 'up')
            : note
        );
        setCurrentNotes(updated);
        onNotesChange(updated);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const updated = currentNotes.map((note, idx) =>
          idx === selectedNoteIdx
            ? adjustNotePitch(note, 'down')
            : note
        );
        setCurrentNotes(updated);
        onNotesChange(updated);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, selectedNoteIdx, currentNotes, onNotesChange]);

  // 滑鼠點擊選擇音符
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || !engineRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const noteIdx = engineRef.current.selectNoteFromMouse(x, y, currentNotes);
    setSelectedNoteIdx(noteIdx);
  };

  // 添加新音符
  const handleAddNote = () => {
    const newNotes = [...currentNotes, { pitch: 'C4', duration: 1 }];
    setCurrentNotes(newNotes);
    onNotesChange(newNotes);
  };

  // 刪除選中的音符
  const handleDeleteNote = () => {
    if (selectedNoteIdx === null) return;

    const newNotes = currentNotes.filter((_, idx) => idx !== selectedNoteIdx);
    setCurrentNotes(newNotes);
    setSelectedNoteIdx(null);
    onNotesChange(newNotes);
  };

  // 調整音符時值
  const handleDurationChange = (idx: number, duration: number) => {
    const newNotes = currentNotes.map((note, i) =>
      i === idx ? { ...note, duration } : note
    );
    setCurrentNotes(newNotes);
    onNotesChange(newNotes);
  };

  return (
    <div className="note-editor">
      <div className="editor-header">
        <h3>音符編輯器</h3>
        <div className="editor-controls">
          <button
            className={`btn-small ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? '✓ 編輯模式' : '編輯模式'}
          </button>
          <button className="btn-small" onClick={handleAddNote}>
            + 添加音符
          </button>
          <button
            className="btn-small btn-danger"
            onClick={handleDeleteNote}
            disabled={selectedNoteIdx === null}
          >
            🗑 刪除
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="staff-canvas"
        onClick={handleCanvasClick}
      />

      <div className="editor-info">
        {editMode && selectedNoteIdx !== null ? (
          <div className="note-info">
            <p>
              <strong>選中音符:</strong> {currentNotes[selectedNoteIdx]?.pitch}
            </p>
            <p className="hint">使用 ↑ ↓ 鍵調整音高，點擊其他音符選擇</p>
          </div>
        ) : (
          <p className="hint">
            {editMode
              ? '點擊五線譜上的音符進行編輯'
              : '啟用編輯模式開始編輯音符'}
          </p>
        )}
      </div>

      <div className="notes-list">
        <h4>音符序列</h4>
        <div className="notes-grid">
          {currentNotes.map((note, idx) => (
            <div
              key={idx}
              className={`note-item ${selectedNoteIdx === idx ? 'selected' : ''}`}
              onClick={() => setSelectedNoteIdx(idx)}
            >
              <div className="note-pitch">{note.pitch}</div>
              <div className="note-duration">
                <select
                  value={note.duration}
                  onChange={(e) => handleDurationChange(idx, parseFloat(e.target.value))}
                >
                  <option value={0.5}>16分</option>
                  <option value={1}>8分</option>
                  <option value={2}>4分</option>
                  <option value={4}>全音</option>
                </select>
              </div>
              {note.dotted && <span className="dot">·</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 調整音符音高
 */
function adjustNotePitch(note: Note, direction: 'up' | 'down'): Note {
  const pitchOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const pitchMap: Record<string, number> = {
    C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6
  };

  const currentPitch = note.pitch[0];
  const currentOctave = parseInt(note.pitch[1]);
  let pitchIdx = pitchMap[currentPitch];

  if (direction === 'up') {
    pitchIdx++;
    if (pitchIdx > 6) {
      pitchIdx = 0;
    }
  } else {
    pitchIdx--;
    if (pitchIdx < 0) {
      pitchIdx = 6;
    }
  }

  return {
    ...note,
    pitch: pitchOrder[pitchIdx] + (currentOctave + (direction === 'up' && pitchIdx === 0 ? 1 : 0) + (direction === 'down' && pitchIdx === 6 ? -1 : 0))
  };
}
