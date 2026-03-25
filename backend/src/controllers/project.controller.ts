import { ProjectService } from "../services/project.service.js";
import type { Request, Response, NextFunction } from "express";
import {
  CreateProjectSchema,
  GetProjectSchema,
  UpdateProjectSchema,
} from "../utils/validation.js";

const projectService = new ProjectService();

export class ProjectController {
  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateProjectSchema.parse(req.body);
      const result = await projectService.createProject(data);

      res.status(201).json(result);
    } catch (error) {
      console.log("Error creating project:", error);

      next(error);
    }
  }
  static async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.getProjects();

      res.json(result);
    } catch (error) {
      console.log("Error getting projects:", error);

      next(error);
    }
  }
  static async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = GetProjectSchema.parse(req.params);
      const result = await projectService.getProject(data);

      res.json(result);
    } catch (error) {
      console.log("Error getting project:", error);

      next(error);
    }
  }
  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UpdateProjectSchema.parse(req.body);
      const result = await projectService.updateProject(
        req.params.id as string,
        data,
      );

      res.json(result);
    } catch (error) {
      console.log("Error updating project:", error);

      next(error);
    }
  }
  static async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.sync(req.body);

      res.json(result);
    } catch (error) {
      console.log("Error syncing data:", error);

      next(error);
    }
  }
}
