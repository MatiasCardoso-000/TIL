const BASE_URL = 'http://localhost:3000/api'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(body.message ?? 'Request failed')
  }

  return body as T
}
