import dotenv from "dotenv"

dotenv.config();

const requiredEnvVars = ["PORT", "DATABASE_URL"];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
});

export const config = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
};