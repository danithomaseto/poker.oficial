"use client";

import { useSyncExternalStore } from "react";

/** Online/offline do navegador, como estado React. */
export function useOnline(): boolean {
  return useSyncExternalStore(
    (f) => {
      window.addEventListener("online", f);
      window.addEventListener("offline", f);
      return () => {
        window.removeEventListener("online", f);
        window.removeEventListener("offline", f);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}
