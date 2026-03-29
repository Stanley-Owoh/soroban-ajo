# Naming Conventions

This document defines the naming standards for the Ajo frontend codebase.

## Quick Reference

| Category | Convention | Example |
|---|---|---|
| React components | PascalCase | `GroupCard`, `WalletModal` |
| Hooks | camelCase + `use` prefix | `useAuth`, `useDashboard` |
| Utility functions | camelCase | `formatCurrency`, `lazyLoad` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Types / Interfaces | PascalCase | `GroupData`, `WalletState` |
| Enums | PascalCase (members UPPER_SNAKE_CASE) | `enum Status { ACTIVE, PENDING }` |
| Component files | PascalCase `.tsx` | `GroupCard.tsx` |
| Non-component files | kebab-case `.ts` | `format-currency.ts`, or camelCase `formatCurrency.ts` |
| Test files | mirror source name + `.test` | `GroupCard.test.tsx` |
| CSS/style files | kebab-case | `glassmorphism.css` |

## Rules in Detail

### Components
- One component per file, filename matches the component name.
- Default export name must match the filename.

```tsx
// ✅ GroupCard.tsx
export default function GroupCard() { ... }

// ❌ groupCard.tsx / group-card.tsx
```

### Hooks
- Must start with `use` followed by a capital letter.
- Live in `src/hooks/`.

```ts
// ✅
export function useGroupAnalytics() { ... }

// ❌
export function groupAnalytics() { ... }
export function UseGroupAnalytics() { ... }
```

### Utils
- camelCase function names, kebab-case or camelCase filenames.
- Live in `src/utils/`.

```ts
// ✅ src/utils/formatters.ts
export function formatCurrency(amount: number) { ... }

// ❌
export function FormatCurrency() { ... }
```

### Constants
- Module-level `const` values that are truly constant use UPPER_SNAKE_CASE.
- Local variables and config objects use camelCase.

```ts
// ✅
const MAX_GROUP_SIZE = 50;
const API_TIMEOUT_MS = 10_000;

// ❌
const maxGroupSize = 50;
```

### Types and Interfaces
- Always PascalCase, no `I` prefix on interfaces.

```ts
// ✅
interface GroupMember { ... }
type WalletStatus = 'connected' | 'disconnected';

// ❌
interface IGroupMember { ... }
type walletStatus = ...;
```

### Enums
- Enum name PascalCase, members UPPER_SNAKE_CASE.

```ts
// ✅
enum ContributionStatus {
  PENDING,
  CONFIRMED,
  FAILED,
}
```

## Automated Enforcement

Run the naming lint check:

```bash
# From frontend/
eslint --config .eslintrc.naming.js 'src/**/*.{ts,tsx}'
```

Or add it to CI alongside the main lint step. The rules are defined in `.eslintrc.naming.js` and use `@typescript-eslint/naming-convention`.
