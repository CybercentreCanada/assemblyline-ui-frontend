import { SafeResultsContext, SafeResultsContextProps } from 'components/visual/SafeResultsProvider';
import { useContext } from 'react';

export default function useSafeResults(): SafeResultsContextProps {
  return useContext(SafeResultsContext) as SafeResultsContextProps;
}
