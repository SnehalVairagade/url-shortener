import { createClient } from "redis";
import { config } from "../config/env";

export const redisClient = createClient({
    url: config.REDIS_URL
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Connect to redis
(async () => {
    try {
        await redisClient.connect();
        console.log("Connected to Redis successfully");
    } catch (err) {
        console.error("Could not connect to Redis", err);
    }
})();
