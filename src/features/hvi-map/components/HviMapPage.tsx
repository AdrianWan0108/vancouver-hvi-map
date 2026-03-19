import { MapStateProvider } from "../state/MapStateProvider";
import LeftPanel from "./LeftPanel";
import MapCanvas from "./MapCanvas";

export default function HviMapPage() {
  return (
    <MapStateProvider>
      <div className="flex h-screen w-full flex-col bg-background md:flex-row">
        <LeftPanel />
        <main className="min-h-[45vh] flex-1 md:min-h-0">
          <MapCanvas />
        </main>
      </div>
    </MapStateProvider>
  );
}
