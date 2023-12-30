import { Routes, routes } from "../src"
import { appSpecs } from "./app.specs"

export const AppRoutes = class extends routes(appSpecs) implements Routes<typeof appSpecs> {
  a = this.route()
    .invalid('json', (rawInput, issues,  c) => {
      return c.json({
        error: 'Bad Request...'
      }, 500)
    })
    .POST(async c => {
      return c.text('a')
    })
}
export const appRoutes = new AppRoutes()