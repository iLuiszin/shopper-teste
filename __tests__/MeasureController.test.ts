// MeasureController.test.ts

import request from 'supertest'
import express from 'express'
import MeasureController from '../src/controllers/MeasureController'
import { uploadRequest } from '../__mocks__/requestMock'
import prisma from '../src/db/prisma' // Importa o prisma corretamente
import 'dotenv/config'

const app = express()
app.use(express.json({ limit: '50mb' }))
app.post('/upload', MeasureController.upload)

// Mock das dependências
jest.mock('../src/services/geminiService')
jest.mock('../src/services/measureService')
jest.mock('../src/utils/validationUtils')
jest.mock('../src/utils/imageUtils')
jest.mock('../src/utils/customError')

beforeAll(() => {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST // Configura a variável de ambiente para o banco de dados de teste
})

afterAll(async () => {
  await prisma.measure.deleteMany()
  await prisma.$disconnect()
})

describe('MeasureController', () => {
  describe('upload', () => {
    it('should upload a new measure successfully', async () => {
      prisma.measure.create = jest.fn().mockResolvedValue({
        id: 1,
        ...uploadRequest,
        imageUrl: 'mockImageUrl',
      })

      const response = await request(app).post('/upload').send(uploadRequest)

      expect(response.status).toBe(200)
      expect(prisma.measure.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customer_code: '2523',
            measure_datetime: '2024-08-28 18:00:00.000',
            measure_type: 'GAS',
            imageUrl: 'mockImageUrl',
          }),
        })
      )
    }, 30000)
  })
})
