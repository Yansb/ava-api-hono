import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { prisma } from "../db"

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
  }
}>()

app.get('/:universityId', zValidator('param', z.object({
  universityId: z.string().uuid()
})), async (c) => {
  const universityId = c.req.valid('param').universityId;
  const courses = await prisma.course.findMany({
    where: {
      universidadeId: universityId
    }
  });
  return c.json(courses);
})
export default app;
