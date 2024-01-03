import { createClient } from '../src/client'
import { appMod } from './app.mod'

const client = createClient<typeof appMod>('http://localhost:3030', {})

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

while (true) {
  const res = await client.$app.a.POST('/:aa', {
    params: {
      aa: 'aaaa'
    },
    json: {
      x: 0
    }
  })
  console.log(await res.json())
  confirm()
}


