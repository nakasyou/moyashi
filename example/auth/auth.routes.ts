import { Handler, Routes, routes } from "../../src"
import { authSpecs } from "./auth.specs"

export const AuthRoutes = class extends routes(authSpecs) implements Routes<typeof authSpecs> {
  login = this.route()
    .post(async c => {
      const req = await c.req.json()
      return c.json({
        a: 0
      })
    })
}
