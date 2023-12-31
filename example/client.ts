import { createClient } from '../src'
import { appMod } from './app.mod'

const client = createClient<typeof appMod>()

client.auth.admin.$main.login('/auth/admin/login')