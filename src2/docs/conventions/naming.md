# Naming Standards

## File Naming Pattern

Every file declares its resource and role in its name:

```
<primary>-<secondary>.<role>.<ext>
```

| Segment | Purpose | Examples |
|---------|---------|--------|
| `<primary>` | The resource/domain being affected | `alert`, `submission`, `user` |
| `<secondary>` | The action or sub-feature | `list`, `detail`, `create`, `search` |
| `<role>` | The technical role of the file | `components`, `hooks`, `utils`, `models`, `config`, `i18n` |
| `<ext>` | File extension | `.tsx`, `.ts`, `.test.ts`, `.spec.ts` |

**Examples:**
```
alert-list.components.tsx
alert-list.hooks.ts
alert-detail.components.tsx
alert-detail.utils.ts
alert-detail.utils.test.ts
alert.models.ts
alert.i18n.ts
```

**Rules:**
- No `index` files as root elements — they obscure what the file actually does
- The file name alone should tell you what resource it affects and what role it plays

## General Conventions

| What | Convention | Example |
|------|-----------|---------|
| Folders | `kebab-case` | `user-profile/`, `account-settings/` |
| Component files | `PascalCase.tsx` | `UserProfileCard.tsx` |
| Non-component TS files | `kebab-case.ts` | `date-utils.ts`, `api-client.ts` |
| Hooks | `useXxx.ts` (camelCase) | `useAuth.ts`, `useLocalStorage.ts` |
| Tests | Mirror source filename | `UserProfileCard.test.tsx`, `date-utils.test.ts` |
| Constant/type files | `kebab-case` | `app-constants.ts`, `user-models.ts` |
| Constant exports | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT`, `DEFAULT_APP_CONFIG` |
| Type/interface exports | `PascalCase` | `AppConfig`, `NotificationModel` |

**Why:**
- `kebab-case` folders are consistent across platforms, URLs, and tooling
- `PascalCase.tsx` matches React component naming (file = component)
- `kebab-case.ts` keeps utility/module files visually distinct from components
- Tests mirror their source for easy discovery
