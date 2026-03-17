import PG from "pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
const pool = new PG.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
export const prisma = new PrismaClient({
  adapter,
});
