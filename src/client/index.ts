import { MergePath } from 'hono/types'
import { Mod, RouteStack, Routes, RoutesBase, Spec, Specs } from '..'


export type ClientByMod <MainMod extends Mod, NowPath extends string = MainMod['basePath']> = {
  [K in keyof MainMod['mods']]: ClientByMod<
    MainMod['mods'][K],
    MergePath<NowPath, MainMod['mods'][K]['basePath']>
  >
} & {
  [K in keyof MainMod['routes'] as `$${string & K}`]: ClientBySpecs<
    Exclude<MainMod['routes'][K]['specs'], undefined>,
    NowPath
  >
}

export type ClientBySpec<SpecType extends Spec, NowPath extends string> = (
  path: MergePath<NowPath, SpecType['path']>
) => string

export type ClientBySpecs<SpecsType extends Specs, NowPath extends string> = {
  [K in keyof SpecsType]: ClientBySpec<SpecsType[K], NowPath>
}
export const createClient = <MainMod extends Mod> (): ClientByMod<MainMod> => {
  
}
