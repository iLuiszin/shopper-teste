import request from 'supertest'
import express from 'express'
import MeasureController from '../controllers/MeasureController'
import { uploadBody } from './mocks/uploadBody'
import prisma from '../db/prisma'

const app = express()
app.use(express.json({ limit: '50mb' }))
app.post('/upload', MeasureController.upload)
app.patch('/confirm', MeasureController.confirm)
app.get('/:customer_code/list', MeasureController.getMeasuresFromCustomer)

let responseUpload: any = null

afterAll(async () => {
  if (responseUpload) {
    await prisma.measure.delete({
      where: {
        measure_uuid: responseUpload.body.measure_uuid,
      },
    })
  }

  await prisma.$disconnect()
}, 15000)

describe('MeasureController', () => {
  it('should upload a measurement', async () => {
    responseUpload = await request(app).post('/upload').send(uploadBody)

    expect(responseUpload.status).toBe(200)
    expect(responseUpload.body).toHaveProperty('measure_uuid')
    expect(responseUpload.body).toHaveProperty('image_url')
    expect(responseUpload.body).toHaveProperty('measure_value')
  })

  it('should try to upload the same measurement', async () => {
    const response = await request(app).post('/upload').send(uploadBody)

    expect(response.status).toBe(409)
    expect(response.body).toHaveProperty('error_code')
    expect(response.body).toHaveProperty('error_description')
  })

  it('should try to upload an invalid image', async () => {
    const response = await request(app)
      .post('/upload')
      .send({
        ...uploadBody,
        customer_code: 'different_customer_code',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAU...',
      })

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('error_code')
    expect(response.body).toHaveProperty('error_description')
  })

  it('should try to upload an invalid body (image not base64 encoded)', async () => {
    const response = await request(app)
      .post('/upload')
      .send({
        ...uploadBody,
        image: 'invalid base64',
      })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error_code')
    expect(response.body).toHaveProperty('error_description')
  })

  it('should confirm a measurement', async () => {
    const response = await request(app).patch('/confirm').send({
      measure_uuid: responseUpload.body.measure_uuid,
      confirmed_value: 10,
    })

    expect(response.status).toBe(200)
  })

  it('should try to confirm an invalid body', async () => {
    const response = await request(app).patch('/confirm').send({
      measure_uuid: responseUpload.body.measure_uuid,
    })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error_code')
    expect(response.body).toHaveProperty('error_description')
  })

  it('should try to confirm a measurement that is already confirmed', async () => {
    const response = await request(app).patch('/confirm').send({
      measure_uuid: responseUpload.body.measure_uuid,
      confirmed_value: 10,
    })

    expect(response.status).toBe(409)
    expect(response.body).toHaveProperty('error_code')
    expect(response.body).toHaveProperty('error_description')
  })

  it('should try to confirm a measurement that does not exist', async () => {
    const response = await request(app).patch('/confirm').send({
      measure_uuid: 'invalid_uuid',
      confirmed_value: 10,
    })

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('error_code')
    expect(response.body).toHaveProperty('error_description')
  })

  it('should get measures from customer', async () => {
    const response = await request(app).get(`/${uploadBody.customer_code}/list`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('customer_code')
    expect(response.body).toHaveProperty('measures')
  })

  it('should try to get measures from an invalid customer', async () => {
    const response = await request(app).get(`/invalid_code/list`)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('error_code')
    expect(response.body).toHaveProperty('error_description')
  })

  it('should try to get measures from an invalid type', async () => {
    const response = await request(app).get(
      `/${uploadBody.customer_code}/list?measure_type=invalid`
    )

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error_code')
    expect(response.body).toHaveProperty('error_description')
  })
})
