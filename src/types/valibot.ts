import type { BaseSchema, BaseSchemaAsync, Input } from 'valibot'

/**
 * ValibotのSchemaが正しければその型、不正なら`never`
 */
export type SafeValibotInput<T> = T extends (BaseSchema<any, any> | BaseSchemaAsync<any, any>) ? Input<T> : any

export {}
