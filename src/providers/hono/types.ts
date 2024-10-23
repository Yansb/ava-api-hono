import * as schema from "../../db/schema.js";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
export interface AppBindings {
  Variables: {
    db: NodePgDatabase<typeof schema>
  };
};
