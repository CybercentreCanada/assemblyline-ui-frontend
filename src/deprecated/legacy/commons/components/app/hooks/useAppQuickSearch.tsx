import { useContext } from 'react';
import { AppQuickSearchContext } from 'deprecated/legacy/commons/components/app/AppContexts';

export function useAppQuickSearch() {
  return useContext(AppQuickSearchContext);
}
