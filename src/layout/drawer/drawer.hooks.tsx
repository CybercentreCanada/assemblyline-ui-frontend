import type { DrawerContextProps } from 'layout/drawer/drawer.providers';
import { DrawerContext } from 'layout/drawer/drawer.providers';
import { useContext } from 'react';

export default function useDrawer(): DrawerContextProps {
  return useContext(DrawerContext);
}
