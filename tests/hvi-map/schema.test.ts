import { open, type FileHandle } from "node:fs/promises";
import path from "node:path";
import { PMTiles } from "pmtiles";
import { describe, expect, it } from "vitest";
import { DA_METRICS } from "../../src/features/hvi-map/config/daMetrics";
import { REGION_HVI_METRIC } from "../../src/features/hvi-map/config/regionConfig";

class NodeFileSource {
  private readonly filePath: string;

  private readonly handlePromise: Promise<FileHandle>;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.handlePromise = open(filePath, "r");
  }

  getKey(): string {
    return this.filePath;
  }

  async getBytes(offset: number, length: number) {
    const handle = await this.handlePromise;
    const buffer = Buffer.alloc(length);
    const { bytesRead } = await handle.read(buffer, 0, length, offset);
    return {
      data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + bytesRead),
    };
  }
}

async function getTileFields(relativePath: string): Promise<string[]> {
  const filePath = path.resolve(relativePath);
  const archive = new PMTiles(new NodeFileSource(filePath));
  const metadata = (await archive.getMetadata()) as {
    vector_layers?: Array<{ fields?: Record<string, string> }>;
  };

  return Object.keys(metadata.vector_layers?.[0]?.fields ?? {});
}

describe("tile schema alignment", () => {
  it("keeps DA metric config aligned with the DA tiles", async () => {
    const fields = await getTileFields("public/tiles/hvi_da.pmtiles");

    for (const metric of DA_METRICS) {
      expect(fields).toContain(metric.propertyKey);
    }
  });

  it("keeps region HVI config aligned with the region tiles", async () => {
    const fields = await getTileFields("public/tiles/hvi_regions.pmtiles");

    expect(fields).toContain(REGION_HVI_METRIC.propertyKey);
  });
});
