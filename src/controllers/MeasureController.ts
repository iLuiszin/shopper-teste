import { Request, Response } from 'express'
import geminiApiRequest from '../services/geminiService'
import customError from '../utils/customError'
import prisma from '../db/prisma'
import { validateRequest, isValidBase64Image } from '../utils/validationUtils'
import { checkExistingMeasure, saveMeasure } from '../services/measureService'
import { saveImageAndGenerateURL } from '../utils/imageUtils'

type ValidationRule = {
  required?: boolean
  type?: 'string' | 'number'
  pattern?: RegExp
  custom?: (value: any) => boolean | Promise<boolean>
  customErrorMessage?: string
}

export default class MeasureController {
  static async upload(req: Request, res: Response) {
    /* 
    #swagger.auto = false
    #swagger.tags = ['Measures']
    #swagger.description = 'Faz upload de uma nova medição'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dados da medição',
      required: true,
      schema: { $ref: '#/definitions/UploadRequest' }
    }
    #swagger.responses[200] = {
      description: 'Medição salva com sucesso',
      schema: { $ref: '#/definitions/UploadResponse' }
    }
    #swagger.responses[400] = {
      description: 'Dados inválidos'
    }
    #swagger.responses[409] = {
      description: 'Medição já realizada'
    }
    #swagger.responses[500] = {
      description: 'Erro interno do servidor'
    }
    */
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
          custom: async (value: string) => await isValidBase64Image(value),
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

      const validationError = await validateRequest(req.body, validationRules)
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

      const { image_url, measure_uuid } = await saveImageAndGenerateURL(image)

      await saveMeasure(
        measure_uuid,
        measure_value,
        customer_code,
        measure_type,
        measure_datetime,
        image_url
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
    /* 
    #swagger.auto = false
    #swagger.tags = ['Measures']
    #swagger.description = 'Confirma uma medição existente'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dados para confirmar a medição',
      required: true,
      schema: { $ref: '#/definitions/ConfirmRequest'},
    }
    #swagger.responses[200] = {
      description: 'Medição confirmada com sucesso'
    }
    #swagger.responses[400] = {
      description: 'Dados inválidos'
    }
    #swagger.responses[404] = {
      description: 'Medição não encontrada'
    }
    #swagger.responses[409] = {
      description: 'Medição já confirmada'
    }
    #swagger.responses[500] = {
      description: 'Erro interno do servidor'
    }
    */
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

      const validationError = await validateRequest(req.body, validationRules)
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

      if (reading.has_confirmed) {
        return customError(
          res,
          409,
          'MEASURE_ALREADY_CONFIRMED',
          'Leitura do mês já realizada'
        )
      }

      await prisma.measure.update({
        where: { measure_uuid },
        data: { has_confirmed: true, measure_value: confirmed_value },
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
    /* 
    #swagger.auto = false
    #swagger.tags = ['Measures']
    #swagger.description = 'Obtém todas as medições para um cliente específico'
    #swagger.parameters['customer_code'] = {
      in: 'path',
      description: 'Código do cliente',
      required: true,
      schema: { type: 'string' }
    }
    #swagger.parameters['measure_type'] = {
      in: 'query',
      description: 'Tipo de medição (WATER ou GAS)',
      required: false,
      schema: { type: 'string' }
    }
    #swagger.responses[200] = {
      description: 'Lista de medições',
       schema: { $ref: '#/definitions/ListMeasuresResponse' }
    }
    #swagger.responses[400] = {
      description: 'Tipo de medição não permitida'
    }
    #swagger.responses[404] = {
      description: 'Nenhuma medição encontrada'
    }
    #swagger.responses[500] = {
      description: 'Erro interno do servidor'
    }
    */
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

      const validationError = await validateRequest(
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

      if (!measures || measures.length === 0) {
        return customError(
          res,
          404,
          'MEASURES_NOT_FOUND',
          'Nenhuma leitura encontrada'
        )
      }

      const transformedMeasures = measures.map((measure) => ({
        measure_uuid: measure.measure_uuid,
        measure_datetime: measure.measure_datetime,
        measure_type: measure.measure_type,
        has_confirmed: measure.has_confirmed,
        image_url: measure.image_url || '',
      }))

      return res.status(200).json({
        customer_code,
        measures: transformedMeasures,
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
