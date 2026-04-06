# Frontend Improvements

This document summarizes the frontend changes and behaviors implemented in the TIL app.

## API

- `apiFetch` wrapper handles JSON requests and responses.
- If a `headers` object is passed, `apiFetch` merges it with default headers instead of replacing them.
- Auth uses in-memory token storage (no localStorage/sessionStorage).

## Auth

- Auth initialization is StrictMode-safe and avoids duplicate work on re-mount.
- `/me` returns a `User` object when authenticated.

## Posts

- Create post endpoint: `POST /api/posts`.
- Minimum content length is 10 characters; validation errors display in the UI.

## Form UX

- Form shows a loading spinner with a minimum visible time of 500ms to avoid flicker.
