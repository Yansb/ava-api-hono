import { Hono } from "hono";
import { AppBindings } from "./types";
import { createDB } from "@/db/index";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { seed } from "@/db/seed";

export function createRouter() {
  return new Hono<AppBindings>();
}

export async function createApp() {
  const app = new Hono<AppBindings>();
  const db = createDB()

  app.use(async (c, next) => {
    c.set('db', db)
    await next()
  })

  app.use(logger())
  app.use(cors())

  await seed(db)

  return app;
}
