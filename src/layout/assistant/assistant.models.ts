export type AssistantInsightProps = {
  type: 'file' | 'submission' | 'code' | 'report';
  value: string;
};

export type ContextMessageProps = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  isError?: boolean;
  isInsight?: boolean;
};
