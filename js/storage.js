/**
 * ============================================
 * GRADVENTURE — LocalStorage Manager
 * ============================================
 */

const Storage = (() => {
  const PREFIX = 'gradventure_';
  
  /** Check if localStorage is available */
  function isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  const available = isAvailable();
  
  // In-memory fallback if localStorage is unavailable
  const memoryStore = {};
  
  /**
   * Save a value to storage
   * @param {string} key
   * @param {*} value - Will be JSON-stringified
   */
  function save(key, value) {
    const fullKey = PREFIX + key;
    try {
      if (available) {
        localStorage.setItem(fullKey, JSON.stringify(value));
      } else {
        memoryStore[fullKey] = value;
      }
    } catch (e) {
      console.warn('[Storage] Failed to save:', key, e);
      memoryStore[fullKey] = value;
    }
  }
  
  /**
   * Load a value from storage
   * @param {string} key
   * @param {*} defaultValue - Returned if key doesn't exist
   * @returns {*}
   */
  function load(key, defaultValue = null) {
    const fullKey = PREFIX + key;
    try {
      if (available) {
        const item = localStorage.getItem(fullKey);
        return item !== null ? JSON.parse(item) : defaultValue;
      }
      return fullKey in memoryStore ? memoryStore[fullKey] : defaultValue;
    } catch (e) {
      console.warn('[Storage] Failed to load:', key, e);
      return defaultValue;
    }
  }
  
  /**
   * Remove a specific key
   * @param {string} key
   */
  function remove(key) {
    const fullKey = PREFIX + key;
    try {
      if (available) {
        localStorage.removeItem(fullKey);
      }
      delete memoryStore[fullKey];
    } catch (e) {
      console.warn('[Storage] Failed to remove:', key, e);
    }
  }
  
  /**
   * Clear all Gradventure data from storage
   */
  function clear() {
    try {
      if (available) {
        Object.keys(localStorage)
          .filter(k => k.startsWith(PREFIX))
          .forEach(k => localStorage.removeItem(k));
      }
      Object.keys(memoryStore)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => delete memoryStore[k]);
    } catch (e) {
      console.warn('[Storage] Failed to clear:', e);
    }
  }
  
  return { save, load, remove, clear, isAvailable: () => available };
})();
