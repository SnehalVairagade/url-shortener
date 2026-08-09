import { Request, Response } from "express";
import { createShortUrlSchema } from "../validators/url.validator";
//Use Express's definition of what a Request looks like

//Express creates the req and res objects for each incoming HTTP request and passes them to your controller when it invokes it.
export function createShortUrlController(req: Request, res: Response){
    const result=createShortUrlSchema.safeParse(req.body);
    if(result.success){
        return res.json({//send JSON to the client.
            message: "URL shortened successfully",
            shortCode: "abc123"
        });

    }
    else{
        console.log(result.error.issues);
        return res.status(400).json({
            message:" error 400..invalid input"
        });
    }
};