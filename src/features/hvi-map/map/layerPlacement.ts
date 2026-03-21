interface StyleLayerLike {
  id: string;
  type?: string;
  layout?: Record<string, unknown>;
  "source-layer"?: string;
}

function isTextSymbolLayer(layer: StyleLayerLike): boolean {
  if (layer.type !== "symbol") return false;
  return Object.prototype.hasOwnProperty.call(layer.layout ?? {}, "text-field");
}

function isPlaceLabelLayer(layer: StyleLayerLike): boolean {
  const id = layer.id.toLowerCase();
  const sourceLayer = layer["source-layer"]?.toLowerCase() ?? "";

  return (
    id.includes("place") ||
    id.includes("settlement") ||
    id.includes("state-label") ||
    sourceLayer.includes("place") ||
    sourceLayer.includes("settlement")
  );
}

export function getFirstPlaceLabelLayerId(
  layers: readonly StyleLayerLike[] | undefined
): string | undefined {
  return layers?.find((layer) => {
    if (!isTextSymbolLayer(layer)) return false;
    return isPlaceLabelLayer(layer);
  })?.id;
}
