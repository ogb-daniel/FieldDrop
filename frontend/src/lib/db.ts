import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Project } from "../types/project";

export interface SyncItem {
  id?: number;
  projectId: string;
  data: {
    name?: string;
    canvas_state?: unknown[];
    polygons?: unknown[];
    thumbnail?: string;
  };
  timestamp: number;
}
interface FieldDropDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
  };
  syncQueue: {
    key: number;
    value: SyncItem;
  };
}

let dbPromise: Promise<IDBPDatabase<FieldDropDB>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<FieldDropDB>("FieldDropDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("projects")) {
          db.createObjectStore("projects", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      },
    });
  }
  return dbPromise;
};

export const getCachedProject = async (id: string) => {
  const db = await getDB();
  return db.get("projects", id);
};

export const cacheProject = async (project: Project) => {
  const db = await getDB();
  return db.put("projects", project);
};

export const enqueueSyncItem = async (item: Omit<SyncItem, "id">) => {
  const db = await getDB();
  return db.add("syncQueue", item);
};
