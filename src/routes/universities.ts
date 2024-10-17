import { universities } from "@/db/schema";
import { createRouter } from "@/providers/hono/createApp.js";

const app = createRouter()

app.get('/universities', async (c) => {
  const {db} = c.var
  const response = await db.select().from(universities);
  return c.json(response);
})

export default app;
