import { Request, Response } from 'express'
import geminiApiRequest from '../services/geminiService'
import customError from '../utils/customError'
import prisma from '../db/prisma'
import { validateRequest } from '../utils/validationUtils'
import { checkExistingMeasure, saveMeasure } from '../services/measureService'
import { saveImageAndGenerateURL } from '../utils/imageUtils'

type ValidationRule = {
  required?: boolean
  type?: 'string' | 'number'
  pattern?: RegExp
  custom?: (value: any) => boolean
  customErrorMessage?: string
}

export default class MeasureController {
  static async upload(req: Request, res: Response) {
    try {
      const { image, customer_code, measure_datetime, measure_type } =
        req.body as {
          image: string
          customer_code: string
          measure_datetime: string
          measure_type: string
        }

      const validationRules: Record<string, ValidationRule> = {
        image: {
          required: true,
          type: 'string',
          pattern:
            /^data:image\/(png|jpg|jpeg|gif|bmp|webp);base64,([A-Za-z0-9+/]+={0,2})$/,
          customErrorMessage: 'A imagem deve estar no formato base64 válido',
        },
        customer_code: {
          required: true,
          type: 'string',
        },
        measure_datetime: {
          required: true,
          type: 'string',
        },
        measure_type: {
          required: true,
          type: 'string',
          custom: (value: string) => ['WATER', 'GAS'].includes(value),
          customErrorMessage: 'O tipo de medida deve ser WATER ou GAS',
        },
      }

      const validationError = validateRequest(req.body, validationRules)
      if (validationError) {
        return customError(res, 400, 'INVALID_DATA', validationError)
      }

      const hasExistingMeasure = await checkExistingMeasure(
        customer_code,
        measure_type,
        new Date(measure_datetime).getMonth()
      )

      if (hasExistingMeasure) {
        return customError(
          res,
          409,
          'DOUBLE_REPORT',
          'Leitura do mês já realizada'
        )
      }

      const measure_value = await geminiApiRequest(image)

      if (!measure_value) {
        return customError(
          res,
          500,
          'INTERNAL_ERROR',
          'Falha ao processar a imagem'
        )
      }

      const { image_url, measure_uuid } = saveImageAndGenerateURL(image)

      await saveMeasure(
        measure_uuid,
        measure_value,
        customer_code,
        measure_type,
        measure_datetime
      )

      return res.status(200).json({
        image_url,
        measure_value,
        measure_uuid,
      })
    } catch (error) {
      console.error('Falha ao processar a imagem', error)
      return customError(
        res,
        500,
        'INTERNAL_ERROR',
        'Falha ao processar a imagem'
      )
    }
  }

  static async confirm(req: Request, res: Response) {
    try {
      const validationRules: Record<string, ValidationRule> = {
        measure_uuid: {
          required: true,
          type: 'string',
        },
        confirmed_value: {
          required: true,
          type: 'number',
        },
      }

      const validationError = validateRequest(req.body, validationRules)
      if (validationError) {
        return customError(res, 400, 'INVALID_DATA', validationError)
      }

      const { measure_uuid, confirmed_value } = req.body as {
        measure_uuid: string
        confirmed_value: number
      }

      const reading = await prisma.measure.findUnique({
        where: { measure_uuid },
      })

      if (!reading) {
        return customError(
          res,
          404,
          'MEASURE_NOT_FOUND',
          'Leitura não encontrada'
        )
      }

      if (reading.confirmed) {
        return customError(
          res,
          409,
          'MEASURE_ALREADY_CONFIRMED',
          'Leitura do mês já realizada'
        )
      }

      await prisma.measure.update({
        where: { measure_uuid },
        data: { confirmed: true, measure_value: confirmed_value },
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Falha ao confirmar a confirmação da leitura', error)
      return customError(
        res,
        500,
        'INTERNAL_ERROR',
        'Falha ao processar a confirmação da leitura'
      )
    }
  }

  static async getMeasuresFromCustomer(req: Request, res: Response) {
    try {
      const { customer_code } = req.params as { customer_code: string }
      const { measure_type } = req.query as { measure_type?: string }

      const validationRules: Record<string, ValidationRule> = {
        customer_code: {
          required: true,
          type: 'string',
        },
        measure_type: {
          required: false,
          type: 'string',
          custom: (value: string | undefined) =>
            !value || ['WATER', 'GAS'].includes(value),
          customErrorMessage: 'Tipo de medição não permitida',
        },
      }

      const validationError = validateRequest(
        { customer_code, measure_type },
        validationRules
      )
      if (validationError) {
        const errorCode = validationError.includes(
          'Tipo de medição não permitida'
        )
          ? 'INVALID_TYPE'
          : 'INVALID_DATA'
        return customError(res, 400, errorCode, validationError)
      }

      const measures = await prisma.measure.findMany({
        where: {
          customer_code,
          ...(measure_type ? { measure_type } : {}),
        },
      })

      if (!measures) {
        return customError(
          res,
          404,
          'MEASURES_NOT_FOUND',
          'Nenhuma leitura encontrada'
        )
      }

      return res.status(200).json({
        customer_code,
        measures,
      })
    } catch (error) {
      console.error('Falha ao buscar as leituras', error)
      return customError(
        res,
        500,
        'INTERNAL_ERROR',
        'Falha ao buscar as leituras'
      )
    }
  }
}
