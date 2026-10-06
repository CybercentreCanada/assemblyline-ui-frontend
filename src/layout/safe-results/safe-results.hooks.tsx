import type { SafeResultsContextProps } from 'layout/safe-results/safe-results.providers';
import { SafeResultsContext } from 'layout/safe-results/safe-results.providers';
import { useContext } from 'react';

export default function useSafeResults(): SafeResultsContextProps {
  return useContext(SafeResultsContext);
}
