import { Request, Response } from "express";
import geminiApiRequest from "../utils/geminiApi";

type UploadRequestBody = {
  image: string;
  customer_code: string;
  measure_datetime: string;
  measure_type: "WATER" | "GAS";
};

export default class ReadingController {
  static async upload(req: Request, res: Response) {
    try {
      const { image, customer_code, measure_datetime, measure_type } = req.body as UploadRequestBody;

      const base64ImageRegex = /^data:image\/(png|jpg|jpeg|gif|bmp|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
      const isBase64Image = base64ImageRegex.test(image);

      if (!image || !customer_code || !measure_datetime || !measure_type) {
        return res.status(400).json({
          error_code: "INVALID_DATA",
          error_description: "Todos os campos são obrigatórios.",
        });
      }

      if (typeof image !== 'string' || !isBase64Image) {
        return res.status(400).json({
          error_code: "INVALID_DATA",
          error_description: "A imagem deve estar no formato base64 válido.",
        });
      }

      if (typeof customer_code !== "string" || !customer_code.trim()) {
        return res.status(400).json({
          error_code: "INVALID_DATA",
          error_description: "O código do cliente deve ser uma string válida.",
        });
      }

      if (!["WATER", "GAS"].includes(measure_type)) {
        return res.status(400).json({
          error_code: "INVALID_DATA",
          error_description: "O tipo de medida deve ser 'WATER' ou 'GAS'.",
        });
      }

      const response = await geminiApiRequest(image);
      console.log(response)



    } catch (error) {

    }
  }
}