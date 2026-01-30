import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  APP_BASE_URL: z.string().url().optional(),
  API_KEY_PEPPER: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  CRON_SECRET: process.env.CRON_SECRET,
  APP_BASE_URL: process.env.APP_BASE_URL,
  API_KEY_PEPPER: process.env.API_KEY_PEPPER,
});

if (!parsed.success) {
  const missing = parsed.error.errors
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join(", ");
  throw new Error(`Environment validation failed: ${missing}`);
}

export const env = parsed.data;

