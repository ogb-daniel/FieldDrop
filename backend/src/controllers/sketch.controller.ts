import { SketchService } from "../services/sketch.service.js";
import type { Request, Response, NextFunction } from "express";
import { SketchSchema } from "../utils/validation.js";
const sketchService = new SketchService();

export class SketchController {
  static createSketch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = SketchSchema.parse(req.body);
      const result = sketchService.createSketch(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}
