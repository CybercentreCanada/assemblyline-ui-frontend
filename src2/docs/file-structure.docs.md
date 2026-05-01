# File Structure & Naming

## File Naming Pattern

Every file declares its resource and role in its name:

```text
<primary>-<secondary>.<role>.<ext>
```

| Segment | Purpose | Examples |
|---------|---------|---------|
| `<primary>` | The resource/domain being affected | `alert`, `submission`, `user` |
| `<secondary>` | The action or sub-feature | `list`, `detail`, `create`, `search` |
| `<role>` | The technical role of the file | `components`, `hooks`, `utils`, `models`, `store`, `providers`, `i18n` |
| `<ext>` | File extension | `.tsx`, `.ts`, `.test.ts`, `.spec.ts` |

**Examples:**

```text
alert-list.components.tsx
alert-list.hooks.ts
alert-detail.components.tsx
alert-detail.utils.ts
alert-detail.utils.test.ts
alert.models.ts
alert.store.ts
alert.providers.tsx
alert.i18n.en.json
```

**Rules:**

- No `index` files as root elements — they obscure what the file actually does
- The file name alone should tell you what resource it affects and what role it plays

## General Naming Conventions

| What | Convention | Example |
|------|------------|---------|
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

---

## Module Organization

Modules can be organized with either a **file-based** or **folder-based** approach. Choose based on module complexity.

### File-Based (flat)

Use when a module is small enough that each role fits in a single file:

```text
<layer>/<module>/
├── <module>.components.tsx
├── <module>.hooks.ts
├── <module>.i18n.en.json
├── <module>.i18n.fr.json
├── <module>.models.ts
├── <module>.pom.ts
├── <module>.providers.tsx
├── <module>.spec.ts
├── <module>.store.ts
├── <module>.utils.ts
├── <module>.utils.test.ts
└── index.ts
```

### Module File Roles

| Role Suffix | Extension | Purpose |
|-------------|-----------|--------|
| `.components` | `.tsx` | UI components (memo, displayName, props) |
| `.hooks` | `.ts` | Shared hooks (reused in 3+ components) |
| `.i18n.en` / `.i18n.fr` | `.json` | Translation files |
| `.models` | `.ts` | Type declarations, `DEFAULT_*` constants, const arrays |
| `.pom` | `.ts` | Playwright Page Object Model |
| `.providers` | `.tsx` | Context providers |
| `.spec` | `.ts` | Playwright E2E tests |
| `.store` | `.ts` | Store provider for that module |
| `.utils` | `.ts` | Pure utility functions |
| `.utils.test` | `.ts` | Unit tests for utils |

### Folder-Based (nested)

Use when a module grows large enough that individual roles benefit from splitting:

```text
<layer>/<module>/
├── components/
│   ├── ComponentA.tsx
│   ├── ComponentB.tsx
│   └── index.ts
├── hooks/
│   ├── useFeatureHook.ts
│   └── index.ts
├── models/
│   └── feature-types.ts
├── utils/
│   ├── feature-helpers.ts
│   └── feature-helpers.test.ts
├── pom/
│   ├── ComponentA.pom.ts
│   └── ComponentB.pom.ts
├── spec/
│   ├── component-a.spec.ts
│   └── component-b.spec.ts
├── <module>.store.ts
├── <module>.providers.tsx
├── <module>.i18n.en.json
├── <module>.i18n.fr.json
└── index.ts
```

### When to Use Which

| Signal | Approach |
|--------|----------|
| < 5 components, simple hooks | File-based |
| Growing file size (300+ lines per role file) | Folder-based |
| Many independently testable components | Folder-based |
| Small utility module (config, models only) | File-based |

Both approaches can coexist — pick per-module based on complexity.

### Rules (both approaches)

- File extension: `.tsx` for files with JSX, `.ts` for pure logic/types
- Test files are co-located with the file they test: `*.test.tsx` / `*.test.ts`
- Each module has an `index.ts` that exports the public API
- **1:1 mappings**: each component gets a corresponding POM, each utility file gets a corresponding test file
- POMs mirror component filenames: `ComponentA.tsx` → `ComponentA.pom.ts`
- Folder-based subfolders may have their own `index.ts` for internal barrel exports

---


