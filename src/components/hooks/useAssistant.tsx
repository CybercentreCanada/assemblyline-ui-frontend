import { AssistantContext, AssistantContextProps } from 'components/providers/AssistantProvider';
import { useContext } from 'react';

export default function useAssistant(): AssistantContextProps {
  return useContext(AssistantContext) as AssistantContextProps;
}
