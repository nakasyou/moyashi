import { Specs, queries, specs } from "../../../src"
import * as v from 'valibot'

export const mainSpecs = specs({
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
} as const)
