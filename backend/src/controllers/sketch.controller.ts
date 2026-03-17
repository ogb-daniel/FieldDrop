import { SketchService } from "../services/sketch.service.js";
import type { Request, Response, NextFunction } from "express";
import { NearbySketchSchema, SketchSchema } from "../utils/validation.js";
const sketchService = new SketchService();

export class SketchController {
  static async createSketch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = SketchSchema.parse(req.body);
      const result = await sketchService.createSketch(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async findNearBySketches(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = NearbySketchSchema.parse(req.query);
      const result = await sketchService.findNearbySketches(data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
