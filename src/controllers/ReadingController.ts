import { Request, Response } from "express";
import geminiApiRequest from "../services/geminiService";
import customError from "../utils/customError";
import prisma from "../db/prisma";
import { validateUploadRequest } from "../utils/validationUtils";
import { checkExistingReading, saveReading } from "../services/readingService";
import { saveImageAndGenerateURL } from "../utils/imageUtils";

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

      const validationError = validateUploadRequest(image, customer_code, measure_datetime, measure_type);
      if (validationError) {
        return customError(res, 400, "INVALID_DATA", validationError);
      }

      const hasExistingReading = await checkExistingReading(customer_code, measure_type, new Date(measure_datetime).getMonth());
      if (hasExistingReading) {
        return customError(res, 409, "DOUBLE_REPORT", "Leitura do mês já realizada");
      }

      const measure_value = await geminiApiRequest(image);

      if (!measure_value || measure_value instanceof Error) {
        return customError(res, 500, "INTERNAL_ERROR", "Falha ao processar a imagem");
      }

      const { image_url, measure_uuid } = saveImageAndGenerateURL(image);

      await saveReading(measure_uuid, measure_value, customer_code, measure_type, measure_datetime);

      return res.status(200).json({
        image_url,
        measure_value,
        measure_uuid
      });
    } catch (error) {
      console.error(error);
      return customError(res, 500, "INTERNAL_ERROR", "Falha ao processar a imagem");
    }
  }

  static async confirmReading(req: Request, res: Response) {
    try {
      const { measure_uuid, confirmed_value } = req.params;

      if (!measure_uuid || !confirmed_value) {
        return customError(res, 400, "INVALID_DATA", "Todos os campos são obrigatórios");
      }

      if (typeof measure_uuid !== "string" || typeof confirmed_value !== "number") {
        return customError(res, 400, "INVALID_DATA", "Os valores enviados aparentemente são inválidos");
      }

      const reading = await prisma.reading.findUnique({ where: { measure_uuid } });

      if (!reading) {
        return customError(res, 404, "MEASURE_NOT_FOUND", "Leitura não encontrada");
      }

      if (reading.confirmed) {
        return customError(res, 409, "MEASURE_ALREADY_CONFIRMED", "Leitura do mês já realizada");
      }

      await prisma.reading.update({ where: { measure_uuid }, data: { confirmed: true, measure_value: confirmed_value } });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return customError(res, 500, "INTERNAL_ERROR", "Falha ao processar a confirmação da leitura");
    }
  }
}