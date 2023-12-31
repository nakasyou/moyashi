import { Hono } from 'hono'
import { appMod } from './app.mod'
import { createHono } from '../src'
const app = new Hono()

const moyashiHono = createHono(appMod)
app.route('/', moyashiHono)

const res = await app.request('/', {
  method: 'POST',
  body: `{"x": 0}`
})

console.log(await res.text())
