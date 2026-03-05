import { useRef } from "react";
import { useMapController } from "../map/useMapController";

export default function MapCanvas() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  useMapController(mapContainerRef);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />;
}
