import { Specs, queries, specs } from "../src"
import * as v from 'valibot'

export const appSpecs = specs({
  a: {
    path: '/',

    POST: {
      i: {
        json: v.object({
          x: v.number()
        })
      },
      o: {

      }
    }
  }
} as const)
