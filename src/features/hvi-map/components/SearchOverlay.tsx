import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSearchResults, loadSearchIndex } from "../search";
import {
  BC_GEOCODER_MIN_QUERY_LENGTH,
  searchBcAddressGeocoder,
} from "../search/bcGeocoder";
import {
  derivePeripheralAreaMetadata,
  isPeripheralSearchEntry,
} from "../search/peripheralAreas";
import { useMapDispatch } from "../state/useMapDispatch";
import { useMapUiState } from "../state/useMapUiState";
import type { AddressSearchResult, SearchIndex, SearchResult } from "../types/search";

interface SearchOverlayProps {
  onSelectResult: (entry: SearchResult) => void;
}

function ResultKindBadge({ kind }: { kind: SearchResult["kind"] }) {
  if (kind === "address") {
    return <Badge variant="secondary">Place</Badge>;
  }

  return <Badge variant="secondary">{kind === "region" ? "Region" : "DA"}</Badge>;
}

function ResultButton({
  result,
  onSelect,
}: {
  result: SearchResult;
  onSelect: (entry: SearchResult) => void;
}) {
  return (
    <button
      type="button"
      className="grid gap-1 px-4 py-3 text-left transition-colors hover:bg-accent/60"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onSelect(result)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{result.label}</p>
        <ResultKindBadge kind={result.kind} />
      </div>
      {result.secondaryLabel ? (
        <p className="text-xs text-muted-foreground">{result.secondaryLabel}</p>
      ) : null}
    </button>
  );
}

export default function SearchOverlay({ onSelectResult }: SearchOverlayProps) {
  const dispatch = useMapDispatch();
  const uiState = useMapUiState();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null);
  const [indexLoadError, setIndexLoadError] = useState<string | null>(null);
  const [addressResults, setAddressResults] = useState<AddressSearchResult[]>([]);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isSearchingAddresses, setIsSearchingAddresses] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadSearchIndex()
      .then((index) => {
        if (cancelled) return;
        setSearchIndex(index);
        setIndexLoadError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setIndexLoadError(
          error instanceof Error ? error.message : "Unable to load search index."
        );
      });

    return () => {
      cancelled = true;
    };
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

  const localResults = useMemo(
    () => getSearchResults(searchIndex?.entries ?? [], query),
    [query, searchIndex]
  );
  const peripheralMetadata = useMemo(
    () => (searchIndex ? derivePeripheralAreaMetadata(searchIndex) : null),
    [searchIndex]
  );
  const shouldSearchAddresses = query.trim().length >= BC_GEOCODER_MIN_QUERY_LENGTH;
  const combinedResults = useMemo<SearchResult[]>(
    () => [...localResults, ...addressResults],
    [localResults, addressResults]
  );

  useEffect(() => {
    if (!shouldSearchAddresses) return undefined;

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setIsSearchingAddresses(true);

      searchBcAddressGeocoder(query, { signal: controller.signal })
        .then((remoteResults) => {
          if (cancelled) return;
          setAddressResults(remoteResults);
          setAddressError(null);
        })
        .catch((error: unknown) => {
          if (cancelled || controller.signal.aborted) return;
          setAddressResults([]);
          setAddressError(
            error instanceof Error
              ? error.message
              : "Place and address search is unavailable right now."
          );
        })
        .finally(() => {
          if (!cancelled) {
            setIsSearchingAddresses(false);
          }
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, shouldSearchAddresses]);

  const showResults =
    isOpen &&
    (combinedResults.length > 0 ||
      Boolean(indexLoadError) ||
      Boolean(addressError) ||
      isSearchingAddresses ||
      query.trim().length >= 2);

  const handleSelect = (entry: SearchResult) => {
    if (entry.kind === "address") {
      setQuery(entry.label);
      setIsOpen(false);
      onSelectResult(entry);
      return;
    }

    if (
      !uiState.showPeripheralAreas &&
      peripheralMetadata &&
      isPeripheralSearchEntry(entry, peripheralMetadata)
    ) {
      dispatch({ type: "peripheralVisibilityChanged", showPeripheralAreas: true });
    }

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
      <div ref={containerRef} className="pointer-events-auto w-full max-w-xl">
        <div className="rounded-2xl border border-border/80 bg-background/95 shadow-lg backdrop-blur">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                setIsOpen(true);
                setAddressResults([]);
                setAddressError(null);
                setIsSearchingAddresses(
                  nextQuery.trim().length >= BC_GEOCODER_MIN_QUERY_LENGTH
                );
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && combinedResults[0]) {
                  event.preventDefault();
                  handleSelect(combinedResults[0]);
                }

                if (event.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              placeholder={
                searchIndex
                  ? "Search by region, DAUID, place, or address"
                  : "Loading region and DA search..."
              }
              disabled={!searchIndex && !indexLoadError}
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
                  setAddressResults([]);
                  setAddressError(null);
                  setIsSearchingAddresses(false);
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
                {indexLoadError ? (
                  <p className="px-4 pt-3 text-sm text-muted-foreground">{indexLoadError}</p>
                ) : null}

                {localResults.length > 0 ? (
                  <div className="grid">
                    <p className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      Regions &amp; DAs
                    </p>
                    {localResults.map((result) => (
                      <ResultButton
                        key={`${result.kind}:${result.key}`}
                        result={result}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                ) : null}

                {shouldSearchAddresses ? (
                  <div className="grid">
                    <p className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      Places &amp; Addresses
                    </p>

                    {addressResults.map((result) => (
                      <ResultButton
                        key={`${result.kind}:${result.key}`}
                        result={result}
                        onSelect={handleSelect}
                      />
                    ))}

                    {isSearchingAddresses ? (
                      <p className="px-4 py-3 text-sm text-muted-foreground">
                        Searching places and addresses...
                      </p>
                    ) : null}

                    {!isSearchingAddresses && addressResults.length === 0 && addressError ? (
                      <p className="px-4 py-3 text-sm text-muted-foreground">{addressError}</p>
                    ) : null}
                  </div>
                ) : null}

                {!indexLoadError &&
                combinedResults.length === 0 &&
                !isSearchingAddresses &&
                !addressError ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">
                    {shouldSearchAddresses
                      ? "No matching regions, DAUIDs, places, or addresses."
                      : "No matching regions or DAUIDs. Keep typing for place/address search."}
                  </p>
                ) : null}
              </ScrollArea>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
