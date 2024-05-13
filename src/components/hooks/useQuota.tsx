import { QuotaContext, QuotaContextProps } from 'components/providers/QuotaProvider';
import { useContext } from 'react';

export default function useQuota(): QuotaContextProps {
  return useContext(QuotaContext) as QuotaContextProps;
}
