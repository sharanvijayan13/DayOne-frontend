"use client";

import { useState, useRef, useEffect } from 'react';
import { Tag, Plus, X, ChevronDown } from 'lucide-react';
import { useLabels } from '../contexts/LabelsContext';

export default function LabelSelector({ selectedLabels = [], onLabelsChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const { availableLabels, addLabel } = useLabels();

  // Filter labels based on search term
  const filteredLabels = availableLabels.filter(label =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedLabels.some(selected => selected.id === label.id)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLabelSelect = (label) => {
    const newLabels = [...selectedLabels, label];
    console.log('🏷️ Label selected:', label);
    console.log('🏷️ New labels array:', newLabels);
    onLabelsChange(newLabels);
    setSearchTerm('');
    setIsOpen(false); // Close dropdown after selection
  };

  const handleLabelRemove = (labelId) => {
    const newLabels = selectedLabels.filter(label => label.id !== labelId);
    console.log('🏷️ Label removed:', labelId);
    console.log('🏷️ Remaining labels:', newLabels);
    onLabelsChange(newLabels);
  };

  const handleCreateLabel = () => {
    if (searchTerm.trim() && !availableLabels.some(label => 
      label.name.toLowerCase() === searchTerm.toLowerCase()
    )) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
      const newLabel = {
        id: Date.now(),
        name: searchTerm.trim(),
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      
      // Add to global labels context
      addLabel(newLabel);
      
      // Add to selected labels for this note
      handleLabelSelect(newLabel);
    }
  };

  return (
    <div className="label-selector" ref={dropdownRef}>
      <div className="label-selector-header">
        <Tag size={16} />
        <span>Labels</span>
      </div>

      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <div className="selected-labels">
          {selectedLabels.map((label) => (
            <div key={label.id} className="selected-label">
              <div 
                className="label-color-dot"
                style={{ backgroundColor: label.color }}
              />
              <span className="label-name">{label.name}</span>
              <button
                type="button"
                onClick={() => handleLabelRemove(label.id)}
                className="remove-label-btn"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Label Button */}
      <div className="add-label-section">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="add-label-btn"
        >
          <Plus size={14} />
          Add Label
          <ChevronDown size={14} className={`chevron ${isOpen ? 'chevron-open' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="label-dropdown">
            <div className="label-search">
              <input
                type="text"
                placeholder="Search or create label..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="label-search-input"
                autoFocus
              />
            </div>

            <div className="label-options">
              {/* Create new label option */}
              {searchTerm.trim() && !availableLabels.some(label => 
                label.name.toLowerCase() === searchTerm.toLowerCase()
              ) && (
                <button
                  type="button"
                  onClick={handleCreateLabel}
                  className="label-option create-option"
                >
                  <Plus size={14} />
                  Create "{searchTerm}"
                </button>
              )}

              {/* Existing labels */}
              {filteredLabels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => handleLabelSelect(label)}
                  className="label-option"
                >
                  <div 
                    className="label-color-dot"
                    style={{ backgroundColor: label.color }}
                  />
                  <span>{label.name}</span>
                </button>
              ))}

              {filteredLabels.length === 0 && !searchTerm.trim() && (
                <div className="no-labels">No more labels available</div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .label-selector {
          position: relative;
        }

        .label-selector-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
          font-weight: 500;
          font-size: 0.875rem;
        }

        .selected-labels {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .selected-label {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          font-size: 0.75rem;
          color: var(--text-primary);
        }

        .label-color-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .label-name {
          font-weight: 500;
        }

        .remove-label-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.125rem;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .remove-label-btn:hover {
          background: var(--error);
          color: white;
        }

        .add-label-section {
          position: relative;
        }

        .add-label-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border: 1px dashed var(--border-secondary);
          background: transparent;
          color: var(--text-secondary);
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          justify-content: center;
        }

        .add-label-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: rgba(59, 130, 246, 0.05);
        }

        .chevron {
          transition: transform 0.2s ease;
        }

        .chevron-open {
          transform: rotate(180deg);
        }

        .label-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 50;
          background: var(--bg-primary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-top: 0.25rem;
          max-height: 200px;
          overflow: hidden;
        }

        .label-search {
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .label-search-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .label-search-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .label-options {
          max-height: 120px;
          overflow-y: auto;
        }

        .label-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .label-option:hover {
          background: var(--bg-secondary);
        }

        .create-option {
          color: var(--accent-primary);
          font-weight: 500;
        }

        .create-option:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .no-labels {
          padding: 1rem 0.75rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        /* Scrollbar styling */
        .label-options::-webkit-scrollbar {
          width: 4px;
        }

        .label-options::-webkit-scrollbar-track {
          background: var(--bg-secondary);
        }

        .label-options::-webkit-scrollbar-thumb {
          background: var(--border-secondary);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}