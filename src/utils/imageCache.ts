// src/utils/imageCache.ts
const cache: Record<string, string> = {}

export async function fetchAuthenticatedImage(filePath: string, token: string, baseUrl: string): Promise<string> {
  if (cache[filePath]) return cache[filePath]

  const response = await fetch(`${baseUrl}${filePath}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const blob = await response.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const uri = reader.result as string
      cache[filePath] = uri  // simpan di cache
      resolve(uri)
    }
    reader.readAsDataURL(blob)
  })
}