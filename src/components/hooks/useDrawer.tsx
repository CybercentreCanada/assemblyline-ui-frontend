import { DrawerContext, DrawerContextProps } from 'components/visual/DrawerProvider';
import { useContext } from 'react';

export default function useDrawer(): DrawerContextProps {
  return useContext(DrawerContext) as DrawerContextProps;
}
