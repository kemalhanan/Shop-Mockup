import { useSyncExternalStore } from 'react';
import type { z } from 'zod';

type Updater<T> = T | ((current: T) => T);

export type Store<T> = {
  get: () => T;
  set: (next: Updater<T>) => void;
  subscribe: (listener: () => void) => () => void;
  use: () => T;
};

const resolve = <T,>(next: Updater<T>, current: T) => (typeof next === 'function' ? (next as (value: T) => T)(current) : next);

/** A small observable value that components read through `useSyncExternalStore`. */
export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();

  const get = () => value;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    get,
    subscribe,
    set: (next) => {
      value = resolve(next, value);
      listeners.forEach((listener) => listener());
    },
    use: () => useSyncExternalStore(subscribe, get),
  };
}

function openStorage(kind: 'local' | 'session') {
  // Merely touching these properties can throw when site data is blocked.
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * A store mirrored to browser storage. Saved values are validated on the way in, so a corrupt or
 * outdated entry falls back rather than crashing the shop. Local stores also stay in sync across tabs.
 */
export function createPersistedStore<T>(options: {
  key: string;
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  fallback: T;
  kind?: 'local' | 'session';
}): Store<T> {
  const { key, schema, fallback, kind = 'local' } = options;
  const storage = openStorage(kind);

  const read = () => {
    try {
      const raw = storage?.getItem(key);
      if (raw == null) return fallback;
      const parsed = schema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : fallback;
    } catch {
      return fallback;
    }
  };

  const store = createStore<T>(read());

  if (kind === 'local') {
    window.addEventListener('storage', (event) => {
      if (event.key === key || event.key === null) store.set(read());
    });
  }

  return {
    ...store,
    set: (next) => {
      const value = resolve(next, store.get());
      try {
        storage?.setItem(key, JSON.stringify(value));
      } catch {
        // Storage can be full or blocked. The shop still works for this visit.
      }
      store.set(value);
    },
  };
}
