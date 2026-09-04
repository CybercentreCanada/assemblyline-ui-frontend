# layout/system-version

Displays the system environment type and software version watermark on non-production environments.

## Responsibilities

- Renders a fixed footer watermark displaying Assemblyline system version and environment type (e.g., `Assemblyline 4.5.0 :: staging`)
- Reads system configuration directly from `useAppConfigStore`
- Automatically hides on production environments (`system.type === 'production'`)
- Observes the drawer toggle element (`aria-label="Collapse drawer"` / `aria-label="Expand drawer"`) via `ResizeObserver` and dynamically positions the fixed watermark to its right

## Key Files

| File | Purpose |
| --- | --- |
| `system-version.components.tsx` | `SystemVersion` memoized component |
| `system-version.models.ts` | Type definitions and default models for system version info |
| `system-version.providers.tsx` | `AppSystemVersionLayout` layout wrapper that attaches `ResizeObserver` to drawer toggle and manages positioning |
| `index.ts` | Barrel exports |

## Usage

```tsx
import { AppSystemVersionLayout } from 'layout/system-version';

export const AppLayout = () => (
  <AppSystemVersionLayout>
    <MainContent />
  </AppSystemVersionLayout>
);
```
