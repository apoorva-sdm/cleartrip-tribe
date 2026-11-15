/**
 * Small wrapper over sessionStorage so the prototype survives a reload or a trip out to
 * WhatsApp and back. Storage can be missing or blocked (private mode), so every call is guarded.
 */
export interface KeyValueStore {
  read<T>(key: string): T | null;
  write(key: string, value: unknown): void;
}

export const sessionStore: KeyValueStore = {
  read<T>(key: string): T | null {
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  write(key: string, value: unknown): void {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable: the prototype still works, it just won't survive a reload.
    }
  },
};

/** For tests and non-browser use. */
export function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    read<T>(key: string) {
      const raw = data.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    },
    write(key, value) {
      data.set(key, JSON.stringify(value));
    },
  };
}
