import { useCallback, useRef, useState } from "react";
import { useMapController } from "../map/useMapController";
import { MapStateProvider } from "../state/MapStateProvider";
import type { SearchResult } from "../types/search";
import GetStartedOverlay from "./GetStartedOverlay";
import LeftPanel from "./LeftPanel";
import MapCanvas from "./MapCanvas";
import MapLegendOverlay from "./MapLegendOverlay";
import SearchOverlay from "./SearchOverlay";

function HviMapPageContent() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const { focusSearchResult } = useMapController(mapContainerRef);
  const [searchSelectionCount, setSearchSelectionCount] = useState(0);

  const handleSelectResult = useCallback(
    (entry: SearchResult) => {
      setSearchSelectionCount((current) => current + 1);
      focusSearchResult(entry);
    },
    [focusSearchResult]
  );

  return (
    <div className="flex h-screen w-full flex-col bg-background md:flex-row">
      <LeftPanel />
      <main className="relative min-h-[45vh] flex-1 md:min-h-0">
        <MapCanvas containerRef={mapContainerRef} />
        <SearchOverlay onSelectResult={handleSelectResult} />
        <GetStartedOverlay searchSelectionCount={searchSelectionCount} />
        <MapLegendOverlay />
      </main>
    </div>
  );
}

export default function HviMapPage() {
  return (
    <MapStateProvider>
      <HviMapPageContent />
    </MapStateProvider>
  );
}
