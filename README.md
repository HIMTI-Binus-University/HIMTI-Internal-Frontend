# HIMTI Internal Frontend

React web application for HIMTI Binus University's internal administration
platform. It provides authenticated tools for membership, access control,
events, and links while also serving the public landing and short-link routes.

## Features

- Public landing page and Google OAuth sign-in
- Registration-completion access flow
- User directory, member details, filtering, summaries, and export
- Role and permission administration
- Membership period and registration-resource management
- Event and sub-event creation, editing, ordering, and workspaces
- URL shortening and click-management tools
- Shared link workspaces with member and link administration
- Dedicated short-link host behavior and local `/link/:shortCode` routes
- Responsive reusable UI components, markdown rendering, and accessible dialogs

### Event Feature Status

Event administration uses the backend API, including event editing, lifecycle
transitions, organizers, registration settings, packages, registrations, and
attendance. Authenticated event workflows require the running backend.

## Stack

- Node.js `22.22.2` and npm `10.9.7`
- React 18, TypeScript, Vite 5
- React Router and TanStack Query
- Axios and Better Auth
- Tailwind CSS, Radix UI, Base UI, and GSAP
- Vitest and Testing Library
- Nginx for the production container

## Prerequisites

For native development:

- Node.js `22.22.2`
- npm `10.9.7`
- A running HIMTI Internal backend for authenticated features

Using `nvm` is recommended:

```bash
nvm install
nvm use
npm --version
```

For containerized development, install Docker Engine with Docker Compose v2.

## Environment

Create a local environment file:

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend origin, normally `http://localhost:8000` |
| `VITE_ADMIN_APP_URL` | Internal frontend origin |
| `VITE_LINK_APP_URL` | Dedicated short-link origin; use the frontend origin locally |
| `VITE_OFOG_URL` | External OFOG application origin |
| `VITE_REGISTRATION_APP_URL` | Registration application origin |
| `VITE_LOCAL_LINK_BASE_PATH` | Absolute local path used for short links |
| `FRONTEND_PORT` | Local Docker host port; defaults to `3000` |

Every `VITE_*` value is public browser configuration and must never contain
secrets. For native Vite development, restart the dev server after changing
`.env`. For Docker development, recreate the service with
`docker compose up -d --force-recreate app` so Compose reloads the environment.
Production values are embedded at build time; rebuild the Nginx image after
changing them.

The backend must allow the exact frontend origin with credentialed CORS. Better
Auth and Google OAuth must also trust the served origin and callback URL.

## Run Locally Without Docker

1. Install the exact locked dependencies:

   ```bash
   npm ci
   ```

2. Start the Vite development server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000`.

The application can render public routes without the backend, but login and all
protected tools require the backend at `VITE_API_BASE_URL`.

## Run With Docker

Run these commands from this repository's frontend directory. The default
`docker-compose.yml` builds the Dockerfile's `development` target and runs Vite
with the source mounted into `/app`, providing hot module replacement (HMR):

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
```

Open `http://localhost:3000`. `docker compose build` only builds the development
image; it does not start Vite or any containers. The optional explicit invocation
`docker compose -f docker-compose.dev.yml up --build -d` has the same behavior.

Each repository has its own Compose project; there is no aggregate workspace
Compose file. Start each app separately with `docker compose up --build -d` from
its Compose directory:

| Application | Public local origin |
| --- | --- |
| Internal frontend (this directory) | `http://localhost:3000` |
| Registration frontend (`himti-regis`) | `http://localhost:3001` |
| Election frontend (`himti-election`) | `http://localhost:3002` |
| Internal backend (sibling backend directory) | `http://localhost:8000` |

This frontend does not start the backend. Backend startup applies migrations and
safely seeds the database automatically. Follow the backend README for its admin
and Google OAuth setup. Browser configuration uses these public origins, not
Docker service names. Keep backend CORS, trusted origins, and Google callback
settings aligned with the served URLs.

View logs or stop the frontend:

```bash
docker compose logs -f app
docker compose down
```

The anonymous `/app/node_modules` volume isolates container dependencies from
the host. After changing `package.json` or `package-lock.json`, rebuild and renew
that volume:

```bash
docker compose up --build -d --renew-anon-volumes
```

### Opt-in Production Container

Stop development first because both configurations use host port `3000`:

```bash
docker compose down
docker compose -f docker-compose.prod.yml up --build -d
curl http://localhost:3000/healthz
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml down
```

`docker-compose.prod.yml` retains the production build served by Nginx. It has no
source mount or HMR; source and environment changes require an image rebuild.
Nginx's SPA fallback serves nested routes such as `/events` on refresh.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite on port `3000` |
| `npm run build` | Type-check and create a production build |
| `npm run build:dev` | Build using Vite development mode |
| `npm run build:staging` | Build using Vite staging mode |
| `npm run preview` | Preview `dist/`, normally on port `4173` |
| `npm test` | Run Vitest once |
| `npm run lint` | Run ESLint with zero warnings allowed |

Vite modes use their corresponding `.env.<mode>` files when present. The base
`.env` is sufficient for the standard local and production commands.

## Project Structure

```text
src/api/                 TanStack Query API hooks grouped by feature
src/components/          Shared layout, feature, and UI components
src/config/              Runtime configuration, routes, Axios, and React Query
src/constants/           API paths and query keys
src/hooks/               Feature hooks
src/pages/               Route-level screens grouped by feature
src/types/               Shared application and API types
src/utils/               Formatting, auth, URL, and registration helpers
src/App.tsx              Route rendering and protection
src/main.tsx             Browser entry point and providers
```

API feature folders generally keep queries and mutations together in a
`queries.ts` file. Shared endpoint paths live in `src/constants/api.ts`, while
the configured backend origin is validated by `src/config/runtime.ts`.

## Main Routes

- `/`: public landing page
- `/login`: Google OAuth sign-in
- `/complete-registration`: incomplete-profile handoff
- `/url-shortener`: URL and workspace management
- `/batches`: membership periods and resources
- `/events`: event administration and workspaces
- `/rbac/users`: user administration
- `/rbac/roles`: role administration
- `/rbac/permissions`: permission administration
- `/link/:shortCode`: local short-link resolution

Protected routes require a valid Better Auth session, a completed registration
where applicable, and the configured permission or role.

## API Layer

Use the shared Axios client and TanStack Query for server state:

```tsx
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/config/api-client";

export function useExample() {
  return useQuery({
    queryKey: ["example"],
    queryFn: async () => (await apiClient.get("/api/example")).data,
  });
}
```

Keep request and response types aligned with the backend OpenAPI contract.
Invalidate the smallest relevant query key after successful mutations.

## Design System

Reusable primitives live in `src/components/ui`, layout components in
`src/components/Utils`, and global tokens in `src/index.css` and
`tailwind.config.js`. Prefer these existing components and tokens before adding
new variants or dependencies.

## Testing and Changes

Before opening a pull request:

```bash
npm test
npm run lint
npm run build
```

Add focused tests for API contracts, permission behavior, reusable components,
and bug fixes. Use a focused branch and semantic commit messages, then open a
pull request into the appropriate integration branch.

## Deployment

The active VPS workflow, `.github/workflows/deploy-vps.yml`, builds
environment-specific images because production Vite settings are build-time
values. Production credentials and deployment variables belong in GitHub Actions
secrets or server-side configuration, never in this repository. Local development
uses `docker-compose.yml`; the local Nginx build uses `docker-compose.prod.yml`.
VPS deployment uses the Compose configuration managed on the server.
