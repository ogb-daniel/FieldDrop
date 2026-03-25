import { Router } from "express";
import { ProjectController } from "../controllers/project.controller.js";

const router = Router();

router.post("/", ProjectController.createProject);
router.get("/", ProjectController.getProjects);
router.post("/sync", ProjectController.sync);
router.get("/:id", ProjectController.getProject);
router.patch("/:id", ProjectController.updateProject);

export default router;
