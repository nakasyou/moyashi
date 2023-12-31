import { Routes, routes } from "../src"
import { appSpecs } from "./app.specs"

export const AppRoutes = class extends routes(appSpecs) implements Routes<typeof appSpecs> {
  a = this.route()
    .invalid('json', (rawInput, issues,  c) => {
      console.log(rawInput)
      return c.json({
        error: 'Bad Request...'
      }, 500)
    })
    .POST(async c => {
      const req = await c.req.json()
      console.log(req)
      return c.json({
        message: `You said ${req.x}`
      })
    })
}
