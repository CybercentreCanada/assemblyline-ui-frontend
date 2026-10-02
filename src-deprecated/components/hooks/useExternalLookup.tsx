import type { ExternalLookupContextProps } from 'components/providers/ExternalLookupProvider';
import { ExternalLookupContext } from 'components/providers/ExternalLookupProvider';
import { useContext } from 'react';

export default function useExternalLookup(): ExternalLookupContextProps {
  return useContext(ExternalLookupContext);
}
