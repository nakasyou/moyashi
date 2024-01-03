import { mod } from '../../src'
import { AuthRoutes } from './auth.routes'

export const authMod = mod({
  basePath: '/auth',
  mods: {},
  routes: {
    main: new AuthRoutes()
  }
} as const)
