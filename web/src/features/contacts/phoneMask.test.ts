import { describe, expect, it } from 'vitest'
import { formatPhoneInput } from './phoneMask'

describe('formatPhoneInput', () => {
  it('returns empty string for empty input', () => {
    expect(formatPhoneInput('')).toBe('')
  })

  it('formats progressively as digits are typed', () => {
    expect(formatPhoneInput('5')).toBe('+5')
    expect(formatPhoneInput('55')).toBe('+55')
    expect(formatPhoneInput('5511')).toBe('+55 11')
    expect(formatPhoneInput('551191234')).toBe('+55 11 91234')
    expect(formatPhoneInput('5511912345678')).toBe('+55 11 91234-5678')
  })

  it('formats an 8-digit landline number without splitting oddly', () => {
    expect(formatPhoneInput('551133334444')).toBe('+55 11 3333-4444')
  })

  it('strips non-digit characters from pasted input', () => {
    expect(formatPhoneInput('+55 (11) 91234-5678')).toBe('+55 11 91234-5678')
  })

  it('truncates input beyond 13 digits', () => {
    expect(formatPhoneInput('551191234567899999')).toBe('+55 11 91234-5678')
  })
})
