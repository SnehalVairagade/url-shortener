import { z } from "zod";

export const createShortUrlSchema = z.object({
  url:
    z
      .string()
      .trim()
      .min(1, "URL is required")
      .url("Please enter a valid URL")
      .refine(
        (value) => {
          try {
            const parsed = new URL(value);
            return (
              parsed.protocol === "http:" ||
              parsed.protocol === "https:"
            );
          } catch {
            return false;
          }
        },
        {
          message: "Only HTTP and HTTPS URLs are allowed",
        }
      ),
  expiresAt: z.string().datetime().optional(),
});
