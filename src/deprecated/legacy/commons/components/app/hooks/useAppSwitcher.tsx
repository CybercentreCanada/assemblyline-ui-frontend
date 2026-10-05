import { useContext } from 'react';
import { AppSwitcherContext } from 'deprecated/legacy/commons/components/app/AppContexts';

export function useAppSwitcher() {
  return useContext(AppSwitcherContext);
}
