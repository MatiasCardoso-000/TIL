export const BASE_URL = "/api";

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
  const { errors } = body;
  console.log(errors);

  if (!res.ok) {
    const error: any = new Error(body.errors ?? "Request failed");
    error.data = body;
    throw error;
  }

  return body as T;
}
