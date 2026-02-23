# Project Guidelines

## Supabase Migrations

When making any Supabase schema or function changes (DDL, RPC functions, views, policies, etc.), always create a local migration file under `supabase/migrations/` so other developers can apply the same changes. Do not only apply migrations via the Supabase MCP — also write the corresponding `.sql` file locally.

## User Transparency & Audit Trail

Every action that modifies data (deliveries, order status changes, stock movements, etc.) must record **who** performed it. Never hardcode user identifiers like `"Admin"` — always resolve the actual logged-in user via the `useAuth()` hook from `src/app/context/AuthContext.tsx`. Use `user.user_metadata.full_name` with a fallback to `user.email`.

All significant transactions should be stored in an audit/history table so there is a full trail of **who** did **what** and **when**. This applies to any new feature that creates, updates, or deletes business data.

## Uniform Table Design

All data tables across the application **must** use the shared `DataTable` component from `src/app/components/DataTable.tsx`. Do not create one-off `<table>` markup in page files.

**Standard:**
- Import `DataTable` and `ColumnDef` from `@/app/components/DataTable`
- Define columns as a `ColumnDef<T>[]` constant outside the component
- Use CSS variables for all colors: `--border`, `--input-bg`, `--foreground`, `--muted`, `--row-even`, `--row-odd`, `--row-hover`, `--accent`
- Header style: `text-[10px] uppercase tracking-wider font-semibold`, `var(--muted)` color, `var(--input-bg)` background
- Row style: alternating `var(--row-even)` / `var(--row-odd)`, hover `var(--row-hover)`, `0.15s` transition
- Cell padding: `px-4 py-3`, `whitespace-nowrap`
- Outer wrapper: `1px solid var(--border)`, `overflow: hidden`
- Custom cell rendering via `renderCell` prop — never override base table styling

When adding a new table to any page, follow this pattern and do **not** inline raw `<table>` elements.

## Session Startup

Always read `CLAUDE.md` and all Claude skill files at the start of every session before doing any work. These contain critical project conventions and tool references that must be followed.

Skill files to read:
- `.agents/skills/senior-backend/SKILL.md`
- `.agents/skills/nodejs-backend-patterns/SKILL.md`
- `.agents/skills/supabase-postgres-best-practices/SKILL.md`
- `.agents/skills/ui-ux-pro-max/SKILL.md`
- `.agents/skills/frontend-testing-best-practices/SKILL.md`
