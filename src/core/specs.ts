import * as v from 'valibot'

export type Method = 'GET' | 'POST'
export const methods: Method[] = ['GET', 'POST']

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
export interface SpecMethod<
  MethodType extends Method,
  InType extends In<MethodType> = In<MethodType>,
  OutType extends Out<MethodType> = Out<MethodType>
> {
  i: InType
  o: OutType
}
export type Spec<Path extends string = string> = {
  [K in Method]?: SpecMethod<K>
} & {
  path: Path
}
export interface Specs {
  [id: string]: Spec
}

export const specs = <T extends Specs>(specs: T): T => specs
