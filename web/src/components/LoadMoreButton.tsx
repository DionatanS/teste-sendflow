import { Box, Button } from '@mui/material'

type LoadMoreButtonProps = {
  hasMore: boolean
  onClick: () => void
}

export function LoadMoreButton({ hasMore, onClick }: LoadMoreButtonProps) {
  if (!hasMore) return null

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Button onClick={onClick} size="small">
        Carregar mais
      </Button>
    </Box>
  )
}
