import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SearchEntry, SearchIndex } from "../types/search";
import { getSearchResults } from "../search";
import { useMapDispatch } from "../state/useMapDispatch";

interface SearchOverlayProps {
  onSelectResult: (entry: SearchEntry) => void;
}

function ResultKindBadge({ kind }: { kind: SearchEntry["kind"] }) {
  return <Badge variant="secondary">{kind === "region" ? "Region" : "DA"}</Badge>;
}

export default function SearchOverlay({ onSelectResult }: SearchOverlayProps) {
  const dispatch = useMapDispatch();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${import.meta.env.BASE_URL}search/hvi-search-index.json`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load search index.");
        }
        return response.json() as Promise<SearchIndex>;
      })
      .then((index) => {
        setSearchIndex(index);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(error instanceof Error ? error.message : "Unable to load search index.");
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const results = useMemo(
    () => getSearchResults(searchIndex?.entries ?? [], query),
    [query, searchIndex]
  );

  const showResults = isOpen && (results.length > 0 || Boolean(loadError) || query.trim().length >= 2);

  const handleSelect = (entry: SearchEntry) => {
    if (entry.kind === "da") {
      dispatch({ type: "unlockDa" });
      dispatch({
        type: "daClicked",
        da: entry.properties,
        regionName: entry.regionName,
      });
      setQuery(entry.properties.DAUID);
    } else {
      dispatch({ type: "unlockRegion" });
      dispatch({ type: "regionClicked", region: entry.properties });
      setQuery(entry.label);
    }

    setIsOpen(false);
    onSelectResult(entry);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
      <div
        ref={containerRef}
        className="pointer-events-auto w-full max-w-xl"
      >
        <div className="rounded-2xl border border-border/80 bg-background/95 shadow-lg backdrop-blur">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && results[0]) {
                  event.preventDefault();
                  handleSelect(results[0]);
                }

                if (event.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              placeholder={
                searchIndex
                  ? "Search by region name or DAUID"
                  : "Loading region and DA search..."
              }
              disabled={!searchIndex && !loadError}
              className="h-11 rounded-2xl border-0 bg-transparent pr-11 pl-10 text-sm shadow-none focus-visible:ring-0"
            />
            {query ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute top-1/2 right-2 -translate-y-1/2"
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                }}
              >
                <XIcon className="size-3.5" />
                <span className="sr-only">Clear search</span>
              </Button>
            ) : null}
          </div>

          {showResults ? (
            <div className="border-t border-border/80">
              <ScrollArea className="max-h-72">
                {loadError ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">{loadError}</p>
                ) : results.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">
                    No matching regions or DAUIDs.
                  </p>
                ) : (
                  <div className="grid">
                    {results.map((result) => (
                      <button
                        key={`${result.kind}:${result.key}`}
                        type="button"
                        className="grid gap-1 px-4 py-3 text-left transition-colors hover:bg-accent/60"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelect(result)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium">{result.label}</p>
                          <ResultKindBadge kind={result.kind} />
                        </div>
                        {result.secondaryLabel ? (
                          <p className="text-xs text-muted-foreground">
                            {result.secondaryLabel}
                          </p>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
