import { type Config } from "drizzle-kit";

export default {
  out: "./migrations",
  schema: "./schema",
  driver: "turso",
  breakpoints: true,
  dbCredentials: {
    url: process.env.TURSO_DB_URL ?? '',
    authToken: process.env.TURSO_DB_TOKEN ?? '',
  },
} satisfies Config;
