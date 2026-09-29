import type { PaletteMode } from '@mui/material/styles'

export const COLOR_MODE_STORAGE_KEY = 'sendflow-color-mode'

/** Resolve o modo inicial: preferência salva pelo usuário > preferência do sistema > 'light'. */
export function resolveInitialColorMode(
  storedValue: string | null,
  prefersDark: boolean,
): PaletteMode {
  if (storedValue === 'light' || storedValue === 'dark') return storedValue
  return prefersDark ? 'dark' : 'light'
}

export function toggleColorMode(mode: PaletteMode): PaletteMode {
  return mode === 'light' ? 'dark' : 'light'
}
