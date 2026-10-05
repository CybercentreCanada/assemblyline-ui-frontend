import type { SafeResultsContextProps } from 'deprecated/legacy/components/providers/SafeResultsProvider';
import { SafeResultsContext } from 'deprecated/legacy/components/providers/SafeResultsProvider';
import { useContext } from 'react';

export default function useSafeResults(): SafeResultsContextProps {
  return useContext(SafeResultsContext);
}
