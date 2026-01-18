import { PrismaClient } from "@/app/generated/prisma/client";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Load env vars, prioritizing .env.local
config({ path: ".env" });
config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString, max: 2 })) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;