# Import Conventions — AI Rules

## Import Ordering (strict)

1. MUI icons — default imports from `@mui/icons-material/*`
2. MUI components — named imports from `@mui/material`
3. Core/app modules — absolute imports from `core/*`, `models/*`, `ui/*`
4. Third-party libraries — `react`, `react-i18next`, `react-router`, `dompurify`, etc.
5. Local relative imports — `./` files (hooks, models, utils, config)

Separate groups with blank lines. Sort alphabetically within each group.

## Must

- Use `import type { X }` for type-only imports
- Use named/destructured imports for all modules
- Use absolute imports for cross-module references (`'core/config'`, `'models/ui/user'`)
- Use relative imports only within same module folder (`'./feature.hooks'`)
- Sort imports alphabetically by module path within each group
- One `index.ts` per module folder exporting only public API

## Never

- NO `import { type X }` — use `import type { X }`
- NO default imports (exceptions: MUI icons, DOMPurify, Markdown)
- NO circular imports between modules
- NO parent directory imports (`../../`) — use absolute paths
- NO wildcard imports (`import * as X`)
- NO `export * from` in barrel files — export explicitly

## Template

```typescript
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { Badge, Drawer, styled, useTheme } from '@mui/material';

import { useAPIMutation } from 'core/api';
import { useAppConfig, useAppSetConfig } from 'core/config';
import type { SystemMessage } from 'models/ui/user';
import { IconButton } from 'ui/buttons/IconButton';

import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useNotificationClose } from './notifications.hooks';
import { DEFAULT_SYSTEM_MESSAGE } from './notifications.models';
import { formatDate } from './notifications.utils';
```

## Barrel Export Template

```typescript
// components/notifications/index.ts
export { NotificationPanel } from './notifications.components';
export type { NotificationItem } from './notifications.models';
```
