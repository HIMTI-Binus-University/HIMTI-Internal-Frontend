# Custom Scrollbar Design

## Goal

Add a custom scrollbar that matches the HIMTI Internal design system across the application without introducing new dependencies or component-level complexity.

## Design

Use context-aware global scrollbar styling in `src/index.css`.

The main application scrollbar should use the existing light surface palette: a pale blue-gray track, a muted blue-gray thumb, and a stronger HIMTI primary blue hover state. This keeps scrollbars visible without competing with cards, borders, and page content.

The dark navy sidebar should use its own scrollbar treatment: a transparent or white-tinted track and a translucent white thumb that becomes more visible on hover. This keeps the scrollbar legible against `bg-brand-primary-1` while preserving the sidebar's dark brand surface.

## Implementation Shape

Add scrollbar CSS variables in `:root` and `.dark` so the default app scrollbar follows the token system. Add a small opt-in utility, `.scrollbar-on-dark`, for scroll containers placed on dark brand backgrounds.

Apply the utility to the sidebar because it is the only existing dark scroll container. Keep the rest of the app covered by global scrollbar rules.

Use standards-first CSS for Firefox with `scrollbar-width` and `scrollbar-color`, plus WebKit pseudo-element rules for Chromium and Safari.

## Accessibility And Behavior

Keep the scrollbar wide enough to target comfortably on desktop while remaining visually slim. Preserve native mobile behavior. Avoid hiding scrollbars or changing scroll mechanics.

## Testing

Run the project build to verify CSS and TypeScript compile. Manual visual verification should check a long main page and the sidebar in both desktop and mobile widths.
