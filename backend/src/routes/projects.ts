import { Router } from "express";
import { ProjectController } from "../controllers/project.controller.js";

const router = Router();

router.post("/", ProjectController.createProject);
router.get("/", ProjectController.getProjects);
router.get("/:id", ProjectController.getProject);

export default router;
