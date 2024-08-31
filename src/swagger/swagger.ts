import swaggerAutogen from 'swagger-autogen'

const outputFile = './swagger-output.json'
const endpointsFiles = ['./src/routes/MeasureRoutes.ts']

async function generateSwaggerDocs() {
  const doc = {
    info: {
      title: 'API de Medidas',
      description:
        'API para gerenciar e consultar medidas de consumo de água e gás.',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 80}/`,
        description: 'Servidor localhost.',
      },
    ],
    definitions: {
      UploadRequest: {
        image: 'string',
        customer_code: 'string',
        measure_datetime: 'datetime',
        measure_type: 'string',
      },
      UploadResponse: {
        image_url: 'string',
        measure_value: 'number',
        measure_uuid: 'string',
      },
      ConfirmRequest: {
        measure_uuid: 'string',
        confirmed_value: 'number',
      },
      ListMeasuresResponse: {
        customer_code: 'string',
        measures: [
          {
            measure_uuid: 'string',
            measure_datetime: 'datetime',
            measure_type: 'string',
            has_confirmed: 'boolean',
            image_url: 'string',
          },
        ],
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
