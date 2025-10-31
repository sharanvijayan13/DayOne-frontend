"use client";

import { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, Lightbulb } from 'lucide-react';
import { useLabels } from '../contexts/LabelsContext';

export default function Labels() {
  const { availableLabels, addLabel, deleteLabel } = useLabels();
  const labels = availableLabels.map(label => ({ ...label, count: 0 })); // Add count for display
  const [newLabel, setNewLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  const handleAddLabel = (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const label = {
      id: Date.now(),
      name: newLabel.trim(),
      color: selectedColor
    };

    addLabel(label);
    setNewLabel('');
  };

  const handleDeleteLabel = (id) => {
    if (confirm('Delete this label? This will remove it from all notes.')) {
      deleteLabel(id);
    }
  };

  return (
    <div className="labels-container">
      <div className="labels-header">
        <div className="labels-title">
          <Tag size={24} />
          <h2>Labels</h2>
        </div>
        <p className="labels-description">
          Organize your notes with custom labels. Create, edit, and manage your label system.
        </p>
      </div>

      <form onSubmit={handleAddLabel} className="add-label-form">
        <div className="form-row">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Enter label name..."
            className="label-input"
            maxLength={20}
          />

          <div className="color-picker">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`color-option ${selectedColor === color ? 'color-selected' : ''}`}
                style={{ backgroundColor: color }}
                title={`Select ${color}`}
              />
            ))}
          </div>

          <button type="submit" className="add-label-btn">
            <Plus size={16} />
            Add Label
          </button>
        </div>
      </form>

      <div className="labels-list">
        {labels.length === 0 ? (
          <div className="empty-state">
            <Tag size={48} className="empty-icon" />
            <h3>No labels yet</h3>
            <p>Create your first label to start organizing your notes!</p>
          </div>
        ) : (
          <div className="labels-grid">
            {labels.map(label => (
              <div key={label.id} className="label-card">
                <div className="label-info">
                  <div
                    className="label-color"
                    style={{ backgroundColor: label.color }}
                  />
                  <div className="label-details">
                    <span className="label-name">{label.name}</span>
                    <span className="label-count">{label.count} notes</span>
                  </div>
                </div>

                <div className="label-actions">
                  <button
                    className="edit-btn"
                    title="Edit label"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteLabel(label.id)}
                    title="Delete label"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="labels-info">
        <div className="info-title">
          <Lightbulb size={20} />
          <h3>Tips</h3>
        </div>
        <ul>
          <li>Labels help you categorize and find notes quickly</li>
          <li>You can assign multiple labels to a single note</li>
          <li>Use colors to create visual organization</li>
          <li>Labels are now available in the note editor!</li>
          <li>Create custom labels or use the predefined ones</li>
        </ul>
      </div>

      <style jsx>{`
        .labels-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .labels-header {
          margin-bottom: 2rem;
        }

        .labels-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .labels-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .labels-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .add-label-form {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-row {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .label-input {
          padding: 0.75rem;
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .label-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .color-picker {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .color-option {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-selected {
          border-color: var(--text-primary);
          box-shadow: 0 0 0 2px var(--bg-primary);
        }

        .add-label-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--accent-primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          align-self: flex-start;
        }

        .add-label-btn:hover {
          background: var(--accent-hover);
        }

        .labels-list {
          margin-bottom: 2rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .labels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .label-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .label-card:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 2px 8px var(--shadow);
        }

        .label-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .label-color {
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .label-details {
          display: flex;
          flex-direction: column;
        }

        .label-name {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .label-count {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .label-actions {
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn, .delete-btn {
          padding: 0.25rem;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .edit-btn:hover {
          background: var(--bg-tertiary);
          color: var(--accent-primary);
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
        }

        .labels-info {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
        }

        .info-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .labels-info h3 {
          color: var(--text-primary);
          font-size: 1rem;
        }

        .labels-info ul {
          list-style: none;
          padding: 0;
        }

        .labels-info li {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          padding-left: 1rem;
          position: relative;
        }

        .labels-info li::before {
          content: '•';
          color: var(--accent-primary);
          position: absolute;
          left: 0;
        }

        @media (max-width: 768px) {
          .labels-container {
            padding: 1rem;
          }

          .form-row {
            gap: 0.75rem;
          }

          .labels-grid {
            grid-template-columns: 1fr;
          }

          .add-label-btn {
            align-self: stretch;
          }
        }
      `}</style>
    </div>
  );
}