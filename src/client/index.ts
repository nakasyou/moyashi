import { MergePath, ParamKeys, ParamKeyToRecord } from 'hono/types'
import { Mod, Spec, Specs, Method } from '../core'
import type { SafeValibotInput } from '../types'
import { Input } from 'valibot'

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

type NonUndefined<T> = Exclude<T, undefined>

export type ClientBySpec<SpecType extends Spec, NowPath extends string> = {
  [M in Method]: FinalFetch<SpecType, NowPath, M>
}
export type FetchOpts<SpecType extends Spec, NowPath extends string, MethodType extends Method> = {

} & (ParamKeys<SpecType['path']> extends never ? {} : {
  params: ParamKeyToRecord<ParamKeys<SpecType['path']>>
}) & ('json' extends keyof NonUndefined<SpecType[MethodType]>['i'] ? {
  json: SafeValibotInput<NonUndefined<NonUndefined<SpecType[MethodType]>['i']['json']>>
} : {}) & ('queries' extends keyof NonUndefined<SpecType[MethodType]>['i'] ? {
  queries: Input<NonUndefined<NonUndefined<SpecType[MethodType]>['i']['queries']>>
} : {})
export type FinalFetch<SpecType extends Spec, NowPath extends string, MethodType extends Method> = (
  path: MergePath<NowPath, SpecType['path']>,
  opts: FetchOpts<SpecType, NowPath, MethodType>
) => Promise<MoyashiClientResponse<SpecType, NowPath, MethodType>>

export type ClientBySpecs<SpecsType extends Specs, NowPath extends string> = {
  [K in keyof SpecsType]: ClientBySpec<SpecsType[K], NowPath>
}
type MoyashiClientResponse<SpecType extends Spec, NowPath extends string, MethodType extends Method> = Omit<Response, 'json'> & {
  json (): Promise<
    SafeValibotInput<NonUndefined<SpecType[MethodType]>['o']['json']>
  >
}
const createClientBySpec = (base: string | URL) => {
  /**
   * なんやかんやでこいつが本体である
   * @returns
   */
  const fetchFunc = (method: Method): FinalFetch<Spec, string, Method> => async (path, opts) => {
    const targetUrl = new URL(path, base)

    const body: BodyInit | undefined = (() => {
      if (method === 'GET') {
        return undefined
      }
      if (opts.json) {
        return JSON.stringify(opts.json)
      }
    })()
    const res = await fetch(targetUrl, {
      method,
      body
    })
    return res as MoyashiClientResponse<any, any, any>
  }
  return new Proxy({}, {
    get: (): ClientBySpec<Spec, string> => {
      return {
        GET: fetchFunc('GET'),
        POST: fetchFunc('POST')
      }
    }
  })
}
const createClientByMod = (base: string | URL): any => {
  return new Proxy({}, {
    get: (target, prop, receiver) => {
      if (typeof prop !== 'string') {
        return
      }
      if (prop[0] === '$') {
        // is bySpec (like Route), 最初に`$`がつくから
        return createClientBySpec(base)
      }
      // is mod
      return createClientByMod(base)
    }
  })
}
/**
 * Create Moyashi Client
 * @param base Base Path (e.g. http://localhost:3000)
 */
export const createClient = <MainMod extends Mod> (
  base: string | URL
): ClientByMod<MainMod> => {
  return createClientByMod(base) as ClientByMod<MainMod>
}
