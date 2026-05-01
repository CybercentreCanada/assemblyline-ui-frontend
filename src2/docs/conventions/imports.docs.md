# Import Conventions

## Purpose

Consistent import ordering makes files scannable — you can immediately tell what external libraries, internal modules, and local files a component depends on. The rules below ensure every file in the project follows the same structure.

## Import Ordering (strict)

Imports are grouped in this order, separated by blank lines between groups:

1. **MUI icons** — default imports from `@mui/icons-material/*`
2. **MUI components** — named imports from `@mui/material`
3. **Core/app modules** — absolute imports from `core/*`, `models/*`, `ui/*`
4. **Third-party libraries** — `react`, `react-i18next`, `react-router`, `dompurify`, `react-markdown`, etc.
5. **Local relative imports** — `./` files (hooks, models, utils, config)

Within each group, sort imports alphabetically by module path.

```typescript
// 1. MUI icons (default imports)
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

// 2. MUI components
import { Badge, Drawer, styled, useTheme } from '@mui/material';

// 3. Core/app modules (absolute)
import { useAPIMutation } from 'core/api';
import { useAppConfig, useAppSetConfig } from 'core/config';
import { useAppSnackbar } from 'core/snackbar';
import type { SystemMessage } from 'models/ui/user';
import { IconButton } from 'ui/buttons/IconButton';

// 4. Third-party libraries
import DOMPurify from 'dompurify';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';

// 5. Local relative imports
import { useNotificationClose } from './notifications.hooks';
import { DEFAULT_SYSTEM_MESSAGE } from './notifications.models';
import { formatDate, getBackgroundColor } from './notifications.utils';
```

## Import Syntax Rules

- Use `import type { X }` for type-only imports — never `import { type X }`
- Use named imports (destructured) — never default imports (exceptions: MUI icons, DOMPurify, Markdown)
- MUI icons use default imports because they are individual modules (`@mui/icons-material/CloseOutlined`)
- Absolute imports for cross-module references: `import { X } from 'core/config'`
- Relative imports only within the same module folder: `import { X } from './feature.hooks'`

## Forbidden Patterns

- No circular imports between modules
- No importing from parent directories (`../../`) — use absolute paths instead
- No wildcard/star imports (`import * as X`)
- No side-effect-only imports (`import './styles.css'`) except in entry files
- No re-exporting types without `export type`

## Barrel Exports

Each module folder has one `index.ts` that exports only its public API:

```typescript
// components/notifications/index.ts
export { NotificationPanel } from './notifications.components';
export type { NotificationItem } from './notifications.models';
```

- One `index.ts` per module folder
- Only export what other modules need — internal files stay private
- Commons folders use barrel files to expose shared utilities
- Never re-export everything blindly (`export * from`)

## Import Rules

- Absolute imports: `import { X } from 'core/config'`
- Relative imports: only within same module folder
- `import type { X }` for type-only imports (NOT `import { type X }`)
- NO circular imports between modules
- NO importing from parent directories (`../../`)

## Barrel Exports

- One `index.ts` per module folder — exports only public API
- Internal files NOT re-exported
- Commons folders use barrel files to expose shared utilities

```typescript
// components/notifications/index.ts
export { NotificationPanel } from './notifications.components';
export type { NotificationItem } from './notifications.models';
```
