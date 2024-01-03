import { TypedResponsesBySpec, Routes, routes } from "../src"
import { appSpecs } from "./app.specs"

export const AppRoutes = class extends routes(appSpecs) implements Routes<typeof appSpecs> {
  a = this.route()
    .invalid('json', (rawInput, issues,  c) => {
      return c.json({
        error: 'Bad Request...'
      }, 500)
    })
    .POST(async c => {
      const req = await c.req.json()
      console.log(c.req.param())
      return c.json({
        mes: "10"
      }, 202)
    })
}
