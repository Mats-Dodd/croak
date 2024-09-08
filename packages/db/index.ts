import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as tenant from "./schema";

export const schema = { ...tenant };

export * from "drizzle-orm";

export type DbClientType = ReturnType<typeof createDbClient>;

export function createDbClient(url: string, authToken?: string | undefined) {
  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}

export type DBClientType = ReturnType<typeof createDbClient>;
