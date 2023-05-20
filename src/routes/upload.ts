import { randomUUID } from 'node:crypto'
import { extname, resolve } from 'node:path'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { FastifyInstance } from 'fastify'
import { promisify } from 'node:util'

const pump = promisify(pipeline)

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (request, response) => {
    const FIVE_MB_IN_BYTES = 5 * 1024 * 1024
    const upload = await request.file({
      limits: { fileSize: FIVE_MB_IN_BYTES },
    })
    if (!upload) {
      return response.status(400).send()
    }
    const REGEX_FOR_MP3_OR_MP4_MIMETYPE = /^(image|video)\/[a-zA-Z]+/
    const isValidFileFormat = REGEX_FOR_MP3_OR_MP4_MIMETYPE.test(
      upload.mimetype,
    )
    if (!isValidFileFormat) {
      return response.status(400).send()
    }
    const fileId = randomUUID()
    const extension = extname(upload.filename)
    const fileName = fileId.concat(extension)
    const writeStream = createWriteStream(
      resolve(__dirname, '../../', 'public/images/', fileName),
    )
    await pump(upload.file, writeStream)
    const fullUrl = `${request.protocol}://${request.hostname}`
    const fileURL = new URL(`/public/images/${fileName}`, fullUrl).toString()
    return { fileURL }
  })
}
