import { describe, expect, it } from 'vitest'
import { validateScheduledDate } from './scheduleValidation'

describe('validateScheduledDate', () => {
  const now = new Date('2026-09-29T12:00:00')

  it('rejects a date in the past', () => {
    const result = validateScheduledDate('2020-01-01T10:00', now)
    expect(result.ok).toBe(false)
  })

  it('rejects the exact current instant (not strictly future)', () => {
    const result = validateScheduledDate('2026-09-29T12:00', now)
    expect(result.ok).toBe(false)
  })

  it('rejects an unparseable value', () => {
    const result = validateScheduledDate('', now)
    expect(result.ok).toBe(false)
  })

  it('accepts a future date and returns the parsed Date', () => {
    const result = validateScheduledDate('2027-01-01T10:00', now)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.scheduledFor.getFullYear()).toBe(2027)
    }
  })
})
