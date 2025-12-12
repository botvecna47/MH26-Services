import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
    syncAcrossTabs?: boolean;
  } = {}
) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true
  } = options;

  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serialize(valueToStore));
        
        // Trigger storage event for cross-tab sync
        if (syncAcrossTabs) {
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: serialize(valueToStore),
            oldValue: window.localStorage.getItem(key),
          }));
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, storedValue, syncAcrossTabs]);

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        if (syncAcrossTabs) {
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: null,
            oldValue: window.localStorage.getItem(key),
          }));
        }
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, syncAcrossTabs]);

  // Sync state across tabs
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;

      try {
        if (e.newValue === null) {
          setStoredValue(initialValue);
        } else {
          setStoredValue(deserialize(e.newValue));
        }
      } catch (error) {
        console.warn(`Error syncing localStorage key "${key}" across tabs:`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, deserialize, syncAcrossTabs]);

  return [storedValue, setValue, removeValue] as const;
}

// Hook for managing complex objects in localStorage with validation
export function useStoredObject<T extends Record<string, any>>(
  key: string,
  initialValue: T,
  validator?: (value: any) => value is T
) {
  const [storedValue, setStoredValue, removeValue] = useLocalStorage(
    key,
    initialValue,
    {
      serialize: JSON.stringify,
      deserialize: (value: string) => {
        try {
          const parsed = JSON.parse(value);
          return validator ? (validator(parsed) ? parsed : initialValue) : parsed;
        } catch {
          return initialValue;
        }
      }
    }
  );

  // Update specific property
  const updateProperty = useCallback(<K extends keyof T>(
    property: K,
    value: T[K] | ((prev: T[K]) => T[K])
  ) => {
    setStoredValue((prev: T) => ({
      ...prev,
      [property]: typeof value === 'function' ? (value as any)(prev[property]) : value
    }));
  }, [setStoredValue]);

  // Merge object
  const merge = useCallback((updates: Partial<T>) => {
    setStoredValue((prev: T) => ({ ...prev, ...updates }));
  }, [setStoredValue]);

  return {
    value: storedValue,
    setValue: setStoredValue,
    updateProperty,
    merge,
    remove: removeValue
  };
}

// Hook for managing arrays in localStorage
export function useStoredArray<T>(
  key: string,
  initialValue: T[] = []
) {
  const [storedValue, setStoredValue, removeValue] = useLocalStorage(key, initialValue);

  const addItem = useCallback((item: T) => {
    setStoredValue(prev => [...prev, item]);
  }, [setStoredValue]);

  const removeItem = useCallback((index: number) => {
    setStoredValue(prev => prev.filter((_, i) => i !== index));
  }, [setStoredValue]);

  const removeItemBy = useCallback((predicate: (item: T) => boolean) => {
    setStoredValue(prev => prev.filter(item => !predicate(item)));
  }, [setStoredValue]);

  const updateItem = useCallback((index: number, updater: T | ((prev: T) => T)) => {
    setStoredValue(prev => 
      prev.map((item, i) => 
        i === index 
          ? typeof updater === 'function' ? (updater as Function)(item) : updater
          : item
      )
    );
  }, [setStoredValue]);

  const insertAt = useCallback((index: number, item: T) => {
    setStoredValue(prev => [
      ...prev.slice(0, index),
      item,
      ...prev.slice(index)
    ]);
  }, [setStoredValue]);

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    setStoredValue(prev => {
      const newArray = [...prev];
      const [removed] = newArray.splice(fromIndex, 1);
      newArray.splice(toIndex, 0, removed);
      return newArray;
    });
  }, [setStoredValue]);

  const clear = useCallback(() => {
    setStoredValue([]);
  }, [setStoredValue]);

  return {
    items: storedValue,
    setItems: setStoredValue,
    addItem,
    removeItem,
    removeItemBy,
    updateItem,
    insertAt,
    moveItem,
    clear,
    remove: removeValue,
    length: storedValue.length,
    isEmpty: storedValue.length === 0
  };
}

// Hook for user preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    itemsPerPage: number;
  };
  location: {
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export function useUserPreferences() {
  const defaultPreferences: UserPreferences = {
    theme: 'system',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    dashboard: {
      layout: 'grid',
      itemsPerPage: 12
    },
    location: {
      city: 'Nanded',
      state: 'Maharashtra'
    }
  };

  const validator = (value: any): value is UserPreferences => {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof value.theme === 'string' &&
      typeof value.language === 'string' &&
      typeof value.notifications === 'object' &&
      typeof value.dashboard === 'object' &&
      typeof value.location === 'object'
    );
  };

  return useStoredObject('user-preferences', defaultPreferences, validator);
}

// Hook for recent searches
export function useRecentSearches(maxItems = 10) {
  const { items, addItem, removeItem, clear } = useStoredArray<{
    query: string;
    category?: string;
    timestamp: number;
  }>('recent-searches');

  const addSearch = useCallback((query: string, category?: string) => {
    // Remove existing search if it exists
    const existingIndex = items.findIndex(item => 
      item.query.toLowerCase() === query.toLowerCase() && item.category === category
    );
    
    if (existingIndex !== -1) {
      removeItem(existingIndex);
    }

    // Add new search at the beginning
    const newSearch = {
      query: query.trim(),
      category,
      timestamp: Date.now()
    };

    // Keep only maxItems
    if (items.length >= maxItems) {
      items.slice(0, maxItems - 1);
      addItem(newSearch);
    } else {
      addItem(newSearch);
    }
  }, [items, addItem, removeItem, maxItems]);

  const getRecentSearches = useCallback((limit?: number) => {
    return items
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit || items.length);
  }, [items]);

  return {
    searches: getRecentSearches(),
    addSearch,
    removeSearch: removeItem,
    clearSearches: clear,
    getRecentSearches
  };
}

// Hook for form data persistence
export function useFormPersistence<T extends Record<string, any>>(
  formId: string,
  initialData: T,
  options: {
    clearOnSubmit?: boolean;
    autoClear?: number; // Clear after N milliseconds
  } = {}
) {
  const { clearOnSubmit = true, autoClear } = options;
  
  const { value, setValue, remove } = useStoredObject(`form-${formId}`, initialData);

  // Auto clear timer
  useEffect(() => {
    if (autoClear) {
      const timer = setTimeout(() => {
        remove();
      }, autoClear);

      return () => clearTimeout(timer);
    }
  }, [autoClear, remove]);

  const updateField = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    setValue((prev: T) => ({ ...prev, [field]: value }));
  }, [setValue]);

  const handleSubmit = useCallback(() => {
    if (clearOnSubmit) {
      remove();
    }
  }, [clearOnSubmit, remove]);

  return {
    formData: value,
    updateField,
    setFormData: setValue,
    clearForm: remove,
    handleSubmit
  };
}