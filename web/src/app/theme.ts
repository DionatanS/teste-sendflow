import { createTheme, type PaletteMode } from '@mui/material/styles'

export function getTheme(mode: PaletteMode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#4f46e5' },
    },
    shape: {
      borderRadius: 8,
    },
  })
}
