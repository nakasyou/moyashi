import type { RoutesBase } from './routes'

type Mods = {
  [modName: string]: Mod
}
type RoutesArg = {
  [routesName: string]: RoutesBase
}
export interface Mod {
  basePath: string
  mods: Mods
  routes: RoutesArg
}
export const mod = <T extends Mod>(mod: T): T => mod
