import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: MySql2Database<typeof fullSchema>;

export function getDb() {
  if (!instance) {
    const isTiDB = env.databaseUrl.includes("tidb");
    const pool = mysql.createPool({
      uri: env.databaseUrl,
      ssl: isTiDB ? {
        rejectUnauthorized: true,
      } : undefined,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });

    instance = drizzle(pool, {
      schema: fullSchema,
      mode: isTiDB ? "default" : "planetscale",
    });
  }
  return instance;
}
