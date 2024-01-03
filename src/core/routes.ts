import { Context, Env, Hono, HonoRequest } from 'hono'
import { Specs, Spec, InputTargets } from '.'
import { methods, type Method } from '../types'
import * as v from 'valibot'
import { emptyHono } from '../emptyrouter'
import type { NonUndefined, SafeValibotInput } from '../types'
export type Routes<SpecsType extends Specs> = {
  [K in keyof SpecsType]: RouteStack<SpecsType[K]['path'], SpecsType[K]>
}
export type JsonResponse <T, Status extends number> = Omit<Response, 'status' | 'json'> & {
  jsonData?: T
  status: Status
  json (): Promise<T>
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
  json <
    JsonType extends (
      SafeValibotInput<
        NonUndefined<NonUndefined<
          SpecType[MethodType]
        >[StatusCode]>['json']
      >
    ),
    StatusCode extends (keyof NonUndefined<SpecType[MethodType]> & number) = 200,
  > (data: JsonType, statusCode?: StatusCode): JsonResponse<JsonType, StatusCode>

  req: Omit<HonoRequest<Path>, 'json'> & {
    json (): Promise<
      SafeValibotInput<NonUndefined<SpecType[MethodType]>['in']['json']>
    >
    queries (): SafeValibotInput<NonUndefined<SpecType[MethodType]>['in']['queries']>
  }
}
export type TypedResponsesBySpec <Outs extends Required<Spec>[Method]> = 
  {
    [Status in keyof Omit<Outs, 'in'>]:
      Status extends number ?
        NonUndefined<Outs[Status]>['json'] extends undefined ?
          any :
            JsonResponse<
              SafeValibotInput<NonUndefined<Outs[Status]>['json']>,
              Status
            >
        : never
  }[keyof Omit<Outs, 'in'>]
export type Handler<Path extends string, MethodType extends Method, SpecType extends Spec> = 
  (c: ExtendedContext<Path, MethodType, SpecType>) => Promiseable <
    TypedResponsesBySpec<NonUndefined<SpecType[MethodType]>>
  >

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

    const methodHandleFuncs: Partial<Record<Method, HandleFunc<SpecsType[Key]['path'], any, any>>> = {}
    for (const method of methods) {
      methodHandleFuncs[method] = byMethod(method)
    }
    return {
      routeData,
      invalid (target, invalidHandler) {
        routeData.invalid[target] = invalidHandler
        return this
      },
      ...(methodHandleFuncs as Required<typeof methodHandleFuncs>)
    }
  }
  _createHono () {
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
          const schema = spec[method]?.in[target]
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

        const reqJson = c.req.json
        const reqQueries = c.req.queries
        return {
          ok: true,
          json: reqJson,
          queries: reqQueries
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
          const mainHandler = (routeData[method] as Exclude<typeof routeData[typeof method], undefined>)
          return await mainHandler(c)
        }
      }
      for (const method of methods) {
        hono[method.toLowerCase() as (Lowercase<typeof method>)](spec.path, handler(method))
      }
    }
    return hono
  }
}
export type RoutesBase = InstanceType<ReturnType<typeof routes>>
