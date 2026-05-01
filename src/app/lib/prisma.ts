import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { envVars } from "../config/env";

let connectionString = envVars.DATABASE_URL;
// Ensure libpq compatibility and proper SSL mode to prevent connection closed issues
if (!connectionString.includes('sslmode')) {
  connectionString += connectionString.includes('?') ? '&' : '?';
  connectionString += 'uselibpqcompat=true&sslmode=require';
} else if (!connectionString.includes('uselibpqcompat=')) {
  // Add uselibpqcompat if sslmode exists but uselibpqcompat doesn't
  connectionString += '&uselibpqcompat=true';
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };