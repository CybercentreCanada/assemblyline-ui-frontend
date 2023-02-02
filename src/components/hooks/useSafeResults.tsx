import { SafeResultsContext, SafeResultsContextProps } from 'components/providers/SafeResultsProvider';
import { useContext } from 'react';

export default function useSafeResults(): SafeResultsContextProps {
  return useContext(SafeResultsContext) as SafeResultsContextProps;
}
