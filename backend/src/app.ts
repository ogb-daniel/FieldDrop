import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());

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
