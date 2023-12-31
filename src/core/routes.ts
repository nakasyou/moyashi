import { Context, Env, Hono, HonoRequest } from 'hono'
import { Specs, Method, Spec, InputTargets } from '.'
import * as v from 'valibot'
import { emptyHono } from '../emptyrouter'

export type Routes<SpecsType extends Specs> = {
  [K in keyof SpecsType]: RouteStack<SpecsType[K]['path'], SpecsType[K]>
}

export type JsonResponse <T> = Response & {
  json?: T
}
export type HandleFunc<Path extends string, MethodType extends Method, SpecType extends Spec> = (handler: Handler<Path, MethodType, SpecType>) => RouteStack<Path, SpecType>

export type InvalidHandler<T extends keyof InputTargets, Path extends string> = (
  rawInput: v.Input<InputTargets[T]['baseSchema']>,
  issues: v.Issue[],
  c: Context<Env, Path>
) => Promise<Response> | Response

export type RouteStack<Path extends string, SpecType extends Spec> = {
  [K in Method]: HandleFunc<Path, K, SpecType>
} & {
  invalid <T extends keyof InputTargets>(target: T, invalidHandler: InvalidHandler<T, Path>): RouteStack<Path, SpecType>
  routeData: RouteData
}

type Promiseable<T> = Promise<T> | T
export type ExtendedContext<Path extends string, MethodType extends Method, SpecType extends Spec> = Omit<Context<Env, Path>, 'json' | 'req'> & {
  json <T extends undefined extends Exclude<SpecType[MethodType], undefined>['o']['json'] ? never : v.Input<Exclude<Exclude<SpecType[MethodType], undefined>['o']['json'], undefined>>> (data: T): JsonResponse<T>
  req: Omit<HonoRequest<Path>, 'json'> & {
    json (): Promise<
    // @ts-expect-error わからん
      v.Input<Exclude<Exclude<SpecType[MethodType], undefined>['i']['json'], undefined>>
    >
  }
}
export type Handler<Path extends string, MethodType extends Method, SpecType extends Spec> = 
  (c: ExtendedContext<Path, MethodType, SpecType>) => 
    undefined extends Exclude<SpecType[MethodType], undefined>['o']['json'] ? Promise<Response> | Response : Promiseable<JsonResponse<v.Input<Exclude<Exclude<SpecType[MethodType], undefined>['o']['json'], undefined>>>>

export type RouteData = {
  [K in Method]?: Handler<string, Method, Spec>
} & {
  invalid: {
    [Target in keyof InputTargets]?: InvalidHandler<any, any>
  }
}
export const routes = <SpecsType extends Specs>(specs: SpecsType) => class RoutesBase {
  constructor () {

  }
  readonly specs?: SpecsType
  route <Key extends keyof SpecsType>(): RouteStack<SpecsType[Key]['path'], SpecsType[Key]> {
    const routeData: RouteData = {
      invalid: {}
    }

    const byMethod = (method: Method): HandleFunc<SpecsType[Key]['path'], any, any> => function (handler: Parameters<HandleFunc<SpecsType[Key]['path'], any, any>>[0]) {
      routeData[method] = handler
      // @ts-ignore
      return this as RouteStack
    }

    return {
      GET: byMethod('GET'),
      POST: byMethod('POST'),
      routeData,
      invalid (target, invalidHandler) {
        routeData.invalid[target] = invalidHandler
        return this
      },
    }
  }
  _createHono () {
    const methodsRecord: (Record<Method, keyof Hono>) = {
      GET: 'get',
      POST: 'post'
    }
    const hono = emptyHono()
    for (const [specId, spec] of Object.entries(specs)) {
      const routeData = (this as Routes<SpecsType>)[specId].routeData

      const valid = async (method: Method, c: Context): Promise<{
        ok: true

        json (): Promise<any>
        queries (): Record<string, string[]>
      } | {
        ok: false
        res: Response
      }> => {
        // JSON
        const validTarget = async (target: keyof InputTargets) => {
          const schema = spec[method]?.i[target]
          if (schema) {
            const data = await c.req[target]()
            const dataParsed = await v.safeParseAsync(schema, data)
            if (!dataParsed.success) {
              const invalidHandler = routeData.invalid[target]
              if (invalidHandler) {
                return await invalidHandler(data, dataParsed.issues, c)
              } else {
                return c.text('Bad request', 400)
              }
            }
          }
        }
        const jsonValided = await validTarget('json')
        if (jsonValided) {
          return {
            ok: false,
            res: jsonValided
          }
        }
        const queriesValided = await validTarget('queries')
        if (queriesValided) {
          return {
            ok: false,
            res: queriesValided
          }
        }
        return {
          ok: true,
          json: () => {
            return c.req.json()
          },
          queries: (...data) => {
            return c.req.queries(...data)
          }
        }
      }
      const handler = (method: Method) => {
        return async (c: Context) => {
          const valided = await valid(method, c)

          if (!valided.ok) {
            return valided.res
          }
          c.req.json = valided.json
          // @ts-ignore
          c.req.queries = valided.queries

          return await (routeData[method] as Exclude<typeof routeData[typeof method], undefined>)(c)
        }
      }
      if (routeData.GET) {
        hono.get(spec.path, handler('GET'))
      }
      if (routeData.POST) {
        hono.post(spec.path, handler('POST'))
      }
    }
    return hono
  }
}
export type RoutesBase = InstanceType<ReturnType<typeof routes>>
