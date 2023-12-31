import { Specs, queries, specs } from "../src"
import * as v from 'valibot'

export const appSpecs = specs({
  a: {
    path: '/:aa',

    POST: {
      i: {
        json: v.object({
          x: v.number()
        })
      },
      o: {
        json: v.object({
          message: v.string()
        })
      }
    }
  }
} as const)
