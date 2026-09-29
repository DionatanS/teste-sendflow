import { describe, expect, it } from 'vitest'
import { resolveInitialColorMode, toggleColorMode } from './colorMode'

describe('resolveInitialColorMode', () => {
  it('uses the stored preference when valid', () => {
    expect(resolveInitialColorMode('dark', false)).toBe('dark')
    expect(resolveInitialColorMode('light', true)).toBe('light')
  })

  it('falls back to system preference when nothing stored', () => {
    expect(resolveInitialColorMode(null, true)).toBe('dark')
    expect(resolveInitialColorMode(null, false)).toBe('light')
  })

  it('ignores garbage stored values and falls back to system preference', () => {
    expect(resolveInitialColorMode('sepia', true)).toBe('dark')
  })
})

describe('toggleColorMode', () => {
  it('flips between light and dark', () => {
    expect(toggleColorMode('light')).toBe('dark')
    expect(toggleColorMode('dark')).toBe('light')
  })
})
