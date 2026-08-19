import { prisma } from "../db/prisma";
import { generateShortCode } from "./short-code.service";
import { Prisma } from "../generated/prisma/client";


export async function createShortUrl(originalUrl: string) {
    const existingUrl=await prisma.url.findUnique({
        where:{
            originalUrl
        }
    });
    if(existingUrl){
        return existingUrl;
    }
    let attempt =0;
    let url;
    while(attempt<5){

        try{
            url = await prisma.url.create({
                data: {
                    originalUrl,
                    shortCode: generateShortCode()
                }
            });
            break;

        }
        catch (e){
            if(e instanceof Prisma.PrismaClientKnownRequestError){
                if(e.code === "P2002"){

                    const duplicateUrl = await prisma.url.findUnique({
                        where: {
                            originalUrl
                        }
                    });
    
                    if (duplicateUrl) {
                        return duplicateUrl;
                    }
    
                    attempt++;
                    continue;
                }
                throw e;//handles the errors that are not p2002 
                //like some other database error
                
            }
            throw e;
        }
    }
    if(!url){
        throw new Error("Failed to create short URL after multiple attempts");   
    }
    return url;
}