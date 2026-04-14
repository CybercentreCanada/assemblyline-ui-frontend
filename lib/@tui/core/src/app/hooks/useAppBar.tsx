import { useContext } from 'react';
import { AppBarContext } from '../AppContexts';

export function useAppBar() {
  return useContext(AppBarContext);
}
