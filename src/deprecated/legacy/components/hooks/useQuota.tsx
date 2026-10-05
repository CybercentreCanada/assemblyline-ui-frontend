import type { QuotaContextProps } from 'deprecated/legacy/components/providers/QuotaProvider';
import { QuotaContext } from 'deprecated/legacy/components/providers/QuotaProvider';
import { useContext } from 'react';

export default function useQuota(): QuotaContextProps {
  return useContext(QuotaContext);
}
