import { mod } from "../src"
import { AppRoutes } from "./app.routes"
import { authMod } from "./auth/auth.mod"

export const appMod = mod({
  basePath: '/',
  mods: {
    auth: authMod
  },
  routes: {
    app: new AppRoutes()
  }
} as const)

