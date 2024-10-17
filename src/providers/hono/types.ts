import * as schema from "@/db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Hono } from "hono";
import { Pool } from "pg";
export interface AppBindings {
  Variables: {
    db: NodePgDatabase<typeof schema>
  };
};
