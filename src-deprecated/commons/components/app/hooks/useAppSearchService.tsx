import { useContext } from 'react';
import type { AppSearchServiceContextType } from 'commons/components/app/AppContexts';
import { AppSearchServiceContext } from 'commons/components/app/AppContexts';

export function useAppSearchService<T = any>(): AppSearchServiceContextType<T> {
  return useContext(AppSearchServiceContext);
}
