import { MapStateProvider } from "../state/MapStateProvider";
import LeftPanel from "./LeftPanel";
import MapCanvas from "./MapCanvas";

export default function HviMapPage() {
  return (
    <MapStateProvider>
      <div style={{ position: "relative", width: "100%", height: "100vh" }}>
        <MapCanvas />
        <LeftPanel />
      </div>
    </MapStateProvider>
  );
}
