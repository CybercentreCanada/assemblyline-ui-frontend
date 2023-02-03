import { DrawerContext, DrawerContextProps } from 'components/providers/DrawerProvider';
import { useContext } from 'react';

export default function useDrawer(): DrawerContextProps {
  return useContext(DrawerContext) as DrawerContextProps;
}
