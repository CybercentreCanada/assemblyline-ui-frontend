import { AppLayoutContext, AppLayoutContextProps } from 'commons/components/layout/LayoutProvider';
import { useContext } from 'react';

export default function useAppLayout(): AppLayoutContextProps {
  return useContext(AppLayoutContext);
}
