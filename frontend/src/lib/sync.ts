import apiClient from "../api/client";
import { getDB } from "./db";

export const flushSyncQueue = async () => {
  if (!navigator.onLine) return;

  const db = await getDB();
  const tx = db.transaction("syncQueue", "readwrite");
  const store = tx.objectStore("syncQueue");

  const allItems = await store.getAll();

  if (allItems.length === 0) return;

  try {
    const response = await apiClient.post("/projects/sync", {
      payloads: allItems,
    });
    if (response.status === 200) {
      for (const item of allItems) {
        if (item.id) {
          await store.delete(item.id);
        }
      }
    }
  } catch (error) {
    console.error("Failed to sync offline queue:", error);
  }
};
