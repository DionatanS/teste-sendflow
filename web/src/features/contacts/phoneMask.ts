/**
 * Formata progressivamente um telefone no padrão "+CC DD NNNNN-NNNN"
 * (ex.: "+55 11 91234-5678") conforme o usuário digita. Aceita colar um
 * número já formatado ou só dígitos — sempre normaliza a partir dos dígitos.
 */
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  if (digits.length === 0) return ''

  const countryCode = digits.slice(0, 2)
  const areaCode = digits.slice(2, 4)
  const rest = digits.slice(4)

  let formatted = `+${countryCode}`
  if (areaCode) formatted += ` ${areaCode}`
  if (rest) {
    // Só insere o hífen a partir do 6º dígito do número local, para não
    // cortar o grupo de 5 dígitos do celular ("91234") cedo demais.
    formatted += rest.length > 5 ? ` ${rest.slice(0, -4)}-${rest.slice(-4)}` : ` ${rest}`
  }
  return formatted
}
