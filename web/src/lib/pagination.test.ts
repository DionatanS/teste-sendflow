import { describe, expect, it } from 'vitest'
import { PAGE_SIZE, hasMorePages, nextPageLimit } from './pagination'

describe('nextPageLimit', () => {
  it('grows the limit by one page size', () => {
    expect(nextPageLimit(PAGE_SIZE)).toBe(PAGE_SIZE * 2)
    expect(nextPageLimit(0)).toBe(PAGE_SIZE)
  })
})

describe('hasMorePages', () => {
  it('is true when the page came back full', () => {
    expect(hasMorePages(PAGE_SIZE, PAGE_SIZE)).toBe(true)
  })

  it('is false when fewer items than the limit were returned', () => {
    expect(hasMorePages(3, PAGE_SIZE)).toBe(false)
  })

  it('is false for an empty result', () => {
    expect(hasMorePages(0, PAGE_SIZE)).toBe(false)
  })
})
