import type { Sketch } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type {
  NearbySketch,
  OfflineSketchInput,
  SketchInput,
} from "../utils/validation.js";

export class SketchService {
  async createSketch({ name, area, geojson, projectId }: SketchInput) {
    const geojsonStr =
      typeof geojson === "string" ? geojson : JSON.stringify(geojson);
    const result = await prisma.$queryRaw`
    INSERT INTO "Sketch" (id, name, area, "createdAt",projectId, geom) VALUES (
        gen_random_uuid(),
        ${name},
        ${area},
        now(),
        ${projectId},
        ST_SetSRID(ST_GeomFromGeoJSON(${geojsonStr}), 4326)
    )
    RETURNING id, name, area, "createdAt", projectId;
    `;

    return result;
  }

  async findNearbySketches({ lat, lng, radius = 50 }: NearbySketch) {
    const longitude = parseFloat(lng as string);
    const latitude = parseFloat(lat as string);
    const rad = parseFloat(radius as unknown as string);

    const nearbySketches = await prisma.$queryRaw`
    SELECT id, name, area, "createdAt", ST_AsGeoJSON(geom)::json as geojson
    FROM "Sketch"
    WHERE ST_DWithin(
        geom::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}),4326)::geography,
        ${rad}
    );
    `;
    return nearbySketches;
  }

  async syncOfflineSketches({ sketches }: OfflineSketchInput) {
    const savedIds = [];

    for (const sketch of sketches) {
      const { name, area, geojson, projectId } = sketch;
      const geojsonStr =
        typeof geojson === "string" ? geojson : JSON.stringify(geojson);
      const result: any = await prisma.$queryRaw`
        INSERT INTO "Sketch" (id, name, area, "createdAt", projectId, geom)
        VALUES (
            gen_random_uuid(),
            ${name},
            ${area},
            now(),
            ${projectId}
            ST_SetSRID(ST_GeomFromGeoJSON(${geojsonStr}), 4326)
        )
        RETURNING id;
        `;
      savedIds.push(result[0].id);
      return { synced: savedIds.length, ids: savedIds };
    }
  }
}
