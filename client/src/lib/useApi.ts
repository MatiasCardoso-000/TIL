import { useAuth } from '../hooks/useAuth'
import { apiFetch } from './api'

export function useApi() {
  const { accessToken } = useAuth()

  return function authFetch<T>(path: string, options?: RequestInit): Promise<T> {
    return apiFetch<T>(path, {
      ...options,
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options?.headers,
      },
    })
  }
}
