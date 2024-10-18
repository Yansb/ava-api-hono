import { createApp } from "./providers/hono/createApp";
import coursesRouter from "./routes/courses";
import universitiesRouter from "./routes/universities";
import documentsRouter from "./routes/documents";
const app = await createApp()

const routes = [
  coursesRouter,
  universitiesRouter,
  documentsRouter,
]
routes.forEach((route) => {
  app.route("/", route)
})

export default app
