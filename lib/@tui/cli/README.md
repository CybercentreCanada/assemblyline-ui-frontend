# `@tui/cli`

Command-line tool to **create** and **upgrade** TemplateUI v4 applications.

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Creating a New Application](#creating-a-new-application)
- [Upgrading an Existing Application](#upgrading-an-existing-application)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

---

## Overview

`@tui/cli` (invoked as `tcli`) is a Node.js CLI that helps you:

1. **Create** a new TemplateUI v4 application from scratch
2. **Upgrade** an existing application to the modular `@tui/*` architecture

Unlike the UI modules (`@tui/core`, `@tui/a11y`, etc.), this package is a standalone executable—not a library you import into your app.

---

## Installation

### 1) Configure npm registry

Create or update `~/.npmrc` to point `@tui` packages to the internal registry:

```ini
@tui:registry=https://bagofholding.cse-cst.gc.ca/repository/npm-ap/
```

### 2) Install globally

```bash
npm install -g @tui/cli
```

### 3) Verify installation

```bash
tcli --help
```

You should see:

```
Usage: tcli [command]

Commands:
  create    Clone a fixed repository and copy template files
  upgrade   Run interactive @tui v4 upgrade wizard
```

### Prerequisites

| Tool   | Required for        | Notes                                      |
| ------ | ------------------- | ------------------------------------------ |
| `git`  | `create`, `upgrade` | Must have SSH access to the template repo  |
| `pnpm` | `create`, `upgrade` | The CLI uses pnpm for dependency installs  |
| `code` | `create`            | Optional; used to open VS Code after setup |

---

## Creating a New Application

```bash
tcli create
```

This launches an interactive wizard that walks you through:

### Step 1 — Project name

You'll be prompted to enter a name for your new application.

### Step 2 — Destination folder

Choose where to place the project. The CLI clones the [template repo](https://github.com/CybercentreCanada/template-ui) and copies `packages/template` into your chosen location.

### Step 3 — Select optional modules

Pick which `@tui/*` modules to include:

| Module        | Description                             |
| ------------- | --------------------------------------- |
| `@tui/drawer` | Right-side application drawer           |
| `@tui/a11y`   | Accessibility features                  |
| `@tui/notis`  | Notification drawer                     |
| `@tui/apps`   | App switcher                            |
| `@tui/classi` | Classification chip (U/PA/PB/PC/C/S/TS) |

> `@tui/core` is always included—it's the foundation of every TemplateUI app.

### Step 4 — Install dependencies

The CLI offers to run `pnpm install` for you.

### Step 5 — Open in VS Code

Optionally open the new project directly in VS Code.

### After creation

Once complete, you'll see instructions like:

```
🎉 Your @tui application is ready!

To start the application, run:

cd ~/tui-apps/my-app && pnpm run dev
```

For configuration guidance, see the [Configuration Guide](../../docs/guides/configuration-guide.md).

---

## Upgrading an Existing Application

```bash
cd /path/to/your/existing/app
tcli upgrade
```

This launches an interactive wizard that migrates your app to TemplateUI v4.

### What the upgrade does

The wizard performs the following steps (with commits after each major change):

| Step | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 1    | **Confirm project path** — Ensures you're in the right directory               |
| 2    | **Preflight checks** — Verifies git status, detects package manager            |
| 3    | **Install pnpm** — Installs pnpm if not present                                |
| 4    | **Create upgrade branch** — Creates a new git branch for the upgrade           |
| 5    | **Detect framework** — Identifies `app/` (Remix/RR7) vs `src/` (legacy) layout |
| 6    | **Prepare repository** — Removes old build outputs, deprecated folders         |
| 7    | **Select modules** — Choose which optional `@tui/*` modules to add             |
| 8    | **Update package.json** — Adds selected modules, removes deprecated deps       |
| 9    | **Run codemods** — Rewrites `commons/...` imports to `@tui/...`                |
| 10   | **Register i18n** — Adds translation registration for `@tui` modules           |
| 11   | **Install dependencies** — Runs `pnpm install`                                 |

### Important notes

- The wizard creates **commits after each major step**, so you can review changes incrementally
- After the wizard completes, you'll likely need to make **manual fixes**—see the [Upgrade Guide](../../docs/guides/upgrade-guide.md)
- The wizard supports two project layouts:
  - **`remix-tui`** — files under `app/`
  - **`template-ui`** — files under `src/`

### Example upgrade (Spellbook)

For a real-world example, see the Spellbook upgrade PRs:

- [CLI-generated changes](https://github.com/CybercentreCanada/spellbook-tui/pull/658)
- [Manual fixes](https://github.com/CybercentreCanada/spellbook-tui/pull/657)

---

## Development

If you're contributing to `@tui/cli` itself:

### Build

```bash
pnpm -F @tui/cli build
```

### Run locally

```bash
node packages/cli/dist/index.js create
node packages/cli/dist/index.js upgrade
```

### Pack for distribution

```bash
pnpm -F @tui/cli pack
```

### Build all modules

```bash
make build-all
```

### CI/CD

The Azure Pipeline is defined in [packages/cli/azure-pipelines.yml](azure-pipelines.yml). It uses Node v22 with pnpm (via Corepack) to build, pack, and publish.

---

## Troubleshooting

### `tcli create` fails to clone

**Cause**: SSH access to the template repository is missing or misconfigured.

**Solution**: Ensure your SSH keys are set up for GitHub and that you can clone:

```bash
git clone git@github.com:CybercentreCanada/template-ui.git
```

---

### `pnpm: command not found`

**Cause**: pnpm is not installed.

**Solution**: Install pnpm globally:

```bash
npm install -g pnpm
```

Or let the upgrade wizard install it for you.

---

### VS Code doesn't open after `tcli create`

**Cause**: The `code` command is not on your PATH.

**Solution**: Open VS Code, press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux), and run **"Shell Command: Install 'code' command in PATH"**.

---

### Upgrade wizard can't detect framework

**Cause**: The project structure doesn't match expected layouts.

**Solution**: The wizard looks for either:

- `app/` folder → Remix/React Router 7 layout
- `src/` folder → Legacy TemplateUI layout

Ensure your project has one of these structures.

---

### Import codemods report errors

**Cause**: Some files couldn't be automatically transformed.

**Solution**: Review the codemod output and manually fix any remaining `commons/...` imports. The wizard commits changes incrementally, so you can `git diff` to see what was changed.

---

## Related Documentation

- [Configuration Guide](../../docs/guides/configuration-guide.md) — How to configure your TemplateUI app
- [Upgrade Guide](../../docs/guides/upgrade-guide.md) — Detailed upgrade instructions and manual fixes
- [@tui/core](../core/README.md) — Core module documentation
- [@tui/a11y](../a11y/README.md) — Accessibility module
- [@tui/apps](../apps/README.md) — App switcher module
- [@tui/classi](../classi/README.md) — Classification module
- [@tui/drawer](../drawer/README.md) — Drawer module
- [@tui/notis](../notis/README.md) — Notifications module
