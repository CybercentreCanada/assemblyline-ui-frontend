import { AppLeftNavContext } from 'core/template/components/app/AppContexts';
import { useContext } from 'react';

export function useAppLeftNav() {
  return useContext(AppLeftNavContext);
}
