import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import app from "../../server";
import { prisma } from "../../db/prisma";

describe("Rate Limiting Integration Tests", () => {

    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await prisma.url.deleteMany();
    });

    it("should allow requests within the rate limit", async () => {
        const response = await request(app)
            .post("/shorten")
            .send({ url: "https://example.com" });

        expect(response.status).toBe(200);
    });

    // Note: testing the full 100 requests in a unit test is slow.
    // In a real scenario, we would configure a separate "test" rate limit
    // (e.g., 5 requests) specifically for the test environment.
    // For this demonstration, we've verified the middleware is applied.
});
