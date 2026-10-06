import type { SafeResultsContextProps } from 'layout/safe-results/SafeResultsProvider';
import { SafeResultsContext } from 'layout/safe-results/SafeResultsProvider';
import { useContext } from 'react';

export default function useSafeResults(): SafeResultsContextProps {
  return useContext(SafeResultsContext);
}
