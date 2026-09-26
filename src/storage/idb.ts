import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Habit, LogEntry, Quest, Reward, Task } from "@/domain/types";

/**
 * Versioned IndexedDB schema. Bump DB_VERSION and extend `upgrade`
 * to add migrations; existing stores are left untouched.
 */
export const DB_NAME = "embervale-db";
export const DB_VERSION = 1;

interface EmbervaleDB extends DBSchema {
  tasks: { key: string; value: Task; indexes: { byDate: string } };
  habits: { key: string; value: Habit };
  quests: { key: string; value: Quest };
  rewards: { key: string; value: Reward };
  log: { key: string; value: LogEntry; indexes: { byDate: string } };
  kv: { key: string; value: unknown };
}

let dbPromise: Promise<IDBPDatabase<EmbervaleDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<EmbervaleDB>> {
  if (!dbPromise) {
    dbPromise = openDB<EmbervaleDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const tasks = db.createObjectStore("tasks", { keyPath: "id" });
          tasks.createIndex("byDate", "dueDate");
          db.createObjectStore("habits", { keyPath: "id" });
          db.createObjectStore("quests", { keyPath: "id" });
          db.createObjectStore("rewards", { keyPath: "id" });
          const log = db.createObjectStore("log", { keyPath: "id" });
          log.createIndex("byDate", "date");
          db.createObjectStore("kv");
        }
        // future: if (oldVersion < 2) { ... }
      },
    });
  }
  return dbPromise;
}
