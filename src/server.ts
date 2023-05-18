import fastify from 'fastify'
import dotenv from 'dotenv'
import { memoriesRoutes } from './routes/memories'
import cors from '@fastify/cors'
import { authRoutes } from './routes/auth'
import jwt from '@fastify/jwt'

dotenv.config()
const app = fastify()
const appPort = process.env.APP_PORT || 3333
const jwtSecret = process.env.JWT_SECRET || 'spacetime'
app.register(cors, { origin: true })
app.register(jwt, { secret: jwtSecret })
app.register(memoriesRoutes)
app.register(authRoutes)
app
  .listen({
    port: appPort,
    // host: '0.0.0.0',
  })
  .then(() => {
    console.log(`Server is running on port ${appPort}`)
  })
