import { useContext } from 'react';
import type { AppSearchServiceContextType } from 'deprecated/legacy/commons/components/app/AppContexts';
import { AppSearchServiceContext } from 'deprecated/legacy/commons/components/app/AppContexts';

export function useAppSearchService<T = any>(): AppSearchServiceContextType<T> {
  return useContext(AppSearchServiceContext);
}
