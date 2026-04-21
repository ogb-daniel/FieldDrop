import "dotenv/config";

import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import sketchRoutes from "./routes/sketches.js";
import projectRoutes from "./routes/projects.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use("/sketches", sketchRoutes);
app.use("/projects", projectRoutes);
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (status === 500) console.error(err);
  res.status(status).json({ status: "error", message: err.errors || message });
});

export default app;
