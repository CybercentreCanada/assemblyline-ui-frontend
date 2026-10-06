import { AppLayoutContext } from 'core/template/components/app/AppContexts';
import { useContext } from 'react';

export function useAppLayout() {
  return useContext(AppLayoutContext);
}
