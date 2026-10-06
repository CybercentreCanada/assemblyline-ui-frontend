import { AppDrawerContext } from 'core/template/components/app/AppContexts';
import { useContext } from 'react';

export function useAppDrawer() {
  return useContext(AppDrawerContext);
}
