import type { AssistantContextProps } from 'layout/assistant/assistant.providers';
import { AssistantContext } from 'layout/assistant/assistant.providers';
import { useContext } from 'react';

export default function useAssistant(): AssistantContextProps {
  return useContext(AssistantContext);
}
