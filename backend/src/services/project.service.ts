import { prisma } from "../lib/prisma.js";
import type {
  CreateProjectInput,
  GetProjectInput,
  SketchInput,
  UpdateProjectInput,
} from "../utils/validation.js";

export class ProjectService {
  async createProject({ name = "Undefined" }: CreateProjectInput) {
    const result = await prisma.project.create({
      data: {
        name,
      },
    });
    return result;
  }

  async getProjects() {
    const result = await prisma.project.findMany({
      include: {
        sketches: true,
      },
    });
    return result;
  }

  async getProject({ id }: GetProjectInput) {
    const result = await prisma.project.findUnique({
      where: { id },
    });
    return result;
  }

  async updateProject(id: string, data: UpdateProjectInput) {
    const result = await prisma.$transaction(async (tx) => {
      const updatedProject = await tx.project.upsert({
        where: { id },
        create: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.canvas_state ? { canvas_state: data.canvas_state } : {}),
          ...(data.thumbnail ? { thumbnail: data.thumbnail } : {}),
        },
        update: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.canvas_state ? { canvas_state: data.canvas_state } : {}),
          ...(data.thumbnail ? { thumbnail: data.thumbnail } : {}),
        },
      });
      if (data.polygons) {
        await tx.sketch.deleteMany({
          where: { projectId: id },
        });
        for (const polygon of data.polygons) {
          const { name, area, geojson } = polygon;
          const geojsonStr =
            typeof geojson === "string" ? geojson : JSON.stringify(geojson);

          await tx.$queryRaw`
            INSERT INTO "Sketch" (id, name, area, "createdAt", "projectId", geom)
            VALUES (
                gen_random_uuid(),
                ${name},
                ${area},
                now(),
                ${id},
                ST_SetSRID(ST_GeomFromGeoJSON(${geojsonStr}), 4326)
            )
          `;
        }
      }
      return updatedProject;
    });
    return result;
  }

  async sync(payload: { projectId: string; data: UpdateProjectInput }[]) {
    for (const item of payload) {
      await this.updateProject(item.projectId, item.data);
    }
    return { count: payload.length };
  }
}
