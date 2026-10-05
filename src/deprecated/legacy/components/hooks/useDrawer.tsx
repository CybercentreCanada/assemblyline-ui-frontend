import type { DrawerContextProps } from 'deprecated/legacy/components/providers/DrawerProvider';
import { DrawerContext } from 'deprecated/legacy/components/providers/DrawerProvider';
import { useContext } from 'react';

export default function useDrawer(): DrawerContextProps {
  return useContext(DrawerContext);
}
