import { useState } from 'react';
import type { RhythmPattern, Note, TimeSignature } from '../types';
import { RhythmPatternManager } from '../services/rhythmPatternManager';
import '../styles/PatternEditor.css';

interface PatternEditorProps {
  onPatternSelect: (pattern: RhythmPattern) => void;
}

export function PatternEditor({ onPatternSelect }: PatternEditorProps) {
  const [manager] = useState(() => new RhythmPatternManager());
  const [patterns, setPatterns] = useState<RhythmPattern[]>(manager.getAllPatterns());
  const [editingPattern, setEditingPattern] = useState<RhythmPattern | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    timeSignature: TimeSignature;
    notes: Note[];
  }>({
    id: '',
    name: '',
    description: '',
    difficulty: 'beginner',
    timeSignature: { numerator: 4, denominator: 4 },
    notes: [] as Note[]
  });

  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
  const timeSignatures: TimeSignature[] = [
    { numerator: 2, denominator: 4 },
    { numerator: 3, denominator: 4 },
    { numerator: 4, denominator: 4 },
    { numerator: 6, denominator: 8 }
  ];

  const filteredPatterns =
    filterDifficulty === 'all'
      ? patterns
      : patterns.filter(p => p.difficulty === filterDifficulty);

  const handleSelectPattern = (pattern: RhythmPattern) => {
    onPatternSelect(pattern);
  };

  const handleNewPattern = () => {
    setFormData({
      id: `custom-pattern-${Date.now()}`,
      name: '',
      description: '',
      difficulty: 'beginner',
      timeSignature: { numerator: 4, denominator: 4 },
      notes: []
    });
    setEditingPattern(null);
    setShowForm(true);
  };

  const handleEditPattern = (pattern: RhythmPattern) => {
    if (!manager.isCustomPattern(pattern.id)) {
      alert('無法編輯預設模式');
      return;
    }
    setFormData({
      id: pattern.id,
      name: pattern.name,
      description: pattern.description || '',
      difficulty: pattern.difficulty as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      timeSignature: pattern.timeSignature,
      notes: [...pattern.notes]
    });
    setEditingPattern(pattern);
    setShowForm(true);
  };

  const handleDeletePattern = (id: string) => {
    if (!manager.isCustomPattern(id)) {
      alert('無法刪除預設模式');
      return;
    }
    if (confirm('確定要刪除此模式？')) {
      manager.deletePattern(id);
      setPatterns(manager.getAllPatterns());
    }
  };

  const handleSavePattern = () => {
    if (!formData.name) {
      alert('模式名稱不能為空');
      return;
    }

    if (formData.notes.length === 0) {
      alert('至少需要添加一個音符');
      return;
    }

    let pattern: RhythmPattern;
    if (editingPattern) {
      pattern = manager.editPattern(formData.id, formData) || formData as RhythmPattern;
    } else {
      pattern = manager.createPattern(
        formData.id,
        formData.name,
        formData.timeSignature,
        formData.notes,
        formData.difficulty,
        formData.description
      );
    }

    const validation = manager.validatePattern(pattern);
    if (!validation.valid) {
      alert('模式驗證失敗：\n' + validation.errors.join('\n'));
      return;
    }

    setPatterns(manager.getAllPatterns());
    setShowForm(false);
    setEditingPattern(null);
  };

  const handleAddNote = () => {
    const currentDuration = formData.notes.reduce((sum, n) => sum + n.duration, 0);
    const remaining = formData.timeSignature.numerator - currentDuration;

    if (remaining <= 0) {
      alert(`此小節已滿 (${formData.timeSignature.numerator} 拍)`);
      return;
    }

    setFormData({
      ...formData,
      notes: [...formData.notes, { pitch: 'C4', duration: Math.min(1, remaining), dotted: false }]
    });
  };

  const handleRemoveNote = (index: number) => {
    setFormData({
      ...formData,
      notes: formData.notes.filter((_, i) => i !== index)
    });
  };

  const handleUpdateNote = (index: number, field: string, value: any) => {
    const newNotes = [...formData.notes];
    (newNotes[index] as any)[field] = value;
    setFormData({ ...formData, notes: newNotes });
  };

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

  return (
    <div className="pattern-editor">
      <h2>節奏模式庫</h2>

      {/* 篩選和操作 */}
      <div className="editor-controls">
        <div className="filter-group">
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

        <button className="btn-primary" onClick={handleNewPattern}>
          + 建立新模式
        </button>
      </div>

      {/* 模式列表 */}
      <div className="patterns-list">
        {filteredPatterns.length === 0 ? (
          <p className="empty-message">沒有找到匹配的模式</p>
        ) : (
          filteredPatterns.map(pattern => (
            <div
              key={pattern.id}
              className="pattern-card"
              style={{
                borderLeftColor: getDifficultyColor(pattern.difficulty)
              }}
            >
              <div className="pattern-header">
                <div className="pattern-info">
                  <h3>{pattern.name}</h3>
                  <span
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(pattern.difficulty) }}
                  >
                    {getDifficultyLabel(pattern.difficulty)}
                  </span>
                </div>
              </div>

              {pattern.description && (
                <p className="pattern-description">{pattern.description}</p>
              )}

              <div className="pattern-meta">
                <span>拍號: {pattern.timeSignature.numerator}/{pattern.timeSignature.denominator}</span>
                <span>音符: {pattern.notes.length}</span>
              </div>

              <div className="pattern-actions">
                <button
                  className="btn-small btn-primary"
                  onClick={() => handleSelectPattern(pattern)}
                >
                  選擇
                </button>
                {manager.isCustomPattern(pattern.id) && (
                  <>
                    <button
                      className="btn-small btn-secondary"
                      onClick={() => handleEditPattern(pattern)}
                    >
                      編輯
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => handleDeletePattern(pattern.id)}
                    >
                      刪除
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 編輯表單 */}
      {showForm && (
        <div className="pattern-form-modal">
          <div className="pattern-form">
            <h3>{editingPattern ? '編輯模式' : '建立新模式'}</h3>

            <div className="form-group">
              <label htmlFor="pattern-name">模式名稱</label>
              <input
                id="pattern-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例：我的節奏模式"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pattern-description">描述</label>
              <textarea
                id="pattern-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述此模式的特點"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pattern-difficulty">難度</label>
                <select
                  id="pattern-difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                >
                  {difficulties.map(d => (
                    <option key={d} value={d}>{getDifficultyLabel(d)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="pattern-ts">拍號</label>
                <select
                  id="pattern-ts"
                  value={`${formData.timeSignature.numerator}/${formData.timeSignature.denominator}`}
                  onChange={(e) => {
                    const [num, denom] = e.target.value.split('/');
                    setFormData({
                      ...formData,
                      timeSignature: { numerator: parseInt(num), denominator: parseInt(denom) }
                    });
                  }}
                >
                  {timeSignatures.map(ts => (
                    <option key={`${ts.numerator}/${ts.denominator}`} value={`${ts.numerator}/${ts.denominator}`}>
                      {ts.numerator}/{ts.denominator}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 音符編輯 */}
            <div className="form-group">
              <label>音符 (總計: {formData.notes.reduce((sum, n) => sum + n.duration, 0)} / {formData.timeSignature.numerator} 拍)</label>
              <div className="notes-list">
                {formData.notes.map((note, idx) => (
                  <div key={idx} className="note-item">
                    <input
                      type="number"
                      min="0.25"
                      step="0.25"
                      value={note.duration}
                      onChange={(e) => handleUpdateNote(idx, 'duration', parseFloat(e.target.value))}
                      placeholder="時值"
                    />
                    <label>
                      <input
                        type="checkbox"
                        checked={note.dotted || false}
                        onChange={(e) => handleUpdateNote(idx, 'dotted', e.target.checked)}
                      />
                      點綴
                    </label>
                    <button
                      className="btn-danger btn-small"
                      onClick={() => handleRemoveNote(idx)}
                    >
                      移除
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn-secondary btn-small" onClick={handleAddNote}>
                + 添加音符
              </button>
            </div>

            <div className="form-actions">
              <button className="btn-primary" onClick={handleSavePattern}>
                保存模式
              </button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
