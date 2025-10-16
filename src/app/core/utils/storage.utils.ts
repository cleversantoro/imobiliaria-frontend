export function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

export function readFromStorage<T>(key: string): T | null {
  const storage = getBrowserStorage();

  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeToStorage<T>(key: string, value: T | null): void {
  const storage = getBrowserStorage();

  if (!storage) {
    return;
  }

  if (value === null) {
    storage.removeItem(key);
    return;
  }

  storage.setItem(key, JSON.stringify(value));
}
