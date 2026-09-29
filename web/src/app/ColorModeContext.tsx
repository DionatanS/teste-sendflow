import type { PaletteMode } from '@mui/material/styles'
import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react'
import { COLOR_MODE_STORAGE_KEY, resolveInitialColorMode, toggleColorMode } from './colorMode'

type ColorModeContextValue = {
  mode: PaletteMode
  toggle: () => void
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null)

function readInitialMode(): PaletteMode {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return resolveInitialColorMode(stored, prefersDark)
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(readInitialMode)

  useEffect(() => {
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode)
  }, [mode])

  const value = useMemo<ColorModeContextValue>(
    () => ({ mode, toggle: () => setMode(toggleColorMode) }),
    [mode],
  )

  return <ColorModeContext value={value}>{children}</ColorModeContext>
}

export function useColorMode() {
  const context = use(ColorModeContext)
  if (!context) {
    throw new Error('useColorMode deve ser usado dentro de um ColorModeProvider')
  }
  return context
}
