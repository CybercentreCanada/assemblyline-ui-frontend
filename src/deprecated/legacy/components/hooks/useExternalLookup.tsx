import type { ExternalLookupContextProps } from 'layout/external-lookup/external-lookup.hooks';
import { ExternalLookupContext } from 'layout/external-lookup/external-lookup.hooks';
import { useContext } from 'react';

export default function useExternalLookup(): ExternalLookupContextProps {
  return useContext(ExternalLookupContext);
}
