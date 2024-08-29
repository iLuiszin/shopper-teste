import prisma from "../db/prisma"

export async function saveReading(
  measure_uuid: string,
  measure_value: number,
  customer_code: string,
  measure_type: string,
  measure_datetime: string
) {
  await prisma.reading.create({
    data: {
      measure_uuid,
      measure_value,
      customer_code,
      measure_type,
      measure_datetime: new Date(measure_datetime)
    },
  });
}

export async function checkExistingReading(
  customer_code: string,
  measure_type: string,
  month: number
): Promise<boolean> {
  const existingReading = await prisma.reading.findFirst({
    where: {
      customer_code,
      measure_type,
      measure_datetime: {
        gte: new Date(new Date().getFullYear(), month, 1),
        lt: new Date(new Date().getFullYear(), month + 1, 0),
      },
    },
  });

  return !!existingReading;
}
