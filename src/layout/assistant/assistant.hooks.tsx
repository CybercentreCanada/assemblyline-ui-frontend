import type { AssistantContextProps } from 'layout/assistant';
import { AppAssistantContext } from 'layout/assistant/assistant.providers';
import { useContext } from 'react';

export function useAssistant(): AssistantContextProps {
  return useContext(AppAssistantContext);
}
