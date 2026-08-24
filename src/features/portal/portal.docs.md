# Features/Portal

## 1. Purpose

Reverse portal implementation for rendering React components into detached DOM nodes that can be moved between mount points without losing state. This is the mechanism that allows the router to preserve component trees when panels are rearranged, hidden, or restored — the component keeps running in its portal while only its visual outlet changes.

## 2. Features

- **Reverse portal pattern** — Render into a detached node (`InPortal`), display it anywhere (`OutPortal`)
- **State preservation** — Moving an `OutPortal` to a new DOM location does not remount the children — React state, refs, and effects survive
- **Lightweight API** — Three exports: `createReversePortalNode`, `InPortal`, `OutPortal`
- **No extra dependencies** — Built entirely on `React.createPortal` and basic DOM manipulation

## 3. Concepts

### Reverse Portal Node

A `ReversePortalNode` is a detached `<div>` element (`hostEl`) paired with a `setOutlet` function. Children rendered into `hostEl` via `createPortal` are always mounted — they just aren't visible until an outlet claims the node by appending it to its own DOM subtree.

### InPortal

Renders children into the portal node's `hostEl` using `createPortal`. The children exist in the React tree regardless of whether an outlet is currently displaying them. This is where the actual component logic lives.

### OutPortal

A DOM container (`<div ref>`) that calls `node.setOutlet(el)` on mount. This physically moves the portal node's `hostEl` into the outlet's DOM position. On unmount, it calls `setOutlet(null)` to detach.

### Lifecycle

```text
createReversePortalNode()  →  node (detached <div>)
         │
    InPortal(node)         →  children rendered into node.hostEl (always mounted)
         │
    OutPortal(node)        →  node.hostEl appended to outlet <div> (now visible)
         │
    OutPortal unmounts     →  node.hostEl detached (still mounted, just not visible)
         │
    New OutPortal(node)    →  node.hostEl appended to new location (no remount)
```

## 4. Configuration

No configuration needed. Create a node, render into it, display it.

```typescript
import { createReversePortalNode, InPortal, OutPortal } from 'features/portal';

// Create once (stable reference — store in ref or outside component)
const portalNode = createReversePortalNode();
```

## 5. Usage

### Basic Pattern

```typescript
// Render the component into the portal (always mounted)
<InPortal node={portalNode}>
  <ExpensiveComponent />
</InPortal>

// Display it in the current location
<OutPortal node={portalNode} />
```

### Router Integration

The router creates a `ReversePortalNode` for each cached panel node. When a panel is active, its `OutPortal` is rendered in the visible slot. When the panel is hidden (LRU eviction or panel switch), the `OutPortal` unmounts but the `InPortal` keeps the component alive — no remount when it becomes visible again.

```typescript
// In the router internals:
const node = createReversePortalNode();

// Always rendered (keeps component alive):
<InPortal node={node}>
  <RouteComponent />
</InPortal>

// Only rendered when this panel slot is visible:
{isVisible && <OutPortal node={node} />}
```

### Moving Between Locations

```typescript
// Panel A displays the portal
<div id="panel-a">
  <OutPortal node={portalNode} />
</div>

// Later, panel B takes over — no remount
<div id="panel-b">
  <OutPortal node={portalNode} />
</div>
```

## 6. Codebase (Internals)

### Key Files

| File | Role |
| ---- | ---- |
| `portal.components.tsx` | `createReversePortalNode`, `InPortal`, `OutPortal` |
| `index.tsx` | Public exports |

### Exports

| Export | Type | Purpose |
| ------ | ---- | ------- |
| `createReversePortalNode()` | Function | Creates a detached portal node with `hostEl` + `setOutlet` |
| `InPortal` | Component | Renders children into `node.hostEl` via `createPortal` |
| `OutPortal` | Component | Mounts `node.hostEl` into its DOM position via `setOutlet` |
| `ReversePortalNode` | Type | `{ hostEl: HTMLDivElement, setOutlet: (el \| null) => void }` |

### Implementation Notes

- `InPortal` uses `React.memo` — only re-renders when `node` or `children` change
- `OutPortal` uses `React.memo` + `useEffect` for cleanup — calls `setOutlet(null)` on unmount
- `setOutlet` removes `hostEl` from its previous parent before appending to the new outlet — ensures only one outlet displays the node at a time
- Both components have `displayName` set for DevTools visibility

### Related Modules

- `core/router/` — Uses reverse portals to preserve panel component state across navigation
- The router's LRU node cache stores `ReversePortalNode` references so evicted panels can be restored without remounting
