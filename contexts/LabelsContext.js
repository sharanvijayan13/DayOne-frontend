"use client";

import { createContext, useContext, useEffect, useState } from 'react';

const LabelsContext = createContext();

export function LabelsProvider({ children }) {
  const [availableLabels, setAvailableLabels] = useState([]);

  // Default labels that are always available
  const defaultLabels = [
    { id: 1, name: 'Work', color: '#3b82f6' },
    { id: 2, name: 'Personal', color: '#10b981' },
    { id: 3, name: 'Ideas', color: '#f59e0b' },
    { id: 4, name: 'Important', color: '#ef4444' },
    { id: 5, name: 'Learning', color: '#8b5cf6' },
    { id: 6, name: 'Projects', color: '#06b6d4' },
  ];

  useEffect(() => {
    // Load labels from localStorage on component mount
    const savedLabels = localStorage.getItem('minisamantha_labels');
    if (savedLabels) {
      try {
        const parsedLabels = JSON.parse(savedLabels);
        setAvailableLabels(parsedLabels);
      } catch (error) {
        console.error('Error parsing saved labels:', error);
        setAvailableLabels(defaultLabels);
      }
    } else {
      setAvailableLabels(defaultLabels);
    }
  }, []);

  const addLabel = (newLabel) => {
    const updatedLabels = [...availableLabels, newLabel];
    setAvailableLabels(updatedLabels);
    localStorage.setItem('minisamantha_labels', JSON.stringify(updatedLabels));
    return newLabel;
  };

  const updateLabel = (labelId, updates) => {
    const updatedLabels = availableLabels.map(label => 
      label.id === labelId ? { ...label, ...updates } : label
    );
    setAvailableLabels(updatedLabels);
    localStorage.setItem('minisamantha_labels', JSON.stringify(updatedLabels));
  };

  const deleteLabel = (labelId) => {
    const updatedLabels = availableLabels.filter(label => label.id !== labelId);
    setAvailableLabels(updatedLabels);
    localStorage.setItem('minisamantha_labels', JSON.stringify(updatedLabels));
  };

  const getLabelById = (labelId) => {
    return availableLabels.find(label => label.id === labelId);
  };

  const resetToDefaults = () => {
    setAvailableLabels(defaultLabels);
    localStorage.setItem('minisamantha_labels', JSON.stringify(defaultLabels));
  };

  return (
    <LabelsContext.Provider value={{
      availableLabels,
      addLabel,
      updateLabel,
      deleteLabel,
      getLabelById,
      resetToDefaults
    }}>
      {children}
    </LabelsContext.Provider>
  );
}

export function useLabels() {
  const context = useContext(LabelsContext);
  if (context === undefined) {
    throw new Error('useLabels must be used within a LabelsProvider');
  }
  return context;
}