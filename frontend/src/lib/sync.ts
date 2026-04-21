import apiClient from "../api/client";
import { getDB } from "./db";

export const flushSyncQueue = async () => {
  if (!navigator.onLine) return;

  const db = await getDB();
  const readTx = db.transaction("syncQueue", "readonly");
  const allItems = await readTx.objectStore("syncQueue").getAll();

  if (allItems.length === 0) return;

  const BATCH_SIZE = 50;
  for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
    const batch = allItems.slice(i, i + BATCH_SIZE);
    try {
      const response = await apiClient.post("/projects/sync", batch);
      if (response.status === 200) {
        const deleteTx = db.transaction("syncQueue", "readwrite");
        const deleteStore = deleteTx.objectStore("syncQueue");
        for (const item of batch) {
          if (item.id) {
            await deleteStore.delete(item.id);
          }
        }
        // Wait for deletions to complete
        await deleteTx.done;
      }
    } catch (error) {
      console.error("Failed to sync offline queue batch. Stopping sync.", error);
      break; 
    }
  }
};
