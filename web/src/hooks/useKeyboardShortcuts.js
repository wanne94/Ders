import { useEffect, useCallback } from 'react';

const useKeyboardShortcuts = (shortcuts = {}, dependencies = []) => {
  const handleKeyPress = useCallback((event) => {
    // Get the key combination
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;
    const key = event.key.toLowerCase();
    
    // Don't trigger shortcuts when typing in inputs
    const activeElement = document.activeElement;
    const isInputActive = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    );
    
    // Build shortcut string
    let shortcutKey = '';
    if (ctrl) shortcutKey += 'ctrl+';
    if (shift) shortcutKey += 'shift+';
    if (alt) shortcutKey += 'alt+';
    shortcutKey += key;
    
    // Check if shortcut exists and conditions are met
    const shortcut = shortcuts[shortcutKey];
    if (shortcut) {
      // Skip if typing in input and not explicitly allowed
      if (isInputActive && !shortcut.allowInInput) {
        return;
      }
      
      // Prevent default behavior
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      
      // Execute callback
      if (typeof shortcut === 'function') {
        shortcut(event);
      } else if (shortcut.handler) {
        shortcut.handler(event);
      }
    }
  }, [shortcuts, ...dependencies]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
  
  return {
    registerShortcut: (key, handler, options = {}) => {
      shortcuts[key] = { handler, ...options };
    },
    unregisterShortcut: (key) => {
      delete shortcuts[key];
    }
  };
};

// Common keyboard shortcuts configuration
export const commonShortcuts = {
  // Navigation
  'alt+h': { description: 'Go to Home', icon: '🏠' },
  'alt+d': { description: 'Open Dashboard', icon: '📊' },
  'alt+s': { description: 'Focus Search', icon: '🔍' },
  
  // Actions
  'ctrl+n': { description: 'New Item', icon: '➕' },
  'ctrl+e': { description: 'Edit Item', icon: '✏️' },
  'ctrl+d': { description: 'Delete Item', icon: '🗑️' },
  'ctrl+s': { description: 'Save', icon: '💾' },
  
  // View
  'ctrl+shift+f': { description: 'Toggle Fullscreen', icon: '🖥️' },
  'ctrl+shift+d': { description: 'Toggle Dark Mode', icon: '🌙' },
  'ctrl+/': { description: 'Show Shortcuts', icon: '⌨️' },
  
  // Selection
  'ctrl+a': { description: 'Select All', icon: '☑️' },
  'escape': { description: 'Clear Selection/Close Modal', icon: '❌' },
  
  // Navigation between sections
  '1': { description: 'Go to Section 1', icon: '1️⃣' },
  '2': { description: 'Go to Section 2', icon: '2️⃣' },
  '3': { description: 'Go to Section 3', icon: '3️⃣' },
  '4': { description: 'Go to Section 4', icon: '4️⃣' },
  '5': { description: 'Go to Section 5', icon: '5️⃣' },
  
  // Undo/Redo
  'ctrl+z': { description: 'Undo', icon: '↶' },
  'ctrl+shift+z': { description: 'Redo', icon: '↷' },
  'ctrl+y': { description: 'Redo', icon: '↷' }
};

export default useKeyboardShortcuts;