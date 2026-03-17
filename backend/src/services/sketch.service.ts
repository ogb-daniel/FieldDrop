import type { Sketch } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { NearbySketch, SketchInput } from "../utils/validation.js";

export class SketchService {
  async createSketch({ name, area, geojson }: SketchInput) {
    const geojsonStr =
      typeof geojson === "string" ? geojson : JSON.stringify(geojson);
    const result = await prisma.$queryRaw`
    INSERT INTO "Sketch" (id, name, area, "createdAt", geom) VALUES (
        gen_random_uuid(),
        ${name},
        ${area},
        now(),
        ST_SetSRID(ST_GeomFromGeoJSON(${geojsonStr}), 4326)
    )
    RETURNING id, name, area, "createdAt";
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
}
