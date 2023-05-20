import fastify from 'fastify'
import dotenv from 'dotenv'
import { memoriesRoutes } from './routes/memories'
import cors from '@fastify/cors'
import { authRoutes } from './routes/auth'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { uploadRoutes } from './routes/upload'
import fastifyStatic from '@fastify/static'
import { resolve } from 'node:path'

dotenv.config()
const app = fastify()
const appPort = process.env.APP_PORT || 3333
const jwtSecret = process.env.JWT_SECRET || 'spacetime'
app.register(cors, { origin: true })
app.register(jwt, { secret: jwtSecret })
app.register(multipart)
app.register(memoriesRoutes)
app.register(authRoutes)
app.register(uploadRoutes)
app.register(fastifyStatic, {
  root: resolve(__dirname, '../public/images'),
  prefix: '/public/images',
})
app
  .listen({
    port: appPort,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log(`Server is running on port ${appPort}`)
  })
