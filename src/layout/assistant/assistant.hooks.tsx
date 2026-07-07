import type { AssistantContextProps } from 'layout/assistant';
import { AssistantContext } from 'layout/assistant';
import { useContext } from 'react';

export function useAssistant(): AssistantContextProps {
  return useContext(AssistantContext);
}
