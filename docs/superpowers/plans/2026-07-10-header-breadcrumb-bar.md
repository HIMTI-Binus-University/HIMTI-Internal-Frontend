# Header Breadcrumb Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current page title heading with a shared, subtle header bar that provides universal back navigation and route-group breadcrumbs.

**Architecture:** Keep the change centralized in `PageLayout`. Derive breadcrumbs from existing `publicRoutes` metadata and append the page title for future nested pages under known route prefixes.

**Tech Stack:** React, React Router, TypeScript, Tailwind CSS, Vitest, Testing Library.

## Global Constraints

- Do not add dependencies.
- Keep existing page usages of `PageLayout` working.
- Back button uses browser history via `navigate(-1)`.
- Breadcrumb parent labels come from sidebar route groups such as `Tools` and `RBAC`.
- Use existing Tailwind tokens and UI patterns.

---

### Task 1: Shared Header Bar

**Files:**
- Modify: `src/components/Utils/PageLayout.tsx`
- Create: `src/components/Utils/PageLayout.test.tsx`

**Interfaces:**
- Consumes: `publicRoutes` from `src/config/routes.ts` and `PageLayout` props `title`, `actions`, `children`.
- Produces: a `PageLayout` header containing `Go back`, optional `Open navigation`, breadcrumbs, optional actions, and hidden accessible page title.

- [ ] Write failing tests for breadcrumbs and back navigation.
- [ ] Run `npm test -- src/components/Utils/PageLayout.test.tsx` and confirm failures.
- [ ] Implement the minimal `PageLayout` update.
- [ ] Run `npm test -- src/components/Utils/PageLayout.test.tsx` and confirm pass.
- [ ] Run `npm run build`.
