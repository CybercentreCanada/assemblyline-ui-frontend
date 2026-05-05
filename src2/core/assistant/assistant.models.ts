/** Insight type for assistant analysis. */
export const ASSISTANT_INSIGHT_TYPES = ['file', 'submission', 'code', 'report'] as const;

/** Type of insight the assistant can analyze. */
export type AssistantInsightType = (typeof ASSISTANT_INSIGHT_TYPES)[number];

/** An insight item to be analyzed by the assistant. */
export type AssistantInsightProps = {
  /** The type of insight (file, submission, code, report). */
  type: AssistantInsightType;
  /** The value/identifier for this insight. */
  value: string;
};

/** A message in the assistant conversation context. */
export type AssistantMessageProps = {
  /** The message content. */
  content: string;
  /** Whether this message is an error response. */
  isError?: boolean;
  /** Whether this message was generated from an insight. */
  isInsight?: boolean;
  /** The role of the message sender. */
  role: 'assistant' | 'system' | 'user';
};

/** Context value exposed by the AssistantProvider. */
export type AppAssistantContextProps = {
  /** Add an insight to the current list. */
  addInsight: (insight: AssistantInsightProps) => void;
  /** Whether the current user is allowed to use the assistant. */
  assistantAllowed: boolean;
  /** Whether there are active insights. */
  hasInsights: boolean;
  /** Remove an insight from the current list. */
  removeInsight: (insight: AssistantInsightProps) => void;
  /** Toggle the assistant popup. */
  toggleAssistant: (target: HTMLElement) => void;
};

/** Default context value for the assistant. */
export const DEFAULT_APP_ASSISTANT_CONTEXT: AppAssistantContextProps = {
  addInsight: () => null,
  assistantAllowed: false,
  hasInsights: false,
  removeInsight: () => null,
  toggleAssistant: () => null
};
