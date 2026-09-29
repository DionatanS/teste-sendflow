/** Divide um array em lotes de até `size` itens — usado para respeitar o limite de 500 escritas por batch do Firestore. */
export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}
