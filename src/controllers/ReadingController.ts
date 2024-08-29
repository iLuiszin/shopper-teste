import { Request, Response } from "express";
import geminiApiRequest from "../utils/geminiApi";
import customError from "../utils/customError";
import prisma from "../utils/prisma";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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
        return customError(res, 400, "INVALID_DATA", "Todos os campos são obrigatórios.");
      }

      if (typeof image !== 'string' || !isBase64Image) {
        return customError(res, 400, "INVALID_DATA", "A imagem deve estar no formato base64 válido.");
      }

      if (typeof customer_code !== "string" || !customer_code.trim()) {
        return customError(res, 400, "INVALID_DATA", "O código do cliente deve ser uma string válida.");
      }

      if (!["WATER", "GAS"].includes(measure_type)) {
        return customError(res, 400, "INVALID_DATA", "O tipo de medida deve ser 'WATER' ou 'GAS'.");
      }

      const response: string | Error = await geminiApiRequest(image);

      if (!response || response instanceof Error) {
        return customError(res, 500, "INTERNAL_ERROR", "Falha ao processar a imagem.");
      }
      const base64Data = Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );

      const imageType = image.match(
        /^data:image\/(png|jpg|jpeg|gif|bmp|webp);base64/
      )?.[1];


      const imageId = uuidv4();
      const fileName = `${imageId}.${imageType}`;
      const filePath = path.join(__dirname, "..", "uploads", fileName);

      fs.writeFileSync(filePath, base64Data);

      const tempUrl = `/uploads/${fileName}`;

      setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Erro ao excluir o arquivo:", err);
        });
      }, 60 * 60 * 1000);


      await prisma.reading.create({
        data: {
          id: imageId,
          measure_value: parseInt(response),
          customer_code,
          measure_type,
          measure_datetime
        }
      });

      return res.status(200).json({
        image_url: tempUrl,
        measure_value: parseInt(response),
        measure_uuid: imageId
      });
    } catch (error) {
      console.error(error);
      return customError(res, 500, "INTERNAL_ERROR", "Falha ao processar a imagem.");
    }
  }
}