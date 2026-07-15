export type AssistantProviderProps = {
  children: React.ReactNode;
};

export type AssistantContextProps = {
  assistantAllowed: boolean;
  hasInsights: boolean;
  addInsight: (insigh: AssistantInsightProps) => void;
  removeInsight: (insigh: AssistantInsightProps) => void;
  toggleAssistant: (event: any) => void;
};

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
