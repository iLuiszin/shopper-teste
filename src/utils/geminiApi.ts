import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.API_KEY as string)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

export default async function geminiApiRequest(image: string) {
  const prompt = "Você deve gerenciar a leitura individualizada de consumo de água e gás, analisando a imagem e retornando o valor que deverá ser pago";

  const base64Pattern = /^data:image\/[a-zA-Z]+;base64,/;
  const cleanedImage = image.replace(base64Pattern, '');

  const response = {
    inlineData: {
      data: cleanedImage,
      mimeType: "image/jpeg",
    },
  };

  try {
    console.time("GeminiAPI Response Time");

    const result = await model.generateContent([prompt, response]);

    console.timeEnd("GeminiAPI Response Time");

    console.log(result.response.text());

    return result.response.text();
  } catch (error) {
    console.error("Erro ao fazer a solicitação à API do Gemini:", error);
    throw new Error("Falha ao processar a imagem com a API do Gemini.");
  }
}