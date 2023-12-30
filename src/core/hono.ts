import { Mod } from '.'
import { emptyHono } from '../emptyrouter'

export const createHono = (mod: Mod) => {
  const app = emptyHono()

  for (const route of Object.values(mod.routes)) {
    app.route('/', route.createHono())
  }
  for (const childMod of Object.values(mod.mods) as Mod[]) {
    const childHono = createHono(childMod)
    app.route(childMod.base, childHono)
  }
  return app
}
