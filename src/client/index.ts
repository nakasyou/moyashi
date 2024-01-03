import { MergePath, ParamKeys, ParamKeyToRecord } from 'hono/types'
import { Mod, Spec, Specs, TypedResponsesBySpec } from '../core'
import type { SafeValibotInput } from '../types'
import { Input } from 'valibot'
import type { Method, NonUndefined } from '../types'
import { methods } from '../types'

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
/**
 * Custom Fetch Function
 */
export type Fetch = (request: Request) => Promise<Response>

export type ClientBySpec<SpecType extends Spec, NowPath extends string> = {
  [M in Method]: FinalFetch<SpecType, NowPath, M>
}
export type FetchOpts<SpecType extends Spec, NowPath extends string, MethodType extends Method> = {

} & (ParamKeys<SpecType['path']> extends never ? {} : {
  params: ParamKeyToRecord<ParamKeys<SpecType['path']>>
}) & ('json' extends keyof NonUndefined<SpecType[MethodType]>['in'] ? {
  json: SafeValibotInput<NonUndefined<NonUndefined<SpecType[MethodType]>['in']['json']>>
} : {}) & ('queries' extends keyof NonUndefined<SpecType[MethodType]>['in'] ? {
  queries: Input<NonUndefined<NonUndefined<SpecType[MethodType]>['in']['queries']>>
} : {})
export type FinalFetch<SpecType extends Spec, NowPath extends string, MethodType extends Method> = (
  path: MergePath<NowPath, SpecType['path']>,
  opts: FetchOpts<SpecType, NowPath, MethodType>
) => Promise<MoyashiClientResponse<SpecType, NowPath, MethodType>>

export type ClientBySpecs<SpecsType extends Specs, NowPath extends string> = {
  [K in keyof SpecsType]: ClientBySpec<SpecsType[K], NowPath>
}
type MoyashiClientResponse<SpecType extends Spec, NowPath extends string, MethodType extends Method> = 
  TypedResponsesBySpec<NonUndefined<SpecType[MethodType]>>
  /*
  Omit<Response, 'json'> & {
    json (): Promise<
      SafeValibotInput<NonUndefined<SpecType[MethodType]>['o']['json']>
    >
  }*/
interface MoyashiClientInternalConfig {
  base: string | URL
  fetch: Fetch
}

export const calcPathByParam = (path: string, params: Record<string, string>) => {
  for (const [paramName, value] of Object.entries(params)) {
    path = path.replace(new RegExp(`/:${paramName}({[^}]*})?`, 'g'), '/' + value)
  }
  return path
}

const createClientBySpec = (config: MoyashiClientInternalConfig) => {
  /**
   * なんやかんやでこいつが本体である
   * @returns
   */
  const fetchFunc = (method: Method): FinalFetch<Spec, string, Method> => async (path, opts) => {
    if ('params' in opts) {
      path = calcPathByParam(path, opts.params as Record<string, string>) as `${string}/${string}`
    }
    const targetUrl = new URL(path, config.base)

    const body: BodyInit | undefined = (() => {
      if (method === 'GET') {
        return undefined
      }
      if (opts.json) {
        return JSON.stringify(opts.json)
      }
    })()
    
    const res = await config.fetch(new Request(targetUrl.href, {
      method,
      body
    }))
    return res as MoyashiClientResponse<any, any, any>
  }

  const fetchFuncs: Partial<Record<Method, FinalFetch<Spec, string, Method>>> = {}
  for (const method of methods) {
    fetchFuncs[method] = fetchFunc(method)
  }
  return new Proxy({}, {
    get: (): ClientBySpec<Spec, string> => {
      return fetchFuncs as Record<Method, FinalFetch<Spec, string, Method>>
    }
  })
}
const createClientByMod = (config: MoyashiClientInternalConfig): any => {
  return new Proxy({}, {
    get: (target, prop, receiver) => {
      if (typeof prop !== 'string') {
        return
      }
      if (prop[0] === '$') {
        // is bySpec (like Route), 最初に`$`がつくから
        return createClientBySpec(config)
      }
      // is mod
      return createClientByMod(config)
    }
  })
}

/**
 * Moyashi Client's options
 */
export interface MoyashiClientOpts {
  /**
   * Custom Fetch function
   * @param request Request Object
   */
  fetch?: Fetch
}

/**
 * Create Moyashi Client
 * @param base Base Path (e.g. http://localhost:3000)
 */
export const createClient = <MainMod extends Mod> (
  base: string | URL,
  opts?: MoyashiClientOpts
): ClientByMod<MainMod> => {
  if (!opts) {
    opts = {}
  }
  const config = {
    base,
    fetch: opts.fetch ?? globalThis.fetch
  } satisfies MoyashiClientInternalConfig
  return createClientByMod(config) as ClientByMod<MainMod>
}
