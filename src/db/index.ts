import { env } from "@/env"
import {drizzle} from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"
export function createDB(url = env.DATABASE_URL){

  return drizzle<typeof schema>(url, {
    schema,
  })
}

export const db = createDB()
