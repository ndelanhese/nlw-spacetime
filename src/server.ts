import fastify from 'fastify'
import dotenv from 'dotenv'

dotenv.config()

const app = fastify()

const appPort = process.env.APP_PORT || 3333

app.get('/hello', () => 'Hello World')

app
  .listen({
    port: appPort,
  })
  .then(() => {
    console.log(`Server is running on port ${appPort}`)
  })
