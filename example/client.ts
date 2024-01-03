import { createClient } from '../src/client'
import { appMod } from './app.mod'

const client = createClient<typeof appMod>('http://localhost:3030')

while (true) {
  const res = await client.$app.greet.post('/:name', {
    params: {
      name: 'aaaa'
    },
    json: {
      content: 'aaa'
    }
  })
  console.log(await res.json())
  confirm()
}


