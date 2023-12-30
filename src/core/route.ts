import { Hono, Context as HonoContext, HonoRequest } from "hono"
import { emptyHono } from "../emptyrouter"
import { StreamingApi } from "hono/utils/stream"

type Methods = 'ALL' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | { custom: string }


export interface ValidatorTargets {
  json: any
  query: Record<string, string>
}

type Input<Targets extends Partial<ValidatorTargets> = {}> =
  'json' extends keyof Targets ? {
    json: Targets['json']
  } :
  (
    'query' extends keyof Targets ? {
      query: Targets['query']
    } : {}
  )

type Context<Path extends string, I extends Input> =  HonoContext<any, Path, {
  out: {
    json: 'json' extends keyof I ? Promise<I['json']> : undefined,
    query: 'query' extends keyof I ? Promise<I['query']> : undefined
  }
}>

type Handler<Path extends string, I extends Input> = (
  c: Context<Path, I>,
  next: () => Promise<Response>
) => Promise<Response> | Response

export interface RouteStack<Path extends string, I extends Input = Input<{}>> {
  in: I
  path: Path

  validate<JsonI extends any> (
    type: 'json',
    validator: (data: unknown) => JsonI
  ): RouteStack<Path, I & {
    json: JsonI,
  }>
  validate<QueryI extends ValidatorTargets['query']> (
    type: 'query',
    validator: (data: Record<string, string | undefined>) => QueryI
  ): RouteStack<Path, I & {
    query: QueryI
  }>

  handle (handler: Handler<Path, I>): RouteStack<Path, I>

  createHono (): Hono
}
export const route = <Path extends string>(path: Path, methods: Methods | Methods[]): RouteStack<Path> => {
  const handlers: Handler<Path, {}>[] = []
  const validators: {
    type: keyof ValidatorTargets
    validator (data: unknown): any
  }[] = []
  const nomalizeMethods = (Array.isArray(methods) ? methods : [methods]).map(method => {
    if (typeof method === "string") {
      return method
    }
    return method.custom
  })

  return {
    path,
    in: {} as any,
    
    handle (handler) {
      handlers.push(handler)
      return this
    },
    // @ts-ignore
    validate (type: keyof ValidatorTargets, validator: (data: unknown) => any) {
      validators.push({
        type,
        validator
      })
      return this as any
    },

    createHono() {
      const app = emptyHono()
      app.on(nomalizeMethods, this.path, async c => {
        const valid = async (type: keyof ValidatorTargets) => {
          for (const validator of validators) {
            let value: unknown = {}
            if (type !== validator.type) {
              continue
            }
            if (validator.type === "json") {
              value = c.req.json()
            } else if (validator.type === "query") {
              value = c.req.query()
            }
            validator.validator(value)
          }
          return c.req[type]()
        }

        // @ts-ignore
        c.req.valid = valid

        const createResult = async (i: number): Promise<Response> => {
          return await handlers[i](c, async () => {
            return await createResult(i + 1)
          })
        }
        return await createResult(0)
      })
      return app
    },
    getHandlers () {
      return handlers
    }
  }
}
export class Routes<RoutesType extends Record<string, RouteStack<string, any>>> {
  constructor () {

  }
  routes: RoutesType = {}
  _routes: RouteStack<string>[] = []
  route <Path extends string>(path: Path, methods: Methods | Methods[]): RouteStack<Path> {
    const newRoute = route(path, methods)
    this._routes.push(newRoute)
    return newRoute
  }
  createHono () {
    const app = emptyHono()
    for (const route of this._routes) {
      app.route('/', route.createHono())
    }
    return app
  }
}
