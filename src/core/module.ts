import type { Routes } from '.'

export interface Mod<
  BasePath extends string = '/',
  ModsType extends Record<string, Mod> = {},
  RoutesType extends Record<string, Routes> = Record<string, Routes>,
> {
  mods: ModsType
  routes: RoutesType
  base: BasePath
}
