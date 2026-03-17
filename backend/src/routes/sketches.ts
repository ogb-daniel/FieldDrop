import { Router } from "express";
import { SketchController } from "../controllers/sketch.controller.js";

const router = Router();

router.post("/", SketchController.createSketch);
router.get("/nearby", SketchController.findNearBySketches);
export default router;
