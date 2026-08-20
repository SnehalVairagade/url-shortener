import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../db/prisma";
import { createShortUrl } from "./url.service";
import { generateShortCode } from "./short-code.service";
import { Prisma } from "../generated/prisma/client";

vi.mock("../db/prisma", () => ({
    prisma: {
        url: {
            findUnique: vi.fn(),
            create: vi.fn()
        }
    }
}));

vi.mock("./short-code.service", () => ({
    generateShortCode: vi.fn()
}));

describe("createShortUrl", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("creates a new URL", async () => {
        vi.mocked(prisma.url.findUnique).mockResolvedValue(null);

        const createdUrl = {
            id: 1,
            originalUrl: "https://example.com",
            shortCode: "ABC123",
            clickCount: 0,
            createdAt: new Date()
        };

        vi.mocked(prisma.url.create).mockResolvedValue(createdUrl);
        vi.mocked(generateShortCode).mockReturnValue("ABC123");

        const result = await createShortUrl("https://example.com");

        expect(result).toEqual(createdUrl);

        expect(prisma.url.findUnique).toHaveBeenCalledWith({
            where: {
                originalUrl: "https://example.com"
            }
        });

        expect(prisma.url.create).toHaveBeenCalledWith({
            data: {
                originalUrl: "https://example.com",
                shortCode: "ABC123"
            }
        });
    });

    it("returns the existing URL when the original URL already exists", async () => {
        const existingUrl = {
            id: 1,
            originalUrl: "https://example.com",
            shortCode: "ABC123",
            clickCount: 5,
            createdAt: new Date()
        };

        vi.mocked(prisma.url.findUnique).mockResolvedValue(existingUrl);

        const result = await createShortUrl("https://example.com");

        expect(result).toEqual(existingUrl);
        expect(prisma.url.create).not.toHaveBeenCalled();
        expect(generateShortCode).not.toHaveBeenCalled();
    });

    it("retries when a short-code collision occurs", async () => {
        vi.mocked(prisma.url.findUnique).mockResolvedValue(null);

        const collisionError = new Prisma.PrismaClientKnownRequestError(
            "Unique constraint failed",
            {
                code: "P2002",
                clientVersion: "7.9.1"
            }
        );

        const createdUrl = {
            id: 2,
            originalUrl: "https://example.com",
            shortCode: "XYZ789",
            clickCount: 0,
            createdAt: new Date()
        };

        vi.mocked(prisma.url.create)
            .mockRejectedValueOnce(collisionError)
            .mockResolvedValueOnce(createdUrl);

        vi.mocked(generateShortCode)
            .mockReturnValueOnce("ABC123")
            .mockReturnValueOnce("XYZ789");

        const result = await createShortUrl("https://example.com");

        expect(result).toEqual(createdUrl);

        expect(prisma.url.create).toHaveBeenCalledTimes(2);
        expect(generateShortCode).toHaveBeenCalledTimes(2);
        expect(prisma.url.findUnique).toHaveBeenCalledTimes(2);
    });

    it("throws after the maximum number of collision retries", async () => {
        vi.mocked(prisma.url.findUnique).mockResolvedValue(null);

        const collisionError = new Prisma.PrismaClientKnownRequestError(
            "Unique constraint failed",
            {
                code: "P2002",
                clientVersion: "7.9.1"
            }
        );

        vi.mocked(prisma.url.create).mockRejectedValue(collisionError);

        vi.mocked(generateShortCode)
            .mockReturnValueOnce("ABC123")
            .mockReturnValueOnce("DEF456")
            .mockReturnValueOnce("GHI789")
            .mockReturnValueOnce("JKL012")
            .mockReturnValueOnce("MNO345");

        await expect(
            createShortUrl("https://example.com")
        ).rejects.toThrow(
            "Failed to create short URL after multiple attempts"
        );

        expect(prisma.url.create).toHaveBeenCalledTimes(5);
        expect(generateShortCode).toHaveBeenCalledTimes(5);
        expect(prisma.url.findUnique).toHaveBeenCalledTimes(6);
    });
    it("propagates unexpected database errors", async () => {
        vi.mocked(prisma.url.findUnique).mockResolvedValue(null);

        const databaseError = new Error("Database connection failed");

        vi.mocked(prisma.url.create).mockRejectedValue(databaseError);

        await expect(
            createShortUrl("https://example.com")
        ).rejects.toThrow("Database connection failed");

        expect(prisma.url.create).toHaveBeenCalledTimes(1);
        expect(generateShortCode).toHaveBeenCalledTimes(1);
    });
});