import { Request, Response } from "express";
import { createShortUrlSchema } from "../validators/url.validator";
import { createShortUrl, getUrlByShortCode  } from "../services/url.service";
//Use Express's definition of what a Request looks like

//Express creates the req and res objects for each incoming HTTP request and passes them to your controller when it invokes it.
export async function createShortUrlController(req: Request, res: Response){
    const result=createShortUrlSchema.safeParse(req.body);
    if(result.success){
        const url = await createShortUrl(result.data.url, result.data.expiresAt);
        return res.json({//send JSON to the client.
            message: "URL shortened successfully",
            shortCode: url.shortCode
        });

    }
    else{
        console.log(result.error.issues);
        return res.status(400).json({
            error: "Bad Request",
            message: "Invalid input provided"
        });
    }
};
export async function getShortUrlController(req: Request, res: Response) {
    const shortCode = String(req.params.shortCode);

    try {
        const url = await getUrlByShortCode(shortCode);

        // Check if URL has expired
        if (url.expiresAt && new Date() > url.expiresAt) {
            return res.status(410).json({
                error: "Gone",
                message: "This short URL has expired"
            });
        }

        return res.redirect(302, url.originalUrl);
    } catch (error: any) {
        // Prisma P2025 means "An operation failed because it depends on one or more records that were not found"
        if (error.code === "P2025") {
            return res.status(404).json({
                error: "Not Found",
                message: "Short URL not found"
            });
        }

        // Propagate other unexpected errors to the central errorHandler middleware
        throw error;
    }
}