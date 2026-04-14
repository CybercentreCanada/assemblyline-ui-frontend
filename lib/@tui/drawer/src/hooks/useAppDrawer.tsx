import { useContext } from 'react';
import type { AppDrawerContextType } from '../providers/AppDrawerProvider';
import { AppDrawerContext } from '../providers/AppDrawerProvider';

export function useAppDrawer(): AppDrawerContextType | undefined {
  return useContext(AppDrawerContext);
}
