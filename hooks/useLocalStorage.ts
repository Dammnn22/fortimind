
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

export function useLocalStorage<T>(key: string, initialValue: T, options?: { disabled?: boolean }): [T, SetValue<T>] {
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    // If disabled, we might still want to read initially to show data from a previous non-disabled session,
    // but subsequent writes will be blocked by the `setValue` logic.
    // However, if the intention for `disabled` is true ephemerality, then initialValue is better.
    // Current behavior: reads from localStorage even if disabled initially, but won't save if disabled.
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Effect to re-read from localStorage if key or disabled status changes.
  // This is important if `disabled` becomes true, we want to reflect the in-memory state or initialValue.
  // If `disabled` becomes false, we want to load persisted data.
  useEffect(() => {
    setStoredValue(readValue());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, options?.disabled]);


  const setValue: SetValue<T> = (value) => {
    if (typeof window === 'undefined') {
      console.warn(
        `Tried setting localStorage key "${key}" even though environment is not a client`,
      );
      return; // Return to prevent further execution if not in a browser.
    }

    const resolvedNewValue = value instanceof Function ? value(storedValue) : value;

    const currentValJson = JSON.stringify(storedValue);
    const newValJson = JSON.stringify(resolvedNewValue);
    const changed = currentValJson !== newValJson;

    if (options?.disabled) {
      // If disabled, only update in-memory state if it has semantically changed.
      if (changed) {
        setStoredValue(resolvedNewValue);
      }
    } else {
      // If not disabled, persist to localStorage and update in-memory state IF IT HAS CHANGED.
      if (changed) {
        try {
          window.localStorage.setItem(key, JSON.stringify(resolvedNewValue));
          setStoredValue(resolvedNewValue);
          window.dispatchEvent(new Event('local-storage')); // To sync across tabs/components
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
        }
      }
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | Event) => {
      // For 'storage' event, check if the key matches.
      // For 'local-storage' custom event, assume it's relevant or check specific data if needed.
      if (event instanceof StorageEvent && event.key !== key) {
        return;
      }
      // Only re-read and update if not disabled to avoid overwriting in-memory guest data.
      if (!options?.disabled) {
        setStoredValue(readValue());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange); // Custom event for same-tab updates
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, options?.disabled]); // Added options?.disabled to re-evaluate if it changes

  return [storedValue, setValue];
}
