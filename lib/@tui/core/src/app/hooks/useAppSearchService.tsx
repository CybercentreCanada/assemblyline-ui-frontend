import { useContext } from 'react';
import type { AppSearchServiceContextType } from '../AppContexts';
import { AppSearchServiceContext } from '../AppContexts';

export const useAppSearchService = <T = any,>(): AppSearchServiceContextType<T> => {
  return useContext(AppSearchServiceContext);
};
