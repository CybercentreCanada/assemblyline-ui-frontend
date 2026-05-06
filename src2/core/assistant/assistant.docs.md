# core/assistant

AI/LLM assistant integration providing a chat panel and floating action button (FAB) for inline analysis. Users can submit insights (files, submissions, code, reports) for AI analysis and converse with the assistant.

## Responsibilities

- AI assistant chat panel UI (messages, input, streaming responses)
- Floating action button (FAB) for quick access to the assistant
- Insight submission (files, code, reports) for AI analysis
- Role-based access gating (`assistant_use` role + `ai.enabled` config flag)
- Context provider for assistant state across the component tree

## Key Files

- `assistant.providers.tsx` — `AppAssistantProvider`, `AppAssistantContext`, `useAppAssistant` context setup
- `assistant.hooks.tsx` — `useAppAssistantAllowed` (permission check), `useAppAssistantState` (internal state)
- `assistant.models.ts` — Type definitions (`AssistantInsightProps`, `AssistantInsightType`, `AssistantMessageProps`)
- `assistant.components.tsx` — UI components (`AssistantFab`, `AssistantPanel`, `AssistantMessage`, `AssistantChatDivider`)
- `index.ts` — Public API barrel exports

## Access Control

The assistant is gated behind two conditions:

1. `ai.enabled` flag in the system configuration must be `true`
2. The current user must have the `assistant_use` role

Use `useAppAssistantAllowed()` to check both conditions before rendering assistant-related UI.

## Usage

```typescript
import { useAppAssistant } from 'core/assistant';

const { open, submitInsight, close } = useAppAssistant();

// Open the assistant panel
open();

// Submit an insight for analysis
submitInsight({ type: 'file', data: fileData });
```
