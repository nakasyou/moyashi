import { createClient } from '../src'
import { appMod } from './app.mod'

const client = createClient<typeof appMod>('http://localhost:3030')

const res = await client.$app.a.POST('/:aa', {
  params: {
    aa: 'a'
  },
  json: {
    x: 0
  }
})

const data = await res.json()

