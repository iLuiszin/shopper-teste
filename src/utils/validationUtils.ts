import fileTypeResult from 'file-type'

type ValidationRule = {
  required?: boolean
  type?: 'string' | 'number'
  pattern?: RegExp
  custom?: (value: any) => boolean | Promise<boolean>
  customErrorMessage?: string
}

export async function validateRequest(
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): Promise<string | null> {
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]

    if (
      rule.required &&
      (value === undefined || value === null || value === '')
    ) {
      return `O campo ${field} é obrigatório.`
    }

    if (rule.type && typeof value !== rule.type && rule.required) {
      return `O campo ${field} deve ser do tipo ${rule.type}.`
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return `O campo ${field} possui um formato inválido.`
    }

    if (rule.custom) {
      const isValid = await rule.custom(value)
      if (!isValid) {
        return rule.customErrorMessage || `O campo ${field} não é válido.`
      }
    }
  }

  return null
}

export async function isValidBase64Image(base64: string): Promise<boolean> {
  try {
    const base64WithoutPrefix = base64.split(',').pop() || ''
    const buffer = Buffer.from(base64WithoutPrefix, 'base64')

    const mimeTypes = [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/bmp',
      'image/webp',
    ]

    const fileType = await fileTypeResult.fromBuffer(buffer)

    return fileType ? mimeTypes.includes(fileType.mime) : false
  } catch {
    return false
  }
}
