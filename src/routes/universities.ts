import { Hono } from "hono"
import { prisma } from "../db"

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
  }
}>()

app.get('/', async (c) => {
  const universities = await prisma.university.findMany();
  return c.json(universities);
})

export default app;
