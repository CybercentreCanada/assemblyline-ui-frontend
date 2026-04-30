# File Structure

## Where to Put New Code

| What you're adding | Where it goes |
| ------------------ | ------------- |
| New page/view | `pages/<PageName>.tsx` |
| Layout-level feature (drawer, panel, toolbar) | `layout/<feature>/` |
| Reusable domain-agnostic utility | `features/<feature>/` |
| Framework-level module (new state slice, new provider) | `core/<module>/` |
| TypeScript types/interfaces | `models/<category>/<name>.ts` |
| Design system component | `ui/` |
| App-level config/routes/themes | `app/` |

## Module File Naming

Every file in a module uses a dot-prefix matching the folder name:

```text
<module>/
├── <module>.components.tsx    ← React components (UI)
├── <module>.hooks.tsx         ← Custom hooks
├── <module>.config.tsx        ← Constants, default config
├── <module>.docs.md           ← Module documentation
├── <module>.models.ts         ← TypeScript types (no JSX → .ts)
├── <module>.utils.tsx         ← Pure utility functions
├── <module>.utils.test.tsx    ← Unit tests for utils
├── <module>.providers.tsx     ← Context providers, store setup
├── <module>.i18n.en.json      ← English translations
├── <module>.i18n.fr.json      ← French translations
├── <module>.pom.ts            ← Playwright Page Object Models
├── <module>.spec.ts           ← Playwright E2E tests
└── index.ts                   ← Barrel exports (public API only)
```

### Rules

- `.tsx` for files containing JSX, `.ts` for pure logic/types
- `.json` for translation files
- Tests are co-located: `<file>.test.tsx` next to `<file>.tsx`
- POMs mirror component filenames: `ComponentA.tsx` → `ComponentA.pom.ts`
- One `index.ts` per module — only export what other modules need
- 1:1 mappings: each component gets a POM, each utility gets a test file

## Creating a New Module

1. Create the folder in the appropriate layer
2. Create files using the dot-prefix naming convention
3. Create `index.ts` with named exports for the public API
4. Add i18n files if the module has user-visible strings (both `.en.json` and `.fr.json`)

## Import Rules

Imports are auto-sorted on save and must follow this grouping:

```typescript
// 1. External library imports
import { memo, useCallback } from 'react';
import { Button } from '@mui/material';

// 2. Internal absolute imports (path aliases)
import { useAppConfig } from 'core/config';
import { useAPIQuery } from 'core/api';

// 3. Relative imports (same module)
import { MyChild } from './my-child.components';

// 4. Type-only imports (always separate)
import type { MyProps } from './my-feature.models';
```

**Rules:**

- Never use default imports — always destructure
- Use `import type {}` for type-only imports
- Barrel exports (`index.ts`) acceptable for module public APIs
- Use path aliases for cross-module imports, relative for same-module

## Barrel Exports (index.ts)

Each module's `index.ts` defines its public API:

```typescript
// layout/notifications/index.ts
export { Notifications } from './notifications.components';
export type { NotificationModel } from './notifications.models';
```

Rules:

- Only export what other modules actually import
- Do NOT re-export everything — keep internals private
- Do NOT create nested barrel exports (no `index.ts` in subfolders unless it's a separate module)
