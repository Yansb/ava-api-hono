import coursesRouter from "./routes/courses.js";
import universitiesRouter from "./routes/universities.js";
import documentsRouter from "./routes/documents.js";
import { createApp } from "./providers/hono/createApp.js";
const app = await createApp()

const routes = [
  coursesRouter,
  universitiesRouter,
  documentsRouter,
]
app.get('/', async (c) => {
  return c.json({ health: true })
})
routes.forEach((route) => {
  app.route("/", route)
})

export default app
