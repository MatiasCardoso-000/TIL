# Frontend Improvements

This document describes the frontend behavior that is actually present today in the TIL app. It focuses on what each piece does in the UI and how it connects to the current API contract.

## API Layer

### `apiFetch` (`client/src/lib/api.ts`)

- All frontend requests go through `apiFetch(path, options)`.
- It prefixes every request with `"/api"`, so the client always talks to the backend through the same base path.
- It always sends `credentials: "include"`, which allows the browser to send the refresh-token cookie automatically.
- It sets `Content-Type: application/json` by default and merges custom headers instead of replacing them.
- It tries to parse the response as JSON even on failures, then throws an `Error` with the backend payload attached in `error.data`.

What this does:
It gives the app one consistent place to handle JSON requests, cookies and backend errors, so pages do not have to repeat that logic.

### `useApi` (`client/src/lib/useApi.ts`)

- `useApi` reads the current in-memory `accessToken` from auth context.
- If a token exists, it injects `Authorization: Bearer <token>` into the request headers.
- If there is no token, it still uses `apiFetch`, but without the auth header.

What this does:
It keeps protected requests simple. Components can call `authFetch(...)` without manually assembling auth headers every time.

## Authentication State

### `AuthProvider` (`client/src/context/AuthProvider.tsx`)

- Auth state is stored in React state, not in `localStorage` or `sessionStorage`.
- On app startup, the provider calls `POST /refresh-token` to try to recover a fresh access token from the HttpOnly refresh-token cookie.
- If refresh succeeds, it immediately calls `GET /me` with the new access token and stores the returned user.
- It exposes `login(user, accessToken)`, `logout()` and `isInitializing` through context.
- It uses a `useRef` guard so initialization only runs once, which avoids duplicate bootstrap work in React StrictMode.

What this does:
The app can restore a logged-in session after a page refresh without exposing the long-lived refresh token to JavaScript.

### Auth contract currently used by the frontend

- `POST /login` returns `{ user, accessToken }`.
- `POST /register` returns `{ user, accessToken }`.
- `POST /refresh-token` returns `{ accessToken }`.
- `GET /me` returns the authenticated `User` object with `id`, `username`, `email`, `avatarUrl`, `bio` and `createdAt`.
- `POST /logout` clears the server-side session path by revoking the refresh token and the frontend then clears in-memory auth state.

What this does:
The frontend works with a short-lived access token in memory and relies on the secure cookie only for session recovery.

## Routing And Route Protection

### `App.tsx`

- `/login` renders `LoginPage`.
- `/register` renders `RegisterPage`.
- `/` is wrapped in `PrivateRoute` and only renders `FeedPage` when an access token exists.
- While auth bootstrap is running, `PrivateRoute` returns `null` to avoid redirecting too early.
- Unknown routes redirect back to `/`.

What this does:
Protected screens wait for auth initialization before deciding whether the user belongs in the feed or should be redirected to login.

## Auth UI

### Shared auth layout (`client/src/components/AuthLayout.tsx`)

- Login and register pages share the same `AuthLayout` shell.
- The layout renders the TIL branding, divider lines, footer navigation and animated entry classes (`fade-*`).
- It accepts a `variant` (`login` or `register`) so both screens can reuse the same structure with different copy.
- It exports `EyeIcon`, which switches between open/closed-eye icons depending on password visibility state.

What this does:
It keeps authentication screens visually consistent and avoids duplicating layout code.

### Login page (`client/src/pages/LoginPage.tsx`)

- Uses React Query `useMutation` for `POST /login`.
- On success, it saves the returned user and access token into auth context and navigates to `/`.
- Includes a password visibility toggle using the shared eye button.
- Shows a generic login error through `ErrorMessage` when the request fails.

What this does:
It gives the login flow a clear loading/error state and immediately hydrates auth context after a successful response.

### Register page (`client/src/pages/RegisterPage.tsx`)

- Uses React Query `useMutation` for `POST /register`.
- On success, it logs the user in directly and redirects to `/`.
- Supports password and confirm-password visibility toggles independently.
- Shows a small helper text explaining the password rules: minimum 8 characters, uppercase, number and symbol.
- Reads `error.data.errors` from backend validation responses and stores them in `fieldErrors`.
- Displays field-level messages for password, confirm password, username and general errors.

What this does:
It lets the backend remain the source of truth for validation while still showing friendly, specific feedback in the UI.

### Error rendering (`client/src/components/ErrorMessage.tsx`)

- In `register` mode, it renders each validation message returned by the backend field by field.
- In `login` mode, it renders a single generic message.
- Errors are wrapped in `role="alert"` so they are announced as important feedback.

What this does:
Registration can show multiple validation issues at once instead of collapsing them into one vague error.

## Feed And Post Listing

### Feed page (`client/src/pages/FeedPage.tsx`)

- The feed is protected and fetched through `useApi`, so requests include the current access token.
- Posts are loaded with React Query using the key `["posts", page]`.
- The page sends `GET /posts?page=<page>` and expects `{ posts, pagination }`.
- Pagination UI uses `pagination.totalPages` and `pagination.hasNext` to enable/disable navigation.
- Empty and loading states are rendered directly in the page.
- Post timestamps are formatted into compact relative labels such as `ahora`, `5m`, `2h` or `3d`.

What this does:
The feed stays simple to navigate and only asks the backend for one page of posts at a time.

### Visual styling in the feed

- The page injects Google Fonts (`IBM Plex Mono` and `Instrument Serif`) on mount.
- It defines its visual system inline: dark grid background, sticky glass-like header, category badges and subtle fade animations.
- Categories are mapped from backend enum values such as `TECNOLOGIA` to readable Spanish labels such as `Tecnologia`.

What this does:
The feed has a custom editorial look instead of a default scaffolded UI, and backend enum values are turned into readable labels for people.

### Header (`client/src/components/Header.tsx`)

- Shows the TIL brand, the current username and a `Salir` button.
- Logout calls `POST /logout` and then clears client auth state even if the request fails.

What this does:
The header is the visible session control for authenticated users and keeps logout behavior immediate on the client.

## Current Post Composer State

### Shared form wrapper (`client/src/components/Form.tsx`)

- The current exported `Form` component is only a thin `<form onSubmit={handleSubmit}>{children}</form>` wrapper.
- Login and register pages use it correctly as a shared wrapper.
- The file still contains a large commented block from an older post-composer implementation, including local validation, character counting, submit loading state and query invalidation.

What this does:
Today it only helps share form markup between auth pages. The commented block shows previous composer logic, but that logic is not active.

### Post creation in the current frontend

- `FeedPage` still renders a `Nueva entrada` section and includes `<Form />` visually.
- However, there are no active textarea/select/button controls wired in that section right now.
- The backend still supports `POST /api/posts` with Zod validation: `content` must be between 10 and 280 characters and `category` must be valid.
- There is also a `PostProvider` / `PostContext` pair in the client, but the current feed implementation is not using it for an active composer flow.

What this means today:
The frontend currently has a paginated read flow for posts, but the post creation UI is not connected even though supporting backend endpoints and some leftover client scaffolding still exist.

## Validation And UX Notes

- Backend auth validation is surfaced in the frontend through structured `errors` payloads.
- Register flow supports multiple simultaneous field errors.
- Login flow intentionally shows a generic credential error.
- The old 500ms minimum spinner behavior for post submission is present only inside commented code in `Form.tsx`; it is not part of the active UI today.

What this does:
Current UX improvements are mainly concentrated in authentication. The earlier post-submission polish is not active in the current code path.

## Post Deletion

### Delete functionality (`client/src/pages/FeedPage.tsx`)

- Uses React Query `useMutation` to send `DELETE /posts/{postId}` requests.
- On success, it manually updates the cache using `queryClient.setQueryData()` to filter out the deleted post from the list.
- Tracks error state with `useState(false)` to show error messages.
- Shows an error message "Hubo un error. Por favor intenta de nuevo." at the top of the feed when deletion fails.
- Uses `setTimeout` to auto-hide the error message after 4 seconds.
- Delete button is connected to the mutation with `onClick={() => deletePostMutation.mutate(post.id)}`.

What this does:
Users can delete their own posts with immediate visual feedback. If the delete fails, a clear error message appears and disappears automatically.

## Post Editing (Inline)

### Edit functionality (`client/src/pages/FeedPage.tsx`)

- Tracks which post is being edited with `useState<number | null>(null)` (`editingPostId`).
- Tracks the editing text content with `useState("")` (`editContent`).
- When edit button is clicked, it sets `editingPostId` and loads the post's current content into `editContent`.
- Uses conditional rendering to show either the normal post view or an edit form (textarea + Save/Cancel buttons).
- Textarea has a character limit of 280 characters (`MAX_CHARS = 280`).
- Uses React Query `useMutation` to send `PUT /posts/{postId}` requests with `JSON.stringify({ content: editContent })`.
- On success, it manually updates the cache using `queryClient.setQueryData()` with `.map()` to replace the updated post content, then clears the editing state (`setEditingPostId(null)`, `setEditContent("")`, `setFieldErrors({})`).
- On error, it sets `fieldErrors` to show validation errors from the backend.
- Cancel button resets both `editingPostId` and `editContent` to exit edit mode.

What this does:
Users can edit their posts inline without leaving the page. Changes are saved immediately with visual feedback, and validation errors appear if the content is invalid.

## Profile Page

### Profile page (`client/src/pages/ProfilePage.tsx`)

- Displays user information: username, email, avatar, and bio.
- Uses React Query `useQuery` to fetch user data from `GET /me`.
- Uses React Query `useQuery` to fetch user's posts from `GET /posts?mine=true`.
- Avatar uses `ui-avatars.com` as fallback when user has no avatar.
- Styled with CSS classes: `.profile-card`, `.profile-avatar`, `.profile-info`, `.profile-username`, `.profile-email`, `.profile-bio`, `.profile-posts-title`, `.profile-post-item`, `.profile-post-content`, `.profile-post-meta`, `.profile-post-category`, `.profile-post-date`.

What this does:
Users can view their profile information and their own posts in one place.

### Backend: Filter user's posts (`server/src/controllers/posts.controller.ts`)

- Added support for `mine=true` query parameter in `GET /posts`.
- When `mine === "true"`, filters posts by `req.userId`.
- Both `findMany` and `count` queries use the conditional filter.

What this does:
The same endpoint can return all posts or only the current user's posts based on the query parameter.
