import { Specs } from "../../src"
import * as v from 'valibot'

export const authSpecs = {
  login: {
    path: '/login',

    POST: {
      i: {
        json: v.object({
          uid: v.string(),
          password: v.string()
        })
      },
      o: {
        json: v.object({
          a: v.number()
        })
      }
    }
  }
} as const satisfies Specs
