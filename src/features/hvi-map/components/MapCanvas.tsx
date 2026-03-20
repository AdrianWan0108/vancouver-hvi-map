import type { RefObject } from "react";

interface MapCanvasProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

export default function MapCanvas({ containerRef }: MapCanvasProps) {
  return <div ref={containerRef} className="h-full w-full" />;
}
