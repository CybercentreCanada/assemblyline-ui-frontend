import { useContext } from 'react';
import { AppQuickSearchContext } from 'commons/components/app/AppContexts';

export function useAppQuickSearch() {
  return useContext(AppQuickSearchContext);
}
