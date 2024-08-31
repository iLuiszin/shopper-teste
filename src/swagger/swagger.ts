import swaggerAutogen from 'swagger-autogen'

const outputFile = './swagger-output.json'
const endpointsFiles = ['./src/routes/MeasureRoutes.ts']

async function generateSwaggerDocs() {
  const PORT = process.env.PORT || 80
  const doc = {
    info: {
      title: 'API de Medidas',
      description:
        'API para gerenciar e consultar medidas de consumo de água e gás.',
      version: '1.0.0',
    },
    host: `localhost:${PORT}`,
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor localhost.',
      },
    ],
    '@definitions': {
      Measure: {
        type: 'object',
        properties: {
          measure_uuid: {
            type: 'string',
            example: '4bbb02d-14c1-4a64-bc9f-58fb40269c3e',
          },
          measure_value: {
            type: 'number',
            example: 10,
          },
          customer_code: {
            type: 'string',
            example: 'CUST1234',
          },
          measure_type: {
            type: 'string',
            example: 'WATER',
          },
          measure_datetime: {
            type: 'string',
            example: '2024-08-30T14:00:00Z',
          },
          image_url: {
            type: 'string',
            example: 'http://example.com/image_url',
          },
          has_confirmed: {
            type: 'boolean',
            example: true,
          },
        },
      },
    },
    consumes: ['application/json'],
    produces: ['application/json'],
  }

  try {
    swaggerAutogen(outputFile, endpointsFiles, doc)
    console.log('Documentação do Swagger gerada com sucesso!')
  } catch (error) {
    console.error('Falha ao gerar Swagger documentação', error)
  }
}

generateSwaggerDocs()
