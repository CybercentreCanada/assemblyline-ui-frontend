import type { DrawerContextProps } from 'layout/drawer/DrawerProvider';
import { DrawerContext } from 'layout/drawer/DrawerProvider';
import { useContext } from 'react';

export default function useDrawer(): DrawerContextProps {
  return useContext(DrawerContext);
}
