import { z } from "zod";

type EnvKey<T extends string, Schema extends z.ZodType<any, any>> = {
  env_name: T;
  schema: Schema;
  instructions: string;
};

function createEnvKey<T extends string, Schema extends z.ZodType<any>>(
  key: EnvKey<T, Schema>
): EnvKey<T, Schema> {
  return key;
}

// Add additional environment variables here using createEnvKey
// Running the CLI will regenerate the .env.example file with the new instructions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const envObjects = [
  createEnvKey({
    env_name: "DISCORD_TOKEN",
    schema: z.string(),
    instructions:
      "Grab a token from the Authorization header from a discord API call in a browser dev tools.",
  }),
  createEnvKey({
    env_name: "DISCORD_THREAD_CHANNEL_ID",
    schema: z.string(),
    instructions: "The ID of the channel to scrape the treads from.",
  }),
  createEnvKey({
    env_name: "TURSO_DB_URL",
    schema: z.string(),
    instructions: "The URL of the database to connect to.",
  }),
  createEnvKey({
    env_name: "TURSO_DB_TOKEN",
    schema: z.string(),
    instructions: "The auth token of the database to connect to.",
  }),
] as const;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type InferSchemaType<T> = T extends z.ZodType<infer U, any> ? U : never;

export type EnvVarNames = (typeof envObjects)[number]["env_name"];

export type EnvType = {
  [K in EnvVarNames]: InferSchemaType<
    Extract<(typeof envObjects)[number], { env_name: K }>["schema"]
  >;
};
