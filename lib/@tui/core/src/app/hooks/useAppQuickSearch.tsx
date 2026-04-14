import { useContext } from 'react';
import { AppQuickSearchContext } from '../AppContexts';

export const useAppQuickSearch = () => {
  return useContext(AppQuickSearchContext);
};
