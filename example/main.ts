import { Hono } from 'hono'
import { appRoutes } from './app.routes'

const app = new Hono()

app.route('/', appRoutes._createHono())

const res = await app.request('/', {
  method: 'POST',
  body: `{"x": 0}`
})

console.log(await res.text())
