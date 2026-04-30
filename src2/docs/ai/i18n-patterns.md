# i18n Patterns

## File Structure

Each module has its own translation files:

```text
<module>.i18n.en.json   ← English
<module>.i18n.fr.json   ← French
```

## Key Naming

Keys are namespaced by module using dot notation:

```json
{
  "notifications.drawer.title": "Notifications",
  "notifications.drawer.empty": "No notifications",
  "notifications.announcement.save": "Save announcement",
  "notifications.announcement.delete.confirm": "Are you sure?"
}
```

### Rules

- Prefix all keys with the module name
- Use dots to indicate hierarchy
- Keep keys descriptive but concise
- Group related keys by feature area

## Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = memo(function MyComponent() {
  const { t } = useTranslation();
  return <Typography>{t('notifications.drawer.title')}</Typography>;
});
```

## Usage Rules

1. **All user-visible strings must use translation keys** — no hardcoded text
2. **No fallback default values** — use strict key usage: `t('key')` not `t('key', 'Default')`
3. **Always add both en and fr** — every key must exist in both language files
4. **Do NOT use interpolation unless necessary** — prefer separate keys over complex templates
5. **Do NOT nest JSON** — use flat dot-notation keys in a flat JSON structure

## Adding New Keys

1. Add the key to `<module>.i18n.en.json`
2. Add the French translation to `<module>.i18n.fr.json`
3. Use it in your component with `t('module.key.name')`

## Do NOT

- Do NOT use template literals for user-visible text
- Do NOT put translations in shared/global files — keep them per-module
- Do NOT create translation keys that are unused
- Do NOT reuse keys across modules — each module owns its namespace
