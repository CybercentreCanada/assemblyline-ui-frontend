import { AppQuickSearchContext } from 'core/template/components/app/AppContexts';
import { useContext } from 'react';

export function useAppQuickSearch() {
  return useContext(AppQuickSearchContext);
}
