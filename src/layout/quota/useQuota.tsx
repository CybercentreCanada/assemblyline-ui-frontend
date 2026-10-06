import type { QuotaContextProps } from 'layout/quota/QuotaProvider';
import { QuotaContext } from 'layout/quota/QuotaProvider';
import { useContext } from 'react';

export default function useQuota(): QuotaContextProps {
  return useContext(QuotaContext);
}
