import { useContext } from 'react';
import { AppSwitcherContext } from 'commons/components/app/AppContexts';

export function useAppSwitcher() {
  return useContext(AppSwitcherContext);
}
