import fastify from 'fastify'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const app = fastify()
const prisma = new PrismaClient()

const appPort = process.env.APP_PORT || 3333

app.get('/users', async () => {
  return await prisma.user.findMany()
})

app
  .listen({
    port: appPort,
  })
  .then(() => {
    console.log(`Server is running on port ${appPort}`)
  })
