import prisma from '../db/prisma'

export async function saveMeasure(
  measure_uuid: string,
  measure_value: number,
  customer_code: string,
  measure_type: string,
  measure_datetime: string,
  image_url: string
) {
  try {
    await prisma.measure.create({
      data: {
        measure_uuid,
        measure_value,
        customer_code,
        measure_type,
        measure_datetime: new Date(measure_datetime),
        image_url,
      },
    })
  } catch (error) {
    console.error('Falha ao salvar leitura' + error)
    throw new Error()
  }
}

export async function checkExistingMeasure(
  customer_code: string,
  measure_type: string,
  month: number
): Promise<boolean> {
  try {
    const existingMeasure = await prisma.measure.findFirst({
      where: {
        customer_code,
        measure_type,
        measure_datetime: {
          gte: new Date(new Date().getFullYear(), month, 1),
          lt: new Date(new Date().getFullYear(), month + 1, 0),
        },
      },
    })

    return !!existingMeasure
  } catch (error) {
    console.error('Falha ao verificar existeção de leitura' + error)
    throw new Error()
  }
}
