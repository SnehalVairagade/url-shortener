process.env.NODE_ENV = "test";

import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../server";
import { prisma } from "../db/prisma";

vi.mock("../db/prisma", () => ({
    prisma: {
        url: {
            findUnique: vi.fn(),
            create: vi.fn()
        }
    }
}));

describe("GET /:shortCode", () => {

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("redirects when the short code exists", async () => {
        vi.mocked(prisma.url.findUnique).mockResolvedValue({
            id: 1,
            originalUrl: "https://www.google.com",
            shortCode: "gSnA09",
            clickCount: 0,
            createdAt: new Date()
        });

        const response = await request(app)
            .get("/gSnA09");

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("https://www.google.com");
    });

    it("returns 404 when the short code does not exist", async () => {
        vi.mocked(prisma.url.findUnique).mockResolvedValue(null);

        const response = await request(app)
            .get("/doesnotexist");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: "Short URL not found"
        });
    });

    it("returns 500 when an unexpected database error occurs", async () => {
        vi.mocked(prisma.url.findUnique).mockRejectedValue(
            new Error("Database failure")
        );

        const response = await request(app)
            .get("/abc123");

        expect(response.status).toBe(500);
    });

});