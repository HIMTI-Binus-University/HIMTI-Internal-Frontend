# HIMTI Internal — Frontend CLAUDE.md

## Overview

React + TypeScript frontend for HIMTI (Himpunan Mahasiswa Teknik Informatika) at BINUS University's internal tools platform. Currently ships Google OAuth login and a URL shortener. Designed to be extended with additional internal tools (dashboard, email blaster, certificate generator, etc.).

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 5 (port 3000) |
| Routing | React Router DOM 6 |
| Server State | TanStack React Query 5 |
| Auth | Better Auth 1.4 (Google OAuth) |
| HTTP | Axios 1.6 |
| Styling | Tailwind CSS 3 |
| Deploy | Docker (Node → Nginx) + GitHub Actions |

---

## Directory Structure

```
src/
├── api/                      # React Query hooks, one folder per feature
│   ├── auth/queries.ts
│   └── url-shortener/queries.ts
├── components/
│   ├── Utils/                # Shared UI: Button, Sidebar, Popup, ProtectedRoute, LinkDetails
│   └── icons/                # Custom SVG icon components
├── config/
│   ├── api-client.ts         # Axios instance (base URL, 10s timeout, Bearer interceptor)
│   ├── react-query.ts        # QueryClient (5min stale, 1min cache)
│   └── routes.ts             # Route definitions with permission metadata
├── constants/
│   ├── api.ts                # API endpoint strings
│   ├── api-service.ts        # Env-specific base URL (gitignored variants per env)
│   └── keys.ts               # App key selector (gitignored variants per env)
├── hooks/                    # Feature-level custom hooks (wrap mutations with local state)
│   └── url-shortener/
├── pages/
│   ├── home/
│   ├── login/
│   └── url-shortener/
├── types/                    # TypeScript interfaces (route, auth, api, models)
└── utils/
    └── auth-client.ts        # Better Auth client init
```

---

## Routing & Permissions

Routes are defined in `src/config/routes.ts`. Each route has:

```ts
{
  key: string
  title: string
  path: string
  component: React.FC
  isEnabled: boolean
  isProtected: boolean
  requiredPermission?: HimtiPermission
}
```

**`HimtiPermission` union type values:**
- `manage_urls`
- `manage_users`
- `create_events`
- `view_dashboard`

`ProtectedRoute` checks for an active Better Auth session and validates the user's permission. No session → `/login`. Missing permission → `/`.

---

## API Layer Pattern

- All API hooks live in `src/api/<feature>/queries.ts`
- Queries → `useQuery`, mutations → `useMutation`
- Query keys: array format `["resource", "subtype"]`
- Mutations accept optional second param for `onSuccess`/`onError`
- Invalidate related queries inside mutation `onSuccess`

```ts
// Standard pattern
export const useCreateUrl = (options?: MutationOptions) =>
  useMutation({ mutationFn: (data) => apiClient.post(...), ...options })
```

---

## Auth

- Library: Better Auth (`src/utils/auth-client.ts`)
- Provider: Google OAuth
- Token stored in `localStorage`
- User + permissions fetched from `GET /api/registration/me`
- `withCredentials: true` on all requests

---

## Styling Conventions

Tailwind only — no CSS Modules, no Styled Components.

**Custom tokens (`tailwind.config.js`):**
- `primary-*`: HIMTI brand blue (`#415ba8` → `#1b2647`)
- `danger-*`: `#d14545`, `#b83a3a`
- `warning-*`: `#efb100`, `#d39b00`
- `grayscale-*`: Neutral scale
- Typography: `h1`–`h6`, `body-1`–`body-3` as Tailwind classes
- Font: Public Sans

---

## Naming Conventions

| Item | Convention |
|------|-----------|
| Components | `PascalCase` |
| Files | `kebab-case` or `index.tsx` |
| Custom hooks | `useFeatureName` |
| Mutation hooks | `useMutation<Action><Object>` |
| Query keys | `["resource", "subtype"]` |
| Event handler props | `on<Action>` (e.g., `onEdit`, `onDelete`) |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend API base URL |

See `.env.example`. Environment-specific files (`api-service-dev.ts`, etc.) are gitignored; `src/constants/api-service.ts` acts as a selector.

---

## Dev Scripts

```bash
npm run dev           # Dev server at http://localhost:3000
npm run build         # Production build (runs tsc first)
npm run build:dev     # Dev-mode build
npm run build:staging # Staging build
npm run lint          # ESLint
npm run preview       # Preview prod build
```

---

## Adding a New Feature / Page

1. Add types → `src/types/<feature>.ts`
2. Add endpoints → `src/constants/api.ts`
3. Add React Query hooks → `src/api/<feature>/queries.ts`
4. Add custom hooks if needed → `src/hooks/<feature>/`
5. Build page → `src/pages/<feature>/index.tsx`
6. Register route → `src/config/routes.ts` (set `requiredPermission`)
7. Add sidebar nav item → `src/components/Utils/Sidebar.tsx`

---

## Current Features

| Feature | Route | Permission |
|---------|-------|-----------|
| Login (Google OAuth) | `/login` | public |
| Home | `/` | public |
| URL Shortener | `/url-shortener` | `manage_urls` |

**Scaffolded but not built:** Dashboard, Email Blaster, Certificate Generator.

---

## Docker / Deployment

- Multi-stage: Node 20-alpine (build) → Nginx (serve)
- `VITE_API_URL` passed as build arg
- Image registry: `ghcr.io/himti-binus-university/...`
- CI/CD: `.github/workflows/deploy-pipeline.yml`
