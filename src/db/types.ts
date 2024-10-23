import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js"
export type DBType = NodePgDatabase<typeof schema>
