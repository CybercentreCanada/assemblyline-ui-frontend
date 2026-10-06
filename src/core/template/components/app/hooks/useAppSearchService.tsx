import type { AppSearchServiceContextType } from 'core/template/components/app/AppContexts';
import { AppSearchServiceContext } from 'core/template/components/app/AppContexts';
import { useContext } from 'react';

export function useAppSearchService<T = any>(): AppSearchServiceContextType<T> {
  return useContext(AppSearchServiceContext);
}
