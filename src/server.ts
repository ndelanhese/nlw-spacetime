import fastify from 'fastify'
import dotenv from 'dotenv'
import { memoriesRoutes } from './routes/memories'
import cors from '@fastify/cors'

dotenv.config()
const app = fastify()
const appPort = process.env.APP_PORT || 3333
app.register(cors, { origin: true })
app.register(memoriesRoutes)
app
  .listen({
    port: appPort,
  })
  .then(() => {
    console.log(`Server is running on port ${appPort}`)
  })
