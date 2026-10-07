import { AppSwitcherContext } from 'core/template/components/app/AppContexts';
import { useContext } from 'react';

export function useAppSwitcher() {
  return useContext(AppSwitcherContext);
}
