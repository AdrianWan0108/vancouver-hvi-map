import { useRef } from "react";
import { useMapController } from "../map/useMapController";
import { MapStateProvider } from "../state/MapStateProvider";
import LeftPanel from "./LeftPanel";
import MapCanvas from "./MapCanvas";
import SearchOverlay from "./SearchOverlay";

function HviMapPageContent() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const { focusSearchResult } = useMapController(mapContainerRef);

  return (
    <div className="flex h-screen w-full flex-col bg-background md:flex-row">
      <LeftPanel />
      <main className="relative min-h-[45vh] flex-1 md:min-h-0">
        <MapCanvas containerRef={mapContainerRef} />
        <SearchOverlay onSelectResult={focusSearchResult} />
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
