export const BASE_URL = '/api'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers ?? {},
    },
  })
  
  const body = await res.json().catch(() => ({}))
  
  if (!res.ok) {
    throw new Error(body.message ?? 'Request failed')
  }

  return body as T
}
