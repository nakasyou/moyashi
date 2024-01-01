import type { Router, Result } from '../../node_modules/hono/dist/types/router'
import { Hono } from 'hono'

/**
 * EmptyRouter
 */
export class EmptyRouter<T> implements Router<T> {
  name = 'empty-router'

  add () {}
  match () {
    return [] as unknown as Result<T>
  }
}
export const emptyHono = () => new Hono({
  router: new EmptyRouter()
})
