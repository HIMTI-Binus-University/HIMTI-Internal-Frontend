# Custom Scrollbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a context-aware custom scrollbar that fits the HIMTI Internal design system.

**Architecture:** Keep scrollbar behavior global in `src/index.css` with design-token-backed CSS variables. Add a single `.scrollbar-on-dark` utility for scroll containers on dark brand backgrounds and apply it to the sidebar.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS 3, plain CSS scrollbar properties and WebKit scrollbar pseudo-elements.

## Global Constraints

- No new dependencies.
- Preserve native scrolling behavior and do not hide scrollbars.
- Use global scrollbar defaults for the main app.
- Use a dark-surface override for the navy sidebar.
- Verify with the project build command: `npm run build`.

---

### Task 1: Add Scrollbar Tokens And Global Styles

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: Existing CSS variables in `:root` and `.dark`.
- Produces: Global scrollbar styling and `.scrollbar-on-dark` utility class.

- [ ] **Step 1: Add scrollbar variables to `:root`**

Add these variables after `--motion-ease-out` in `src/index.css`:

```css
    --scrollbar-track: 214 32% 92%;
    --scrollbar-thumb: 214 30% 70%;
    --scrollbar-thumb-hover: 214 100% 36%;
```

- [ ] **Step 2: Add dark mode scrollbar variables**

Add these variables after `--sidebar-ring` in `.dark`:

```css
    --scrollbar-track: 0 0% 100% / 0.08;
    --scrollbar-thumb: 0 0% 100% / 0.28;
    --scrollbar-thumb-hover: 0 0% 100% / 0.44;
```

- [ ] **Step 3: Add global scrollbar rules**

Add this block before the closing brace of `@layer base`:

```css
  html {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--scrollbar-thumb)) hsl(var(--scrollbar-track));
  }

  *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  *::-webkit-scrollbar-track {
    background: hsl(var(--scrollbar-track));
  }

  *::-webkit-scrollbar-thumb {
    min-height: 48px;
    border: 2px solid hsl(var(--scrollbar-track));
    border-radius: 999px;
    background: hsl(var(--scrollbar-thumb));
  }

  *::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--scrollbar-thumb-hover));
  }
```

- [ ] **Step 4: Add dark-surface scrollbar utility**

Add this block inside `@layer utilities`:

```css
  .scrollbar-on-dark {
    --scrollbar-track: 0 0% 100% / 0.08;
    --scrollbar-thumb: 0 0% 100% / 0.28;
    --scrollbar-thumb-hover: 0 0% 100% / 0.44;
    scrollbar-color: hsl(var(--scrollbar-thumb)) hsl(var(--scrollbar-track));
  }
```

- [ ] **Step 5: Run the build**

Run: `npm run build`

Expected: TypeScript and Vite build complete successfully.

---

### Task 2: Apply Dark Scrollbar Context To Sidebar

**Files:**
- Modify: `src/components/Utils/Sidebar.tsx`

**Interfaces:**
- Consumes: `.scrollbar-on-dark` utility from `src/index.css`.
- Produces: Sidebar scroll container uses the dark-surface scrollbar variables.

- [ ] **Step 1: Update sidebar className**

In `src/components/Utils/Sidebar.tsx`, add `scrollbar-on-dark` to the `<aside>` class list:

```tsx
className={`scrollbar-on-dark fixed left-0 top-0 z-40 flex h-screen w-[min(272px,calc(100vw-2rem))] shrink-0 flex-col justify-between overflow-y-auto bg-brand-primary-1 p-5 font-sans text-white transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:w-[272px] lg:translate-x-0 ${
  isOpen ? "translate-x-0" : "-translate-x-full"
}`}
```

- [ ] **Step 2: Run the build**

Run: `npm run build`

Expected: TypeScript and Vite build complete successfully.

---

### Task 3: Final Verification

**Files:**
- Read: `src/index.css`
- Read: `src/components/Utils/Sidebar.tsx`

**Interfaces:**
- Consumes: Completed Tasks 1 and 2.
- Produces: Verified implementation matching the approved spec.

- [ ] **Step 1: Inspect the CSS**

Confirm `src/index.css` contains the scrollbar variables, WebKit rules, Firefox rules, and `.scrollbar-on-dark` utility.

- [ ] **Step 2: Inspect the sidebar**

Confirm `src/components/Utils/Sidebar.tsx` applies `scrollbar-on-dark` to the scrollable `<aside>`.

- [ ] **Step 3: Run final build**

Run: `npm run build`

Expected: TypeScript and Vite build complete successfully.
