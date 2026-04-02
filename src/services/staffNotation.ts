import type { Note, TimeSignature } from '../types';

export class StaffNotationEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private staffLineSpacing = 15;
  private staffStartX = 50;
  private staffStartY = 50;
  private noteRadius = 6;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
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
    const beatWidth = 60; // 像素
    let beatPosition = 0;

    notes.forEach((note) => {
      const x = this.staffStartX + beatPosition * beatWidth + (beatWidth * 0.5);
      const y = this.staffStartY + 60; // 中線位置

      // 繪製音符頭
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(x, y, this.noteRadius, 0, Math.PI * 2);
      ctx.fill();

      // 繪製音符莖
      ctx.strokeStyle = '#000000';
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
