import { describe, expect, it } from "vitest";
import {
  GET_STARTED_DISMISSED_STORAGE_KEY,
  persistGetStartedDismissed,
  readGetStartedDismissed,
  shouldAutoDismissGetStarted,
} from "../../src/features/hvi-map/components/getStartedOverlayState";

function createMemoryStorage(initialValue?: string) {
  const values = new Map<string, string>();
  if (initialValue !== undefined) {
    values.set(GET_STARTED_DISMISSED_STORAGE_KEY, initialValue);
  }

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

describe("get started overlay helpers", () => {
  it("defaults to visible when no dismissal is stored", () => {
    expect(readGetStartedDismissed(createMemoryStorage())).toBe(false);
    expect(readGetStartedDismissed(null)).toBe(false);
  });

  it("reads and writes a stored dismissal flag", () => {
    const storage = createMemoryStorage();

    persistGetStartedDismissed(storage);

    expect(readGetStartedDismissed(storage)).toBe(true);
  });

  it("treats storage failures as non-fatal", () => {
    const throwingStorage = {
      getItem() {
        throw new Error("read blocked");
      },
      setItem() {
        throw new Error("write blocked");
      },
    };

    expect(readGetStartedDismissed(throwingStorage)).toBe(false);
    expect(() => persistGetStartedDismissed(throwingStorage)).not.toThrow();
  });

  it("stays visible for the initial regional state", () => {
    expect(
      shouldAutoDismissGetStarted({
        zoomMode: "region",
        hasLockedRegion: false,
        hasLockedDa: false,
        searchSelectionCount: 0,
      })
    ).toBe(false);
  });

  it("auto-dismisses after entering DA mode, locking a feature, or selecting search", () => {
    expect(
      shouldAutoDismissGetStarted({
        zoomMode: "da",
        hasLockedRegion: false,
        hasLockedDa: false,
        searchSelectionCount: 0,
      })
    ).toBe(true);

    expect(
      shouldAutoDismissGetStarted({
        zoomMode: "region",
        hasLockedRegion: true,
        hasLockedDa: false,
        searchSelectionCount: 0,
      })
    ).toBe(true);

    expect(
      shouldAutoDismissGetStarted({
        zoomMode: "region",
        hasLockedRegion: false,
        hasLockedDa: true,
        searchSelectionCount: 0,
      })
    ).toBe(true);

    expect(
      shouldAutoDismissGetStarted({
        zoomMode: "region",
        hasLockedRegion: false,
        hasLockedDa: false,
        searchSelectionCount: 1,
      })
    ).toBe(true);
  });
});
