import { MapStateProvider } from "../state/MapStateProvider";
import LeftPanel from "./LeftPanel";
import MapCanvas from "./MapCanvas";

export default function HviMapPage() {
  return (
    <MapStateProvider>
      <div className="relative h-screen w-full">
        <MapCanvas />
        <LeftPanel />
      </div>
    </MapStateProvider>
  );
}
