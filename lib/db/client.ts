import { neon } from "@neondatabase/serverless";
import { env } from "@/lib/env";

// Single shared SQL client (Neon serverless uses HTTP — no connection pool needed)
export const sql = neon(env.DATABASE_URL);
