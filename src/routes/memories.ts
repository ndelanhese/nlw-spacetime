import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/memories', async (request) => {
    const memories = await prisma.memory.findMany({
      where: { userId: request.user.sub },
      orderBy: { createdAt: 'asc' },
    })
    return memories.map((memory) => ({
      id: memory.id,
      coverUrl: memory.coverUrl,
      excerpt: memory.content.substring(0, 115).concat('...'),
      createdAt: memory.createdAt,
    }))
  })

  app.get('/memories/:id', async (request, response) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)
    const memory = await prisma.memory.findUniqueOrThrow({ where: { id } })
    if (!memory.isPublic && request.user.sub !== memory.userId) {
      return response.status(401).send()
    }
    return memory
  })

  app.post('/memories', async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)
    return await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub,
      },
    })
  })

  app.put('/memories/:id', async (request, response) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const memory = await prisma.memory.findUniqueOrThrow({ where: { id } })
    if (request.user.sub !== memory.userId) {
      return response.status(401).send()
    }

    return await prisma.memory.update({
      where: { id },
      data: { content, coverUrl, isPublic },
    })
  })

  app.delete('/memories/:id', async (request, response) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)
    const memory = await prisma.memory.findUniqueOrThrow({ where: { id } })
    if (request.user.sub !== memory.userId) {
      return response.status(401).send()
    }
    await prisma.memory.delete({ where: { id } })
  })
}
