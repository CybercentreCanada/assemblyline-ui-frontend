import { AppBarContext } from 'core/template/components/app/AppContexts';
import { useContext } from 'react';

export function useAppBar() {
  return useContext(AppBarContext);
}
