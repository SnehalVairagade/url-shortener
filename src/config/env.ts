import dotenv from "dotenv"

dotenv.config();

export const config = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
};