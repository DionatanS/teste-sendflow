export const PAGE_SIZE = 10

/** Próximo limite de página ao clicar "carregar mais" — cresce a janela do listener em tempo real. */
export function nextPageLimit(currentLimit: number): number {
  return currentLimit + PAGE_SIZE
}

/** Heurística padrão: se a página voltou cheia, provavelmente há mais itens. */
export function hasMorePages(itemCount: number, currentLimit: number): boolean {
  return itemCount >= currentLimit
}
