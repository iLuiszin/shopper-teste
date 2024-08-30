type ValidationRule = {
  required?: boolean
  type?: 'string' | 'number'
  pattern?: RegExp
  custom?: (value: any) => boolean
  customErrorMessage?: string
}

export function validateRequest(
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): string | null {
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

    if (rule.custom && !rule.custom(value)) {
      return rule.customErrorMessage || `O campo ${field} não é válido.`
    }
  }

  return null
}
