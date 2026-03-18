import PG from "pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from environment variables");
}

const pool = new PG.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
export const prisma = new PrismaClient({
  adapter,
});
