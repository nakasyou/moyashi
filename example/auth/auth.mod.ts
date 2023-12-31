import { mod } from "../../src"
import { adminMod } from "./admin/main.mod"
import { AuthRoutes } from "./auth.routes"

export const authMod = mod({
  basePath: '/auth',
  mods: {
    admin: adminMod
  },
  routes: {
    main: new AuthRoutes()
  }
} as const)
