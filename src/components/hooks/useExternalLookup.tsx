import { ExternalLookupContext, ExternalLookupContextProps } from 'components/providers/ExternalLookupProvider';
import { useContext } from 'react';

export default function useExternalLookup(): ExternalLookupContextProps {
  return useContext(ExternalLookupContext) as ExternalLookupContextProps;
}
