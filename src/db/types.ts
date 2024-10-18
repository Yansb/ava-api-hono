import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema"
export type DBType = NodePgDatabase<typeof schema>
