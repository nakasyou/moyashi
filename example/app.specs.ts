import { Specs } from "../src"
import * as v from 'valibot'

export const appSpecs = {
  greet: {
    path: '/:name',

    get: {
      in: {},
      200: {
        json: v.object({
          text: v.string()
        })
      }
    },
    post: {
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
