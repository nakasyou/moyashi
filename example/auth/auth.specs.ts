import { Specs } from "../../src"
import * as v from 'valibot'

export const authSpecs = {
  login: {
    path: '/login',

    POST: {
      in: {
        json: v.object({
          uid: v.string(),
          password: v.string()
        })
      },
      200: {
        json: v.object({
          a: v.number()
        })
      }
    }
  }
} as const satisfies Specs
