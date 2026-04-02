import type { Note, TimeSignature } from '../types';

// 音符高度映射（從下到上）
const PITCH_TO_LINE = {
  'C4': 8, 'D4': 7, 'E4': 6, 'F4': 5, 'G4': 4, 'A4': 3, 'B4': 2,
  'C5': 1, 'D5': 0, 'E5': -1, 'F5': -2, 'G5': -3, 'A5': -4, 'B5': -5,
  'C3': 10, 'D3': 9, 'E3': 8, 'F3': 7, 'G3': 6, 'A3': 5, 'B3': 4
};

const LINE_TO_PITCH = Object.entries(PITCH_TO_LINE).reduce(
  (acc, [pitch, line]) => ({ ...acc, [line]: pitch }),
  {} as Record<number, string>
);

export class StaffNotationEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private staffLineSpacing = 15;
  private staffStartX = 50;
  private staffStartY = 50;
  private noteRadius = 6;
  private beatWidth = 60;
  private selectedNoteIndex: number | null = null;
  private editMode = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
  }

  /**
   * 設定編輯模式
   */
  setEditMode(enabled: boolean) {
    this.editMode = enabled;
  }

  /**
   * 取得選中的音符索引
   */
  getSelectedNoteIndex(): number | null {
    return this.selectedNoteIndex;
  }

  /**
   * 調整選中音符的音高
   */
  adjustNoteByDirection(notes: Note[], direction: 'up' | 'down'): Note[] {
    if (this.selectedNoteIndex === null || this.selectedNoteIndex >= notes.length) {
      return notes;
    }

    const note = notes[this.selectedNoteIndex];
    const currentLine = PITCH_TO_LINE[note.pitch as keyof typeof PITCH_TO_LINE] ?? 4;
    const newLine = direction === 'up' ? currentLine - 1 : currentLine + 1;
    const newPitch = LINE_TO_PITCH[newLine];

    if (newPitch) {
      const updatedNotes = [...notes];
      updatedNotes[this.selectedNoteIndex] = { ...note, pitch: newPitch };
      return updatedNotes;
    }

    return notes;
  }

  /**
   * 從滑鼠位置選擇音符
   */
  selectNoteFromMouse(x: number, y: number, notes: Note[]): number | null {
    let beatPosition = 0;
    for (let i = 0; i < notes.length; i++) {
      const noteX = this.staffStartX + beatPosition * this.beatWidth + (this.beatWidth * 0.5);
      const noteLine = PITCH_TO_LINE[notes[i].pitch as keyof typeof PITCH_TO_LINE] ?? 4;
      const noteY = this.staffStartY + (4 - noteLine) * this.staffLineSpacing;

      const distance = Math.sqrt((x - noteX) ** 2 + (y - noteY) ** 2);
      if (distance < this.noteRadius + 10) {
        return i;
      }

      beatPosition += notes[i].duration;
    }
    return null;
  }

  /**
   * 繪製五線譜背景
   */
  drawStaff(timeSignature: TimeSignature) {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 繪製5條線
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = this.staffStartY + i * this.staffLineSpacing;
      ctx.beginPath();
      ctx.moveTo(this.staffStartX, y);
      ctx.lineTo(this.canvas.width - 50, y);
      ctx.stroke();
    }

    // 繪製時間簽名
    this.drawTimeSignature(timeSignature);
  }

  /**
   * 繪製時間簽名
   */
  private drawTimeSignature(ts: TimeSignature) {
    const ctx = this.ctx;
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';

    const centerX = this.staffStartX + 30;
    const centerY = this.staffStartY + 30;

    ctx.fillText(ts.numerator.toString(), centerX, centerY);
    ctx.fillText(ts.denominator.toString(), centerX, centerY + 30);
  }

  /**
   * 繪製音符
   */
  drawNotes(notes: Note[], _timeSignature?: TimeSignature, _scrollProgress: number = 0) {
    const ctx = this.ctx;
    let beatPosition = 0;

    notes.forEach((note, index) => {
      const x = this.staffStartX + beatPosition * this.beatWidth + (this.beatWidth * 0.5);
      
      // 根據音高計算 y 位置
      const pitchLine = PITCH_TO_LINE[note.pitch as keyof typeof PITCH_TO_LINE] ?? 4;
      const y = this.staffStartY + (4 - pitchLine) * this.staffLineSpacing;

      // 高亮選中的音符
      if (this.editMode && this.selectedNoteIndex === index) {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.fillRect(x - this.beatWidth * 0.35, y - 25, this.beatWidth * 0.7, 50);
      }

      // 繪製音符頭
      ctx.fillStyle = this.editMode && this.selectedNoteIndex === index ? '#6366f1' : '#000000';
      ctx.beginPath();
      ctx.arc(x, y, this.noteRadius, 0, Math.PI * 2);
      ctx.fill();

      // 繪製音符莖
      ctx.strokeStyle = this.editMode && this.selectedNoteIndex === index ? '#6366f1' : '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + this.noteRadius, y);
      ctx.lineTo(x + this.noteRadius, y - 35);
      ctx.stroke();

      // 如果是點綴音符，繪製點
      if (note.dotted) {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x + 20, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 編輯模式：顯示音高標籤和上下調整提示
      if (this.editMode && this.selectedNoteIndex === index) {
        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(note.pitch, x, y - 50);
        ctx.font = '10px Arial';
        ctx.fillStyle = '#999999';
        ctx.fillText('↑/↓ 調整音高', x, y + 50);
      }

      beatPosition += note.duration;
    });
  }

  /**
   * 繪製播放進度指標
   */
  drawPlayhead(beatPosition: number) {
    const ctx = this.ctx;
    const beatWidth = 60;
    const x = this.staffStartX + beatPosition * beatWidth;

    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, this.staffStartY);
    ctx.lineTo(x, this.staffStartY + 60);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /**
   * 繪製轉換警告指示
   */
  drawTransitionWarning(measureNumber: number, warningBeats: number) {
    const ctx = this.ctx;
    const beatWidth = 60;
    const measureLength = 4 * beatWidth; // 假設 4 拍

    const x = this.staffStartX + measureNumber * measureLength;
    const y = this.staffStartY - 30;

    ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
    ctx.fillRect(x, y, warningBeats * beatWidth, 120);

    ctx.fillStyle = '#FF8C00';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('轉換即將到來', x + 20, y + 15);
  }

  /**
   * 清空畫布
   */
  clear() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 設定畫布大小
   */
  setCanvasSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
