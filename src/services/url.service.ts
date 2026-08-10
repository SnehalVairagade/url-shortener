import { prisma } from "../db/prisma";

export async function createShortUrl(originalUrl: string) {
    const url = await prisma.url.create({
        data: {
            originalUrl,
            shortCode: "abc123"
        }
    });
    return url;
}