import { mod } from "../../../src"
import { MainRoutes } from "./main.routes"

export const adminMod = mod({
  basePath: '/admin',
  mods: {},
  routes: {
    main: new MainRoutes()
  }
} as const)
