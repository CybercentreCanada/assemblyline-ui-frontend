import type { SafeResultsContextProps } from 'components/providers/SafeResultsProvider';
import { SafeResultsContext } from 'components/providers/SafeResultsProvider';
import { useContext } from 'react';

export default function useSafeResults(): SafeResultsContextProps {
  return useContext(SafeResultsContext);
}
