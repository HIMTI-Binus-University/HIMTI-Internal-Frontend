## 📁 Project Structure

```
himti-internal-frontend/
├── src/
│   ├── api/                    # API layer - berisi semua hook untuk API calls
│   │   └── users/
│   │       └── queries.ts      # User CRUD hooks (types, queries & mutations)
│   │
│   ├── components/             # Reusable React components
│   │
│   ├── config/                 # Configuration files
│   │   ├── api-client.ts       # Axios instance dengan interceptors
│   │   ├── react-query.ts      # React Query client configuration
│   │   └── routes.ts           # Routes configuration
│   │
│   ├── constants/              # Constants & static values
│   │   ├── api.ts              # API endpoints (uses ApiService.baseURL)
│   │   ├── api-service.ts      # Current environment selector (gitignored)
│   │   ├── api-service-*.ts    # Environment-specific base URLs (gitignored)
│   │   ├── keys.ts             # Current environment selector (gitignored)
│   │   └── keys-*.ts           # Environment-specific keys (gitignored)
│   │
│   ├── hooks/                  # Custom React hooks
│   │
│   ├── pages/                  # Page components (setiap page dalam folder sendiri)
│   │   ├── home/
│   │   │   └── index.tsx       # Home page component
│   │   └── login/
│   │       └── index.tsx       # Login page component
│   │
│   ├── types/                  # Global TypeScript types
│   │   └── route.ts            # Route type definition
│   │
│   ├── utils/                  # Utility functions
│   │
│   ├── App.tsx                 # Root component with Router
│   ├── main.tsx                # Entry point & React Query setup
│   ├── index.css               # Tailwind imports
│   └── vite-env.d.ts           # Vite environment types
│
├── .env                        # Environment variables (jangan commit!)
├── .env.example                # Template environment variables
├── .eslintrc.cjs               # ESLint configuration
├── .gitignore                  # Git ignore rules
├── index.html                  # HTML entry point
├── package.json                # Dependencies & scripts
├── postcss.config.js           # PostCSS config for Tailwind
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript config untuk source code
├── tsconfig.node.json          # TypeScript config untuk build tools
├── vite.config.ts              # Vite configuration
└── README.md                   # Documentation (you are here!)
```

### 📂 Penjelasan Folder Structure

#### `/src/api/`

Berisi semua logic untuk API calls menggunakan TanStack Query. Setiap fitur/resource punya folder sendiri dengan file `queries.ts` yang berisi:

- **Types/Interfaces** - untuk request params, payloads, dan responses
- **Queries** - hooks menggunakan `useQuery` untuk GET requests
- **Mutations** - hooks menggunakan `useMutation` untuk POST/PUT/DELETE

**Contoh:** `src/api/users/queries.ts` berisi `useGetUsers`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`

#### `/src/config/`

Konfigurasi aplikasi seperti Axios instance, API client setup, dll.

**File:** `api-client.ts` - Axios instance dengan:

- Base URL dari environment variables
- Request interceptor untuk add auth token
- Response interceptor untuk error handling

#### `/src/constants/`

Konstanta dan nilai static yang digunakan di seluruh aplikasi.

**Environment Management:**

- `api-service-local.ts`, `api-service-dev.ts`, `api-service-uat.ts`, `api-service-prod.ts` - Base URL untuk setiap environment (gitignored)
- `api-service.ts` - File selector yang export environment aktif (gitignored)

- `keys-local.ts`, `keys-dev.ts`, `keys-uat.ts`, `keys-prod.ts` - App keys per environment (gitignored)
- `keys.ts` - File selector yang export environment aktif (gitignored)

**API Endpoints:**

- `api.ts` - Semua API endpoints, menggunakan `ApiService.baseURL` untuk dynamic base URL

#### `/src/components/`

Reusable React components. Bisa diorganisir lebih lanjut dengan subfolder per feature.

**Contoh:**

```
components/
├── ui/              # Basic UI components (Button, Input, Card, dll)
├── forms/           # Form components
└── layout/          # Layout components (Header, Sidebar, dll)
```

#### `/src/hooks/`

Custom React hooks yang reusable.

**Contoh:** `useAuth.ts`, `useDebounce.ts`, `useLocalStorage.ts`

#### `/src/pages/`

Page-level components. Setiap page punya folder sendiri dengan file `index.tsx`.

**Contoh:**

```
pages/
├── home/
│   └── index.tsx
├── dashboard/
│   └── index.tsx
└── users/
    ├── index.tsx           # Users list page
    └── detail/
        └── index.tsx       # User detail page
```

#### `/src/types/`

Global TypeScript types/interfaces yang digunakan di banyak tempat.

**Contoh:** `common.ts`, `models.ts`

#### `/src/utils/`

Utility/helper functions.

**Contoh:** `formatDate.ts`, `validators.ts`, `helpers.ts`

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Edit `src/constants/api-service.ts` untuk memilih environment:

```typescript
// Untuk local development
export * from "./api-service-local";

// Untuk dev environment
// export * from './api-service-dev'

// Untuk UAT environment
// export * from './api-service-uat'

// Untuk production
// export * from './api-service-prod'
```

3. Edit `src/constants/keys.ts` untuk memilih environment:

```typescript
// Untuk local development
export { default } from "./keys-local";

// Untuk dev environment
// export { default } from './keys-dev'
```

### Development

Jalankan development server:

```bash
npm run dev
```

App akan berjalan di `http://localhost:3000`

### Build

Build untuk production:

```bash
npm run build
```

**Note:** Sebelum build, pastikan sudah edit `src/constants/api-service.ts` dan `src/constants/keys.ts` untuk environment yang sesuai.

### Preview

Preview production build:

```bash
npm run preview
```

### Lint

Run ESLint:

```bash
npm run lint
```

## 📝 Cara Pakai API Layer

### 1. Setup Query Keys (`src/constants/query-keys.ts`)

```typescript
export const QueryKeys = {
  USERS: "users",
  USER_DETAIL: "user-detail",
  // Add more...
} as const;
```

### 2. Buat API Hooks (`src/api/[feature]/index.ts`)

Contoh lengkap ada di `src/api/users/index.ts`. Structure-nya:

```typescript
// 1. Define Types
export interface User {
  id: number;
  name: string;
  email: string;
}

// 2. Create Query Hooks (GET)
export const useGetUsers = () => {
  return useQuery({
    queryKey: [QueryKeys.USERS],
    queryFn: () => apiClient.get("/users").then((res) => res.data),
  });
};

// 3. Create Mutation Hooks (POST/PUT/DELETE)
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiClient.post("/users", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS] });
    },
  });
};
```

### 3. Pakai di Component

```typescript
import { useGetUsers, useCreateUser } from "@/api/users";

function UsersPage() {
  // Fetch data
  const { data: users, isLoading, error } = useGetUsers();

  // Create mutation
  const createUser = useCreateUser({
    onSuccess: () => {
      alert("User created!");
    },
  });

  const handleCreate = () => {
    createUser.mutate({
      name: "John Doe",
      email: "john@example.com",
      username: "johndoe",
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleCreate}>Create User</button>
      {users?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

## ➕ Menambah Feature Baru

Contoh: Menambah API untuk "articles"

### 1. Tambah Query Keys

**File:** `src/constants/query-keys.ts`

```typescript
export const QueryKeys = {
  USERS: "users",
  USER_DETAIL: "user-detail",
  ARTICLES: "articles", // ← tambah ini
  ARTICLE_DETAIL: "article-detail", // ← tambah ini
} as const;
```

### 2. Buat API Hooks

**File:** `src/api/articles/index.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { QueryKeys } from "@/constants/query-keys";

// Types
export interface Article {
  id: number;
  title: string;
  content: string;
}

// Queries
export const useGetArticles = () => {
  return useQuery({
    queryKey: [QueryKeys.ARTICLES],
    queryFn: () => apiClient.get("/articles").then((res) => res.data),
  });
};

// Mutations
export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiClient.post("/articles", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ARTICLES] });
    },
  });
};
```

### 3. Pakai di Component

```typescript
import { useGetArticles, useCreateArticle } from "@/api/articles";

function ArticlesPage() {
  const { data: articles } = useGetArticles();
  const createArticle = useCreateArticle();

  // ... rest of your component
}
```

## 🎨 Tailwind Design System

### Custom Colors

**Primary (Brand):** `primary-{50-900}` - `bg-primary-500`, `text-primary-700`

**Grayscale (Neutral):** `grayscale-{50-900}` - `bg-grayscale-100`, `text-grayscale-800`

### Typography

**Font:** Public Sans (default)

**Headings:** `text-h1` (61px) hingga `text-h6` (20px)

**Body:** `text-body-1` (16px), `text-body-2` (13px), `text-body-3` (10px)

**Contoh:**

```jsx
<h1 className="text-h1 text-primary-700">Heading</h1>
<p className="text-body-1 text-grayscale-900">Body text</p>
<button className="bg-primary-500 text-white text-body-1">Button</button>
```
