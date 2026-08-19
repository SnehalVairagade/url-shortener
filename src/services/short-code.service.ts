import { randomInt } from "crypto";
export function generateShortCode():string {
    const alphabet: string="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result: string ="";

    for (let i = 0; i < 6; i++){
        const n=randomInt(0,62);
        result+=alphabet[n];
    }
    

    return result;
}