import { Routes, routes } from "../src"
import { appSpecs } from "./app.specs"

export const AppRoutes = class extends routes(appSpecs) implements Routes<typeof appSpecs> {
  greet = this.route()
    .invalid('json', (rawInput, issues,  c) => {
      return c.json({
        error: 'Bad Request...'
      }, 500)
    })
    .GET(c => {
      return c.json({
        text: c.req.param('name')
      })
    })
    .POST(async c => {
      const req = await c.req.json()
      return c.json({
        text: `Hello, ${c.req.param('name')}`,
        content: req.content
      })
    })
}
