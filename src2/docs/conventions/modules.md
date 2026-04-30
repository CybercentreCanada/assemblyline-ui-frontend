# Module Organization

Modules can be organized with either a **file-based** or **folder-based** approach. Choose based on module complexity.

## File-Based (flat)

Use when a module is small enough that each role fits in a single file. Files use a dot-delimited prefix matching the parent folder:

```
<layer>/<module>/
├── <module>.components.tsx    ← All UI components
├── <module>.config.tsx        ← Default config, constants
├── <module>.docs.md           ← Module documentation
├── <module>.hooks.tsx         ← All hooks
├── <module>.i18n.en.json      ← English translations
├── <module>.i18n.fr.json      ← French translations
├── <module>.models.ts         ← TypeScript types
├── <module>.pom.ts            ← Playwright Page Object Models
├── <module>.providers.tsx     ← Context/store providers
├── <module>.spec.ts           ← Playwright E2E tests
├── <module>.utils.tsx         ← Pure utility functions
├── <module>.utils.test.tsx    ← Unit tests (co-located)
└── index.ts                   ← Public API (barrel exports)
```

## Folder-Based (nested)

Use when a module grows large enough that individual roles benefit from splitting into separate files. Subfolders are named by role, and individual files follow the [naming standards](./naming.md):

```
<layer>/<module>/
├── components/
│   ├── ComponentA.tsx
│   ├── ComponentB.tsx
│   └── index.ts
├── docs/
│   └── overview.md
├── hooks/
│   ├── useFeatureHook.ts
│   └── index.ts
├── models/
│   └── feature-types.ts
├── pom/
│   ├── ComponentA.pom.ts             ← mirrors ComponentA.tsx
│   └── ComponentB.pom.ts             ← mirrors ComponentB.tsx
├── spec/
│   ├── component-a.spec.ts
│   └── component-b.spec.ts
├── utils/
│   ├── feature-helpers.ts
│   └── feature-helpers.test.ts       ← mirrors feature-helpers.ts
├── <module>.config.tsx
├── <module>.i18n.en.json
├── <module>.i18n.fr.json
└── index.ts
```

## When to Use Which

| Signal | Approach |
|--------|----------|
| < 5 components, simple hooks | File-based |
| Growing file size (300+ lines per role file) | Folder-based |
| Many components that are independently testable | Folder-based |
| Small utility module (config, models only) | File-based |

Both approaches can coexist in the same codebase — pick per-module based on complexity.

## Rules (both approaches)

- File extension: `.tsx` for files with JSX, `.ts` for pure logic/types
- Config files use `.ts` unless they contain JSX (then `.tsx`)
- Test files are co-located with the file they test: `*.test.tsx` / `*.test.ts`
- Each module has an `index.ts` that exports the public API
- **1:1 mappings**: each component gets a corresponding POM, each utility file gets a corresponding test file
- POMs mirror component filenames: `ComponentA.tsx` → `ComponentA.pom.ts`
- Unit tests mirror utility filenames: `feature-helpers.ts` → `feature-helpers.test.ts`
- Folder-based subfolders (`components/`, `hooks/`, etc.) may have their own `index.ts` for internal barrel exports
