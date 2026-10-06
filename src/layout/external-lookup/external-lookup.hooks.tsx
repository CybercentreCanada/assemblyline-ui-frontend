import type { ExternalLookupContextProps } from 'layout/external-lookup/external-lookup.providers';
import { ExternalLookupContext } from 'layout/external-lookup/external-lookup.providers';
import { useContext } from 'react';

export default function useExternalLookup(): ExternalLookupContextProps {
  return useContext(ExternalLookupContext);
}
