export const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

type ErrorType = Error & {
  data?: unknown;
};

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  const body = await res.json().catch(() => ({}));
 

  if (!res.ok) {
    const error: ErrorType = new Error(body.errors ?? "Request failed");

    error.data = body;
    throw error;
  }

  return body as T;
}

