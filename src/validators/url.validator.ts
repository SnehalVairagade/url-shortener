import { z } from "zod";

export const createShortUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .url("Please enter a valid URL")
    .refine(
      (value) => {
        const parsed = new URL(value);
        return (
          parsed.protocol === "http:" ||
          parsed.protocol === "https:"
        );
      },
      {
        message: "Only HTTP and HTTPS URLs are allowed",
      }
    ),
});