import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config/env";

const connectionString = config.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const parsedUrl = new URL(connectionString);



const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });