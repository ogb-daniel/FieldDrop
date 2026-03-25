import { useEffect } from "react";
import { AppRouter } from "./routes";
import { flushSyncQueue } from "./lib/sync";

function App() {
  useEffect(() => {
    flushSyncQueue();

    window.addEventListener("online", flushSyncQueue);

    return () => {
      window.removeEventListener("online", flushSyncQueue);
    };
  }, []);
  return <AppRouter />;
}

export default App;
