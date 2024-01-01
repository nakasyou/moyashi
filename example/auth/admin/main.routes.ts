import { Handler, Routes, routes } from "../../../src"
import { mainSpecs } from "./main.specs"

export const MainRoutes = class extends routes(mainSpecs) implements Routes<typeof mainSpecs> {
  login = this.route()
    .POST(async c => {
      const req = await c.req.json()
      return c.json({
        a: 0
      })
    })
}
