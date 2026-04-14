import { useContext } from 'react';
import type { AppSwitcherContextType } from '../providers/AppSwitcherProvider';
import { AppSwitcherContext } from '../providers/AppSwitcherProvider';

export function useAppSwitcher(): AppSwitcherContextType {
  return useContext(AppSwitcherContext);
}
