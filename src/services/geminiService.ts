import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function geminiApiRequest(image: string): Promise<number> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt =
    'You must manage the individual reading of water and gas consumption by analyzing the image and returning only the number on the meter.'

  const cleanedImage = image.replace(/^data:image\/[a-zA-Z]+;base64,/, '')

  const response = {
    inlineData: {
      data: cleanedImage,
      mimeType: 'image/jpeg',
    },
  }

  try {
    const {
      response: { text },
    } = await model.generateContent([prompt, response])

    const cleanedResult = text().match(/\d+/)?.[0].replace(/^0+/, '') || ''

    return parseInt(cleanedResult)
  } catch (error) {
    throw new Error()
  }
}
