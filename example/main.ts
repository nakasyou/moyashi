import { Hono } from 'hono'
import { appMod } from './app.mod'
import { createHono } from '../src'
const app = new Hono()

const moyashiHono = createHono(appMod)
app.route('/', moyashiHono)

Bun.serve({
  fetch: app.fetch,
  port: 3030
})
