import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { createRouter } from "../providers/hono/createApp.js"
import { eq } from "drizzle-orm"
import { courses } from "../db/schema.js"

const app = createRouter()

app.get('courses/:universityId', zValidator('param', z.object({
  universityId: z.coerce.string().uuid()
})), async (c) => {
  const {db} = c.var
  const universityId = c.req.valid('param').universityId;

  const foundCourses = await db.query.courses.findMany({
    where: eq(courses.universidadeId, universityId),
  });

  return c.json(foundCourses);
})
export default app;
