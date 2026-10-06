import type { QuotaContextProps } from 'layout/quota/quota.providers';
import { QuotaContext } from 'layout/quota/quota.providers';
import { useContext } from 'react';

export default function useQuota(): QuotaContextProps {
  return useContext(QuotaContext);
}
