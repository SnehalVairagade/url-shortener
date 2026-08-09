import { z } from "zod";

export const createShortUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .url("Please enter a valid URL")
    .refine(//if error thrown and not exit this also runs so new error will come
      (value) => {
        try{
          const parsed = new URL(value);//directly using the url library
          return (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
          );

        }
        catch{
          return false;

        }
      },
      {
        message: "Only HTTP and HTTPS URLs are allowed"
    }
    )
});