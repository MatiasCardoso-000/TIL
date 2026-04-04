# TIL — Frontend Improvements Guide

A detailed walkthrough of every improvement made to the frontend of this project, explaining **what** was changed, **why it matters**, and **what problem it prevents**.

---

## Table of Contents

1. [apiFetch — Centralized Fetch Wrapper](#1-apifetch--centralized-fetch-wrapper)
2. [In-Memory Access Token Storage](#2-in-memory-access-token-storage)
3. [React StrictMode-Safe Auth Initialization](#3-react-strictmode-safe-auth-initialization)
4. [Create Post Endpoint Usage (/api/posts)](#4-create-post-endpoint-usage-apiposts)
5. [Client-Side Post Validation + Error Display](#5-client-side-post-validation--error-display)
6. [Auth Header Merging in apiFetch](#6-auth-header-merging-in-apifetch)

---

## 1. apiFetch — Centralized Fetch Wrapper

**File:** `client/src/lib/api.ts`, `client/src/context/AuthProvider.tsx`

### What changed
All HTTP calls go through a single `apiFetch` function instead of raw `fetch`:

```ts
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
  if (!res.ok) throw new Error(body.message ?? 'Request failed')
  return body as T
}
```

The `AuthProvider` uses `apiFetch` for its initialization requests instead of raw `fetch` with a hardcoded `http://localhost:5174` URL.

### Why it matters
Hardcoding `http://localhost:5174` in the `AuthProvider` had two problems: it breaks in production, and it bypasses the Vite proxy configuration. Using `apiFetch` with a relative `/api` path ensures every request routes correctly through the proxy in development and through the real domain in production — without changing any code between environments.

`apiFetch` also centralizes three cross-cutting concerns: `credentials: 'include'` (so cookies are always sent), JSON parsing, and error handling. Without a wrapper, every `fetch` call would need to remember all three.

---

## 2. In-Memory Access Token Storage

**File:** `client/src/context/AuthContext.tsx`, `client/src/lib/useApi.ts`

### What changed
The `accessToken` lives in React state (in-memory), not in `localStorage` or a cookie:

```ts
const [auth, setAuth] = useState<AuthState>({
  user: null,
  accessToken: null,
});
```

The `useApi` hook reads the token from context and injects it automatically into every authenticated request:

```ts
export function useApi() {
  const { accessToken } = useAuth()
  return function authFetch<T>(path: string, options?: RequestInit): Promise<T> {
    return apiFetch<T>(path, {
      ...options,
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : null),
        ...options?.headers,
      },
    })
  }
}
```

### Why it matters
`localStorage` is accessible from any JavaScript running on the page. A single XSS vulnerability exposes the token immediately and permanently. In-memory storage (React state) is invisible to scripts — it disappears when the tab closes and cannot be read by injected code. The `useApi` hook means components never handle tokens directly, keeping the authorization concern in one place.

---

## 3. React StrictMode-Safe Auth Initialization

**File:** `client/src/context/AuthProvider.tsx`

### What changed
The `AuthProvider` uses a `useRef` guard to prevent double initialization, and does **not** pass an `AbortController` signal to the initialization requests:

```ts
const initialized = useRef(false);

useEffect(() => {
  if (initialized.current) return;
  initialized.current = true;

  const checkLogin = async () => {
    try {
      const token = await apiFetch<{ accessToken: string }>('/refresh-token', { method: 'POST' });
      const user = await apiFetch<User>('/me', {
        headers: { Authorization: `Bearer ${token.accessToken}` },
      });
      setAuth({ user, accessToken: token.accessToken });
    } catch {
      // no active session — stay logged out
    } finally {
      setIsInitializing(false);
    }
  };

  checkLogin();
}, []);
```

### Why it matters
React StrictMode in development intentionally mounts, unmounts, and remounts every component to detect side effects. Without the `useRef` guard, `checkLogin` runs twice. With refresh token rotation enabled, the first call rotates the token; the second call finds the rotated token already revoked and gets a 401 — leaving the user logged out even though they had a valid session.

The `AbortController` signal must **not** be passed to initialization requests. In StrictMode the cleanup (`controller.abort()`) runs between the two mounts, canceling the first request before it completes. The `useRef` guard then prevents the second mount from running a new request. Result: no request ever completes, `isInitializing` stays `true` forever, and the session is never restored.

The rule: `AbortController` is appropriate for user-cancellable requests (search, filters, navigation). Auth initialization must always complete.

---

## 4. Create Post Endpoint Usage (/api/posts)

**File:** `client/src/components/Form.tsx`, `client/src/lib/api.ts`

### What changed
The post creation flow uses the `/api/posts` endpoint through the shared fetch helpers:

```ts
authFetch('/posts', {
  method: 'POST',
  body: JSON.stringify({ content, category }),
})
```

`authFetch` resolves to `apiFetch`, which prefixes `/api` and sends credentials by default.

### Why it matters
Using the shared helpers keeps request semantics consistent (cookies included, JSON parsing, error handling), and avoids hardcoding environment-specific URLs in components. It also makes it clear that post creation is an authenticated action that must attach the access token.

---

## 5. Client-Side Post Validation + Error Display

**File:** `client/src/components/Form.tsx`

### What changed
Before sending a post, the form enforces a 10-character minimum and surfaces a clear inline error:

```ts
const trimmed = content.trim();
if (trimmed.length < 10) {
  setError('El contenido debe al menos tener 10 caracteres');
  return;
}
```

The error renders directly under the form in a monospace, high-contrast style for visibility.

### Why it matters
This prevents avoidable round trips for obvious invalid input and gives the user immediate feedback. It also mirrors the backend constraints, reducing confusion when a post is rejected server-side.

---

## 6. Auth Header Merging in apiFetch

**File:** `client/src/lib/api.ts`, `client/src/lib/useApi.ts`

### What changed
`apiFetch` merges caller-provided headers instead of overwriting them, which preserves the `Authorization` header injected by `useApi`:

```ts
headers: {
  'Content-Type': 'application/json',
  ...options?.headers ?? {},
},
```

### Why it matters
Auth flows frequently need to add headers (Authorization, CSRF tokens, etc.). If `apiFetch` replaced headers entirely, any authenticated request would lose its token and fail with 401s. Merging keeps auth concerns centralized while still allowing per-request customization.

---

## Summary

| Category | Improvements |
|----------|-------------|
| Networking | apiFetch wrapper, consistent `/api` routing, unified error handling |
| Auth | In-memory access token, StrictMode-safe initialization, header merging |
| UX | Inline form validation + error display |
| Posting | Authenticated create post flow via `/api/posts` |
