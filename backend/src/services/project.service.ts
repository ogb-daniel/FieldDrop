import { prisma } from "../lib/prisma.js";
import type {
  CreateProjectInput,
  GetProjectInput,
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

  async updateProject(
    id: string,
    data: { name?: string; canvasState?: any[]; polygons?: any[] },
  ) {
    const result = await prisma.project.update({
      where: {
        id,
      },
      data: data,
    });
    return result;
  }
}
