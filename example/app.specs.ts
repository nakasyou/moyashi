import { Specs } from "../src"
import * as v from 'valibot'

export const appSpecs = {
  a: {
    path: '/:aa',

    POST: {
      in: {
        json: v.object({
          x: v.number()
        })
      },
      200: {
        json: v.object({
          message: v.string()
        })
      },
      202: {
        json: v.object({
          mes: v.string()
        })
      }
    }
  }
} as const satisfies Specs
