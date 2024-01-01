import type { Mod } from './mod'
import { emptyHono } from '../emptyrouter'

export const createHono = (mod: Mod) => {
  const app = emptyHono().basePath(mod.basePath)

  for (const subMod of Object.values(mod.mods)) {
    createHono(subMod)
  }

  for (const subRoute of Object.values(mod.routes)) {
    app.route('/', subRoute._createHono())
  }

  return app
}
