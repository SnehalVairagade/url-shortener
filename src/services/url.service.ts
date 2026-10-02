import { prisma } from "../db/prisma";
import { generateShortCode } from "./short-code.service";
import { Prisma } from "../generated/prisma/client";
import { redisClient } from "../db/redis";

export async function createShortUrl(originalUrl: string, expiresAt?: string) {
    const existingUrl=await prisma.url.findUnique({
        where:{
            originalUrl
        }
    });
    if(existingUrl){
        return existingUrl;
    }
    let attempt =0;
    let url;
    while(attempt<5){

        try{
            url = await prisma.url.create({
                data: {
                    originalUrl,
                    shortCode: generateShortCode(),
                    expiresAt: expiresAt ? new Date(expiresAt) : null
                }
            });
            break;

        }
        catch (e){
            if(e instanceof Prisma.PrismaClientKnownRequestError){
                if(e.code === "P2002"){

                    const duplicateUrl = await prisma.url.findUnique({
                        where: {
                            originalUrl
                        }
                    });

                    if (duplicateUrl) {
                        return duplicateUrl;
                    }

                    attempt++;
                    continue;
                }
                throw e;//handles the errors that are not p2002
                //like some other database error

            }
            throw e;
        }
    }
    if(!url){
        throw new Error("Failed to create short URL after multiple attempts");
    }
    return url;
}

export async function getUrlByShortCode(shortCode: string) {
    // 1. Try to get from Cache (Redis)
    try {
        const cachedUrl = await redisClient.get(`url:${shortCode}`);
        if (cachedUrl) {
            // Cache hit: We still want to increment click count in DB
            // but we can return the cached URL immediately.
            // Fire-and-forget the DB update to optimize speed.
            prisma.url.update({
                where: { shortCode },
                data: { clickCount: { increment: 1 } }
            }).catch(e => console.error("Background click update failed", e));

            return {
                originalUrl: cachedUrl,
                shortCode: shortCode
            };
        }
    } catch (err) {
        console.error("Redis cache error", err);
        // Fallback to DB if Redis is down
    }

    // 2. Cache miss: Fetch from DB and increment
    const url = await prisma.url.update({
        where: {
            shortCode
        },
        data: {
            clickCount: {
                increment: 1
            }
        }
    });

    // 3. Save to Cache for next time (with TTL of 1 hour)
    try {
        await redisClient.set(`url:${shortCode}`, url.originalUrl, {
            EX: 3600
        });
    } catch (err) {
        console.error("Redis save error", err);
    }

    return url;
}

