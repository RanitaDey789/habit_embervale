import { getDb } from "@/storage/idb";
import type { StorageAdapter, StoreName } from "@/storage/adapter";

/**
 * IndexedDB implementation of the StorageAdapter contract.
 * This is the only module that knows about IndexedDB specifics.
 *
 * The idb DBSchema typing is intentionally widened here so the adapter
 * can stay generic across entity types; repositories restore strong typing.
 */
interface LooseDb {
  getAll(store: string): Promise<unknown[]>;
  put(store: string, value: unknown): Promise<unknown>;
  delete(store: string, key: string): Promise<void>;
  clear(store: string): Promise<void>;
  get(store: string, key: string): Promise<unknown>;
  transaction(
    stores: string | string[],
    mode?: IDBTransactionMode
  ): {
    objectStore(name: string): { put(v: unknown): Promise<unknown>; clear(): Promise<void> };
    done: Promise<void>;
  };
}

export class IdbStorageAdapter implements StorageAdapter {
  private async db(): Promise<LooseDb> {
    return (await getDb()) as unknown as LooseDb;
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    const db = await this.db();
    return (await db.getAll(store)) as T[];
  }

  async put<T extends { id: string }>(store: StoreName, value: T): Promise<void> {
    const db = await this.db();
    await db.put(store, value);
  }

  async bulkPut<T extends { id: string }>(store: StoreName, values: T[]): Promise<void> {
    if (values.length === 0) return;
    const db = await this.db();
    const tx = db.transaction(store, "readwrite");
    for (const v of values) await tx.objectStore(store).put(v);
    await tx.done;
  }

  async remove(store: StoreName, id: string): Promise<void> {
    const db = await this.db();
    await db.delete(store, id);
  }

  async clearStore(store: StoreName): Promise<void> {
    const db = await this.db();
    await db.clear(store);
  }

  async kvGet<T>(key: string): Promise<T | undefined> {
    const db = await this.db();
    return (await db.get("kv", key)) as T | undefined;
  }

  async kvSet<T>(key: string, value: T): Promise<void> {
    const db = await this.db();
    await db.put("kv", value);
  }

  async clearAll(): Promise<void> {
    const db = await this.db();
    const stores = ["tasks", "habits", "quests", "rewards", "log", "kv"];
    const tx = db.transaction(stores, "readwrite");
    for (const s of stores) await tx.objectStore(s).clear();
    await tx.done;
  }
}

export const idbAdapter = new IdbStorageAdapter();
