import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.API_KEY as string)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

export default async function geminiApiRequest(image: string): Promise<string | Error> {
  const prompt = "Você deve gerenciar a leitura individualizada de consumo de água e gás, analisando a imagem e retornando apenas o número no medidor";

  const cleanedImage = image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

  const response = {
    inlineData: {
      data: cleanedImage,
      mimeType: "image/jpeg",
    },
  };

  try {
    const { response: { text } } = await model.generateContent([prompt, response]);

    const cleanedResult = text().match(/\d+/)?.[0].replace(/^0+/, '') || '';

    return cleanedResult;
  } catch (error) {
    throw new Error("Falha ao processar a imagem com a API do Gemini.");
  }
}