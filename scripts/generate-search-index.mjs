import { mkdir, open, writeFile } from "node:fs/promises";
import path from "node:path";
import { PMTiles, tileIdToZxy } from "pmtiles";
import Pbf from "pbf";
import { VectorTile } from "@mapbox/vector-tile";

class NodeFileSource {
  constructor(filePath) {
    this.filePath = filePath;
    this.handlePromise = open(filePath, "r");
  }

  getKey() {
    return this.filePath;
  }

  async getBytes(offset, length) {
    const handle = await this.handlePromise;
    const buffer = Buffer.alloc(length);
    const { bytesRead } = await handle.read(buffer, 0, length, offset);
    return {
      data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + bytesRead),
    };
  }

  async close() {
    const handle = await this.handlePromise;
    await handle.close();
  }
}

function roundNumber(value) {
  if (!Number.isFinite(value)) return value;
  if (Number.isInteger(value)) return value;
  return Number(value.toFixed(6));
}

function roundProperties(properties) {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [
      key,
      typeof value === "number" ? roundNumber(value) : value,
    ])
  );
}

function createEmptyBounds() {
  return [Infinity, Infinity, -Infinity, -Infinity];
}

function expandBounds(bounds, lng, lat) {
  bounds[0] = Math.min(bounds[0], lng);
  bounds[1] = Math.min(bounds[1], lat);
  bounds[2] = Math.max(bounds[2], lng);
  bounds[3] = Math.max(bounds[3], lat);
}

function visitCoordinates(coordinates, visit) {
  if (!Array.isArray(coordinates)) return;
  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    visit(coordinates[0], coordinates[1]);
    return;
  }

  for (const child of coordinates) {
    visitCoordinates(child, visit);
  }
}

function getFeatureBounds(geometry) {
  const bounds = createEmptyBounds();
  visitCoordinates(geometry?.coordinates, (lng, lat) => {
    expandBounds(bounds, lng, lat);
  });

  return bounds.every(Number.isFinite) ? bounds.map(roundNumber) : null;
}

function getFeatureCenter(bounds) {
  return [
    roundNumber((bounds[0] + bounds[2]) / 2),
    roundNumber((bounds[1] + bounds[3]) / 2),
  ];
}

function pointInRing(point, ring) {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const intersects =
      yi > point[1] !== yj > point[1] &&
      point[0] <
        ((xj - xi) * (point[1] - yi)) / ((yj - yi) || Number.EPSILON) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

function pointInPolygon(point, polygon) {
  if (!pointInRing(point, polygon[0])) return false;

  for (let i = 1; i < polygon.length; i += 1) {
    if (pointInRing(point, polygon[i])) return false;
  }

  return true;
}

function pointInGeometry(point, geometry) {
  if (!geometry) return false;

  if (geometry.type === "Polygon") {
    return pointInPolygon(point, geometry.coordinates);
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
  }

  return false;
}

async function collectTileEntries(archive, header, offset, length, entries = []) {
  const directory = await archive.cache.getDirectory(
    archive.source,
    offset,
    length,
    header
  );

  for (const entry of directory) {
    if (entry.runLength > 0) {
      entries.push(entry);
      continue;
    }

    await collectTileEntries(
      archive,
      header,
      header.leafDirectoryOffset + entry.offset,
      entry.length,
      entries
    );
  }

  return entries;
}

async function loadFeatureMap({ filePath, layerName, getFeatureKey, buildEntry }) {
  const source = new NodeFileSource(filePath);
  const archive = new PMTiles(source);

  try {
    const header = await archive.getHeader();
    const entries = await collectTileEntries(
      archive,
      header,
      header.rootDirectoryOffset,
      header.rootDirectoryLength
    );
    const featuresByKey = new Map();

    for (const entry of entries) {
      const [z, x, y] = tileIdToZxy(entry.tileId);
      const response = await archive.getZxy(z, x, y);
      if (!response?.data) continue;

      const vectorTile = new VectorTile(new Pbf(new Uint8Array(response.data)));
      const layer = vectorTile.layers[layerName];
      if (!layer) continue;

      for (let index = 0; index < layer.length; index += 1) {
        const feature = layer.feature(index).toGeoJSON(x, y, z);
        const key = getFeatureKey(feature.properties ?? {});
        if (!key) continue;

        const bounds = getFeatureBounds(feature.geometry);
        if (!bounds) continue;

        const existing = featuresByKey.get(key);
        if (existing && existing.zoom >= z) continue;

        featuresByKey.set(
          key,
          buildEntry({
            key,
            bounds,
            center: getFeatureCenter(bounds),
            properties: roundProperties(feature.properties ?? {}),
            geometry: feature.geometry,
            zoom: z,
          })
        );
      }
    }

    return featuresByKey;
  } finally {
    await source.close();
  }
}

async function generateSearchIndex() {
  const regionFeatureMap = await loadFeatureMap({
    filePath: path.resolve("public/tiles/hvi_regions.pmtiles"),
    layerName: "hvi_regions",
    getFeatureKey: (properties) => {
      const munNum = properties.MunNum;
      if (typeof munNum === "number") return String(munNum);

      const name = properties.FullName ?? properties.ShortName;
      return typeof name === "string" && name.trim() ? name.trim() : null;
    },
    buildEntry: ({ key, bounds, center, properties, geometry, zoom }) => ({
      kind: "region",
      key,
      label: String(properties.FullName ?? properties.ShortName ?? key),
      secondaryLabel:
        typeof properties.ShortName === "string" &&
        properties.ShortName !== properties.FullName
          ? properties.ShortName
          : null,
      bbox: bounds,
      center,
      properties,
      geometry,
      zoom,
    }),
  });

  const regionGeometries = Array.from(regionFeatureMap.values()).map((entry) => ({
    label: entry.label,
    geometry: entry.geometry,
    bbox: entry.bbox,
  }));

  const daFeatureMap = await loadFeatureMap({
    filePath: path.resolve("public/tiles/hvi_da.pmtiles"),
    layerName: "hvi_da",
    getFeatureKey: (properties) => {
      const dauid = properties.DAUID;
      return dauid === null || dauid === undefined ? null : String(dauid);
    },
    buildEntry: ({ key, bounds, center, properties, geometry, zoom }) => {
      const regionMatch = regionGeometries.find((region) => {
        const [minLng, minLat, maxLng, maxLat] = region.bbox;
        if (
          center[0] < minLng ||
          center[0] > maxLng ||
          center[1] < minLat ||
          center[1] > maxLat
        ) {
          return false;
        }

        return pointInGeometry(center, region.geometry);
      });

      return {
        kind: "da",
        key,
        label: `DA ${String(properties.DAUID ?? key)}`,
        secondaryLabel: regionMatch?.label ?? null,
        bbox: bounds,
        center,
        properties,
        regionName: regionMatch?.label ?? null,
        zoom,
      };
    },
  });

  const entries = [
    ...Array.from(regionFeatureMap.values())
      .map(({ geometry, zoom, ...entry }) => entry)
      .sort((a, b) => a.label.localeCompare(b.label)),
    ...Array.from(daFeatureMap.values())
      .map(({ zoom, ...entry }) => entry)
      .sort((a, b) => a.key.localeCompare(b.key)),
  ];

  const output = {
    version: 2,
    generatedAt: new Date().toISOString(),
    entries,
  };

  const outputDir = path.resolve("public/search");
  await mkdir(outputDir, { recursive: true });
  await writeFile(
    path.join(outputDir, "hvi-search-index.json"),
    JSON.stringify(output)
  );

  console.log(`Wrote ${entries.length} search entries to public/search/hvi-search-index.json`);
}

generateSearchIndex().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
