import type { ZoomMode } from "../types/data";

export const GET_STARTED_DISMISSED_STORAGE_KEY = "hvi:get-started-dismissed";

type MinimalStorage = Pick<Storage, "getItem" | "setItem">;

export interface GetStartedDismissSignal {
  zoomMode: ZoomMode;
  hasLockedRegion: boolean;
  hasLockedDa: boolean;
  searchSelectionCount: number;
}

function resolveStorage(storage?: MinimalStorage | null): MinimalStorage | null {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readGetStartedDismissed(storage?: MinimalStorage | null): boolean {
  const resolvedStorage = resolveStorage(storage);
  if (!resolvedStorage) {
    return false;
  }

  try {
    return resolvedStorage.getItem(GET_STARTED_DISMISSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function persistGetStartedDismissed(storage?: MinimalStorage | null) {
  const resolvedStorage = resolveStorage(storage);
  if (!resolvedStorage) {
    return;
  }

  try {
    resolvedStorage.setItem(GET_STARTED_DISMISSED_STORAGE_KEY, "1");
  } catch {
    // Ignore storage failures so the overlay never blocks map usage.
  }
}

export function shouldAutoDismissGetStarted({
  zoomMode,
  hasLockedRegion,
  hasLockedDa,
  searchSelectionCount,
}: GetStartedDismissSignal): boolean {
  return (
    zoomMode === "da" ||
    hasLockedRegion ||
    hasLockedDa ||
    searchSelectionCount > 0
  );
}
