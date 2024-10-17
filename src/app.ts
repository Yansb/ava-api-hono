import { createApp } from "./providers/hono/createApp";
import coursesRouter from "./routes/courses";
import universitiesRouter from "./routes/universities";
const app = await createApp()

const routes = [
  coursesRouter,
  universitiesRouter
]
routes.forEach((route) => {
  app.route("/", route)
})

export default app
