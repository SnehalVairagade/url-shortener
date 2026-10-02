process.env.NODE_ENV = "test";

import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../server";
import { prisma } from "../db/prisma";

vi.mock("../db/prisma", () => ({
    prisma: {
        url: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn()
        }
    }
}));

describe("GET /:shortCode", () => {

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("redirects when the short code exists", async () => {
        vi.mocked(prisma.url.update).mockResolvedValue({
            id: 1,
            originalUrl: "https://www.google.com",
            shortCode: "gSnA09",
            clickCount: 1,
            createdAt: new Date()
        });

        const response = await request(app)
            .get("/gSnA09");

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("https://www.google.com");
        expect(prisma.url.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { shortCode: "gSnA09" },
            data: { clickCount: { increment: 1 } }
        }));
    });

    it("returns 404 when the short code does not exist", async () => {
        const p2025Error = new Error("Record not found");
        (p2025Error as any).code = "P2025";
        vi.mocked(prisma.url.update).mockRejectedValue(p2025Error);

        const response = await request(app)
            .get("/doesnotexist");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: "Not Found",
            message: "Short URL not found"
        });
    });

    it("returns 500 when an unexpected database error occurs", async () => {
        vi.mocked(prisma.url.update).mockRejectedValue(
            new Error("Database failure")
        );

        const response = await request(app)
            .get("/abc123");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            error: "Internal Server Error",
            message: "An unexpected error occurred on the server."
        });
    });

});