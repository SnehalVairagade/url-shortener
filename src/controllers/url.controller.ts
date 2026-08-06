import {Request, Response } from "express";
//Use Express's definition of what a Request looks like

//Express creates the req and res objects for each incoming HTTP request and passes them to your controller when it invokes it.
export function createShortUrlController(req: Request, res: Response){
    return res.json({//send JSON to the client.
        message: "URL shortened successfully",
        shortCode: "abc123"
    });
};