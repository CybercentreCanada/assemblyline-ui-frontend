import { AppContext } from 'core/template/components/app/AppContexts';
import { useContext } from 'react';

export function useApp() {
  return useContext(AppContext);
}
