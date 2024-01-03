import * as v from 'valibot'
import type { Method } from '../types'

export const queries = <T extends Record<string, v.ArraySchema<v.StringSchema<string>, string[]>>>(keys: T) => v.object(keys)

type QueriesSchema = v.ObjectSchema<Record<string, v.ArraySchema<v.StringSchema<string>, string[]>>, undefined, {
  [x: string]: string[];
}>

export interface InputTargets {
  json: {
    baseSchema: v.ObjectSchema<any, any, any>
  }
  queries: {
    baseSchema: QueriesSchema
  }
}

interface In<
  MethodType extends Method,
  Json extends v.ObjectSchema<any, any, any> = v.ObjectSchema<any, any, any>,
  Queries extends QueriesSchema = QueriesSchema
> {
  json?: 'GET' extends MethodType ? undefined : Json,
  queries?: Queries
}
interface Out<
  MethodType extends Method,
  Json extends v.ObjectSchema<any, any, any> = v.ObjectSchema<any, any, any>
> {
  json?: Json
}

export type MethodSpec <
  MethodType extends Method,
  InType extends In<MethodType> = In<MethodType>
> = {
  [statusCode: number]: Out<MethodType> | undefined
} & {
  in: InType
}
export type Spec<Path extends string = string> = {
  [K in Method]?: MethodSpec<K>
} & {
  path: Path
}
export interface Specs {
  [id: string]: Spec
}
