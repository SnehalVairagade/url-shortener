import { Request, Response } from "express";
import { createShortUrlSchema } from "../validators/url.validator";
import { createShortUrl } from "../services/url.service";
//Use Express's definition of what a Request looks like

//Express creates the req and res objects for each incoming HTTP request and passes them to your controller when it invokes it.
export async function createShortUrlController(req: Request, res: Response){
    const result=createShortUrlSchema.safeParse(req.body);
    if(result.success){
        const url = await createShortUrl(result.data.url);
        return res.json({//send JSON to the client.
            message: "URL shortened successfully",
            shortCode: url.shortCode
        });

    }
    else{
        console.log(result.error.issues);
        return res.status(400).json({
            message:" error 400..invalid input"
        });
    }
};