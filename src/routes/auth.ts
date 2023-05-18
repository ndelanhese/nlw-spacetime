import axios from 'axios'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    const GITHUB_URL = 'https://github.com/'
    const API_GITHUB_URL = 'https://api.github.com/'
    const bodySchema = z.object({ code: z.string() })
    const { code } = bodySchema.parse(request.body)
    const accessTokenGithub = await axios.post(
      `${GITHUB_URL}login/oauth/access_token`,
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    )
    const { access_token: accessToken } = accessTokenGithub.data
    const userInfo = await axios.get(`${API_GITHUB_URL}user`, {
      headers: { Authorization: `bearer ${accessToken}` },
    })
    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      name: z.string(),
      avatar_url: z.string(),
    })
    const {
      id,
      login,
      name,
      avatar_url: avatarUrl,
    } = userSchema.parse(userInfo.data)

    const user = await prisma.user.findUnique({ where: { githubId: id } })

    if (!user) {
      await prisma.user.create({
        data: {
          name,
          login,
          githubId: id,
          avatarUrl,
        },
      })
    }
    const token = app.jwt.sign(
      { name, avatarUrl },
      { sub: user?.id, expiresIn: '24h' },
    )
    return { token }
  })
}
