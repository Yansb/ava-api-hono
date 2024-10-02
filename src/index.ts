import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import documents from './routes/documents'
import courses from './routes/courses'
import universities from './routes/universities'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
  }
}>()
app.use(logger())
app.use(cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.route('/documents', documents)
app.route('/courses', courses)
app.route('/universities', universities)

const port = Number(process.env.PORT) || 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
