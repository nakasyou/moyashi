import { Specs } from "../src"
import * as v from 'valibot'

export const appSpecs = {
  greet: {
    path: '/:name',

    GET: {
      in: {},
      200: {
        json: v.object({
          text: v.string()
        })
      }
    },
    POST: {
      in: {
        json: v.object({
          content: v.string()
        })
      },
      200: {
        json: v.object({
          text: v.string()
        })
      },
    }
  }
} as const satisfies Specs
