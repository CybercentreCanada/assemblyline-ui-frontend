import { AppDrawerContext } from 'deprecated/legacy/commons/components/app/AppContexts';
import { useContext } from 'react';

export function useAppDrawer() {
  return useContext(AppDrawerContext);
}
