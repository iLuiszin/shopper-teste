export function validateUploadRequest(image: string, customer_code: string, measure_datetime: string, measure_type: string): string | null {
  const base64ImageRegex = /^data:image\/(png|jpg|jpeg|gif|bmp|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
  const isBase64Image = base64ImageRegex.test(image);

  if (!image || !customer_code || !measure_datetime || !measure_type) {
    return "Todos os campos são obrigatórios";
  }

  if (typeof image !== 'string' || !isBase64Image) {
    return "A imagem deve estar no formato base64 válido";
  }

  if (typeof customer_code !== "string" || !customer_code.trim()) {
    return "O código do cliente deve ser válido";
  }

  if (typeof measure_datetime !== "string" || !measure_datetime.trim()) {
    return "A data da leitura deve ser válida";
  }

  if (!["WATER", "GAS"].includes(measure_type)) {
    return "O tipo de medida deve ser 'WATER' ou 'GAS'";
  }

  return null;
}
