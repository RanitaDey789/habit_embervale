/**
 * Storage adapter contract.
 *
 * The app currently ships with an IndexedDB adapter, but any backend
 * (Supabase, Firebase, a custom REST API) can be plugged in by
 * implementing this interface and passing it to the repositories.
 * UI and services never touch IndexedDB directly.
 */

export type StoreName = "tasks" | "habits" | "quests" | "rewards" | "log";

export interface StorageAdapter {
  getAll<T>(store: StoreName): Promise<T[]>;
  put<T extends { id: string }>(store: StoreName, value: T): Promise<void>;
  bulkPut<T extends { id: string }>(store: StoreName, values: T[]): Promise<void>;
  remove(store: StoreName, id: string): Promise<void>;
  clearStore(store: StoreName): Promise<void>;

  /** Key-value space for singletons (profile, settings, unlocks). */
  kvGet<T>(key: string): Promise<T | undefined>;
  kvSet<T>(key: string, value: T): Promise<void>;

  /** Wipe everything (used by reset + import). */
  clearAll(): Promise<void>;
}
