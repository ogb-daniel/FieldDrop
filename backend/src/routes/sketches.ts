import { Router } from "express";
import { SketchController } from "../controllers/sketch.controller.js";

const router = Router();

router.post("/", SketchController.createSketch);
export default router;
