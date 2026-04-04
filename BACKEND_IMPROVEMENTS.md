# TIL — Backend Improvements Guide

A detailed walkthrough of every improvement made to the backend of this project, explaining **what** was changed, **why** it matters, and **what attack or problem it prevents**.

---

## Table of Contents

1. [Dual-Token Authentication (JWT)](#1-dual-token-authentication-jwt)
2. [Refresh Token Hashing](#2-refresh-token-hashing)
3. [Refresh Token Rotation](#3-refresh-token-rotation)
4. [Refresh Token Expiry + Automatic Cleanup](#4-refresh-token-expiry--automatic-cleanup)
5. [User Enumeration Fix](#5-user-enumeration-fix)
6. [HttpOnly Cookies for Refresh Tokens](#6-httponly-cookies-for-refresh-tokens)
7. [Environment-Aware Cookie Options](#7-environment-aware-cookie-options)
8. [Rate Limiting on Auth Endpoints](#8-rate-limiting-on-auth-endpoints)
9. [Helmet — HTTP Security Headers](#9-helmet--http-security-headers)
10. [CORS with Credentials](#10-cors-with-credentials)
11. [Input Validation with Zod](#11-input-validation-with-zod)
12. [Scoped Authorization on Posts](#12-scoped-authorization-on-posts)
13. [Selective Field Responses (select)](#13-selective-field-responses-select)
14. [Prisma Error Handling (P2002 / P2025)](#14-prisma-error-handling-p2002--p2025)
15. [Global Error Handler Middleware](#15-global-error-handler-middleware)
16. [Graceful Shutdown (SIGTERM)](#16-graceful-shutdown-sigterm)
17. [Paginated Posts Feed](#17-paginated-posts-feed)
18. [Database Schema Improvements](#18-database-schema-improvements)
19. [Project Structure & Separation of Concerns](#19-project-structure--separation-of-concerns)

---

## 1. Dual-Token Authentication (JWT)

**File:** `server/src/utils/createToken.ts`

### What changed
Two separate tokens are issued on every login or register:

- **Access Token** — short-lived (15 minutes), sent in the response body, used by the client to authenticate API calls via the `Authorization: Bearer <token>` header.
- **Refresh Token** — long-lived (7 days), sent as an HttpOnly cookie, used only to get a new access token when the old one expires.

```ts
const accessToken = jwt.sign({ payload }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
const refreshToken = jwt.sign({ payload }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
```

They also use **two different secrets** (`JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`), so a leaked access token cannot be used to forge a refresh token.

### Why it matters
If you only have one long-lived token and it gets stolen (e.g., intercepted in transit or from a log), the attacker has access for days or weeks. With this model, a stolen access token is only valid for 15 minutes. The refresh token, which is the long-lived credential, never touches JavaScript (it lives in an HttpOnly cookie).

---

## 2. Refresh Token Hashing

**File:** `server/src/utils/hashToken.ts`

### What changed
The raw refresh token is **never stored in the database**. Before persisting, it is hashed with SHA-256:

```ts
export const hashToken = (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};
```

The `hashedToken` field in the `RefreshToken` table stores only the digest.

### Why it matters
If an attacker gains read access to the database (SQL injection, a compromised backup, etc.), they get a list of SHA-256 hashes — not the actual tokens. Since JWT refresh tokens are long random strings, they are infeasible to reverse from a hash. This is the same principle as hashing passwords: you never store a secret in plaintext if you can avoid it.

---

## 3. Refresh Token Rotation

**File:** `server/src/controllers/auth.controllers.ts` → `refreshToken`

### What changed
Every time a client calls `POST /refresh-token`, the old token is **immediately revoked** and a brand new token is issued. Both the revocation and creation happen atomically via `Promise.all`:

```ts
await Promise.all([
  prisma.refreshToken.update({ where: { id: tokenInDb.id }, data: { isRevoked: true } }),
  prisma.refreshToken.create({ data: { hashedToken: hashedNew, userId, expiresAt } }),
]);
```

### Why it matters
Without rotation, a stolen refresh token is valid for its full 7-day lifetime. With rotation, the token is single-use: once used to get a new access token, the old refresh token is dead. If an attacker steals a refresh token and tries to use it *after* the legitimate user already refreshed, the server rejects it. This significantly reduces the window of exposure.

---

## 4. Refresh Token Expiry + Automatic Cleanup

**File:** `server/prisma/schema.prisma`, `server/src/controllers/auth.controllers.ts`

### What changed
The `RefreshToken` model has an `expiresAt` field set to 7 days from creation:

```ts
expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
```

On every refresh, the server validates both the `isRevoked` flag **and** the expiry date:

```ts
if (!tokenInDb || tokenInDb.isRevoked || tokenInDb.expiresAt < new Date()) {
  return res.status(401).json({ message: "Invalid token" });
}
```

After issuing a new token, expired or revoked tokens for that user are automatically deleted:

```ts
await prisma.refreshToken.deleteMany({
  where: {
    userId: tokenInDb.userId,
    OR: [{ isRevoked: true }, { expiresAt: { lt: new Date() } }],
  },
});
```

### Why it matters
Without expiry tracking in the database, if the JWT library had a bug or a token was tampered with, there would be no server-side way to enforce expiry. Storing `expiresAt` adds a second layer of validation independent of the JWT library. The cleanup prevents the `refresh_tokens` table from growing indefinitely — without it, every login would add a row that never gets removed.

---

## 5. User Enumeration Fix

**File:** `server/src/controllers/auth.controllers.ts` → `login`

### What changed
Both "user not found" and "wrong password" cases return the exact same response:

```ts
if (!userFound) {
  return res.status(401).json({ message: "Invalid credentials" });
}
if (!passwordMatch) {
  return res.status(401).json({ message: "Invalid credentials" });
}
```

### Why it matters
If the server returned different messages ("user does not exist" vs "wrong password"), an attacker could use the login endpoint to **enumerate valid email addresses** — just by observing which error they get. With this fix, both cases are indistinguishable from the outside. The attacker cannot tell whether the email exists in the system or not.

---

## 6. HttpOnly Cookies for Refresh Tokens

**File:** `server/src/utils/cookieOptions.ts`

### What changed
The refresh token is sent to the client as a cookie with `httpOnly: true`:

```ts
export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
```

### Why it matters
`httpOnly: true` means the cookie **cannot be read by JavaScript** — not by your code, not by third-party scripts, not by malicious code injected via XSS. This is critical because the refresh token is the long-lived credential. If it were stored in `localStorage` or a regular cookie, any XSS vulnerability in the frontend would expose it immediately.

---

## 7. Environment-Aware Cookie Options

**File:** `server/src/utils/cookieOptions.ts`

### What changed
The `secure` and `sameSite` attributes on the cookie change depending on `NODE_ENV`:

| Attribute | Development | Production |
|-----------|-------------|------------|
| `secure`  | `false`     | `true`     |
| `sameSite`| `"lax"`     | `"none"`   |

### Why it matters
- `secure: true` means the cookie will only be sent over HTTPS. In development you use HTTP (`localhost`), so setting `secure: true` would break your dev workflow — the cookie simply wouldn't be sent.
- `sameSite: "none"` is required when your frontend and backend are on different domains in production (cross-origin requests). But it only works when `secure: true`, which is why both change together.

This pattern avoids the common trap of hard-coding values that work in one environment but silently break in the other.

---

## 8. Rate Limiting on Auth Endpoints

**File:** `server/src/routes/auth.routes.ts`

### What changed
A rate limiter is applied to all auth routes, allowing a maximum of 10 requests per IP per 15 minutes:

```ts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Demasiados intentos, esperá 15 minutos" },
});
```

### Why it matters
Without rate limiting, an attacker can send thousands of login attempts per second to brute-force credentials or to test whether emails are registered. Rate limiting makes these attacks impractical by imposing a time cost. 10 attempts per 15 minutes is generous enough for legitimate users but prohibitively slow for automated attacks.

---

## 9. Helmet — HTTP Security Headers

**File:** `server/src/index.ts`

### What changed
```ts
app.use(helmet());
```

### Why it matters
Helmet automatically sets a collection of HTTP response headers that protect against common web attacks:

| Header | Protects against |
|--------|-----------------|
| `X-Content-Type-Options: nosniff` | MIME-type sniffing attacks |
| `X-Frame-Options: SAMEORIGIN` | Clickjacking |
| `Strict-Transport-Security` | Protocol downgrade attacks |
| `X-XSS-Protection` | Reflected XSS in older browsers |
| `Content-Security-Policy` | Code injection via resources |
| `Referrer-Policy` | Leaking URLs in referer headers |

None of these require you to write custom logic — Helmet handles all of them with one line.

---

## 10. CORS with Credentials

**File:** `server/src/index.ts`

### What changed
CORS is configured to only allow requests from the frontend origin, and it explicitly allows cookies:

```ts
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
```

### Why it matters
Without `credentials: true`, the browser will refuse to send cookies (including the refresh token cookie) on cross-origin requests. Without restricting `origin`, any website could make requests to your API on behalf of a logged-in user (CSRF). Using an environment variable for `CLIENT_URL` ensures the correct domain is allowed in each environment without hardcoding anything.

---

## 11. Input Validation with Zod

**Files:** `server/src/schemas/auth.schemas.ts`, `server/src/schemas/post.schema.ts`, `server/src/middlewares/validateSchema.ts`

### What changed
All endpoints that accept a body are protected by Zod schema validation via a reusable middleware:

```ts
export const validateSchema =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }
    return next();
  };
```

The **password schema** enforces strong passwords with a regex:
- Minimum 8 characters
- At least one uppercase letter (including Spanish characters like Ñ)
- At least one number
- At least one special character

The **post schema** enforces:
- Content between 10 and 280 characters
- Category must be one of the valid enum values

### Why it matters
Without validation, a user could send any shape of data to your API. This leads to:
- **Type errors** crashing the server at runtime
- **Invalid data** being persisted to the database
- **Security issues** like overposting (sending extra fields to overwrite data the user shouldn't control)

Zod validates the shape and content of the request before the controller runs, so controllers can safely assume the data is correct. The types inferred by Zod (`z.infer<typeof schema>`) are also used directly in TypeScript, keeping the validation and the type system in sync.

---

## 12. Scoped Authorization on Posts

**File:** `server/src/controllers/posts.controller.ts`

### What changed
Update and delete queries include `userId: req.userId!` in the `where` clause:

```ts
prisma.post.update({
  where: {
    id,
    userId: req.userId!, // only matches if this user owns the post
  },
  ...
})
```

### Why it matters
Without this, any authenticated user could update or delete any post by knowing its ID. This is a **Broken Object Level Authorization (BOLA / IDOR)** vulnerability — one of the most common API security issues. By filtering on `userId` at the database level, it is impossible for the query to succeed unless the authenticated user is the owner of that post. If the post exists but belongs to someone else, Prisma returns a "not found" error (P2025) and the controller responds with 404 — without revealing whether the post exists or not.

---

## 13. Selective Field Responses (select)

**Files:** `server/src/controllers/auth.controllers.ts`, `server/src/controllers/posts.controller.ts`

### What changed
Every Prisma query uses explicit `select` to control exactly which fields are returned:

```ts
prisma.user.create({
  data: { ... },
  select: { id: true, username: true, email: true, createdAt: true },
})
```

### Why it matters
Without `select`, Prisma returns **all fields** including `password` and `updatedAt`. Sending the hashed password to the client, even in a response the client might not display, is a significant security risk. If an attacker intercepts or logs the response, they have a hashed password they can attempt to crack offline. Explicit `select` ensures sensitive fields can never accidentally leak.

---

## 14. Prisma Error Handling (P2002 / P2025)

**File:** `server/src/controllers/auth.controllers.ts`, `server/src/controllers/posts.controller.ts`

### What changed

**P2002 — Unique constraint violation** (register):
```ts
if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
  const field = (error.meta?.target as string[])?.includes("email") ? "email" : "username";
  return res.status(409).json({ message: `Este ${field} ya está en uso` });
}
```

**P2025 — Record not found** (update/delete):
```ts
.catch((e) => {
  if (e.code === "P2025") return null;
  throw e;
});
```

### Why it matters
Without this handling, a duplicate email/username would cause an unhandled error that either crashes the request or returns a generic 500. The P2002 handler returns a clean 409 Conflict with a human-readable message. The P2025 handler gracefully returns 404 instead of a 500 crash when trying to update or delete a post that doesn't exist. Both patterns distinguish between **expected domain errors** (which get specific HTTP codes) and **unexpected errors** (which get re-thrown to the global handler).

---

## 15. Global Error Handler Middleware

**File:** `server/src/index.ts`

### What changed
```ts
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(["ERROR HANDLING"], err);
  return res.status(500).json({ message: "Algo salió mal" });
});
```

### Why it matters
Express has a special 4-argument middleware signature for error handling. Any unhandled error thrown inside a route (or passed via `next(error)`) will be caught here instead of crashing the process. Without this, an unexpected error would either return an empty response or expose a full stack trace to the client — which reveals internal implementation details useful to an attacker. This middleware logs the full error server-side while returning only a generic message to the client.

---

## 16. Graceful Shutdown (SIGTERM)

**File:** `server/src/index.ts`

### What changed
```ts
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

### Why it matters
When a container or process manager (Docker, PM2, Kubernetes) stops your server, it sends a `SIGTERM` signal. Without a handler, Node.js exits immediately, potentially leaving:
- Open database connections that the DB server has to time out
- In-flight requests that get abruptly cut off
- Prisma's connection pool in an inconsistent state

Listening for `SIGTERM` and explicitly calling `prisma.$disconnect()` ensures the database connection pool is properly closed before the process exits.

---

## 17. Paginated Posts Feed

**File:** `server/src/controllers/posts.controller.ts` → `getPosts`

### What changed
Instead of returning all posts in one query, the feed is paginated using `skip`/`take` and a `$transaction` to fetch both the data and the total count atomically:

```ts
const POSTS_PER_PAGE = 10;
const page = Math.max(1, parseInt(req.query.page as string) || 1);
const skip = (page - 1) * POSTS_PER_PAGE;

const [posts, total] = await prisma.$transaction([
  prisma.post.findMany({ skip, take: POSTS_PER_PAGE, ... }),
  prisma.post.count(),
]);
```

The response includes full pagination metadata:
```json
{
  "pagination": {
    "total": 47,
    "page": 2,
    "totalPages": 5,
    "hasNext": true
  }
}
```

### Why it matters
Without pagination, as the number of posts grows, a single request to `GET /posts` would eventually try to load thousands of records into memory, serialize them all to JSON, and send them over the wire. This is a **performance and reliability** issue. `Math.max(1, ...)` prevents negative page numbers. Using `$transaction` for the count + data ensures both numbers come from the same consistent snapshot of the database.

---

## 18. Database Schema Improvements

**File:** `server/prisma/schema.prisma`

### What changed

| Model | Improvement | Reason |
|-------|-------------|--------|
| `User` | `updatedAt @updatedAt` | Track when profiles were last modified |
| `Post` | `content @db.VarChar(280)` | Enforces the 280-char limit at the database level, not just in application code |
| `Post` | `onDelete: Cascade` | Deleting a user automatically deletes their posts |
| `RefreshToken` | `hashedToken @db.VarChar(64)` | SHA-256 produces exactly 64 hex characters — explicit typing prevents unbounded strings |
| `RefreshToken` | `expiresAt DateTime` | Server-side expiry independent of JWT claims |
| `RefreshToken` | `isRevoked Boolean @default(false)` | Token blacklisting for logout and rotation |
| `RefreshToken` | `onDelete: Cascade` | Deleting a user automatically cleans up their tokens |
| All models | CUID `@id @default(cuid())` | Non-sequential IDs that don't expose record counts or allow enumeration |

### Why it matters
Database constraints are your last line of defense — they enforce data integrity even if application-level validation fails or is bypassed. `Cascade` deletes prevent orphaned records. `VarChar(280)` prevents unbounded storage. CUID prevents attackers from guessing IDs by incrementing a number.

---

## 19. Project Structure & Separation of Concerns

### What changed
The codebase is organized into distinct layers:

```
server/src/
├── controllers/    # Business logic (what to do with a request)
├── routes/         # URL definitions + middleware composition
├── middlewares/    # Reusable request processing (authenticate, validateSchema)
├── schemas/        # Zod validation schemas + inferred TypeScript types
├── utils/          # Pure functions (createToken, hashToken, cookieOptions)
├── lib/            # Singleton instances (prisma client)
├── types/          # Shared TypeScript types
└── index.ts        # App bootstrap
```

### Why it matters
Separation of concerns makes the codebase maintainable and testable:

- **Controllers** don't know about routing or validation — they just handle data.
- **Middlewares** are reusable — `authenticate` and `validateSchema` work on any route.
- **Schemas** are the single source of truth for both runtime validation and TypeScript types (via `z.infer`).
- **Utils** are pure functions that are easy to unit test in isolation.
- **`lib/prisma.ts`** ensures only one Prisma client instance exists in the process, preventing connection pool exhaustion.

---

## Summary

| Category | Improvements |
|----------|-------------|
| Authentication | Dual-token JWT, refresh token rotation, hashing, expiry, blacklisting |
| Security | Helmet, CORS, rate limiting, HttpOnly cookies, user enumeration fix, IDOR prevention |
| Validation | Zod schemas, password strength, type-safe inference |
| Database | Cascade deletes, VarChar constraints, updatedAt, CUID, expiresAt |
| Reliability | Global error handler, graceful shutdown, Prisma error codes |
| Performance | Pagination with count transaction |
| Architecture | Separation of concerns, reusable middleware, utils |
