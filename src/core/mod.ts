type Mods = {
  [aaaa: string]: Mod
}

export interface Mod {
  basePath: string
  mods: Mods
}
export const mod = <T extends Mod>(mod: T): T => mod
