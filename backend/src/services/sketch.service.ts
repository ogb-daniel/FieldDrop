import type { Sketch } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { SketchInput } from "../utils/validation.js";

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
}
