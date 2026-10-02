import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import app from "../../server";
import { prisma } from "../../db/prisma";

describe("URL Shortener Integration Tests", () => {

    beforeAll(async () => {
        // Ensure we are connected to the DB
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        // Clean the database before each test to ensure isolation
        // In a production-ready system, we might use a dedicated test database
        await prisma.url.deleteMany();
    });

    it("should create a short URL and then redirect to the original URL", async () => {
        const originalUrl = "https://www.anthropic.com";

        // 1. Create the short URL
        const createResponse = await request(app)
            .post("/shorten")
            .send({ url: originalUrl });

        expect(createResponse.status).toBe(200);
        const { shortCode } = createResponse.body;
        expect(shortCode).toBeDefined();
        expect(shortCode.length).toBe(6);

        // 2. Retrieve and redirect
        const redirectResponse = await request(app)
            .get(`/${shortCode}`);

        expect(redirectResponse.status).toBe(302);
        expect(redirectResponse.headers.location).toBe(originalUrl);
    });

    it("should increment click count on every access", async () => {
        const originalUrl = "https://www.google.com";

        // 1. Create the short URL
        const createResponse = await request(app)
            .post("/shorten")
            .send({ url: originalUrl });
        const { shortCode } = createResponse.body;

        // 2. Access it twice
        await request(app).get(`/${shortCode}`);
        await request(app).get(`/${shortCode}`);

        // 3. Verify the count in the database
        const urlRecord = await prisma.url.findUnique({
            where: { shortCode }
        });

        expect(urlRecord?.clickCount).toBe(2);
    });

    it("should return 404 for a non-existent short code", async () => {
        const response = await request(app).get("/nonexistent123");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: "Not Found",
            message: "Short URL not found"
        });
    });

    it("should reuse the same short code for the same original URL", async () => {
        const originalUrl = "https://www.wikipedia.org";

        // First creation
        const res1 = await request(app).post("/shorten").send({ url: originalUrl });
        const code1 = res1.body.shortCode;

        // Second creation
        const res2 = await request(app).post("/shorten").send({ url: originalUrl });
        const code2 = res2.body.shortCode;

        expect(code1).toBe(code2);
    });
});
