import { mod } from "../src"
import { authMod } from "./auth/auth.mod"

export const appMod = mod({
  basePath: '/',
  mods: {
    auth: authMod
  }
} as const)
