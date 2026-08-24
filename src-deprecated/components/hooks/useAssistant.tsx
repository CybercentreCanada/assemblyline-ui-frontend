import type { AssistantContextProps } from 'components/providers/AssistantProvider';
import { AssistantContext } from 'components/providers/AssistantProvider';
import { useContext } from 'react';

export default function useAssistant(): AssistantContextProps {
  return useContext(AssistantContext);
}
