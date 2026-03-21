import type { SearchEntry } from "../types/search";

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getRegionCandidateTexts(entry: SearchEntry): string[] {
  if (entry.kind === "region") {
    return [entry.label, entry.secondaryLabel ?? ""];
  }

  return [entry.regionName ?? ""];
}

function getSearchScore(entry: SearchEntry, query: string): number | null {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2) return null;

  const primaryId =
    entry.kind === "da"
      ? normalizeSearchText(entry.properties.DAUID)
      : normalizeSearchText(entry.label);

  if (primaryId === normalizedQuery) return 0;
  if (primaryId.startsWith(normalizedQuery)) return 1;

  if (entry.kind === "da" && primaryId.includes(normalizedQuery)) {
    return 2;
  }

  const regionTexts = getRegionCandidateTexts(entry)
    .map(normalizeSearchText)
    .filter(Boolean);

  if (regionTexts.some((text) => text === normalizedQuery)) return 3;
  if (regionTexts.some((text) => text.startsWith(normalizedQuery))) return 4;
  if (regionTexts.some((text) => text.includes(normalizedQuery))) return 5;

  const labelText = normalizeSearchText(entry.label);
  if (labelText.includes(normalizedQuery)) return 6;

  return null;
}

export function getSearchResults(
  entries: readonly SearchEntry[],
  query: string,
  limit = 8
): SearchEntry[] {
  const scoredEntries = entries
    .map((entry) => ({
      entry,
      score: getSearchScore(entry, query),
    }))
    .filter((item): item is { entry: SearchEntry; score: number } => item.score !== null)
    .sort((left, right) => {
      if (left.score !== right.score) return left.score - right.score;
      if (left.entry.kind !== right.entry.kind) {
        return left.entry.kind === "region" ? -1 : 1;
      }
      return left.entry.label.localeCompare(right.entry.label);
    });

  return scoredEntries.slice(0, limit).map((item) => item.entry);
}
