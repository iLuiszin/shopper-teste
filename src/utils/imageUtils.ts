import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fileTypeResult from 'file-type'

export async function parseBase64Image(image: string) {
  const base64Data = Buffer.from(
    image.replace(/^data:image\/\w+;base64,/, ''),
    'base64'
  )

  const mimeTypes = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/bmp',
    'image/webp',
  ]

  const imageType = await fileTypeResult.fromBuffer(base64Data)

  if (!imageType || !mimeTypes.includes(imageType.mime)) {
    throw new Error()
  }

  return { base64Data, imageType: imageType.ext }
}

export async function saveImageAndGenerateURL(image: string) {
  const { base64Data, imageType } = await parseBase64Image(image)

  const measure_uuid = uuidv4()
  const fileName = `${measure_uuid}.${imageType}`
  const filePath = path.join(__dirname, '..', 'uploads', fileName)

  fs.writeFileSync(filePath, base64Data)

  const host = process.env.HOST || 'http://localhost'
  const port = process.env.PORT || '80'
  const image_url = `${host}:${port}/uploads/${fileName}`

  setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Erro ao excluir o arquivo:', err)
    })
  }, 60 * 60 * 1000) // 1 hora

  return { image_url, measure_uuid }
}
